import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    HttpStatus,
    HttpCode,
    UseGuards,
    ParseUUIDPipe,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBadRequestResponse,
    ApiProperty,
    ApiBearerAuth,
    ApiNoContentResponse
} from '@nestjs/swagger';
import { OrdenesService } from './ordenes.service';
import { CreateOrderDto, UpdateOrderDto } from './ordenDto/ordenDto';
import { OrderStatus } from './OrdenEntity/ordenes.entity';
import { JwtAuthGuard } from '../auth/guards/autGuard';
import { RolesGuard } from '../util/permisosRoles/roles.guard';
import { Roles } from '../util/permisosRoles/roles.decorator';
import { Order } from './OrdenEntity/ordenes.entity';

// DTOs para endpoints específicos con decoraciones Swagger
class UpdateStatusDto {
    @ApiProperty({
        description: 'Nuevo estado de la orden',
        enum: OrderStatus,
        example: OrderStatus.PAID
    })
    status: OrderStatus;
}

class DateRangeDto {
    @ApiProperty({
        description: 'Fecha de inicio',
        example: '2024-01-01T00:00:00Z'
    })
    startDate: Date;

    @ApiProperty({
        description: 'Fecha de fin',
        example: '2024-12-31T23:59:59Z'
    })
    endDate: Date;
}

class AddItemDto {
    @ApiProperty({
        description: 'ID del producto',
        example: 'uuid-123-456-789'
    })
    productId: string;

    @ApiProperty({
        description: 'Cantidad del producto',
        example: 2
    })
    quantity: number;

    @ApiProperty({
        description: 'Precio del producto',
        example: 99.99
    })
    price: number;
}

class UpdateItemQuantityDto {
    @ApiProperty({
        description: 'Nueva cantidad del item',
        example: 5
    })
    quantity: number;
}

class MessageResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Operación exitosa'
    })
    message: string;
}

class OrderStatsDto {
    @ApiProperty({
        description: 'Total de órdenes',
        example: 150
    })
    totalOrders: number;

    @ApiProperty({
        description: 'Órdenes pendientes',
        example: 25
    })
    pendingOrders: number;

    @ApiProperty({
        description: 'Órdenes pagadas',
        example: 100
    })
    paidOrders: number;

    @ApiProperty({
        description: 'Órdenes canceladas',
        example: 15
    })
    cancelledOrders: number;

    @ApiProperty({
        description: 'Órdenes enviadas',
        example: 80
    })
    shippedOrders: number;

    @ApiProperty({
        description: 'Total de ventas',
        example: 15000.50
    })
    totalSales: number;
}

@ApiBearerAuth()
@ApiTags('Órdenes')
@Controller('ordenes')
export class OrdenesController {
    constructor(private readonly ordenesService: OrdenesService) { }

    // Crear orden
    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nueva orden',
        description: 'Crea una nueva orden con los items especificados'
    })
    @ApiCreatedResponse({
        description: 'Orden creada exitosamente',
        type: Order
    })
    @ApiBadRequestResponse({
        description: 'Error en los datos proporcionados'
    })
    @ApiBody({
        type: CreateOrderDto
    })
    async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
        return await this.ordenesService.create(createOrderDto);
    }

    // Obtener todas las órdenes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener todas las órdenes',
        description: 'Retorna una lista de todas las órdenes del sistema'
    })
    @ApiOkResponse({
        description: 'Lista de órdenes obtenida exitosamente',
        type: [Order]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo las órdenes'
    })
    async findAll(): Promise<Order[]> {
        return await this.ordenesService.findAll();
    }

    // Obtener orden por ID
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener orden por ID',
        description: 'Retorna una orden específica basada en su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Orden encontrada exitosamente',
        type: Order
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo la orden'
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
        return await this.ordenesService.findOne(id);
    }

    // Obtener órdenes por usuario
    @UseGuards(JwtAuthGuard)
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener órdenes por usuario',
        description: 'Retorna todas las órdenes de un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID único del usuario',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Órdenes del usuario obtenidas exitosamente',
        type: [Order]
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo las órdenes del usuario'
    })
    async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Order[]> {
        return await this.ordenesService.findByUser(userId);
    }

    // Obtener órdenes por estado
    @UseGuards(JwtAuthGuard)
    @Get('status/:status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener órdenes por estado',
        description: 'Retorna todas las órdenes con un estado específico'
    })
    @ApiParam({
        name: 'status',
        description: 'Estado de la orden',
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @ApiOkResponse({
        description: 'Órdenes por estado obtenidas exitosamente',
        type: [Order]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo las órdenes por estado'
    })
    async findByStatus(@Param('status') status: OrderStatus): Promise<Order[]> {
        return await this.ordenesService.findByStatus(status);
    }

    // Actualizar orden
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar orden',
        description: 'Actualiza los datos de una orden existente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Orden actualizada exitosamente',
        type: Order
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando la orden'
    })
    @ApiBody({
        type: UpdateOrderDto
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ): Promise<Order> {
        return await this.ordenesService.update(id, updateOrderDto);
    }

    // Actualizar estado de la orden
    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar estado de orden',
        description: 'Actualiza únicamente el estado de una orden específica'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Estado de la orden actualizado exitosamente',
        type: Order
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el estado de la orden'
    })
    @ApiBody({
        type: UpdateStatusDto
    })
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateStatusDto: UpdateStatusDto
    ): Promise<Order> {
        return await this.ordenesService.updateStatus(id, updateStatusDto.status);
    }

    // Cancelar orden
    @UseGuards(JwtAuthGuard)
    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cancelar orden',
        description: 'Cancela una orden específica'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Orden cancelada exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error cancelando la orden'
    })
    async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        return await this.ordenesService.cancel(id);
    }

    // Eliminar orden
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar orden',
        description: 'Elimina permanentemente una orden del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Orden eliminada exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error eliminando la orden'
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        return await this.ordenesService.remove(id);
    }

    // Obtener estadísticas de órdenes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('analytics/stats')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener estadísticas de órdenes',
        description: 'Retorna estadísticas generales de todas las órdenes'
    })
    @ApiOkResponse({
        description: 'Estadísticas obtenidas exitosamente',
        type: OrderStatsDto
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo estadísticas'
    })
    async getStats(): Promise<any> {
        return await this.ordenesService.getStats();
    }

    // Obtener órdenes recientes
    @UseGuards(JwtAuthGuard)
    @Get('recent/list')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener órdenes recientes',
        description: 'Retorna las órdenes más recientes'
    })
    @ApiQuery({
        name: 'limit',
        description: 'Límite de órdenes a retornar',
        example: 10,
        required: false
    })
    @ApiOkResponse({
        description: 'Órdenes recientes obtenidas exitosamente',
        type: [Order]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo órdenes recientes'
    })
    async getRecentOrders(@Query('limit', ParseIntPipe) limit: number = 10): Promise<Order[]> {
        return await this.ordenesService.getRecentOrders(limit);
    }

    // Buscar órdenes por rango de fechas
    @UseGuards(JwtAuthGuard)
    @Get('search/daterange')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Buscar órdenes por rango de fechas',
        description: 'Retorna órdenes dentro de un rango de fechas específico'
    })
    @ApiQuery({
        name: 'startDate',
        description: 'Fecha de inicio',
        example: '2024-01-01T00:00:00Z'
    })
    @ApiQuery({
        name: 'endDate',
        description: 'Fecha de fin',
        example: '2024-12-31T23:59:59Z'
    })
    @ApiOkResponse({
        description: 'Órdenes encontradas exitosamente',
        type: [Order]
    })
    @ApiBadRequestResponse({
        description: 'Error buscando órdenes por rango de fechas'
    })
    async findByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ): Promise<Order[]> {
        return await this.ordenesService.findByDateRange(
            new Date(startDate),
            new Date(endDate)
        );
    }

    // Calcular total de una orden
    @UseGuards(JwtAuthGuard)
    @Get(':id/total')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Calcular total de orden',
        description: 'Calcula el total de una orden basado en sus items'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Total calculado exitosamente',
        schema: {
            type: 'object',
            properties: {
                total: {
                    type: 'number',
                    example: 299.99
                }
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error calculando el total'
    })
    async calculateOrderTotal(@Param('id', ParseUUIDPipe) id: string): Promise<{ total: number }> {
        const total = await this.ordenesService.calculateOrderTotal(id);
        return { total };
    }

    // Agregar item a orden
    @UseGuards(JwtAuthGuard)
    @Post(':id/items')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Agregar item a orden',
        description: 'Agrega un nuevo item a una orden existente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiCreatedResponse({
        description: 'Item agregado exitosamente'
    })
    @ApiNotFoundResponse({
        description: 'Orden no encontrada'
    })
    @ApiBadRequestResponse({
        description: 'Error agregando item a la orden'
    })
    @ApiBody({
        type: AddItemDto
    })
    async addItemToOrder(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() addItemDto: AddItemDto
    ) {
        return await this.ordenesService.addItemToOrder(
            id,
            addItemDto.productId,
            addItemDto.quantity,
            addItemDto.price
        );
    }

    // Remover item de orden
    @UseGuards(JwtAuthGuard)
    @Delete(':id/items/:itemId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Remover item de orden',
        description: 'Remueve un item específico de una orden'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiParam({
        name: 'itemId',
        description: 'ID único del item',
        example: 'uuid-item-123-456'
    })
    @ApiOkResponse({
        description: 'Item removido exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Orden o item no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error removiendo item de la orden'
    })
    async removeItemFromOrder(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('itemId', ParseUUIDPipe) itemId: string
    ): Promise<{ message: string }> {
        return await this.ordenesService.removeItemFromOrder(id, itemId);
    }

    // Actualizar cantidad de item
    @UseGuards(JwtAuthGuard)
    @Patch(':id/items/:itemId/quantity')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar cantidad de item',
        description: 'Actualiza la cantidad de un item específico en una orden'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único de la orden',
        example: 'uuid-123-456-789'
    })
    @ApiParam({
        name: 'itemId',
        description: 'ID único del item',
        example: 'uuid-item-123-456'
    })
    @ApiOkResponse({
        description: 'Cantidad de item actualizada exitosamente'
    })
    @ApiNotFoundResponse({
        description: 'Orden o item no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando cantidad del item'
    })
    @ApiBody({
        type: UpdateItemQuantityDto
    })
    async updateItemQuantity(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('itemId', ParseUUIDPipe) itemId: string,
        @Body() updateQuantityDto: UpdateItemQuantityDto
    ) {
        return await this.ordenesService.updateItemQuantity(
            id,
            itemId,
            updateQuantityDto.quantity
        );
    }
}