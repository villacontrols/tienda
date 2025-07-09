import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { User } from 'src/user/UserEntity/user.entity';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtRefreshStrategy } from './jwtRefreshStrategy';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [JwtModule.register({
    secret: process.env.TOKEN_SECRET,
    signOptions: {expiresIn: process.env.JWT_EXPIRES_IN}
  }), UserModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
