import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertType, AlertStatus } from '@prisma/client';
import { NotificationsService } from '../ws/notifications.service';

export interface FraudCheckResult {
  isFraud: boolean;
  score: number; // 0-100
  reasons: string[];
}

export interface CreateAlertDto {
  userId: string;
  type: AlertType;
  score: number;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  // Пороги для детекции
  private readonly THRESHOLDS = {
    // Velocity checks
    ORDERS_PER_HOUR: 10,
    ORDERS_PER_DAY: 50,
    CANCELS_PER_DAY: 5,
    
    // Amount checks
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 100000,
    SUSPICIOUS_AMOUNT_STEP: 10000,
    
    // Behavior checks
    CANCEL_RATE_THRESHOLD: 0.3, // 30% отмен
    DISPUTE_RATE_THRESHOLD: 0.1, // 10% споров
    AVG_TRADE_TIME_THRESHOLD: 300000, // 5 минут
    
    // Risk scores
    RISK_BLOCK_THRESHOLD: 80,
    RISK_WARNING_THRESHOLD: 50,
  };

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Основная проверка перед созданием заявки
   */
  async checkBeforeCreateOrder(
    userId: string,
    amount: number,
    ipAddress?: string,
    fingerprint?: string,
  ): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let score = 0;

    // 1. Проверка пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // За 24 часа
            },
          },
        },
        alerts: {
          where: {
            status: AlertStatus.OPEN,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // За 7 дней
            },
          },
        },
      },
    });

    if (!user) {
      return { isFraud: false, score: 0, reasons: [] };
    }

    // 2. Проверка на блокировку
    if (user.isBlocked) {
      return {
        isFraud: true,
        score: 100,
        reasons: ['Пользователь заблокирован'],
      };
    }

    // 3. Velocity check - количество заявок за 24 часа
    const ordersLast24h = user.orders.length;
    if (ordersLast24h > this.THRESHOLDS.ORDERS_PER_DAY) {
      score += 30;
      reasons.push(`Слишком много заявок за 24 часа: ${ordersLast24h}`);
    }

    // 4. Проверка суммы
    if (amount > this.THRESHOLDS.MAX_AMOUNT) {
      score += 25;
      reasons.push(`Подозрительно большая сумма: ${amount}`);
    }

    if (amount < this.THRESHOLDS.MIN_AMOUNT) {
      score += 10;
      reasons.push(`Слишком маленькая сумма: ${amount}`);
    }

    // 5. Проверка risk score пользователя
    if (user.riskScore >= this.THRESHOLDS.RISK_WARNING_THRESHOLD) {
      score += 20;
      reasons.push(`Высокий уровень риска пользователя: ${user.riskScore}`);
    }

    // 6. Проверка открытых алертов
    if (user.alerts.length > 0) {
      score += 15;
      reasons.push(`Есть открытые алерты: ${user.alerts.length}`);
    }

    // 7. Проверка отмен
    const cancelledOrders = user.orders.filter(o => o.status === 'CANCELLED').length;
    const cancelRate = user.orders.length > 0 ? cancelledOrders / user.orders.length : 0;
    
    if (cancelRate > this.THRESHOLDS.CANCEL_RATE_THRESHOLD) {
      score += 20;
      reasons.push(`Высокий процент отмен: ${(cancelRate * 100).toFixed(1)}%`);
    }

    const isFraud = score >= this.THRESHOLDS.RISK_BLOCK_THRESHOLD;

    if (isFraud || score >= this.THRESHOLDS.RISK_WARNING_THRESHOLD) {
      await this.createAlert({
        userId,
        type: AlertType.VELOCITY,
        score,
        title: 'Подозрительная активность при создании заявки',
        description: reasons.join('; '),
        metadata: { amount, ordersLast24h, cancelRate, ipAddress, fingerprint },
      });
    }

    return {
      isFraud,
      score: Math.min(score, 100),
      reasons,
    };
  }

  /**
   * Проверка при принятии заявки
   */
  async checkBeforeAcceptOrder(
    buyerId: string,
    sellerId: string,
    amount: number,
  ): Promise<{ buyerResult: FraudCheckResult; sellerResult: FraudCheckResult }> {
    const buyerResult = await this.checkBeforeCreateOrder(buyerId, amount);
    const sellerResult = await this.checkBeforeCreateOrder(sellerId, amount);

    // Дополнительная проверка: если покупатель и продавец один человек
    if (buyerId === sellerId) {
      await this.createAlert({
        userId: buyerId,
        type: AlertType.MULTI_ACCOUNT,
        score: 100,
        title: 'Покупатель и продавец - одно лицо',
        description: 'Попытка самообмена',
        metadata: { buyerId, sellerId, amount },
      });

      return {
        buyerResult: { isFraud: true, score: 100, reasons: ['Самообмен'] },
        sellerResult: { isFraud: true, score: 100, reasons: ['Самообмен'] },
      };
    }

    return { buyerResult, sellerResult };
  }

  /**
   * Проверка на multi-account (один IP/устройство у разных пользователей)
   */
  async checkMultiAccount(
    userId: string,
    ipAddress?: string,
    fingerprint?: string,
  ): Promise<FraudCheckResult> {
    if (!ipAddress && !fingerprint) {
      return { isFraud: false, score: 0, reasons: [] };
    }

    const reasons: string[] = [];
    let score = 0;

    // Поиск других пользователей с тем же IP
    if (ipAddress) {
      const usersWithSameIP = await this.prisma.loginSession.findMany({
        where: {
          ipAddress,
          userId: { not: userId },
        },
        include: { user: true },
        take: 10,
      });

      const uniqueUserIds = new Set(usersWithSameIP.map(s => s.userId));
      
      if (uniqueUserIds.size > 2) {
        score += 40;
        reasons.push(`Один IP у ${uniqueUserIds.size + 1} пользователей`);
      }
    }

    // Поиск других пользователей с тем же fingerprint
    if (fingerprint) {
      const usersWithSameFingerprint = await this.prisma.loginSession.findMany({
        where: {
          fingerprint,
          userId: { not: userId },
        },
        include: { user: true },
        take: 10,
      });

      const uniqueUserIds = new Set(usersWithSameFingerprint.map(s => s.userId));
      
      if (uniqueUserIds.size > 1) {
        score += 30;
        reasons.push(`Одно устройство у ${uniqueUserIds.size + 1} пользователей`);
      }
    }

    const isFraud = score >= this.THRESHOLDS.RISK_WARNING_THRESHOLD;

    if (isFraud) {
      await this.createAlert({
        userId,
        type: AlertType.MULTI_ACCOUNT,
        score,
        title: 'Возможно несколько аккаунтов',
        description: reasons.join('; '),
        metadata: { ipAddress, fingerprint },
      });
    }

    return {
      isFraud,
      score: Math.min(score, 100),
      reasons,
    };
  }

  /**
   * Обновление risk score пользователя
   */
  async updateUserRiskScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        alerts: {
          where: { status: { in: [AlertStatus.OPEN, AlertStatus.CONFIRMED] } },
        },
      },
    });

    if (!user) return 0;

    let riskScore = 0;

    // Фактор 1: Процент отмен
    const cancelRate = user.orders.length > 0
      ? user.orders.filter(o => o.status === 'CANCELLED').length / user.orders.length
      : 0;
    riskScore += cancelRate * 30;

    // Фактор 2: Процент споров
    const disputeRate = user.orders.length > 0
      ? user.orders.filter(o => o.status === 'DISPUTED').length / user.orders.length
      : 0;
    riskScore += disputeRate * 40;

    // Фактор 3: Открытые алерты
    riskScore += user.alerts.length * 10;

    // Фактор 4: Возраст аккаунта (новые аккаунты рисковее)
    const accountAgeDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 7) {
      riskScore += 15;
    } else if (accountAgeDays < 30) {
      riskScore += 5;
    }

    // Фактор 5: Количество сделок (меньше сделок = выше риск)
    if (user.totalTrades < 5) {
      riskScore += 10;
    }

    riskScore = Math.min(Math.round(riskScore), 100);

    await this.prisma.user.update({
      where: { id: userId },
      data: { riskScore },
    });

    // Автоматическая блокировка при высоком риске
    if (riskScore >= this.THRESHOLDS.RISK_BLOCK_THRESHOLD) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isBlocked: true },
      });

      this.logger.warn(`User ${userId} automatically blocked. Risk score: ${riskScore}`);
    }

    return riskScore;
  }

  /**
   * Создать фрод-алерт
   */
  async createAlert(data: CreateAlertDto) {
    const alert = await this.prisma.fraudAlert.create({
      data,
      include: { user: true },
    });

    this.logger.log(
      `Fraud alert created: ${data.type} for user ${data.userId}, score: ${data.score}`,
    );

    // Уведомляем админов
    this.notificationsService.tradesGateway.server
      .to('admins')
      .emit('fraud-alert', {
        alertId: alert.id,
        userId: data.userId,
        type: data.type,
        score: data.score,
        title: data.title,
        timestamp: new Date().toISOString(),
      });

    return alert;
  }

  /**
   * Получить все алерты для админки
   */
  async getAlerts(filters?: {
    status?: AlertStatus;
    type?: AlertType;
    userId?: string;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    return this.prisma.fraudAlert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            telegramId: true,
            riskScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  /**
   * Обновить статус алерта
   */
  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    adminId: string,
  ) {
    return this.prisma.fraudAlert.update({
      where: { id: alertId },
      data: {
        status,
        reviewedBy: adminId,
        resolvedAt: status === AlertStatus.RESOLVED || status === AlertStatus.CONFIRMED
          ? new Date()
          : null,
      },
    });
  }

  /**
   * Разблокировать пользователя
   */
  async unblockUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        riskScore: { multiply: 0.5 }, // Снижаем риск на 50%
      },
    });
  }

  /**
   * Записать сессию входа
   */
  async logLoginSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    fingerprint?: string,
  ) {
    // Проверяем существующую сессию
    const existingSession = await this.prisma.loginSession.findFirst({
      where: {
        userId,
        fingerprint: fingerprint || null,
      },
    });

    if (existingSession) {
      // Обновляем существующую
      await this.prisma.loginSession.update({
        where: { id: existingSession.id },
        data: {
          ipAddress,
          userAgent,
          lastActive: new Date(),
        },
      });
    } else {
      // Создаём новую
      await this.prisma.loginSession.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          fingerprint,
        },
      });
    }

    // Проверяем на multi-account
    await this.checkMultiAccount(userId, ipAddress, fingerprint);
  }
}
