import { Module } from '@nestjs/common';
import { ItemOrdenController } from './item-orden.controller';
import { ItemOrdenService } from './item-orden.service';

@Module({
  controllers: [ItemOrdenController],
  providers: [ItemOrdenService]
})
export class ItemOrdenModule {}
