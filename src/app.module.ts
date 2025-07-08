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

@Module({
  imports: [
     ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
    type: 'postgres',
      host: process.env.DB_HOST,
      port: parseFloat(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
  }),
    UserModule, ProductoModule, OrdenesModule, AuthModule, ItemOrdenModule],
  controllers: [AppController, ProductoController],
  providers: [AppService],
})
export class AppModule {}
