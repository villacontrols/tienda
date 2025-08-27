import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    UseGuards,
    Request,
    ParseIntPipe,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBadRequestResponse,
    ApiProperty,
    ApiBearerAuth,
    ApiConsumes
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto, LoginDto, ChangePasswordDto } from './userDto/userDto';
import { User } from './UserEntity/user.entity';
import { JwtAuthGuard } from '../auth/guards/autGuard';
import { RolesGuard } from '../util/permisosRoles/roles.guard';
import { Roles } from '../util/permisosRoles/roles.decorator';
import { SupabaseService } from 'src/util/storage';

// DTOs para endpoints específicos con decoraciones Swagger
class UpdateFotoRequestDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Archivo de imagen para la foto de perfil'
    })
    foto: any;
}

class ValidatePasswordDto {
    @ApiProperty({
        description: 'Email o username del usuario',
        example: 'usuario@example.com'
    })
    identifier: string;

    @ApiProperty({
        description: 'Contraseña a validar',
        example: 'password123'
    })
    password: string;
}

// DTO para respuestas de mensajes
class MessageResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Operación exitosa'
    })
    message: string;
}

// DTO para la respuesta del perfil de usuario
class UserProfileResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'john_doe' })
    username: string;

    @ApiProperty({
        type: 'object',
        properties: {
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' }
        }
    })
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };

    @ApiProperty({ example: '123456789' })
    telefono: string;

    @ApiProperty({ example: 'cliente' })
    tipo_usuario: string;

    @ApiProperty({ example: 'natural' })
    tipo_naturaleza: string;

    @ApiProperty({ example: 'Desarrollador full stack' })
    biografia: string;

    @ApiProperty({ example: '12345678' })
    documento: string;

    @ApiProperty({ example: 'https://linkedin.com/in/johndoe', required: false })
    linkedin?: string;

    @ApiProperty({ example: 'https://twitter.com/johndoe', required: false })
    twitter?: string;

    @ApiProperty({ example: 'https://github.com/johndoe', required: false })
    github?: string;

    @ApiProperty({ example: 'https://johndoe.dev', required: false })
    sitio_web?: string;

    @ApiProperty({ example: false })
    esta_verificado: boolean;

    @ApiProperty({ example: 'https://example.com/foto.jpg', required: false })
    foto?: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    fecha_creacion: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    fecha_actualizacion: string;
}

@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller('usuario')
export class UserController {
    private readonly PROCEDIMIENTO_BUCKET = 'evidencias';
    constructor(
        private readonly userService: UserService,
         private readonly supabaseService: SupabaseService,

    ) { }

    // Crear usuario
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema con email y username únicos'
    })
    @ApiCreatedResponse({
        description: 'Usuario creado exitosamente',
        type: User
    })
    @ApiConflictResponse({
        description: 'El email o username ya está registrado'
    })
    @ApiBadRequestResponse({
        description: 'Error en los datos proporcionados'
    })
    @ApiBody({
        type: CreateUserDto,
        examples: {
            'Usuario Completo': {
                value: {
                    username: 'johndoe',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@gmail.com',
                    password: '12345678',
                    telefono: '123456789',
                    tipo_usuario: 'cliente',
                    tipo_naturaleza: 'natural',
                    biografia: 'Desarrollador full stack',
                    documento: '12345678'
                }
            }
        }
    })
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.create(createUserDto);
    }

    // Obtener todos los usuarios (solo admin)
   
 
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener todos los usuarios',
        description: 'Retorna una lista de todos los usuarios registrados (solo admin)'
    })
    @ApiOkResponse({
        description: 'Lista de usuarios obtenida exitosamente',
        type: [User]
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo los usuarios'
    })
    async findAll(): Promise<User[]> {
        return await this.userService.findAll();
    }

    // Obtener perfil del usuario autenticado
    @UseGuards(JwtAuthGuard)
    @Get('perfil')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Retorna el perfil del usuario actualmente autenticado'
    })
    @ApiOkResponse({
        description: 'Perfil obtenido exitosamente',
        type: UserProfileResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el perfil'
    })
    async getPerfil(@Request() req): Promise<UserProfileResponseDto> {
        const userId = req.user.id; // Extraer del JWT
        return await this.userService.getPerfil(userId);
    }

    // Obtener usuario por ID
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener usuario por ID',
        description: 'Retorna un usuario específico basado en su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 1
    })
    @ApiOkResponse({
        description: 'Usuario encontrado exitosamente',
        type: UserProfileResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el usuario'
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfileResponseDto> {
        return await this.userService.findOne(id);
    }

    // Obtener usuario por email
    @Get('email/:email')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener usuario por email',
        description: 'Retorna un usuario específico basado en su email'
    })
    @ApiParam({
        name: 'email',
        description: 'Email del usuario',
        example: 'usuario@example.com'
    })
    @ApiOkResponse({
        description: 'Usuario encontrado exitosamente',
        type: User
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el usuario por email'
    })
    async findByEmail(@Param('email') email: string): Promise<User> {
        return await this.userService.findByEmail(email);
    }

    // Obtener usuario por username
    @Get('username/:username')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener usuario por username',
        description: 'Retorna un usuario específico basado en su username'
    })
    @ApiParam({
        name: 'username',
        description: 'Username del usuario',
        example: 'johndoe'
    })
    @ApiOkResponse({
        description: 'Usuario encontrado exitosamente',
        type: User
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el usuario por username'
    })
    async findByUsername(@Param('username') username: string): Promise<User> {
        return await this.userService.findByUsername(username);
    }

    // Actualizar perfil del usuario autenticado
    @UseGuards(JwtAuthGuard)
    @Put('perfil')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar perfil del usuario',
        description: 'Actualiza el perfil del usuario autenticado'
    })
    @ApiOkResponse({
        description: 'Perfil actualizado exitosamente',
        type: UserProfileResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el perfil'
    })
    @ApiBody({
        type: UpdateProfileDto,
        examples: {
            'Actualizar Perfil': {
                value: {
                    user: {
                        first_name: 'John Updated',
                        last_name: 'Doe Updated'
                    },
                    telefono: '987654321',
                    tipo_usuario: 'cliente',
                    tipo_naturaleza: 'natural',
                    biografia: 'Desarrollador senior full stack',
                    documento: '87654321',
                    linkedin: 'https://linkedin.com/in/johndoe',
                    twitter: 'https://twitter.com/johndoe',
                    github: 'https://github.com/johndoe',
                    sitio_web: 'https://johndoe.dev',
                    esta_verificado: 'false'
                }
            }
        }
    })
    async updatePerfil(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto
    ): Promise<UserProfileResponseDto> {
        const userId = req.user.id; // Extraer del JWT
        return await this.userService.updatePerfil(userId, updateProfileDto);
    }

    // Actualizar foto de perfil
    @UseGuards(JwtAuthGuard)
    @Patch('perfil/foto')
    @UseInterceptors(FileInterceptor('foto'))
    @ApiConsumes('multipart/form-data')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar foto de perfil',
        description: 'Actualiza la foto de perfil del usuario autenticado'
    })
    @ApiOkResponse({
        description: 'Foto actualizada exitosamente',
        type: UserProfileResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando la foto'
    })
    @ApiBody({
        type: UpdateFotoRequestDto
    })
    async updateFoto(
        @Request() req,
        @UploadedFile() file: Express.Multer.File
    ): Promise<UserProfileResponseDto> {
        const userId = req.user.id; // Extraer del JWT
        
        // Aquí deberías implementar la lógica para guardar el archivo
        // Por ejemplo, usando un servicio de almacenamiento como AWS S3, Cloudinary, etc.
        // Para este ejemplo, asumimos que tienes una función que maneja el archivo
        const fotoUrl = await this.handleFileUpload(file);
        
        return await this.userService.updateFoto(userId, fotoUrl);
    }

    // Actualizar usuario (uso administrativo)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar usuario (admin)',
        description: 'Actualiza cualquier usuario (solo admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 1
    })
    @ApiOkResponse({
        description: 'Usuario actualizado exitosamente',
        type: User
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiConflictResponse({
        description: 'El email o username ya está registrado por otro usuario'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el usuario'
    })
    @ApiBody({
        type: UpdateUserDto,
        examples: {
            'Actualizar Usuario': {
                value: {
                    first_name: 'John Anderson',
                    tipo_usuario: 'admin',
                    esta_verificado: true
                }
            }
        }
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return await this.userService.update(id, updateUserDto);
    }

    // Cambiar estado del usuario (activar/desactivar)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('toggle-status/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cambiar estado del usuario',
        description: 'Activa o desactiva un usuario (solo admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 1
    })
    @ApiOkResponse({
        description: 'Estado cambiado exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error cambiando el estado del usuario'
    })
    async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this.userService.toggleStatus(id);
    }

    // Eliminar usuario permanentemente
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar usuario permanentemente',
        description: 'Elimina un usuario de forma permanente del sistema (solo admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 1
    })
    @ApiOkResponse({
        description: 'Usuario eliminado exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error eliminando el usuario'
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this.userService.remove(id);
    }

    // Cambiar contraseña (usuario autenticado)
    @UseGuards(JwtAuthGuard)
    @Put('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cambiar contraseña',
        description: 'Permite a un usuario autenticado cambiar su contraseña'
    })
    @ApiOkResponse({
        description: 'Contraseña cambiada exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Contraseña actual incorrecta o error cambiando la contraseña'
    })
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(
        @Request() req,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        const userId = req.user.id; // Extraer del JWT
        return {message: ""}/*await this.userService.changePassword(
            userId,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword
        );*/
    }

    // Validar contraseña (para autenticación - uso interno)
    @Post('validate-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validar contraseña',
        description: 'Valida las credenciales de un usuario (uso interno para autenticación)'
    })
    @ApiOkResponse({
        description: 'Contraseña validada exitosamente',
        type: User
    })
    @ApiBadRequestResponse({
        description: 'Credenciales inválidas o error validando la contraseña'
    })
    @ApiBody({ type: ValidatePasswordDto })
    async validatePassword(@Body() validatePasswordDto: ValidatePasswordDto): Promise<User | null> {
        return await this.userService.validatePassword(
            validatePasswordDto.identifier,
            validatePasswordDto.password
        );
    }

    // Método auxiliar para manejar subida de archivos
   private async handleFileUpload(file: Express.Multer.File): Promise<string> {
    // 1. Creas el nombre de archivo único
    const filename = `${Date.now()}-${file.originalname}`;

    // 2. Usas ese 'filename' al llamar al servicio de subida
    const result = await this.supabaseService.uploadFile(
        this.PROCEDIMIENTO_BUCKET, // Nombre del bucket
        file.buffer,              // El contenido del archivo
        file.mimetype,            // El tipo de archivo (e.g., 'image/jpeg')
        filename                  // <--- AQUÍ VA TU VARIABLE
    );

    return result.publicUrl;
}
}
























