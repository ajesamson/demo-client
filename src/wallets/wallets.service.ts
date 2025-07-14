import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { KnexService } from 'src/knex/knex.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { plainToInstance } from 'class-transformer';
import { Knex } from 'knex';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  private readonly db_table = 'wallets';

  constructor(private readonly knexService: KnexService) {}

  async create(user_id: number, trx?: Knex.Transaction): Promise<number> {
    const query = (trx ?? this.knexService.connection)(this.db_table);
    const hasWallet = await this.findByUserId(user_id);
    if (hasWallet != undefined) {
      throw new BadRequestException('User already has wallet', {
        cause: new Error(),
        description: `Duplicate wallet creation request`,
      });
    }
    const [id] = await query.insert({ user_id: user_id });

    return id;
  }

  async findUserWallet(userId: number): Promise<WalletResponseDto> {
    const wallet = await this.findByUserId(userId);
    if (wallet == undefined) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `User has no wallet`,
      });
    }

    return plainToInstance(WalletResponseDto, wallet, {
      excludeExtraneousValues: true,
    });
  }

  async findByUserId(user_id: number): Promise<Wallet | undefined> {
    return await this.knexService
      .connection<Wallet>(this.db_table)
      .where({ user_id })
      .first();
  }

  async findById(id: number): Promise<Wallet> {
    const wallet = await this.knexService
      .connection<Wallet>(this.db_table)
      .where({ id })
      .first();

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id not found`,
      });
    }

    return wallet;
  }

  async findByUid(uid: string): Promise<Wallet> {
    const wallet = await this.knexService
      .connection<Wallet>(this.db_table)
      .where({ uid })
      .first();

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id ${uid} not found`,
      });
    }

    return wallet;
  }

  async findAll(): Promise<WalletResponseDto[]> {
    const data = await this.knexService
      .connection<Wallet>(this.db_table)
      .select();
    return plainToInstance(WalletResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string): Promise<WalletResponseDto> {
    const data = await this.findByUid(uid);
    return plainToInstance(WalletResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    updateWalletDto: UpdateWalletDto,
    trx?: Knex.Transaction,
  ): Promise<WalletResponseDto> {
    const query = (trx ?? this.knexService.connection)(this.db_table);
    const wallet = await this.findByUid(uid);
    const updatedId = await query
      .where({ id: wallet.id })
      .update(updateWalletDto);
    const updatedWallet = this.findById(updatedId);

    return plainToInstance(WalletResponseDto, updatedWallet, {
      excludeExtraneousValues: true,
    });
  }
}
