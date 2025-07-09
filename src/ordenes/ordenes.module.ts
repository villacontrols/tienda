import { Module } from '@nestjs/common';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './OrdenEntity/ordenes.entity';
import { OrderItem } from '../item-orden/itemOrdenentity/itemOrden.entity';
import { ProductoService } from '../producto/producto.service';
import { UserService } from '../user/user.service';
import { ProductoModule } from '../producto/producto.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), ProductoModule, UserModule],
  controllers: [OrdenesController],
  providers: [OrdenesService]
})
export class OrdenesModule {}
