import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripsService } from '../trips/trips.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly tripsService: TripsService) {}

  async initiateStk(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    const checkoutRequestId = `mpesa-${tripId}-${Date.now()}`;
    const payment = await this.prisma.payment.upsert({
      where: { tripId },
      create: {
        tripId,
        amount: trip.quotedPrice ?? 0,
        status: 'PENDING',
        provider: 'mpesa',
        providerRef: checkoutRequestId
      },
      update: { status: 'PENDING', providerRef: checkoutRequestId }
    });

    const isMock = process.env.DARAJA_ENV === 'mock';
    return { checkoutRequestId: payment.providerRef, status: 'PENDING', mock: isMock };
  }

  async handleCallback(payload: any) {
    const resultCode = payload?.Body?.stkCallback?.ResultCode;
    const checkoutRequestId = payload?.Body?.stkCallback?.CheckoutRequestID;
    const payment = await this.prisma.payment.findFirst({ where: { providerRef: checkoutRequestId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    const status = resultCode === 0 ? 'SUCCESS' : 'FAILED';
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status, rawCallback: payload }
    });
    if (status === 'SUCCESS') {
      await this.tripsService.markPaid(payment.tripId);
    }
    return { status };
  }
}
