
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './OrdenEntity/ordenes.entity';
import { OrderItem } from '../item-orden/itemOrdenentity/itemOrden.entity';
import { CreateOrderDto, UpdateOrderDto } from './ordenDto/ordenDto';
import { UserService } from '../user/user.service';
import { ProductoService } from '../producto/producto.service';

@Injectable()
export class OrdenesService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly userService: UserService,
        private readonly productService: ProductoService,
    ) { }

    // Crear orden
    async create(createOrderDto: CreateOrderDto): Promise<Order | any> {
        try {
            // Verificar que el usuario existe
            const user = await this.userService.findOne(createOrderDto.userId as any);
            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Verificar que el usuario esté activo
            if (!user.status) {
                throw new HttpException('El usuario no está activo', HttpStatus.FORBIDDEN);
            }

            // Verificar que todos los productos existen
            const productPromises = createOrderDto.items.map(item =>
                this.productService.findOne(item.productId)
            );
            const products = await Promise.all(productPromises);

            // Calcular el total para la orden
            const totalProduct = products.map((prod) => {
                const producto = createOrderDto.items.find((item) => item.productId === prod.id);
                return Number(prod.precio) * Number(producto?.quantity || 0); // Asegura que no sea undefined
            });

            const totalFinalProd = totalProduct.reduce((acc, i) => acc + i, 0);

            createOrderDto.total = totalFinalProd;
            // Crear nueva orden (sin items primero)
            const order = this.orderRepository.create({
                userId: createOrderDto.userId,
                user,
                total: createOrderDto.total,
                status: createOrderDto.status || OrderStatus.PENDING,
            });

            const savedOrder = await this.orderRepository.save(order);

            // Crear los items de la orden
            const orderItems = createOrderDto.items.map(itemDto => {
                const product = products.find(p => p.id === itemDto.productId);
                return this.orderItemRepository.create({
                    orderId: savedOrder.id,
                    order: savedOrder,
                    productId: itemDto.productId,
                    product,
                    quantity: itemDto.quantity,
                    price: itemDto.price,
                    name: itemDto.name
                });
            });

            await this.orderItemRepository.save(orderItems);

            // Retornar la orden completa con items
            return await this.findOne(savedOrder.id);
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error creando la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener todas las órdenes
    async findAll(): Promise<Order[]> {
        try {
            return await this.orderRepository.find({
                relations: ['user', 'items'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo las órdenes", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener orden por ID
    async findOne(id: string): Promise<Order> {
        try {
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['user', 'items'],
            });

            if (!order) {
                throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
            }

            return order;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener órdenes por usuario
    async findByUser(userId: string): Promise<Order[]> {
        try {
            // Verificar que el usuario existe
            await this.userService.findOne(userId as any);

            const orders = await this.orderRepository.find({
                where: { userId },
                relations: ['user', 'items'],
                order: { createdAt: 'DESC' },
            });

            return orders;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo las órdenes del usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener órdenes por estado
    async findByStatus(status: OrderStatus): Promise<Order[]> {
        try {
            return await this.orderRepository.find({
                where: { status },
                relations: ['user', 'items'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo las órdenes por estado", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar orden
    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        try {
            const order = await this.findOne(id);

            // Verificar que la orden se puede actualizar
            if (order.status === OrderStatus.CANCELLED) {
                throw new HttpException('No se puede actualizar una orden cancelada', HttpStatus.BAD_REQUEST);
            }

            // Si se está actualizando el usuario, verificar que existe
            if (updateOrderDto.userId && updateOrderDto.userId !== order.userId) {
                const user = await this.userService.findOne(updateOrderDto.userId as any);
                if (!user.status) {
                    throw new HttpException('El usuario no está activo', HttpStatus.FORBIDDEN);
                }
            }

            // Actualizar orden
            Object.assign(order, updateOrderDto);
            return await this.orderRepository.save(order);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Cambiar estado de la orden
    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        try {
            const order = await this.findOne(id);

            // Validar transiciones de estado
            if (order.status === OrderStatus.CANCELLED) {
                throw new HttpException('No se puede cambiar el estado de una orden cancelada', HttpStatus.BAD_REQUEST);
            }

            if (order.status === OrderStatus.SHIPPED && status === OrderStatus.PENDING) {
                throw new HttpException('No se puede cambiar una orden enviada a pendiente', HttpStatus.BAD_REQUEST);
            }

            order.status = status;
            return await this.orderRepository.save(order);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando el estado de la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Cancelar orden
    async cancel(id: string): Promise<{ message: string }> {
        try {
            const order = await this.findOne(id);

            // Verificar que la orden se puede cancelar
            if (order.status === OrderStatus.SHIPPED) {
                throw new HttpException('No se puede cancelar una orden ya enviada', HttpStatus.BAD_REQUEST);
            }

            if (order.status === OrderStatus.CANCELLED) {
                throw new HttpException('La orden ya está cancelada', HttpStatus.BAD_REQUEST);
            }

            order.status = OrderStatus.CANCELLED;
            await this.orderRepository.save(order);

            return { message: 'Orden cancelada exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error cancelando la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar orden permanentemente
    async remove(id: string): Promise<{ message: string }> {
        try {
            const order = await this.findOne(id);

            // Solo permitir eliminar órdenes canceladas o pendientes
            if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED) {
                throw new HttpException('No se puede eliminar una orden pagada o enviada', HttpStatus.BAD_REQUEST);
            }

            await this.orderRepository.remove(order);
            return { message: 'Orden eliminada exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error eliminando la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener estadísticas de órdenes
    async getStats(): Promise<any> {
        try {
            const [
                totalOrders,
                pendingOrders,
                paidOrders,
                cancelledOrders,
                shippedOrders,
            ] = await Promise.all([
                this.orderRepository.count(),
                this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
                this.orderRepository.count({ where: { status: OrderStatus.PAID } }),
                this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
                this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } }),
            ]);

            // Calcular total de ventas (solo órdenes pagadas)
            const totalSales = await this.orderRepository
                .createQueryBuilder('order')
                .select('SUM(order.total)', 'total')
                .where('order.status = :status', { status: OrderStatus.PAID })
                .getRawOne();

            return {
                totalOrders,
                pendingOrders,
                paidOrders,
                cancelledOrders,
                shippedOrders,
                totalSales: totalSales?.total || 0,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo estadísticas", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener órdenes recientes
    async getRecentOrders(limit: number = 10): Promise<Order[]> {
        try {
            return await this.orderRepository.find({
                relations: ['user', 'items'],
                order: { createdAt: 'DESC' },
                take: limit,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo órdenes recientes", HttpStatus.BAD_REQUEST);
        }
    }

    // Buscar órdenes por rango de fechas
    async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
        try {
            return await this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.items', 'items')
                .where('order.createdAt BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .orderBy('order.createdAt', 'DESC')
                .getMany();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo órdenes por rango de fechas", HttpStatus.BAD_REQUEST);
        }
    }

    // Calcular total de una orden basado en sus items
    async calculateOrderTotal(orderId: string): Promise<number> {
        try {
            const order = await this.findOne(orderId);

            let total = 0;
            for (const item of order.items) {
                total += item.quantity * item.price;
            }

            return total;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error calculando el total de la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Agregar item a una orden existente
    async addItemToOrder(orderId: string, productId: string, quantity: number, price: number): Promise<OrderItem> {
        try {
            const order = await this.findOne(orderId);

            if (order.status !== OrderStatus.PENDING) {
                throw new HttpException('Solo se pueden agregar items a órdenes pendientes', HttpStatus.BAD_REQUEST);
            }

            // Verificar que el producto existe
            const product = await this.productService.findOne(productId);

            // Verificar si el item ya existe en la orden
            const existingItem = order.items.find(item => item.productId === productId);

            if (existingItem) {
                // Actualizar cantidad si ya existe
                existingItem.quantity += quantity;
                await this.orderItemRepository.save(existingItem);

                // Actualizar total de la orden
                const newTotal = await this.calculateOrderTotal(orderId);
                await this.orderRepository.update(orderId, { total: newTotal });

                return existingItem;
            } else {
                // Crear nuevo item
                const newItem = this.orderItemRepository.create({
                    orderId,
                    order,
                    productId,
                    product,
                    quantity,
                    price,
                });

                const savedItem = await this.orderItemRepository.save(newItem);

                // Actualizar total de la orden
                const newTotal = await this.calculateOrderTotal(orderId);
                await this.orderRepository.update(orderId, { total: newTotal });

                return savedItem;
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error agregando item a la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Remover item de una orden
    async removeItemFromOrder(orderId: string, itemId: string): Promise<{ message: string }> {
        try {
            const order = await this.findOne(orderId);

            if (order.status !== OrderStatus.PENDING) {
                throw new HttpException('Solo se pueden remover items de órdenes pendientes', HttpStatus.BAD_REQUEST);
            }

            const item = await this.orderItemRepository.findOne({
                where: { id: itemId, orderId }
            });

            if (!item) {
                throw new HttpException('Item no encontrado en la orden', HttpStatus.NOT_FOUND);
            }

            await this.orderItemRepository.remove(item);

            // Actualizar total de la orden
            const newTotal = await this.calculateOrderTotal(orderId);
            await this.orderRepository.update(orderId, { total: newTotal });

            return { message: 'Item removido exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error removiendo item de la orden", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar cantidad de un item en la orden
    async updateItemQuantity(orderId: string, itemId: string, quantity: number): Promise<OrderItem> {
        try {
            const order = await this.findOne(orderId);

            if (order.status !== OrderStatus.PENDING) {
                throw new HttpException('Solo se pueden actualizar items de órdenes pendientes', HttpStatus.BAD_REQUEST);
            }

            const item = await this.orderItemRepository.findOne({
                where: { id: itemId, orderId }
            });

            if (!item) {
                throw new HttpException('Item no encontrado en la orden', HttpStatus.NOT_FOUND);
            }

            item.quantity = quantity;
            const updatedItem = await this.orderItemRepository.save(item);

            // Actualizar total de la orden
            const newTotal = await this.calculateOrderTotal(orderId);
            await this.orderRepository.update(orderId, { total: newTotal });

            return updatedItem;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando cantidad del item", HttpStatus.BAD_REQUEST);
        }
    }
}