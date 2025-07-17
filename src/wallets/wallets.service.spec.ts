import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { UsersService } from 'src/users/users.service';
import { WalletRepository } from './repositories/wallet.repository';
import { Knex } from 'knex';
import { BadRequestException } from '@nestjs/common';
import { createWalletDtoStub } from './factories/wallet.factory';
import { userStud } from 'src/users/factories/user.factory';

describe('WalletsService', () => {
  let service: WalletsService;
  const mockUsersService = {
    findByUid: jest.fn(),
  };
  const mockRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByField: jest.fn(),
    update: jest.fn(),
  };
  const trx = {} as Knex.Transaction;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: WalletRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create wallet for user with id', async () => {
      mockRepo.create.mockReturnValue(1);

      const result = await service.create(1, trx);

      expect(result).toEqual(1);
      expect(mockRepo.create).toHaveBeenCalledWith(1, trx);
    });

    it('should throw BadRequestException for user with existing wallet', async () => {
      mockRepo.create.mockReturnValue(undefined);

      await expect(service.create(1, trx)).rejects.toThrow(BadRequestException);
      expect(mockRepo.create).toHaveBeenCalledWith(1, trx);
    });
  });

  describe('createByUsersUid', () => {
    it('should create wallet for user with uid', async () => {
      mockUsersService.findByUid.mockResolvedValue(userStud);
      jest
        .spyOn(service, 'create')
        .mockImplementation(async (user_id: number, trx?: Knex.Transaction) =>
          Promise.resolve(1),
        );

      const result = await service.createByUsersUid(createWalletDtoStub);

      expect(result).toEqual(1);
      expect(mockUsersService.findByUid).toHaveBeenCalledWith(
        createWalletDtoStub.user_id,
      );
      expect(service.create).toHaveBeenCalledWith(1);
    });
  });

  describe('updateBalance', () => {});

  describe('findByUserId', () => {});

  describe('findUserWallet', () => {});

  describe('findById', () => {});

  describe('findByUid', () => {});

  describe('findByUidList', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('findWalletTransactions', () => {});
});
