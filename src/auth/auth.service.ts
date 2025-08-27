import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/UserEntity/user.entity';
import * as dotenv from 'dotenv';
import { UserService } from '../user/user.service';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
     private readonly usersService: UserService,
  ) {}

  // Validar usuario por email y contraseña
  async validateUser(username: string, password: string): Promise<User | null> {
    
    try {
      const user = await this.userRepository.findOne({ where: { username: username } });
   console.log("encontrado", user, username)
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      return isPasswordValid ? user : null;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error validando el usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Login
  async login(user: User): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = { sub: user.id, email: user.email, };

      const access_token = this.jwtService.sign(payload, {
        secret: process.env.TOKEN_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const refresh_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      return { access_token, refresh_token };
    } catch (error) {
      console.error(error);
      throw new HttpException('Error generando tokens', HttpStatus.BAD_REQUEST);
    }
  }

  // Refresh token
  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, },
        {
          secret: process.env.TOKEN_SECRET,
          expiresIn: '15m',
        },
      );

      return { access_token: newAccessToken };
    } catch (error) {
      console.error(error);
      throw new HttpException('Token de refresco inválido', HttpStatus.UNAUTHORIZED);
    }
  }

   async getMe(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId as any);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    const { password, ...userInfo } = user;
    return userInfo;
  }

}
