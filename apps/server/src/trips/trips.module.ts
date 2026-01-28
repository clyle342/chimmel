import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  providers: [TripsService],
  controllers: [TripsController],
  exports: [TripsService]
})
export class TripsModule {}
