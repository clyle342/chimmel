import { TripStatus } from '@prisma/client';

export const tripTransitions: Record<TripStatus, TripStatus[]> = {
  REQUESTED: [TripStatus.QUOTED, TripStatus.CANCELLED],
  QUOTED: [TripStatus.PAYMENT_PENDING, TripStatus.CANCELLED, TripStatus.EXPIRED],
  PAYMENT_PENDING: [TripStatus.PAID, TripStatus.QUOTED, TripStatus.CANCELLED],
  PAID: [TripStatus.MATCHING, TripStatus.CANCELLED],
  MATCHING: [TripStatus.ACCEPTED, TripStatus.EXPIRED, TripStatus.CANCELLED],
  ACCEPTED: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
  IN_PROGRESS: [TripStatus.COMPLETED, TripStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: []
};

export const canTransition = (from: TripStatus, to: TripStatus) =>
  tripTransitions[from].includes(to);
