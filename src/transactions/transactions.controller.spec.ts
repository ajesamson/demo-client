import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import {
  debitSenderTransactionStub,
  transactionResponseDtoStub,
  transactionTransferStub,
  updateTransactionStub,
  userTokenStub,
} from './factories/transaction.factory';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  const mockTransactionService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionService },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction with authenticated user', async () => {
      const dto = debitSenderTransactionStub;
      const request = userTokenStub;
      mockTransactionService.create.mockResolvedValue(
        transactionTransferStub[0],
      );

      const result = await controller.create(dto, request);

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        dto,
        request.user.sub,
      );
      expect(result).toEqual(transactionTransferStub[0]);
    });
  });

  describe('update', () => {
    it('should update the transaction reference', async () => {
      const updatedData = {
        ...transactionResponseDtoStub[0],
        reference: updateTransactionStub.reference,
      };
      mockTransactionService.update.mockResolvedValue(updatedData);

      const result = await controller.update(
        updatedData.id,
        updateTransactionStub,
      );

      expect(mockTransactionService.update).toHaveBeenCalledWith(
        updatedData.id,
        updateTransactionStub,
      );
      expect(result).toEqual(updatedData);
    });
  });

  describe('findAll', () => {});

  describe('findOne', () => {});
});
