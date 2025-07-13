import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from './knex/knex.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [KnexModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
