import { canTransition } from './state-machine';
import { TripStatus } from '@prisma/client';

describe('Trip state machine', () => {
  it('allows quoted after requested', () => {
    expect(canTransition(TripStatus.REQUESTED, TripStatus.QUOTED)).toBe(true);
  });

  it('blocks completed to in progress', () => {
    expect(canTransition(TripStatus.COMPLETED, TripStatus.IN_PROGRESS)).toBe(false);
  });
});
