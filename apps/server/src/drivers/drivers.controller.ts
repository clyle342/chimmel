import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DriverProfileDto } from './dto/driver-profile.dto';
import { DriverOnlineDto } from './dto/driver-online.dto';
import { Request } from 'express';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('profile')
  async upsertProfile(@Req() req: Request, @Body() dto: DriverProfileDto) {
    const user = req.user as { userId: string };
    return this.driversService.upsertProfile(user.userId, dto);
  }

  @Patch('online')
  async setOnline(@Req() req: Request, @Body() dto: DriverOnlineDto) {
    const user = req.user as { userId: string };
    return this.driversService.setOnlineStatus(user.userId, dto);
  }

  @Get('offers')
  async getOffers(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.driversService.getOffers(user.userId);
  }

  @Post('offers/:id/accept')
  async acceptOffer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.driversService.acceptOffer(user.userId, id);
  }

  @Post('offers/:id/decline')
  async declineOffer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.driversService.declineOffer(user.userId, id);
  }

  @Get('earnings')
  async getEarnings(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.driversService.getEarnings(user.userId);
  }
}
