import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guards';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async logIn(@Body() loginDto: LoginDto) {
    return await this.authService.signIn(loginDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
