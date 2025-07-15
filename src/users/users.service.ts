import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { KnexService } from 'src/knex/knex.service';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { WalletsService } from 'src/wallets/wallets.service';
import { UserEntity } from './entities/user.entity';
import { Knex } from 'knex';
import { KarmaEntity } from './entities/karma.entity';

@Injectable()
export class UsersService {
  private readonly dbTable = 'users';
  private readonly karma_url =
    'https://adjutor.lendsqr.com/v2/verification/karma/';

  constructor(
    private readonly knexService: KnexService,
    private readonly httpService: HttpService,
    private readonly walletService: WalletsService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const karma = await this.validateUser(dto.email);
    try {
      const user = await this.knexService.connection.transaction(
        async (trx) => {
          const salt = await bcrypt.genSalt();
          const hash = await bcrypt.hash(dto.password, salt);
          const [id] = await trx(this.dbTable).insert({
            email: dto.email,
            password_hash: hash,
            fullname: dto.fullname,
            mobile: dto.mobile,
            is_onboarded: karma.data.karma_identity ? false : true,
          });
          const _walletId = await this.walletService.create(id, trx);

          return await this.findByField({ id }, trx);
        },
      );
      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }) as UserResponseDto;
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
    const users = await this.knexService
      .connection<UserEntity>(this.dbTable)
      .select();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    }) as UserResponseDto[];
  }

  async findByField(
    where: Partial<UserEntity>,
    trx?: Knex,
  ): Promise<UserEntity | undefined> {
    const query = (trx ?? this.knexService.connection)<UserEntity>(
      this.dbTable,
    );
    return await query.where(where).first();
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.findByField({ email });

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with email ${email} not found`,
      });
    }

    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.findByField({ id });

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id not found`,
      });
    }

    return user;
  }

  async findByUid(uid: string): Promise<UserEntity> {
    const user = await this.findByField({ uid });

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
    }) as UserResponseDto;
  }

  async update(
    uid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const affectedRow = await this.knexService
      .connection<UserEntity>(this.dbTable)
      .where({
        uid,
      })
      .update(updateUserDto);

    if (!affectedRow) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id ${uid} not found`,
      });
    }

    const updatedUser = this.findByUid(uid);
    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    }) as UserResponseDto;
  }
}
