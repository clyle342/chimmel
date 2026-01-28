import { IsEnum, IsPhoneNumber, Length } from 'class-validator';
import { Role } from '@prisma/client';

export class VerifyOtpDto {
  @IsPhoneNumber('KE')
  phone!: string;

  @Length(6, 6)
  otp!: string;

  @IsEnum(Role)
  role!: Role;
}
