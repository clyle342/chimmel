import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listDrivers(status?: string) {
    return this.prisma.driverProfile.findMany({
      where: status ? { status: status as any } : {},
      include: { user: true }
    });
  }

  async approveDriver(id: string) {
    return this.prisma.driverProfile.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
  }

  async rejectDriver(id: string) {
    return this.prisma.driverProfile.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
  }

  async listTrips() {
    return this.prisma.trip.findMany({ include: { owner: true, driver: true, payment: true } });
  }

  async listPayments() {
    return this.prisma.payment.findMany({ include: { trip: true } });
  }
}
