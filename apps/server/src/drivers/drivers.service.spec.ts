import { DriversService } from './drivers.service';
import { OfferStatus, TripStatus } from '@prisma/client';

const buildPrismaMock = (overrides: Partial<any> = {}) => ({
  driverProfile: {
    findUnique: jest.fn()
  },
  tripOffer: {
    findUnique: jest.fn(),
    updateMany: jest.fn()
  },
  trip: {
    updateMany: jest.fn(),
    findUnique: jest.fn()
  },
  $transaction: async (cb: any) => cb(prismaMock),
  ...overrides
});

const prismaMock = buildPrismaMock();

beforeEach(() => {
  prismaMock.driverProfile.findUnique.mockResolvedValue({ id: 'driver-profile-1', userId: 'driver-user' });
  prismaMock.tripOffer.findUnique.mockResolvedValue({ id: 'offer-1', driverId: 'driver-profile-1', tripId: 'trip-1' });
  prismaMock.tripOffer.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.trip.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.trip.findUnique.mockResolvedValue({ id: 'trip-1', status: TripStatus.ACCEPTED });
});

describe('DriversService acceptOffer', () => {
  it('accepts offer when trip is available', async () => {
    const service = new DriversService(prismaMock);
    const result = await service.acceptOffer('driver-user', 'offer-1');
    expect(result?.status).toBe(TripStatus.ACCEPTED);
  });

  it('rejects when trip already assigned', async () => {
    prismaMock.trip.updateMany.mockResolvedValueOnce({ count: 0 });
    const service = new DriversService(prismaMock);
    await expect(service.acceptOffer('driver-user', 'offer-1')).rejects.toThrow('Trip already assigned');
  });
});
