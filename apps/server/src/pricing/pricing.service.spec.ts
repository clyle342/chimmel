import { PricingService } from './pricing.service';

const prismaMock = {
  trip: { count: jest.fn() },
  driverProfile: { count: jest.fn() }
} as any;

describe('PricingService', () => {
  it('calculates base quote with multiplier', () => {
    const service = new PricingService(prismaMock);
    const quote = service.calculateBaseQuote('M', 'CITY', 1.2);
    expect(quote.total).toBe(Math.round((300 + 250 + 200) * 1.2));
    expect(quote.breakdown.baseFare).toBe(300);
  });
});
