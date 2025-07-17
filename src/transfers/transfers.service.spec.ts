import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { TransferRepository } from './repositories/transfers.repository';

describe('TransfersService', () => {
  let service: TransfersService;
  const mockTransferRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: TransferRepository,
          useValue: mockTransferRepository,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
