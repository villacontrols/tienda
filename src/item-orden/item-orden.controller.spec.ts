import { Test, TestingModule } from '@nestjs/testing';
import { ItemOrdenController } from './item-orden.controller';

describe('ItemOrdenController', () => {
  let controller: ItemOrdenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemOrdenController],
    }).compile();

    controller = module.get<ItemOrdenController>(ItemOrdenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
