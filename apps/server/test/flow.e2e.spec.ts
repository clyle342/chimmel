import { TripsService } from '../src/trips/trips.service';
import { PricingService } from '../src/pricing/pricing.service';
import { DriversService } from '../src/drivers/drivers.service';
import { PaymentsService } from '../src/payments/payments.service';
import { PetSize, PetType, RouteBand, TripStatus } from '@prisma/client';

type Trip = any;

describe('Flow e2e', () => {
  it('creates trip, quotes, pays, matches, accepts, completes', async () => {
    const store = {
      trips: [] as Trip[],
      payments: [] as any[],
      drivers: [{ id: 'driver-profile-1', userId: 'driver-user', isOnline: true, status: 'APPROVED', createdAt: new Date() }],
      offers: [] as any[]
    };

    const prisma: any = {
      trip: {
        create: async ({ data }: any) => {
          const trip = { ...data, id: 'trip-1', status: TripStatus.REQUESTED };
          store.trips.push(trip);
          return trip;
        },
        findFirst: async ({ where }: any) => store.trips.find((t) => t.id === where.id && t.ownerId === where.ownerId),
        findUnique: async ({ where }: any) => store.trips.find((t) => t.id === where.id),
        update: async ({ where, data }: any) => {
          const trip = store.trips.find((t) => t.id === where.id);
          Object.assign(trip, data);
          return trip;
        },
        updateMany: async ({ where, data }: any) => {
          const trip = store.trips.find((t) => t.id === where.id && t.status === where.status && t.driverId == null);
          if (!trip) {
            return { count: 0 };
          }
          Object.assign(trip, data);
          return { count: 1 };
        },
        count: async ({ where }: any) => store.trips.filter((t) => t.status === where.status).length,
        findMany: async () => store.trips
      },
      driverProfile: {
        findMany: async () => store.drivers,
        count: async () => store.drivers.length,
        findUnique: async ({ where }: any) => store.drivers.find((d) => d.userId === where.userId)
      },
      tripOffer: {
        createMany: async ({ data }: any) => {
          store.offers.push(...data.map((o: any) => ({ ...o, id: `offer-${store.offers.length + 1}` })));
          return { count: data.length };
        },
        findUnique: async ({ where }: any) => store.offers.find((o) => o.id === where.id),
        updateMany: async ({ where, data }: any) => {
          let count = 0;
          store.offers = store.offers.map((offer) => {
            if (offer.id === where.id && offer.status === where.status) {
              count += 1;
              return { ...offer, ...data };
            }
            if (where.tripId && offer.tripId === where.tripId && (!where.id || offer.id !== where.id)) {
              return { ...offer, ...data };
            }
            return offer;
          });
          return { count };
        },
        findMany: async ({ where }: any) => store.offers.filter((o) => o.driverId === where.driverId)
      },
      payment: {
        upsert: async ({ create }: any) => {
          const payment = { id: 'payment-1', ...create };
          store.payments.push(payment);
          return payment;
        },
        findFirst: async ({ where }: any) => store.payments.find((p) => p.providerRef === where.providerRef),
        update: async ({ where, data }: any) => {
          const payment = store.payments.find((p) => p.id === where.id);
          Object.assign(payment, data);
          return payment;
        }
      },
      $transaction: async (cb: any) => cb(prisma)
    };

    const pricingService = new PricingService(prisma);
    const tripsService = new TripsService(prisma, pricingService);
    const paymentsService = new PaymentsService(prisma, tripsService);
    const driversService = new DriversService(prisma);

    const trip = await tripsService.createTrip('owner-1', {
      pickup: 'A',
      dropoff: 'B',
      petType: PetType.DOG,
      petSize: PetSize.S,
      routeBand: RouteBand.CITY,
      ownerRides: true
    });

    await tripsService.getQuote(trip.id, 'owner-1');
    await tripsService.confirmPaymentPending(trip.id, 'owner-1');
    const stk = await paymentsService.initiateStk(trip.id);
    await paymentsService.handleCallback({
      Body: { stkCallback: { ResultCode: 0, CheckoutRequestID: stk.checkoutRequestId } }
    });

    const offers = await driversService.getOffers('driver-user');
    expect(offers.length).toBeGreaterThan(0);
    await driversService.acceptOffer('driver-user', offers[0].id);
    await tripsService.driverUpdateTrip('driver-user', trip.id, TripStatus.IN_PROGRESS);
    await tripsService.driverUpdateTrip('driver-user', trip.id, TripStatus.COMPLETED);

    const finalTrip = await tripsService.getTrip(trip.id, 'owner-1');
    expect(finalTrip.status).toBe(TripStatus.COMPLETED);
  });
});
