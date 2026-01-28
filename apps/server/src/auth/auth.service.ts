import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const DEV_OTP = '123456';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async requestOtp(phone: string) {
    return { otp: DEV_OTP };
  }

  async verifyOtp(phone: string, otp: string, role: Role) {
    if (otp !== DEV_OTP) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const adminPhone = process.env.ADMIN_PHONE;
    const effectiveRole = adminPhone && phone === adminPhone ? Role.ADMIN : role;

    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone, role: effectiveRole },
      update: { role: effectiveRole }
    });

    const payload = { sub: user.id, role: user.role, phone: user.phone };
    return { accessToken: this.jwtService.sign(payload), user };
  }
}
