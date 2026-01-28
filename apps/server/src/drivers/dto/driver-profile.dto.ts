import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DriverProfileDto {
  @IsString()
  vehicleType!: string;

  @IsString()
  plate!: string;

  @IsOptional()
  @IsString()
  capacityNotes?: string;

  @IsBoolean()
  docSubmitted!: boolean;
}
