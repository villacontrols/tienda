import { 
    IsString, 
    IsUUID, 
    IsNumber, 
    IsEnum, 
    IsOptional, 
    IsArray, 
    ValidateNested, 
    IsPositive, 
    Min, 
    Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../OrdenEntity/ordenes.entity';

// DTO para crear items de orden
export class CreateOrderItemDto {
    @ApiProperty({
        description: 'ID único del producto',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @IsString()
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'Nombre del producto',
        example: 'Laptop Gaming ASUS ROG',
        minLength: 1,
        maxLength: 255
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Precio unitario del producto',
        example: 1299.99,
        minimum: 0.01
    })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({
        description: 'Cantidad del producto',
        example: 2,
        minimum: 1,
        maximum: 1000
    })
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(1000)
    quantity: number;
}

// DTO para crear una orden
export class CreateOrderDto {
    @ApiProperty({
        description: 'ID único del usuario que realiza la orden',
        example: '987fcdeb-51a2-43d7-b456-426614174001',
        format: 'uuid'
    })
    @IsString()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Lista de productos en la orden',
        type: [CreateOrderItemDto],
        example: [
            {
                productId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Laptop Gaming ASUS ROG',
                price: 1299.99,
                quantity: 1
            },
            {
                productId: '456e7890-e89b-12d3-a456-426614174002',
                name: 'Mouse Gaming Logitech',
                price: 79.99,
                quantity: 2
            }
        ]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty({
        description: 'Total de la orden',
        example: 1459.97,
        minimum: 0.01
    })
    @IsNumber()
    @IsPositive()
    total: number;

    @ApiPropertyOptional({
        description: 'Estado de la orden',
        enum: OrderStatus,
        example: OrderStatus.PENDING,
        default: OrderStatus.PENDING
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}

// DTO para actualizar items de orden
export class UpdateOrderItemDto {
    @ApiPropertyOptional({
        description: 'ID único del producto',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    productId?: string;

    @ApiPropertyOptional({
        description: 'Nombre del producto',
        example: 'Laptop Gaming ASUS ROG Actualizada',
        minLength: 1,
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Precio unitario del producto',
        example: 1199.99,
        minimum: 0.01
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @ApiPropertyOptional({
        description: 'Cantidad del producto',
        example: 3,
        minimum: 1,
        maximum: 1000
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(1000)
    quantity?: number;
}

// DTO para actualizar una orden
export class UpdateOrderDto {
    @ApiPropertyOptional({
        description: 'ID único del usuario',
        example: '987fcdeb-51a2-43d7-b456-426614174001',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Lista de productos actualizados',
        type: [UpdateOrderItemDto],
        example: [
            {
                productId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Laptop Gaming ASUS ROG Actualizada',
                price: 1199.99,
                quantity: 1
            }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOrderItemDto)
    items?: UpdateOrderItemDto[];

    @ApiPropertyOptional({
        description: 'Total actualizado de la orden',
        example: 1279.97,
        minimum: 0.01
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    total?: number;

    @ApiPropertyOptional({
        description: 'Estado actualizado de la orden',
        enum: OrderStatus,
        example: OrderStatus.PAID
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}

// DTO para cambiar solo el estado de una orden
export class UpdateOrderStatusDto {
    @ApiProperty({
        description: 'Nuevo estado de la orden',
        enum: OrderStatus,
        example: OrderStatus.SHIPPED
    })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

// DTO para filtrar órdenes
export class FilterOrderDto {
    @ApiPropertyOptional({
        description: 'ID del usuario para filtrar órdenes',
        example: '987fcdeb-51a2-43d7-b456-426614174001',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Estado de las órdenes a filtrar',
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({
        description: 'Fecha de inicio del rango (YYYY-MM-DD)',
        example: '2024-01-01',
        format: 'date'
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin del rango (YYYY-MM-DD)',
        example: '2024-12-31',
        format: 'date'
    })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Límite de resultados por página',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 10
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Desplazamiento para paginación',
        example: 0,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number;
}

// DTO para respuesta de estadísticas
export class OrderStatsDto {
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
        example: 85
    })
    shippedOrders: number;

    @ApiProperty({
        description: 'Total de ventas',
        example: 125750.50
    })
    totalSales: number;
}

// DTO para respuesta de orden con información completa
export class OrderResponseDto {
    @ApiProperty({
        description: 'ID único de la orden',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'ID del usuario',
        example: '987fcdeb-51a2-43d7-b456-426614174001'
    })
    userId: string;

    @ApiProperty({
        description: 'Información del usuario',
        example: {
            id: '987fcdeb-51a2-43d7-b456-426614174001',
            nombre: 'Juan Pérez',
            email: 'juan.perez@email.com'
        }
    })
    user: {
        id: string;
        nombre: string;
        email: string;
    };

    @ApiProperty({
        description: 'Items de la orden',
        example: [
            {
                id: '660e8400-e29b-41d4-a716-446655440001',
                productId: '123e4567-e89b-12d3-a456-426614174000',
                product: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    nombre: 'Laptop Gaming ASUS ROG',
                    precio: 1299.99
                },
                price: 1299.99,
                quantity: 1,
                subtotal: 1299.99
            }
        ]
    })
    items: {
        id: string;
        productId: string;
        product: {
            id: string;
            nombre: string;
            precio: number;
        };
        price: number;
        quantity: number;
        subtotal: number;
    }[];

    @ApiProperty({
        description: 'Total de la orden',
        example: 1459.97
    })
    total: number;

    @ApiProperty({
        description: 'Estado de la orden',
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    status: OrderStatus;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2024-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2024-01-15T12:45:00Z'
    })
    updatedAt: Date;
}

// DTO para crear orden rápida (calculando el total automáticamente)
export class CreateQuickOrderDto {
    @ApiProperty({
        description: 'ID único del usuario',
        example: '987fcdeb-51a2-43d7-b456-426614174001',
        format: 'uuid'
    })
    @IsString()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Lista de productos (el total se calcula automáticamente)',
        type: [CreateOrderItemDto],
        example: [
            {
                productId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Laptop Gaming ASUS ROG',
                price: 1299.99,
                quantity: 1
            },
            {
                productId: '456e7890-e89b-12d3-a456-426614174002',
                name: 'Mouse Gaming Logitech',
                price: 79.99,
                quantity: 2
            }
        ]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiPropertyOptional({
        description: 'Estado inicial de la orden',
        enum: OrderStatus,
        example: OrderStatus.PENDING,
        default: OrderStatus.PENDING
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}

// DTO para búsqueda de órdenes
export class SearchOrderDto {
    @ApiPropertyOptional({
        description: 'Término de búsqueda (nombre de producto, email de usuario, etc.)',
        example: 'laptop gaming'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por estado',
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({
        description: 'Filtrar por usuario',
        example: '987fcdeb-51a2-43d7-b456-426614174001',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar',
        example: 'createdAt',
        enum: ['createdAt', 'total', 'status']
    })
    @IsOptional()
    @IsString()
    sortBy?: 'createdAt' | 'total' | 'status';

    @ApiPropertyOptional({
        description: 'Orden de clasificación',
        example: 'DESC',
        enum: ['ASC', 'DESC']
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC';

    @ApiPropertyOptional({
        description: 'Límite de resultados por página',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 10
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Número de página',
        example: 1,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    page?: number;
}

// DTO para cancelar orden
export class CancelOrderDto {
    @ApiPropertyOptional({
        description: 'Razón de la cancelación',
        example: 'Cliente solicitó cancelación por cambio de opinión'
    })
    @IsOptional()
    @IsString()
    reason?: string;
}

// DTO para rango de fechas
export class DateRangeDto {
    @ApiProperty({
        description: 'Fecha de inicio (YYYY-MM-DD)',
        example: '2024-01-01',
        format: 'date'
    })
    @IsString()
    startDate: string;

    @ApiProperty({
        description: 'Fecha de fin (YYYY-MM-DD)',
        example: '2024-12-31',
        format: 'date'
    })
    @IsString()
    endDate: string;
}