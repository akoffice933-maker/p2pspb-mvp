import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getActiveOrders(filters?: { type?: string; payment?: string }) {
    const where: any = { status: 'ACTIVE' };

    if (filters?.type) {
      where.type = filters.type.toUpperCase();
    }

    if (filters?.payment) {
      where.paymentMethods = { has: filters.payment };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            reputationScore: true,
            totalTrades: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders;
  }

  async createOrder(data: {
    telegramId: string;
    username?: string;
    type: string;
    rate: number;
    minLimit: number;
    maxLimit: number;
    availableAmount: number;
    paymentMethods: string[];
  }) {
    // Найти или создать пользователя
    let user = await this.prisma.user.findUnique({
      where: { telegramId: data.telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: data.telegramId,
          username: data.username || 'Аноним',
        },
      });
    }

    // Создать заявку
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        type: data.type,
        rate: data.rate,
        minLimit: data.minLimit,
        maxLimit: data.maxLimit,
        availableAmount: data.availableAmount,
        paymentMethods: data.paymentMethods,
      },
      include: { user: true },
    });

    return order;
  }

  async hideOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'HIDDEN' },
    });
  }
}
