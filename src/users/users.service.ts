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
import { User } from './entities/user.entity';

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
    // TODO: Confirm the user is not part of blacklist
    const isValidated = await this.validateUser(dto.email);
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
            is_onboarded: true,
          });
          // TODO: Create wallet for user in a transaction
          const _walletId = await this.walletService.create(id, trx);

          return await this.findById(id);
        },
      );
      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('User account creation failed', {
        cause: error,
        description: 'Problem creating account and wallet',
      });
    }
    throw new Error('User account not processed');
  }

  async validateUser(email: string): Promise<boolean> {
    const API_KEY = process.env.ADJUTOR_API_KEY;
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${API_KEY}` },
    };
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.karma_url}${email}`, config).pipe(
        catchError((_error: AxiosError) => {
          throw new BadRequestException();
        }),
      ),
    );

    return data;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.knexService
      .connection<User>(this.dbTable)
      .select();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.knexService
      .connection<User>(this.dbTable)
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: `User with id not found`,
      });
    }

    return user;
  }

  async findByUid(uid: string): Promise<User> {
    const user = await this.knexService
      .connection<User>(this.dbTable)
      .where({ uid })
      .first();

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

  async update(uid: string, updateUserDto: UpdateUserDto) {
    const affectedRow = await this.knexService
      .connection<User>(this.dbTable)
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
    });
  }
}
