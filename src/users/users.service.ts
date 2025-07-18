import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { KnexService } from '../knex/knex.service';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { WalletsService } from '../wallets/wallets.service';
import { UserEntity } from './entities/user.entity';
import { Knex } from 'knex';
import { KarmaEntity } from './entities/karma.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly karma_url =
    'https://adjutor.lendsqr.com/v2/verification/karma/';

  constructor(
    private readonly knexService: KnexService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => WalletsService))
    private readonly walletService: WalletsService,
    private readonly repo: UserRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const karma = await this.validateUser(dto.email);
    if (karma.status != 'success') {
      throw new BadRequestException('User could not be validated.');
    }
    if (!karma['mock-response'] && karma.data.karma_identity != null) {
      throw new BadRequestException('User has been blacklisted');
    }
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(dto.password, salt);
      const data = {
        email: dto.email,
        password_hash: hash,
        fullname: dto.fullname,
        mobile: dto.mobile,
        is_onboarded: true,
      } as UserEntity;
      const user = await this.knexService.connection.transaction(
        async (trx) => {
          const id = await this.repo.create(data, trx);
          if (id == undefined) {
            throw new BadRequestException('Email is already registered');
          }
          await this.walletService.create(id, trx);
          return await this.repo.findByField({ id }, trx);
        },
      );
      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async validateUser(email: string): Promise<KarmaEntity> {
    const API_KEY = process.env.ADJUTOR_API_KEY;
    if (!API_KEY) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
      );
      // TODO: add log to configure the API_KEY before proceeding
    }
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${API_KEY}` },
    };
    const { data } = await firstValueFrom(
      this.httpService
        .get<KarmaEntity>(`${this.karma_url}${email}`, config)
        .pipe(
          catchError((_error: AxiosError) => {
            throw new BadRequestException();
          }),
        ),
    );

    return data;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.repo.findByField({ email });

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with email ${email} not found`,
      });
    }

    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.repo.findByField({ id });

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id not found`,
      });
    }

    return user;
  }

  async findByUid(uid: string, trx?: Knex): Promise<UserEntity> {
    const user = await this.repo.findByField({ uid }, trx);

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id ${uid} not found`,
      });
    }

    return user;
  }

  async findOne(uid: string): Promise<UserResponseDto> {
    const user = await this.findByUid(uid);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const data = {} as UserEntity;
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(updateUserDto.password, salt);
      data.password_hash = hash;
    }
    if (updateUserDto.fullname) {
      data.fullname = updateUserDto.fullname;
    }
    const updatedUser = await this.repo.update(uid, data);

    if (!updatedUser) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id ${uid} not found`,
      });
    }

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }
}
