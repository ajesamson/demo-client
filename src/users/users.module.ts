import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [HttpModule],
})
export class UsersModule {}
