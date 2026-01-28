import { Injectable } from '@nestjs/common';
import { DriverStatus, PetSize, RouteBand, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PricingQuote = {
  total: number;
  breakdown: {
    baseFare: number;
    petSizeFee: number;
    routeFee: number;
    demandMultiplier: number;
  };
};

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemandMultiplier() {
    const [matchingTrips, onlineDrivers] = await Promise.all([
      this.prisma.trip.count({ where: { status: TripStatus.MATCHING } }),
      this.prisma.driverProfile.count({ where: { isOnline: true, status: DriverStatus.APPROVED } })
    ]);
    return matchingTrips > onlineDrivers ? 1.2 : 1.0;
  }

  calculateBaseQuote(petSize: PetSize, routeBand: RouteBand, demandMultiplier: number): PricingQuote {
    const baseFare = 300;
    const petSizeFee = petSize === 'S' ? 100 : petSize === 'M' ? 250 : 500;
    const routeFee = routeBand === 'CITY' ? 200 : 1200;
    const subtotal = baseFare + petSizeFee + routeFee;
    const total = Math.round(subtotal * demandMultiplier);
    return {
      total,
      breakdown: {
        baseFare,
        petSizeFee,
        routeFee,
        demandMultiplier
      }
    };
  }
}
