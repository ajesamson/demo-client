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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
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
