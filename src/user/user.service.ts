import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './UserEntity/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './userDto/userDto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    // Crear usuario
    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            // Verificar si el email ya existe
            const existingUserByEmail = await this.userRepository.findOne({
                where: { email: createUserDto.email }
            });

            if (existingUserByEmail) {
                throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);
            }

            // Verificar si el username ya existe
            const existingUserByUsername = await this.userRepository.findOne({
                where: { username: createUserDto.username }
            });

            if (existingUserByUsername) {
                throw new HttpException('El nombre de usuario ya está registrado', HttpStatus.CONFLICT);
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
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error creando el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener todos los usuarios
    async findAll(): Promise<User[]> {
        try {
            return await this.userRepository.find({
                relations: ['ordenes'],
                select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    telefono: true,
                    tipo_usuario: true,
                    tipo_naturaleza: true,
                    biografia: true,
                    documento: true,
                    linkedin: true,
                    twitter: true,
                    github: true,
                    sitio_web: true,
                    esta_verificado: true,
                    foto: true,
                    status: true,
                    fecha_creacion: true,
                    fecha_actualizacion: true,
                    // Excluir password
                }
            });
        } catch (error) {
            console.error(error);
            throw new HttpException("Error obteniendo los usuarios", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener usuario por ID (formato compatible con frontend)
    async findOne(id: number): Promise<any> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['ordenes'],
                select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    telefono: true,
                    tipo_usuario: true,
                    tipo_naturaleza: true,
                    biografia: true,
                    documento: true,
                    linkedin: true,
                    twitter: true,
                    github: true,
                    sitio_web: true,
                    esta_verificado: true,
                    foto: true,
                    status: true,
                    fecha_creacion: true,
                    fecha_actualizacion: true,
                }
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Formatear respuesta para coincidir con la interfaz UserProfile del frontend
            return {
                id: user.id,
                username: user.username,
                user: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                },
                telefono: user.telefono,
                tipo_usuario: user.tipo_usuario,
                tipo_naturaleza: user.tipo_naturaleza,
                biografia: user.biografia,
                documento: user.documento,
                linkedin: user.linkedin,
                twitter: user.twitter,
                github: user.github,
                sitio_web: user.sitio_web,
                esta_verificado: user.esta_verificado,
                foto: user.foto,
                fecha_creacion: user.fecha_creacion.toISOString(),
                fecha_actualizacion: user.fecha_actualizacion.toISOString(),
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener perfil del usuario autenticado (formato compatible con frontend)
    async getPerfil(userId: number): Promise<any> {
        return await this.findOne(userId);
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

    // Obtener usuario por username
    async findByUsername(username: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { username },
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error obteniendo el usuario por username", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar usuario (uso interno)
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Si se está actualizando el email, verificar que no exista
            if (updateUserDto.email && updateUserDto.email !== user.email) {
                const existingUser = await this.userRepository.findOne({
                    where: { email: updateUserDto.email }
                });

                if (existingUser) {
                    throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);
                }
            }

            // Si se está actualizando el username, verificar que no exista
            if (updateUserDto.username && updateUserDto.username !== user.username) {
                const existingUser = await this.userRepository.findOne({
                    where: { username: updateUserDto.username }
                });

                if (existingUser) {
                    throw new HttpException('El nombre de usuario ya está registrado', HttpStatus.CONFLICT);
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

    // Actualizar perfil del usuario (compatible con frontend)
    async updatePerfil(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Actualizar campos del usuario
            if (updateProfileDto.user) {
                user.first_name = updateProfileDto.user.first_name;
                user.last_name = updateProfileDto.user.last_name;
            }

            // Actualizar otros campos del perfil
            if (updateProfileDto.telefono !== undefined) user.telefono = updateProfileDto.telefono;
            if (updateProfileDto.tipo_usuario !== undefined) user.tipo_usuario = updateProfileDto.tipo_usuario as any;
            if (updateProfileDto.tipo_naturaleza !== undefined) user.tipo_naturaleza = updateProfileDto.tipo_naturaleza as any;
            if (updateProfileDto.biografia !== undefined) user.biografia = updateProfileDto.biografia;
            if (updateProfileDto.documento !== undefined) user.documento = updateProfileDto.documento;
            if (updateProfileDto.linkedin !== undefined) user.linkedin = updateProfileDto.linkedin;
            if (updateProfileDto.twitter !== undefined) user.twitter = updateProfileDto.twitter;
            if (updateProfileDto.github !== undefined) user.github = updateProfileDto.github;
            if (updateProfileDto.sitio_web !== undefined) user.sitio_web = updateProfileDto.sitio_web;
            
            // Manejar esta_verificado como string que viene del frontend
            if (updateProfileDto.esta_verificado !== undefined) {
                user.esta_verificado = updateProfileDto.esta_verificado === 'true';
            }

            const updatedUser = await this.userRepository.save(user);

            // Retornar en formato compatible con UserProfile
            return {
                id: updatedUser.id,
                username: updatedUser.username,
                user: {
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    email: updatedUser.email,
                },
                telefono: updatedUser.telefono,
                tipo_usuario: updatedUser.tipo_usuario,
                tipo_naturaleza: updatedUser.tipo_naturaleza,
                biografia: updatedUser.biografia,
                documento: updatedUser.documento,
                linkedin: updatedUser.linkedin,
                twitter: updatedUser.twitter,
                github: updatedUser.github,
                sitio_web: updatedUser.sitio_web,
                esta_verificado: updatedUser.esta_verificado,
                foto: updatedUser.foto,
                fecha_creacion: updatedUser.fecha_creacion.toISOString(),
                fecha_actualizacion: updatedUser.fecha_actualizacion.toISOString(),
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando el perfil", HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar foto de perfil
    async updateFoto(userId: number, fotoUrl: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }
              console.log("actualizando")
            user.foto = fotoUrl;
            const updatedUser = await this.userRepository.save(user);

            // Retornar en formato compatible con UserProfile
            return {
                id: updatedUser.id,
                username: updatedUser.username,
                user: {
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    email: updatedUser.email,
                },
                telefono: updatedUser.telefono,
                tipo_usuario: updatedUser.tipo_usuario,
                tipo_naturaleza: updatedUser.tipo_naturaleza,
                biografia: updatedUser.biografia,
                documento: updatedUser.documento,
                linkedin: updatedUser.linkedin,
                twitter: updatedUser.twitter,
                github: updatedUser.github,
                sitio_web: updatedUser.sitio_web,
                esta_verificado: updatedUser.esta_verificado,
                foto: updatedUser.foto,
                fecha_creacion: updatedUser.fecha_creacion.toISOString(),
                fecha_actualizacion: updatedUser.fecha_actualizacion.toISOString(),
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error actualizando la foto", HttpStatus.BAD_REQUEST);
        }
    }

    // Inactivar/activar usuario (soft delete)
    async toggleStatus(id: number): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Alternar el estado del usuario
            user.status = !user.status;

            await this.userRepository.save(user);

            return { 
                message: `Usuario ${user.status ? 'activado' : 'desactivado'} exitosamente` 
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error cambiando el estado del usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar usuario permanentemente
    async remove(id: number): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            await this.userRepository.remove(user);
            return { message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new HttpException("Error eliminando el usuario", HttpStatus.BAD_REQUEST);
        }
    }

    // Validar contraseña (para autenticación)
    async validatePassword(identifier: string, password: string): Promise<User | null> {
        try {
            // Buscar por email o username
            const user = await this.userRepository.findOne({ 
                where: [
                    { email: identifier },
                    { username: identifier }
                ]
            });

            if (!user || !user.status) {
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            return isPasswordValid ? user : null;
        } catch (error) {
            console.error(error);
            throw new HttpException("Error validando la contraseña", HttpStatus.BAD_REQUEST);
        }
    }
}