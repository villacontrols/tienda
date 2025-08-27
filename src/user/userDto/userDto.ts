import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, MinLength, MaxLength, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, TipoNaturaleza } from '../UserEntity/user.entity';

// DTO para crear usuario
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEnum(UserRole)
  tipo_usuario?: UserRole;

  @IsOptional()
  @IsEnum(TipoNaturaleza)
  tipo_naturaleza?: TipoNaturaleza;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  documento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  github?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sitio_web?: string;

  @IsOptional()
  @IsBoolean()
  esta_verificado?: boolean;

  @IsOptional()
  @IsString()
  foto?: string;
}

// DTO para actualizar usuario (uso interno/admin)
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEnum(UserRole)
  tipo_usuario?: UserRole;

  @IsOptional()
  @IsEnum(TipoNaturaleza)
  tipo_naturaleza?: TipoNaturaleza;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  documento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  github?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sitio_web?: string;

  @IsOptional()
  @IsBoolean()
  esta_verificado?: boolean;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

// Sub-DTO para la información básica del usuario
export class UserBasicInfoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;
}

// DTO para actualizar perfil (compatible con frontend)
export class UpdateProfileDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserBasicInfoDto)
  user: UserBasicInfoDto;

  @IsString()
  @MaxLength(20)
  telefono: string;

  @IsString()
  tipo_usuario: string;

  @IsString()
  tipo_naturaleza: string;

  @IsString()
  biografia: string;

  @IsString()
  @MaxLength(50)
  documento: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  github?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sitio_web?: string;

  @IsString()
  esta_verificado: string; // El frontend envía como string
}

// DTO para login
export class LoginDto {
  @IsString()
  username: string; // Puede ser email o username

  @IsString()
  @MinLength(6)
  password: string;
}

// DTO para cambiar contraseña
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

// DTO para actualizar foto
export class UpdateFotoDto {
  @IsString()
  foto: string;
}