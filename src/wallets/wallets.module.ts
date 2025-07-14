import { forwardRef, Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
  imports: [forwardRef(() => UsersModule)],
})
export class WalletsModule {}
