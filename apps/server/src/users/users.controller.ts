import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.usersService.getUserById(user.userId);
  }
}
