import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, IsEnum, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        description: 'Nombre del producto',
        example: 'Computador HP i5 16GB RAM',
        minLength: 1,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    nombre: string;

    @ApiProperty({
        description: 'Descripción detallada del producto',
        example: 'Computador portátil HP con procesador Intel i5, 16GB de RAM DDR4, disco SSD 512GB'
    })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({
        description: 'Precio del producto en la moneda local',
        example: 1299.99,
        minimum: 0,
        type: 'number',
        format: 'float'
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    precio: number;

    @ApiPropertyOptional({
        description: 'Cantidad disponible en inventario',
        example: 25,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    stock?: number = 0;

    @ApiPropertyOptional({
        description: 'URL de la imagen del producto',
        example: 'https://example.com/images/producto.jpg',
        format: 'uri'
    })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export class UpdateProductDto {
    @ApiPropertyOptional({
        description: 'Nombre del producto',
        example: 'Computador HP i7 32GB RAM',
        minLength: 1,
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @Length(1, 100)
    nombre?: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada del producto',
        example: 'Computador portátil HP con procesador Intel i7, 32GB de RAM DDR4, disco SSD 1TB'
    })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiPropertyOptional({
        description: 'Precio del producto en la moneda local',
        example: 1899.99,
        minimum: 0,
        type: 'number',
        format: 'float'
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    precio?: number;

    @ApiPropertyOptional({
        description: 'Cantidad disponible en inventario',
        example: 15,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    stock?: number;

    @ApiPropertyOptional({
        description: 'URL de la imagen del producto',
        example: 'https://example.com/images/producto-actualizado.jpg',
        format: 'uri'
    })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export enum OrdenDireccion {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum CamposOrden {
    NOMBRE = 'nombre',
    PRECIO = 'precio',
    STOCK = 'stock',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt'
}

export class FilterProductDto {
    // Filtros de búsqueda por texto
    @ApiPropertyOptional({
        description: 'Filtrar productos por nombre (búsqueda parcial)',
    })
    @IsString()
    @IsOptional()
    nombre?: string;

    @ApiPropertyOptional({
        description: 'Filtrar productos por descripción (búsqueda parcial)',
    })
    @IsString()
    @IsOptional()
    descripcion?: string;

    // Filtros de precio
    @ApiPropertyOptional({
        description: 'Precio mínimo para filtrar productos',
        minimum: 0,
        type: 'number'
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    precioMin?: number;

    @ApiPropertyOptional({
        description: 'Precio máximo para filtrar productos',
        minimum: 0,
        type: 'number'
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    precioMax?: number;

    // Filtros de stock
    @ApiPropertyOptional({
        description: 'Stock mínimo para filtrar productos',
        minimum: 0,
        type: 'number'
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    stockMin?: number;

    @ApiPropertyOptional({
        description: 'Stock máximo para filtrar productos',
        minimum: 0,
        type: 'number'
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    stockMax?: number;

    // Filtro de disponibilidad
    @ApiPropertyOptional({
        description: 'Filtrar solo productos disponibles (con stock > 0)',
        example: true,
        type: 'boolean'
    })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    disponible?: boolean;

    // Filtros de fecha
    @ApiPropertyOptional({
        description: 'Fecha de creación mínima (formato ISO 8601)',
        format: 'date-time'
    })
    @IsDateString()
    @IsOptional()
    fechaCreacionDesde?: string;

    @ApiPropertyOptional({
        description: 'Fecha de creación máxima (formato ISO 8601)',
        format: 'date-time'
    })
    @IsDateString()
    @IsOptional()
    fechaCreacionHasta?: string;

    // Ordenamiento
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar los resultados',
        enum: CamposOrden,
        enumName: 'CamposOrden'
    })
    @IsEnum(CamposOrden)
    @IsOptional()
    ordenarPor?: CamposOrden;

    @ApiPropertyOptional({
        description: 'Dirección del ordenamiento',
        enum: OrdenDireccion,
        enumName: 'OrdenDireccion'
    })
    @IsEnum(OrdenDireccion)
    @IsOptional()
    direccionOrden?: OrdenDireccion;

    // Paginación
    @ApiPropertyOptional({
        description: 'Número máximo de productos a retornar',
        minimum: 1,
        maximum: 100,
        default: 10
    })
    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    limite?: number;

    @ApiPropertyOptional({
        description: 'Número de productos a omitir para paginación',
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}

export class UpdateStockDto {
    @ApiProperty({
        description: 'Nueva cantidad de stock para el producto',
        example: 50,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    stock: number;
}