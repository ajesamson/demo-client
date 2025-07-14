import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [HttpModule, forwardRef(() => WalletsModule)],
  exports: [UsersService],
})
export class UsersModule {}
