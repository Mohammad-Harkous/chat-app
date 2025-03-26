import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.createUser(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}