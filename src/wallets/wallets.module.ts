import { forwardRef, Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { UsersModule } from 'src/users/users.module';
import { WalletRepository } from './repositories/wallet.repository';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, WalletRepository],
  exports: [WalletsService],
  imports: [forwardRef(() => UsersModule)],
})
export class WalletsModule {}
