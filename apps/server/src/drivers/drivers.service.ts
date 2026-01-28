import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverProfileDto } from './dto/driver-profile.dto';
import { DriverOnlineDto } from './dto/driver-online.dto';
import { OfferStatus, TripStatus } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(userId: string, dto: DriverProfileDto) {
    return this.prisma.driverProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto }
    });
  }

  async setOnlineStatus(userId: string, dto: DriverOnlineDto) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }
    return this.prisma.driverProfile.update({
      where: { userId },
      data: { isOnline: dto.isOnline }
    });
  }

  async getOffers(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }
    return this.prisma.tripOffer.findMany({
      where: { driverId: profile.id, status: OfferStatus.OFFERED },
      include: { trip: true }
    });
  }

  async acceptOffer(userId: string, offerId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.tripOffer.findUnique({ where: { id: offerId } });
      if (!offer || offer.driverId !== profile.id) {
        throw new NotFoundException('Offer not found');
      }
      const updatedOffer = await tx.tripOffer.updateMany({
        where: { id: offerId, status: OfferStatus.OFFERED },
        data: { status: OfferStatus.ACCEPTED }
      });
      if (updatedOffer.count === 0) {
        throw new BadRequestException('Offer no longer available');
      }
      const updatedTrip = await tx.trip.updateMany({
        where: { id: offer.tripId, status: TripStatus.MATCHING, driverId: null },
        data: { status: TripStatus.ACCEPTED, driverId: profile.userId }
      });
      if (updatedTrip.count === 0) {
        throw new BadRequestException('Trip already assigned');
      }
      await tx.tripOffer.updateMany({
        where: { tripId: offer.tripId, id: { not: offerId } },
        data: { status: OfferStatus.EXPIRED }
      });
      return tx.trip.findUnique({ where: { id: offer.tripId } });
    });
  }

  async declineOffer(userId: string, offerId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }
    await this.prisma.tripOffer.updateMany({
      where: { id: offerId, driverId: profile.id },
      data: { status: OfferStatus.DECLINED }
    });
    return { status: 'declined' };
  }

  async getEarnings(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { driverId: userId, status: TripStatus.COMPLETED }
    });
    const totalEarned = trips.reduce((sum, trip) => sum + (trip.quotedPrice ?? 0), 0);
    return { totalTrips: trips.length, totalEarned };
  }
}
