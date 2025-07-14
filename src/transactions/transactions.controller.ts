import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    // TODO: replace with id of currently logged in user
    const userId = 1;
    return await this.transactionsService.create(createTransactionDto, userId);
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
