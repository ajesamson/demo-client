import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { KnexService } from 'src/knex/knex.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { HttpService } from '@nestjs/axios';
import { UserRepository } from './repositories/user.repository';
import {
  badKarmaResponse,
  createUserDtoStub,
  goodKarmaResponse,
  updateUserDtoStub,
  userResponseDtoStub,
  userStud,
} from './factories/user.factory';
import { of } from 'rxjs';
import * as transformer from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  const mockKnexService = {
    connection: {
      transaction: jest.fn(),
    },
  };

  const mockWalletService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };
  const mockHttpService = {
    get: jest.fn(),
  };
  const mockRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByField: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: KnexService,
          useValue: mockKnexService,
        },
        {
          provide: WalletsService,
          useValue: mockWalletService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: UserRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user if email is not blacklisted', async () => {
      const responseDto = userResponseDtoStub[0];
      jest.spyOn(transformer, 'plainToInstance').mockReturnValue(responseDto);
      mockHttpService.get.mockReturnValue(of(goodKarmaResponse));
      mockKnexService.connection.transaction.mockImplementation(
        async (callback) => {
          return await callback('trx');
        },
      );

      mockRepo.create.mockReturnValue(1);
      mockWalletService.create.mockReturnValue(1);
      mockRepo.findByField.mockReturnValue(userStud);

      const result = await service.createUser(createUserDtoStub);

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockWalletService.create).toHaveBeenCalled();
      expect(mockRepo.findByField).toHaveBeenCalled();
      expect(transformer.plainToInstance).toHaveBeenCalledWith(
        UserResponseDto,
        userStud,
        {
          excludeExtraneousValues: true,
        },
      );
      expect(result).toEqual(responseDto);
    });

    it('should raise BadRequestException if email already exist', async () => {
      mockHttpService.get.mockReturnValue(of(goodKarmaResponse));
      mockKnexService.connection.transaction.mockImplementation(
        async (callback) => {
          return await callback('trx');
        },
      );
      mockRepo.create.mockReturnValue(undefined);
      await expect(service.createUser(createUserDtoStub)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(createUserDtoStub)).rejects.toThrow(
        'Email is already registered',
      );

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockWalletService.create).not.toHaveBeenCalled();
      expect(mockRepo.findByField).not.toHaveBeenCalled();
    });

    it('should raise BadRequestException if email is blacklisted', async () => {
      mockHttpService.get.mockReturnValue(of(badKarmaResponse));

      await expect(service.createUser(createUserDtoStub)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockWalletService.create).not.toHaveBeenCalled();
      expect(mockRepo.findByField).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should list all users', async () => {
      mockRepo.findAll.mockReturnValue(userStud);
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(userResponseDtoStub.slice(0, 3));

      const result = await service.findAll();

      expect(result).toEqual(userResponseDtoStub.slice(0, 3));
      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(transformer.plainToInstance).toHaveBeenCalledWith(
        UserResponseDto,
        userStud,
        {
          excludeExtraneousValues: true,
        },
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user with specified email', async () => {
      mockRepo.findByField.mockReturnValue(userStud);

      const result = await service.findByEmail(userStud.email);

      expect(result).toEqual(userStud);
      expect(result.email).toEqual(userStud.email);
      expect(mockRepo.findByField).toHaveBeenCalled();
    });

    it('should raise NotFoundException if user with email is not found', async () => {
      mockRepo.findByField.mockReturnValue(undefined);

      await expect(service.findByEmail('123@w.com')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.findByField).toHaveBeenCalled();
    });
  });

  describe('findById', () => {});

  describe('findByUid', () => {});

  describe('findOne', () => {});

  describe('update', () => {
    it('should hash password and update user', async () => {
      const hashedSecret = 'hashed';
      const updatedUser = {
        ...userResponseDtoStub[1],
        fullname: updateUserDtoStub.fullname,
      };
      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => 'salt');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => hashedSecret);
      jest.spyOn(transformer, 'plainToInstance').mockReturnValue(updatedUser);
      mockRepo.update.mockReturnValue(updatedUser);

      const result = await service.update(userStud.uid, updateUserDtoStub);

      expect(result).toEqual(updatedUser);
      expect(mockRepo.update).toHaveBeenCalledWith(userStud.uid, {
        password_hash: hashedSecret,
        fullname: updatedUser.fullname,
      });
    });

    it('should update only fullname when password is not present', async () => {
      const { fullname } = updateUserDtoStub;
      const userResponseDto = {
        ...userResponseDtoStub[2],
        fullname: updateUserDtoStub.fullname,
      };
      const updatedUser = {
        ...userStud,
        uid: userResponseDto.id,
        email: userResponseDto.email,
        mobile: userResponseDto.mobile,
        fullname: userResponseDto.fullname,
      };
      const uid = updatedUser.uid;
      mockRepo.update.mockReturnValue(updatedUser);
      jest
        .spyOn(transformer, 'plainToInstance')
        .mockReturnValue(userResponseDto);

      const result = await service.update(uid, { fullname });

      expect(mockRepo.update).toHaveBeenCalledWith(uid, { fullname });
      expect(result).toEqual(userResponseDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockRepo.update.mockReturnValue(undefined);

      await expect(
        service.update('uid-not-found', updateUserDtoStub),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
