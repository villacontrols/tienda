import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductoController } from './producto/producto.controller';
import { ProductoModule } from './producto/producto.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemOrdenModule } from './item-orden/item-orden.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
     ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
}),
    UserModule, ProductoModule, OrdenesModule, AuthModule, ItemOrdenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
