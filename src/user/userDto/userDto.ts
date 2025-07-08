import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength, IsUrl, IsEmpty, IsBoolean } from 'class-validator';
import { UserRole } from '../UserEntity/user.entity';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsEmpty()
  @IsBoolean()
  status?: boolean;
}

export class UserResponseDto {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  createdAt: Date;
  updatedAt: Date;
  imagenUrl: string;
  status: boolean
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}