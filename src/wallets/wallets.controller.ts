import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateWalletDto } from './dto/create-wallet.dto';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async create(@Body() dto: CreateWalletDto) {
    return await this.walletsService.createByUsersUid(dto);
  }

  @Get()
  async findAll() {
    return await this.walletsService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid', new ParseUUIDPipe()) uid: string) {
    return await this.walletsService.findOne(uid);
  }

  @Get(':uid/transactions')
  async findTransactions(@Param('uid', new ParseUUIDPipe()) uid: string) {
    return await this.walletsService.findWalletTransactions(uid);
  }
}
