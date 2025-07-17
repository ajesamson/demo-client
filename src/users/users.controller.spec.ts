import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  createUserDtoStub,
  updateUserDtoStub,
  userResponseDtoStub,
} from './factories/user.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    createUser: jest.fn(async (dto) => Promise.resolve(userResponseDtoStub[0])),
    findAll: jest.fn(async () => Promise.resolve(userResponseDtoStub)),
    findOne: jest.fn(async (uid: string) => {
      const user = userResponseDtoStub.find((dto) => dto.id == uid);
      return await Promise.resolve(user);
    }),
    update: jest.fn(async (uid: string, dto: UpdateUserDto) => {
      const user = { ...userResponseDtoStub[0], fullname: dto.fullname };
      return await Promise.resolve(user);
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with valid dto', async () => {
      await expect(controller.create(createUserDtoStub)).resolves.toEqual(
        userResponseDtoStub[0],
      );
      expect(mockUsersService.createUser).toHaveBeenCalled();
    });
    it('should not create a user with invalid dto', async () => {
      (mockUsersService.createUser as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );
      await expect(controller.create(createUserDtoStub)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should retrieve all users', async () => {
      await expect(controller.findAll()).resolves.toEqual(userResponseDtoStub);
    });
  });

  describe('findOne', () => {
    it('should return a use when id is valid', async () => {
      const dto = userResponseDtoStub[0];
      await expect(controller.findOne(dto.id)).resolves.toEqual(dto);
    });
    it('should throw an error for invalid id', async () => {
      (mockUsersService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );
      await expect(controller.findOne('abc')).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('update', () => {
    it('should update a user with valid id', async () => {
      const dto = userResponseDtoStub[0];
      const result = await controller.update(dto.id, updateUserDtoStub);

      expect(result.fullname).toBe(updateUserDtoStub.fullname);
    });
    it('should throw an error for invalid id update', async () => {
      (mockUsersService.update as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );
      await expect(controller.update('abc', updateUserDtoStub)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });
});
