import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, TripStatus } from '@prisma/client';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { Request } from 'express';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post()
  async createTrip(@Req() req: Request, @Body() dto: CreateTripDto) {
    const user = req.user as { userId: string };
    return this.tripsService.createTrip(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post(':id/quote')
  async quote(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.tripsService.getQuote(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.tripsService.confirmPaymentPending(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get(':id')
  async getTrip(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.tripsService.getTrip(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get()
  async listTrips(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.tripsService.listTrips(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':id/status')
  async updateStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTripStatusDto) {
    const user = req.user as { userId: string };
    return this.tripsService.updateStatus(user.userId, id, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Patch(':id/driver-status')
  async driverStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTripStatusDto) {
    const user = req.user as { userId: string };
    return this.tripsService.driverUpdateTrip(user.userId, id, dto.status);
  }
}
