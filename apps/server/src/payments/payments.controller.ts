import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('mpesa/stk/:tripId')
  async initiateStk(@Param('tripId') tripId: string) {
    return this.paymentsService.initiateStk(tripId);
  }

  @Post('mpesa/callback')
  async callback(@Body() body: any) {
    return this.paymentsService.handleCallback(body);
  }
}
