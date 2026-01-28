import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PricingService } from '../pricing/pricing.service';
import { DriverStatus, OfferStatus, TripStatus } from '@prisma/client';
import { canTransition } from './state-machine';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService
  ) {}

  async createTrip(ownerId: string, dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        ownerId,
        pickup: dto.pickup,
        dropoff: dto.dropoff,
        petType: dto.petType,
        petSize: dto.petSize,
        ownerRides: dto.ownerRides,
        routeBand: dto.routeBand,
        status: TripStatus.REQUESTED
      }
    });
  }

  async getQuote(tripId: string, ownerId: string) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, ownerId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, TripStatus.QUOTED)) {
      throw new BadRequestException('Cannot quote from current state');
    }
    const multiplier = await this.pricingService.getDemandMultiplier();
    const quote = this.pricingService.calculateBaseQuote(trip.petSize, trip.routeBand, multiplier);
    const expires = new Date(Date.now() + 60 * 1000);
    return this.prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: TripStatus.QUOTED,
        quotedPrice: quote.total,
        quoteExpiresAt: expires
      }
    });
  }

  async confirmPaymentPending(tripId: string, ownerId: string) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, ownerId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, TripStatus.PAYMENT_PENDING)) {
      throw new BadRequestException('Cannot move to payment pending');
    }
    return this.prisma.trip.update({
      where: { id: trip.id },
      data: { status: TripStatus.PAYMENT_PENDING }
    });
  }

  async markPaid(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, TripStatus.PAID)) {
      throw new BadRequestException('Cannot mark paid');
    }
    await this.prisma.trip.update({ where: { id: tripId }, data: { status: TripStatus.PAID } });
    return this.startMatching(tripId);
  }

  async startMatching(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, TripStatus.MATCHING)) {
      throw new BadRequestException('Cannot start matching');
    }
    const drivers = await this.prisma.driverProfile.findMany({
      where: { isOnline: true, status: DriverStatus.APPROVED },
      orderBy: { createdAt: 'asc' },
      take: 5
    });
    await this.prisma.trip.update({ where: { id: tripId }, data: { status: TripStatus.MATCHING } });
    if (drivers.length > 0) {
      await this.prisma.tripOffer.createMany({
        data: drivers.map((driver) => ({
          tripId,
          driverId: driver.id,
          status: OfferStatus.OFFERED
        })),
        skipDuplicates: true
      });
    }
    return { tripId, offers: drivers.length };
  }

  async updateStatus(ownerId: string, tripId: string, status: TripStatus) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, ownerId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, status)) {
      throw new BadRequestException('Invalid status transition');
    }
    return this.prisma.trip.update({ where: { id: tripId }, data: { status } });
  }

  async getTrip(tripId: string, ownerId: string) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, ownerId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async listTrips(ownerId: string) {
    return this.prisma.trip.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  }

  async driverUpdateTrip(driverId: string, tripId: string, status: TripStatus) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, driverId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!canTransition(trip.status, status)) {
      throw new BadRequestException('Invalid status transition');
    }
    return this.prisma.trip.update({ where: { id: tripId }, data: { status } });
  }
}
