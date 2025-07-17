import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import {
  createWalletDtoStub,
  walletResponseDtoStub,
} from './factories/wallet.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletsController', () => {
  let controller: WalletsController;
  const mockWalletService = {
    createByUsersUid: jest.fn(async () =>
      Promise.resolve(walletResponseDtoStub[0]),
    ),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findWalletTransactions: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        {
          provide: WalletsService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletsController>(WalletsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet for user', async () => {
      await expect(controller.create(createWalletDtoStub)).resolves.toEqual(
        walletResponseDtoStub[0],
      );
      expect(mockWalletService.createByUsersUid).toHaveBeenCalledWith(
        createWalletDtoStub,
      );
    });

    it('should throw BadRequestException if user has exiting wallet', async () => {
      mockWalletService.createByUsersUid.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.create(createWalletDtoStub)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockWalletService.createByUsersUid.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.create(createWalletDtoStub)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('findTransactions', () => {});
});
