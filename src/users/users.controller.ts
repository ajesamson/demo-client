import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid', new ParseUUIDPipe()) uid: string) {
    return await this.usersService.findOne(uid);
  }

  @Patch(':uid')
  async update(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(uid, updateUserDto);
  }
}
