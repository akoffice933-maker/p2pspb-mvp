import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthService } from '../auth/jwt-auth.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface LoginResponse {
  access_token: string;
  requires2FA: boolean;
  admin: {
    id: string;
    username: string;
    role: string;
  };
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async login(username: string, password: string, otp?: string): Promise<LoginResponse> {
    // Rate limiting должен быть на уровне контроллера
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка 2FA если включён
    if (admin.twoFactorEnabled) {
      if (!otp) {
        throw new UnauthorizedException('2FA code required');
      }

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 1,
      });

      if (!verified) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Генерируем JWT
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    const access_token = this.jwtAuthService.generateToken(payload);

    return {
      access_token,
      requires2FA: admin.twoFactorEnabled,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  async setup2FA(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    if (admin.twoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }

    // Генерируем секрет
    const secret = speakeasy.generateSecret({
      name: `P2PSPB Admin (${admin.username})`,
      length: 32,
    });

    // Сохраняем секрет (пока не включаем)
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    // Генерируем QR код
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    };
  }

  async enable2FA(adminId: string, otp: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    if (!admin.twoFactorSecret) {
      throw new BadRequestException('Setup 2FA first');
    }

    // Проверяем OTP
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid OTP');
    }

    // Включаем 2FA
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
      },
    });

    return { success: true };
  }

  async disable2FA(adminId: string, otp: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    // Проверяем OTP
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid OTP');
    }

    // Выключаем 2FA
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { success: true };
  }

  async createAdmin(username: string, password: string) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin already exists');
    }

    const hash = await bcrypt.hash(password, 10);
    return this.prisma.admin.create({
      data: {
        username,
        passwordHash: hash,
      },
    });
  }

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: admin.id, username: admin.username, role: admin.role };
  }
}
