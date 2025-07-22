import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { KnexService } from 'src/knex/knex.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { UsersService } from 'src/users/users.service';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransfersService } from 'src/transfers/transfers.service';
import {
  createCreditTransactionStub,
  createTransactionTransferStub,
  creditSenderTransactionStub,
  debitSenderTransactionStub,
  receiverWalletStub,
  senderWalletStub,
  transactionResponseDtoStub,
  updateTransactionStub,
} from './factories/transaction.factory';
import * as transformer from 'class-transformer';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';
import { WalletUserEntity } from 'src/wallets/entities/wallet-user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { userStud } from 'src/users/factories/user.factory';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const mockKnexService = {
    connection: {
      transaction: jest.fn(),
    },
  };

  const mockLogger = {};
  const mockWalletService = {};
  const mockTransfersService = {};
  const mockUsersService = {
    findByUid: jest.fn(),
  };
  const mockRepo = {
    findByField: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const trx = {} as Knex.Transaction;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: KnexService,
          useValue: mockKnexService,
        },
        {
          provide: WalletsService,
          useValue: mockWalletService,
        },
        {
          provide: TransfersService,
          useValue: mockTransfersService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TransactionRepository,
          useValue: mockRepo,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    mockKnexService.connection.transaction.mockImplementation(
      async (callback) => {
        return await callback('trx');
      },
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should update transaction reference', async () => {
      const uid = transactionResponseDtoStub[0].id;
      const updatedTransaction = {
        ...transactionResponseDtoStub[0],
        reference: updateTransactionStub.reference,
      };
      mockRepo.update.mockResolvedValue(updatedTransaction);
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(updatedTransaction);

      const result = await service.update(uid, updateTransactionStub);

      expect(mockRepo.update).toHaveBeenCalledWith(uid, updateTransactionStub);
      expect(transformer.plainToInstance).toHaveBeenCalledWith(
        TransactionResponseDto,
        updatedTransaction,
        {
          excludeExtraneousValues: true,
        },
      );
      expect(result.reference).toEqual(updatedTransaction.reference);
    });

    it('should throw NotFoundException for invalid transaction uid', async () => {
      mockRepo.update.mockResolvedValue(undefined);

      await expect(
        service.update('uid-100', updateTransactionStub),
      ).rejects.toThrow(NotFoundException);
      expect(transformer.plainToInstance).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(service, 'retrieveWallets')
        .mockImplementation(async (trx: Knex.Transaction, uidList: string[]) =>
          Promise.resolve([senderWalletStub, undefined]),
        );
      jest
        .spyOn(service, 'confirmWalletStatus')
        .mockImplementation(
          (
            senderWallet: WalletUserEntity,
            receiverWallet: WalletUserEntity | undefined,
            amount: string,
            type: TransactionTypesEnum,
          ) => {},
        );
      jest
        .spyOn(service, 'initiateTransfer')
        .mockImplementation(
          async (
            trx: Knex,
            senderWallet: WalletUserEntity,
            receiverWallet: WalletUserEntity,
            dto: CreateTransactionDto,
          ) => Promise.resolve(1),
        );
      jest
        .spyOn(service, 'initiateTransaction')
        .mockImplementation(
          async (
            trx: Knex,
            userId: number,
            dto: CreateTransactionDto,
            senderWallet: WalletUserEntity,
            receiverWallet: WalletUserEntity | undefined,
            transferId: number,
          ) => Promise.resolve(1),
        );
      jest
        .spyOn(service, 'initiateWalletUpdate')
        .mockImplementation(
          async (
            trx: Knex,
            senderWallet: WalletUserEntity,
            receiverWallet: WalletUserEntity | undefined,
            dto: CreateTransactionDto,
          ) => Promise.resolve(),
        );
      mockUsersService.findByUid.mockResolvedValue(userStud);
      mockRepo.findByField.mockResolvedValue(transactionResponseDtoStub[2]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequestException for credit transaction with receiver_wallet_id', async () => {
      const dto = {
        ...createCreditTransactionStub,
        type: TransactionTypesEnum.CREDIT,
      };
      const uid = 'valid-uid';

      await expect(service.create(dto, uid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a debit transaction for sender', async () => {
      const dto = debitSenderTransactionStub;
      const uid = 'valid-uid';
      const createdTransaction = transactionResponseDtoStub[2];
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(createdTransaction);

      const result = await service.create(dto, uid);

      expect(result).toBe(createdTransaction);
      expect(mockUsersService.findByUid).toHaveBeenCalled();
      expect(service.retrieveWallets).toHaveBeenCalled();
      expect(service.confirmWalletStatus).toHaveBeenCalled();
      expect(service.initiateTransfer).not.toHaveBeenCalled();
      expect(service.initiateTransaction).toHaveBeenCalled();
      expect(service.initiateWalletUpdate).toHaveBeenCalled();
      expect(mockRepo.findByField).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create a credit transaction for sender', async () => {
      const dto = creditSenderTransactionStub;
      const uid = 'valid-uid';
      const createdTransaction = transactionResponseDtoStub[2];
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(createdTransaction);

      const result = await service.create(dto, uid);

      expect(result).toBe(createdTransaction);
      expect(mockUsersService.findByUid).toHaveBeenCalled();
      expect(service.retrieveWallets).toHaveBeenCalled();
      expect(service.confirmWalletStatus).toHaveBeenCalled();
      expect(service.initiateTransfer).not.toHaveBeenCalled();
      expect(service.initiateTransaction).toHaveBeenCalled();
      expect(service.initiateWalletUpdate).toHaveBeenCalled();
      expect(mockRepo.findByField).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create a debit and credit transaction for sender and receiver respectively', async () => {
      const dto = createTransactionTransferStub;
      const uid = 'valid-uid';
      const createdTransaction = transactionResponseDtoStub[2];
      jest
        .spyOn(service, 'retrieveWallets')
        .mockImplementation(async (trx: Knex.Transaction, uidList: string[]) =>
          Promise.resolve([senderWalletStub, receiverWalletStub]),
        );
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(createdTransaction);

      const result = await service.create(dto, uid);

      expect(result).toBe(createdTransaction);
      expect(mockUsersService.findByUid).toHaveBeenCalled();
      expect(service.retrieveWallets).toHaveBeenCalled();
      expect(service.confirmWalletStatus).toHaveBeenCalled();
      expect(service.initiateTransfer).toHaveBeenCalled();
      expect(service.initiateTransaction).toHaveBeenCalled();
      expect(service.initiateWalletUpdate).toHaveBeenCalled();
      expect(mockRepo.findByField).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('confirmWalletStatus', () => {});

  describe('initiateWalletUpdate', () => {});

  describe('initiateTransaction', () => {});

  describe('initiateTransfer', () => {});

  describe('retrieveWallets', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('findOne', () => {});

  describe('findById', () => {});

  describe('findByUid', () => {});
});
