
import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThan, LessThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './entity/producto.entity';
import { CreateProductDto, UpdateProductDto, FilterProductDto } from './productoDto/productoDto';

@Injectable()
export class ProductoService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    // Crear producto
    async create(createProductDto: CreateProductDto): Promise<Product | any> {
        try {
            // Verificar si el producto ya existe por nombre
            const existingProduct = await this.productRepository.findOne({
                where: { nombre: createProductDto.nombre }
            });

            if (existingProduct) {
                throw new HttpException('Ya existe un producto con ese nombre', HttpStatus.FOUND);
            }

            // Validar precio y stock
            if (createProductDto.precio < 0) {
                throw new HttpException('El precio no puede ser negativo', HttpStatus.BAD_REQUEST);
            }

            if (createProductDto.stock) {
                if (createProductDto.stock < 0) {
                throw new HttpException('El stock no puede ser negativo', HttpStatus.BAD_REQUEST);
            }
            }

            const product = this.productRepository.create(createProductDto);
            return await this.productRepository.save(product);
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error creando el producto", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener todos los productos con filtros opcionales
    async findAll(filters?: FilterProductDto): Promise<Product[]> {
        try {
            const query = this.productRepository.createQueryBuilder('product');

            // Aplicar filtros si existen
            if (filters) {
                // Filtro por nombre (búsqueda parcial)
                if (filters.nombre) {
                    query.andWhere('product.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
                }

                // Filtro por descripción (búsqueda parcial)
                if (filters.descripcion) {
                    query.andWhere('product.descripcion ILIKE :descripcion', { descripcion: `%${filters.descripcion}%` });
                }

                // Filtros de precio
                if (filters.precioMin !== undefined && filters.precioMax !== undefined) {
                    query.andWhere('product.precio BETWEEN :precioMin AND :precioMax', {
                        precioMin: filters.precioMin,
                        precioMax: filters.precioMax
                    });
                } else if (filters.precioMin !== undefined) {
                    query.andWhere('product.precio >= :precioMin', { precioMin: filters.precioMin });
                } else if (filters.precioMax !== undefined) {
                    query.andWhere('product.precio <= :precioMax', { precioMax: filters.precioMax });
                }

                // Filtros de stock
                if (filters.stockMin !== undefined && filters.stockMax !== undefined) {
                    query.andWhere('product.stock BETWEEN :stockMin AND :stockMax', {
                        stockMin: filters.stockMin,
                        stockMax: filters.stockMax
                    });
                } else if (filters.stockMin !== undefined) {
                    query.andWhere('product.stock >= :stockMin', { stockMin: filters.stockMin });
                } else if (filters.stockMax !== undefined) {
                    query.andWhere('product.stock <= :stockMax', { stockMax: filters.stockMax });
                }

                // Filtro por disponibilidad (productos con stock > 0)
                if (filters.disponible !== undefined) {
                    if (filters.disponible) {
                        query.andWhere('product.stock > 0');
                    } else {
                        query.andWhere('product.stock = 0');
                    }
                }

                // Filtros de fecha de creación
                if (filters.fechaCreacionDesde && filters.fechaCreacionHasta) {
                    query.andWhere('product.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
                        fechaDesde: filters.fechaCreacionDesde,
                        fechaHasta: filters.fechaCreacionHasta
                    });
                } else if (filters.fechaCreacionDesde) {
                    query.andWhere('product.createdAt >= :fechaDesde', { fechaDesde: filters.fechaCreacionDesde });
                } else if (filters.fechaCreacionHasta) {
                    query.andWhere('product.createdAt <= :fechaHasta', { fechaHasta: filters.fechaCreacionHasta });
                }

                // Ordenamiento
                if (filters.ordenarPor) {
                    const direccion = filters.direccionOrden || 'ASC';
                    query.orderBy(`product.${filters.ordenarPor}`, direccion);
                } else {
                    query.orderBy('product.createdAt', 'DESC');
                }

                // Paginación
                if (filters.limite) {
                    query.limit(filters.limite);
                }
                if (filters.offset) {
                    query.offset(filters.offset);
                }
            } else {
                // Orden por defecto si no hay filtros
                query.orderBy('product.createdAt', 'DESC');
            }

            return await query.getMany();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo los productos", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener producto por ID
    async findOne(id: string): Promise<Product> {
        try {
            const product = await this.productRepository.findOne({
                where: { id }
            });

            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }

            return product;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo el producto", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar producto
    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        try {
            const product = await this.findOne(id);

            // Verificar si el nuevo nombre ya existe en otro producto
            if (updateProductDto.nombre && updateProductDto.nombre !== product.nombre) {
                const existingProduct = await this.productRepository.findOne({
                    where: { nombre: updateProductDto.nombre }
                });

                if (existingProduct && existingProduct.id !== id) {
                    throw new HttpException('Ya existe un producto con ese nombre', HttpStatus.CONFLICT);
                }
            }

            // Validar precio y stock si se están actualizando
            if (updateProductDto.precio !== undefined && updateProductDto.precio < 0) {
                throw new HttpException('El precio no puede ser negativo', HttpStatus.BAD_REQUEST);
            }

            if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
                throw new HttpException('El stock no puede ser negativo', HttpStatus.BAD_REQUEST);
            }

            await this.productRepository.update(id, updateProductDto);
            return await this.findOne(id);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando el producto", HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar producto
    async remove(id: string): Promise<{ message: string }> {
        try {
            const product = await this.findOne(id);
            await this.productRepository.delete(id);
            return { message: 'Producto eliminado exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error eliminando el producto", HttpStatus.BAD_REQUEST);
        }
    }

    // Buscar productos por nombre (método adicional)
    async findByName(nombre: string): Promise<Product[]> {
        try {
            return await this.productRepository.find({
                where: { 
                    nombre: Like(`%${nombre}%`) 
                },
                order: { createdAt: 'DESC' }
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error buscando productos por nombre", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener productos con stock bajo (método adicional)
    async findLowStock(limite: number = 10): Promise<Product[]> {
        try {
            return await this.productRepository.find({
                where: { 
                    stock: LessThanOrEqual(limite) 
                },
                order: { stock: 'ASC' }
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo productos con stock bajo", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar stock de un producto (método adicional)
    async updateStock(id: string, nuevoStock: number): Promise<Product> {
        try {
            if (nuevoStock < 0) {
                throw new HttpException('El stock no puede ser negativo', HttpStatus.BAD_REQUEST);
            }

            const product = await this.findOne(id);
            await this.productRepository.update(id, { stock: nuevoStock });
            return await this.findOne(id);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando el stock", HttpStatus.BAD_REQUEST);
        }
    }

    // Contar productos con filtros (método adicional para paginación)
    async count(filters?: FilterProductDto): Promise<number> {
        try {
            const query = this.productRepository.createQueryBuilder('product');

            // Aplicar los mismos filtros que en findAll
            if (filters) {
                if (filters.nombre) {
                    query.andWhere('product.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
                }
                if (filters.descripcion) {
                    query.andWhere('product.descripcion ILIKE :descripcion', { descripcion: `%${filters.descripcion}%` });
                }
                if (filters.precioMin !== undefined && filters.precioMax !== undefined) {
                    query.andWhere('product.precio BETWEEN :precioMin AND :precioMax', {
                        precioMin: filters.precioMin,
                        precioMax: filters.precioMax
                    });
                } else if (filters.precioMin !== undefined) {
                    query.andWhere('product.precio >= :precioMin', { precioMin: filters.precioMin });
                } else if (filters.precioMax !== undefined) {
                    query.andWhere('product.precio <= :precioMax', { precioMax: filters.precioMax });
                }
                if (filters.stockMin !== undefined && filters.stockMax !== undefined) {
                    query.andWhere('product.stock BETWEEN :stockMin AND :stockMax', {
                        stockMin: filters.stockMin,
                        stockMax: filters.stockMax
                    });
                } else if (filters.stockMin !== undefined) {
                    query.andWhere('product.stock >= :stockMin', { stockMin: filters.stockMin });
                } else if (filters.stockMax !== undefined) {
                    query.andWhere('product.stock <= :stockMax', { stockMax: filters.stockMax });
                }
                if (filters.disponible !== undefined) {
                    if (filters.disponible) {
                        query.andWhere('product.stock > 0');
                    } else {
                        query.andWhere('product.stock = 0');
                    }
                }
                if (filters.fechaCreacionDesde && filters.fechaCreacionHasta) {
                    query.andWhere('product.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
                        fechaDesde: filters.fechaCreacionDesde,
                        fechaHasta: filters.fechaCreacionHasta
                    });
                } else if (filters.fechaCreacionDesde) {
                    query.andWhere('product.createdAt >= :fechaDesde', { fechaDesde: filters.fechaCreacionDesde });
                } else if (filters.fechaCreacionHasta) {
                    query.andWhere('product.createdAt <= :fechaHasta', { fechaHasta: filters.fechaCreacionHasta });
                }
            }

            return await query.getCount();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error contando productos", HttpStatus.BAD_REQUEST);
        }
    }
}