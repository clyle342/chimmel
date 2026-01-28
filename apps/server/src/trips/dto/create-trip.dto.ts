import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { PetSize, PetType, RouteBand } from '@prisma/client';

export class CreateTripDto {
  @IsString()
  pickup!: string;

  @IsString()
  dropoff!: string;

  @IsEnum(PetType)
  petType!: PetType;

  @IsEnum(PetSize)
  petSize!: PetSize;

  @IsEnum(RouteBand)
  routeBand!: RouteBand;

  @IsBoolean()
  ownerRides!: boolean;
}
