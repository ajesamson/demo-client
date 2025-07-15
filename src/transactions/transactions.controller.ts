import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserTokenEntity } from 'src/auth/entities/user-token.entity';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() request: UserTokenEntity,
  ) {
    const { sub: uid } = request.user;
    return await this.transactionsService.create(createTransactionDto, uid);
  }

  @Get()
  async findAll() {
    return await this.transactionsService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid', new ParseUUIDPipe()) uid: string) {
    return await this.transactionsService.findOne(uid);
  }

  @Patch(':uid')
  async update(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.update(uid, updateTransactionDto);
  }
}
