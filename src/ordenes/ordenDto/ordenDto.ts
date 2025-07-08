import { IsArray, IsNotEmpty, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../OrdenEntity/ordenes.entity';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
