import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthenticatedUserEntity,
  UserTokenEntity,
} from './entities/user-token.entity';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async logIn(@Body() loginDto: LoginDto) {
    return await this.authService.signIn(loginDto);
  }

  @Get('profile')
  getProfile(@Request() req: UserTokenEntity): AuthenticatedUserEntity {
    return req.user;
  }
}
