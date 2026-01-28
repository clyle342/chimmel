import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('drivers')
  async listDrivers(@Query('status') status?: string) {
    return this.adminService.listDrivers(status);
  }

  @Post('drivers/:id/approve')
  async approveDriver(@Param('id') id: string) {
    return this.adminService.approveDriver(id);
  }

  @Post('drivers/:id/reject')
  async rejectDriver(@Param('id') id: string) {
    return this.adminService.rejectDriver(id);
  }

  @Get('trips')
  async listTrips() {
    return this.adminService.listTrips();
  }

  @Get('payments')
  async listPayments() {
    return this.adminService.listPayments();
  }
}
