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
import { ProductoService } from './producto.service';
import { CreateProductDto, UpdateProductDto, FilterProductDto, UpdateStockDto } from './productoDto/productoDto';
import { JwtAuthGuard } from '../auth/guards/autGuard';
import { RolesGuard } from '../util/permisosRoles/roles.guard';
import { Roles } from '../util/permisosRoles/roles.decorator';
import { Product } from './entity/producto.entity';

// DTOs para endpoints específicos con decoraciones Swagger
class SearchProductDto {
    @ApiProperty({
        description: 'Nombre del producto a buscar',
        example: 'Laptop Dell'
    })
    nombre: string;
}

class LowStockQueryDto {
    @ApiProperty({
        description: 'Límite de stock para considerar como bajo',
        example: 10,
        default: 10
    })
    limite: number;
}

class CountResponseDto {
    @ApiProperty({
        description: 'Total de productos encontrados',
        example: 150
    })
    count: number;
}

// DTO para respuestas de mensajes
class MessageResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Operación exitosa'
    })
    message: string;
}

@ApiBearerAuth()
@ApiTags('Productos')
@Controller('producto')
export class ProductoController {
    constructor(private readonly productService: ProductoService) { }

    // Crear producto
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nuevo producto',
        description: 'Crea un nuevo producto en el sistema con datos específicos'
    })
    @ApiCreatedResponse({
        description: 'Producto creado exitosamente',
        type: Product
    })
    @ApiConflictResponse({
        description: 'El producto ya existe o hay conflicto en los datos'
    })
    @ApiBadRequestResponse({
        description: 'Error en los datos proporcionados'
    })
    @ApiBody({
        type: CreateProductDto
    })
    async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return await this.productService.create(createProductDto);
    }

    // Obtener todos los productos con filtros opcionales
    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener todos los productos',
        description: 'Retorna una lista de todos los productos con filtros opcionales'
    })
    
    @ApiOkResponse({
        description: 'Lista de productos obtenida exitosamente',
        type: [Product]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo los productos'
    })
    async findAll(@Query() filters: FilterProductDto): Promise<Product[]> {
        return await this.productService.findAll(filters);
    }

    // Obtener producto por ID
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener producto por ID',
        description: 'Retorna un producto específico basado en su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del producto',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Producto encontrado exitosamente',
        type: Product
    })
    @ApiNotFoundResponse({
        description: 'Producto no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el producto'
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
        return await this.productService.findOne(id);
    }

    // Actualizar producto
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar producto',
        description: 'Actualiza los datos de un producto existente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del producto',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Producto actualizado exitosamente',
        type: Product
    })
    @ApiNotFoundResponse({
        description: 'Producto no encontrado'
    })
    @ApiConflictResponse({
        description: 'Conflicto en los datos del producto'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el producto'
    })
    @ApiBody({
        type: UpdateProductDto,
        examples: {
            'Actualizar Producto': {
                value: {
                    nombre: 'Laptop Dell Inspiron 15 Pro',
                    precio: 999.99,
                    stock: 45
                }
            }
        }
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto
    ): Promise<Product> {
        return await this.productService.update(id, updateProductDto);
    }

    // Eliminar producto
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar producto',
        description: 'Elimina un producto del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del producto',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Producto eliminado exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Producto no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error eliminando el producto'
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        return await this.productService.remove(id);
    }

    // Buscar productos por nombre
    @UseGuards(JwtAuthGuard)
    @Get('search/name')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Buscar productos por nombre',
        description: 'Busca productos que coincidan con el nombre proporcionado'
    })
    @ApiQuery({
        name: 'nombre',
        description: 'Nombre del producto a buscar',
        example: 'Laptop Dell'
    })
    @ApiOkResponse({
        description: 'Productos encontrados exitosamente',
        type: [Product]
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron productos con ese nombre'
    })
    @ApiBadRequestResponse({
        description: 'Error en la búsqueda de productos'
    })
    async findByName(@Query('nombre') nombre: string): Promise<Product[]> {
        return await this.productService.findByName(nombre);
    }

    // Obtener productos con stock bajo
    @UseGuards(JwtAuthGuard)
    @Get('stock/low')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener productos con stock bajo',
        description: 'Retorna productos que tienen stock por debajo del límite especificado'
    })
    @ApiQuery({
        name: 'limite',
        description: 'Límite de stock para considerar como bajo',
        example: 10,
        required: false
    })
    @ApiOkResponse({
        description: 'Productos con stock bajo obtenidos exitosamente',
        type: [Product]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo productos con stock bajo'
    })
    async findLowStock(@Query('limite', ParseIntPipe) limite: number = 10): Promise<Product[]> {
        return await this.productService.findLowStock(limite);
    }

    // Actualizar stock específico
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/stock')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar stock de producto',
        description: 'Actualiza únicamente el stock de un producto específico'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del producto',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Stock actualizado exitosamente',
        type: Product
    })
    @ApiNotFoundResponse({
        description: 'Producto no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el stock'
    })
    @ApiBody({
        type: UpdateStockDto,
        examples: {
            'Actualizar Stock': {
                value: {
                    stock: 100
                }
            }
        }
    })
    async updateStock(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateStockDto: UpdateStockDto
    ): Promise<Product> {
        return await this.productService.updateStock(id, updateStockDto.stock);
    }

    // Contar productos con filtros
    @UseGuards(JwtAuthGuard)
    @Get('count/total')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Contar productos',
        description: 'Retorna el número total de productos que coinciden con los filtros'
    })
    @ApiQuery({
        name: 'categoria',
        required: false,
        description: 'Filtrar por categoría',
        example: 'Tecnología'
    })
    @ApiQuery({
        name: 'marca',
        required: false,
        description: 'Filtrar por marca',
        example: 'Dell'
    })
    @ApiOkResponse({
        description: 'Conteo de productos obtenido exitosamente',
        type: CountResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Error contando los productos'
    })
    async count(@Query() filters: FilterProductDto) {
        return await this.productService.count(filters);
    }
}