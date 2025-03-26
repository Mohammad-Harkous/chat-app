// src/users/users.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  // Protected route
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }
}