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

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.walletsService.findOne(id);
  }

  @Get(':id/transactions')
  async findTransactions(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.walletsService.findWalletTransactions(id);
  }
}
