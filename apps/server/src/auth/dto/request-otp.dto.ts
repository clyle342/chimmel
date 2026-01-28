import { IsPhoneNumber } from 'class-validator';

export class RequestOtpDto {
  @IsPhoneNumber('KE')
  phone!: string;
}
