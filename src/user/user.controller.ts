import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    UseGuards,
    Request
} from '@nestjs/common';
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
    ApiBearerAuth
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './userDto/userDto';
import { User } from './UserEntity/user.entity';
import { JwtAuthGuard } from 'src/auth/autGuard';

// DTOs para endpoints específicos con decoraciones Swagger
class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email del usuario para recuperar contraseña',
        example: 'usuario@example.com'
    })
    email: string;
}

class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de recuperación de contraseña',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña',
        example: 'nuevaPassword123'
    })
    newPassword: string;
}

class ChangePasswordDto {
    @ApiProperty({
        description: 'Contraseña actual',
        example: 'passwordActual123'
    })
    currentPassword: string;

    @ApiProperty({
        description: 'Nueva contraseña',
        example: 'nuevaPassword123'
    })
    newPassword: string;
}

class ValidatePasswordDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'usuario@example.com'
    })
    email: string;

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
@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // Crear usuario
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema con email único'
    })
    @ApiCreatedResponse({
        description: 'Usuario creado exitosamente',
        type: User
    })
    @ApiConflictResponse({
        description: 'El email ya está registrado'
    })
    @ApiBadRequestResponse({
        description: 'Error en los datos proporcionados'
    })

    @ApiBody({
        type: CreateUserDto,
        examples: {
            'Usuario Jhon': {
                value: {
                    nombre: 'jhon',
                    email: 'jhon@gmail.com',
                    password: '12345678',
                    rol: 'admin'
                }
            }
        }
    })
    async create(@Body() createUserDto: CreateUserDto): Promise<User | any> {
        return await this.userService.create(createUserDto);
    }


    // Obtener todos los usuarios
    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener todos los usuarios',
        description: 'Retorna una lista de todos los usuarios registrados con sus relaciones'
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
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Usuario encontrado exitosamente',
        type: User
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error obteniendo el usuario'
    })
    async findOne(@Param('id') id: string): Promise<User> {
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

    // Actualizar usuario
     @UseGuards(JwtAuthGuard)
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos de un usuario existente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Usuario actualizado exitosamente',
        type: User
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiConflictResponse({
        description: 'El email ya está registrado por otro usuario'
    })
    @ApiBadRequestResponse({
        description: 'Error actualizando el usuario'
    })
    @ApiBody({
        type: UpdateUserDto,
        examples: {
            'Actualizar Usuario Jhon': {
                value: {
                    nombre: 'jhon anderson',
                    rol: 'admin'
                }
            }
        }
    })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return await this.userService.update(id, updateUserDto);
    }

    // Inactivar usuario (soft delete)
     @UseGuards(JwtAuthGuard)
    @Delete('deactivate/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Inactivar usuario',
        description: 'Inactiva un usuario sin eliminarlo permanentemente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 'uuid-123-456-789'
    })
    @ApiOkResponse({
        description: 'Usuario inactivado exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error inactivando el usuario'
    })
    async deactivate(@Param('id') id: string): Promise<{ message: string }> {
        return await this.userService.deactivate(id);
    }

    // Eliminar usuario permanentemente
     @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar usuario permanentemente',
        description: 'Elimina un usuario de forma permanente del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 'uuid-123-456-789'
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
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.userService.remove(id);
    }

    // Recuperar contraseña - enviar token por email
     @UseGuards(JwtAuthGuard)
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Solicitar recuperación de contraseña',
        description: 'Envía un token de recuperación de contraseña al email del usuario'
    })
    @ApiOkResponse({
        description: 'Email de recuperación enviado exitosamente',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Error enviando email de recuperación'
    })
    @ApiBody({ type: ForgotPasswordDto })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        return await this.userService.forgotPassword(forgotPasswordDto.email);
    }

    // Resetear contraseña con token
     @UseGuards(JwtAuthGuard)
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Resetear contraseña con token',
        description: 'Permite cambiar la contraseña usando un token de recuperación'
    })
    @ApiOkResponse({
        description: 'Contraseña actualizada exitosamente',
        type: MessageResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Token inválido o expirado'
    })
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        return await this.userService.resetPassword(
            resetPasswordDto.token,
            resetPasswordDto.newPassword
        );
    }

    // Cambiar contraseña (usuario autenticado)
     @UseGuards(JwtAuthGuard)
    @Put('change-password/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cambiar contraseña',
        description: 'Permite a un usuario autenticado cambiar su contraseña'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        example: 'uuid-123-456-789'
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
    // @UseGuards(AuthGuard) // Descomenta si tienes un guard de autenticación
    async changePassword(
        @Param('id') userId: string,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        return await this.userService.changePassword(
            userId,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword
        );
    }

    // Validar contraseña (para login)
    @Post('validate-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validar contraseña',
        description: 'Valida las credenciales de un usuario para el proceso de login'
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
            validatePasswordDto.email,
            validatePasswordDto.password
        );
    }
}