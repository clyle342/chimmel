import { IsBoolean } from 'class-validator';

export class DriverOnlineDto {
  @IsBoolean()
  isOnline!: boolean;
}
