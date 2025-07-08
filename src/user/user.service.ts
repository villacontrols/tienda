import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
//import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { User } from './UserEntity/user.entity';
import { CreateUserDto, UpdateUserDto } from './userDto/userDto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        //  private readonly mailerService: MailerService, 
    ) { }

    // Crear usuario
    async create(createUserDto: CreateUserDto): Promise<User | any> {
        try {
            // Verificar si el email ya existe
            const existingUser = await this.userRepository.findOne({
                where: { email: createUserDto.email }
            });

            if (existingUser) {
                throw new HttpException('El email ya está registrado', HttpStatus.FOUND);
            }

            // Hashear la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

            // Crear nuevo usuario
            const user = this.userRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });

            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof HttpException) return error
            console.error(error)
            throw new HttpException("error creando el usuario", HttpStatus.BAD_REQUEST)
        }
    }

    // Obtener todos los usuarios
    async findAll(): Promise<User[]> {
        try {
            return await this.userRepository.find({
                relations: ['ordenes'],
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo los usuarios", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener usuario por ID
    async findOne(id: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['ordenes'],
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener usuario por email
    async findByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo el usuario por email", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar usuario
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.findOne(id);

            // Si se está actualizando el email, verificar que no exista
            if (updateUserDto.email && updateUserDto.email !== user.email) {
                const existingUser = await this.userRepository.findOne({
                    where: { email: updateUserDto.email }
                });

                if (existingUser) {
                    throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);
                }
            }

            // Si se está actualizando la contraseña, hashearla
            if (updateUserDto.password) {
                const saltRounds = 10;
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
            }

            // Actualizar usuario
            Object.assign(user, updateUserDto);
            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Inactivar usuario (soft delete)
    async deactivate(id: string): Promise<{ message: string }> {
        try {
            const user = await this.findOne(id);

            // Alternar el estado del usuario
            user.status = !user.status;

            // Actualizar el usuario en la base de datos
            await this.userRepository.update(user.id, { status: user.status });

            return { message: 'Usuario cambio de estado exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error inactivando el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar usuario permanentemente
    async remove(id: string): Promise<{ message: string }> {
        try {
            const user = await this.findOne(id);
            await this.userRepository.remove(user);
            return { message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error eliminando el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Recuperar contraseña - enviar token por email
    async forgotPassword(email: string): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Generar token de recuperación
            const resetToken = uuidv4();
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token válido por 1 hora

            // Guardar token en usuario (necesitarás agregar estos campos a tu entidad)
            // user.resetToken = resetToken;
            // user.resetTokenExpiry = tokenExpiry;
            // await this.userRepository.save(user);

            // Enviar email con el token
            /*await this.mailerService.sendMail({
              to: user.email,
              subject: 'Recuperación de contraseña',
              template: 'forgot-password', // Plantilla de email
              context: {
                nombre: user.nombre,
                resetToken,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
              },
            });*/

            return { message: 'Email de recuperación enviado' };
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error enviando email de recuperación", HttpStatus.BAD_REQUEST);
        }
    }

    // Resetear contraseña con token
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            // Buscar usuario por token (necesitarás agregar estos campos a tu entidad)
            const user = await this.userRepository.findOne({
                where: {
                    // resetToken: token,
                    // resetTokenExpiry: MoreThan(new Date()),
                },
            });

            if (!user) {
                throw new HttpException('Token inválido o expirado', HttpStatus.BAD_REQUEST);
            }

            // Hashear nueva contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña y limpiar token
            user.password = hashedPassword;
            // user.resetToken = null;
            // user.resetTokenExpiry = null;
            await this.userRepository.save(user);

            return { message: 'Contraseña actualizada exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error reseteando la contraseña", HttpStatus.BAD_REQUEST);
        }
    }

    // Cambiar contraseña (usuario autenticado)
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new HttpException('Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);
            }

            // Hashear nueva contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña
            user.password = hashedPassword;
            await this.userRepository.save(user);

            return { message: 'Contraseña cambiada exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error cambiando la contraseña", HttpStatus.BAD_REQUEST);
        }
    }

    // Validar contraseña (para login)
    async validatePassword(email: string, password: string): Promise<User | any> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (!user) {
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            return isPasswordValid ? user : null;
        } catch (error) {
            if (error instanceof HttpException) return error;
            console.error(error);
            throw new HttpException("Error validando la contraseña", HttpStatus.BAD_REQUEST);
        }
    }
}