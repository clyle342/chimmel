export const OTP_DEV_CODE = '123456';

export const Roles = ['OWNER', 'DRIVER', 'ADMIN'] as const;
export type Role = (typeof Roles)[number];

export const TripStatuses = [
  'REQUESTED',
  'QUOTED',
  'PAYMENT_PENDING',
  'PAID',
  'MATCHING',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
] as const;
export type TripStatus = (typeof TripStatuses)[number];

export const PetTypes = ['DOG', 'CAT', 'OTHER'] as const;
export type PetType = (typeof PetTypes)[number];

export const PetSizes = ['S', 'M', 'L'] as const;
export type PetSize = (typeof PetSizes)[number];

export const RouteBands = ['CITY', 'INTERCITY'] as const;
export type RouteBand = (typeof RouteBands)[number];
