import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

    return { id: admin.id, username: admin.username };
  }

  async createAdmin(username: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.admin.create({
      data: {
        username,
        passwordHash: hash,
      },
    });
  }
}
