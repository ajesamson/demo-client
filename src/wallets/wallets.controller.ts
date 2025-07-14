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
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  async create(@Body() dto: CreateWalletDto) {
    const user = await this.userService.findByUid(dto.user_id);
    const _walletId = await this.walletsService.create(user.id);
    return await this.walletsService.findByUserId(user.id);
  }

  @Get()
  async findAll() {
    return await this.walletsService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid', new ParseUUIDPipe()) uid: string) {
    return await this.walletsService.findOne(uid);
  }

  @Patch(':uid')
  async update(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Body() updateWalletDto: UpdateWalletDto,
  ) {
    return await this.walletsService.update(uid, updateWalletDto);
  }
}
