import { Controller, Post, Body, UseGuards, Get, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') authorization: string) {
    // Extract token from Bearer token
    const token = authorization.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
} 