import { Test, TestingModule } from '@nestjs/testing';
import { ItemOrdenService } from './item-orden.service';

describe('ItemOrdenService', () => {
  let service: ItemOrdenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemOrdenService],
    }).compile();

    service = module.get<ItemOrdenService>(ItemOrdenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
