import { Module } from '@nestjs/common';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './OrdenEntity/ordenes.entity';
import { OrderItem } from 'src/item-orden/itemOrdenentity/itemOrden.entity';
import { ProductoService } from 'src/producto/producto.service';
import { UserService } from 'src/user/user.service';
import { ProductoModule } from 'src/producto/producto.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), ProductoModule, UserModule],
  controllers: [OrdenesController],
  providers: [OrdenesService]
})
export class OrdenesModule {}
