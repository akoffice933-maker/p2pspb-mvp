import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../ws/notifications.service';
import { FraudDetectionService } from '../fraud/fraud-detection.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let transactionsService: TransactionsService;
  let notificationsService: NotificationsService;
  let fraudDetectionService: FraudDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(async (fn) => fn(prisma)),
          },
        },
        {
          provide: TransactionsService,
          useValue: {
            reserveFunds: jest.fn(),
            releaseFunds: jest.fn(),
            transferToSeller: jest.fn(),
            refundToBuyer: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyOrderCreated: jest.fn(),
            notifyOrderAccepted: jest.fn(),
            notifyPaymentConfirmed: jest.fn(),
            notifyReceiptConfirmed: jest.fn(),
            notifyOrderCancelled: jest.fn(),
            notifyDisputeCreated: jest.fn(),
            notifyDisputeResolved: jest.fn(),
          },
        },
        {
          provide: FraudDetectionService,
          useValue: {
            checkBeforeCreateOrder: jest.fn(),
            updateUserRiskScore: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    fraudDetectionService = module.get<FraudDetectionService>(FraudDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canTransition', () => {
    it('should allow valid transitions', () => {
      expect(service.canTransition('PENDING', 'ACTIVE')).toBe(true);
      expect(service.canTransition('ACTIVE', 'RESERVED')).toBe(true);
      expect(service.canTransition('RESERVED', 'PAYMENT_PENDING')).toBe(true);
      expect(service.canTransition('PAYMENT_PENDING', 'PAID')).toBe(true);
      expect(service.canTransition('PAID', 'CONFIRMED')).toBe(true);
      expect(service.canTransition('CONFIRMED', 'COMPLETED')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(service.canTransition('PENDING', 'COMPLETED')).toBe(false);
      expect(service.canTransition('ACTIVE', 'COMPLETED')).toBe(false);
      expect(service.canTransition('COMPLETED', 'ACTIVE')).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should create a BUY order successfully', async () => {
      const mockUser = { id: 'user-1', telegramId: '123', balance: 0 };
      const mockOrder = {
        id: 'order-1',
        userId: mockUser.id,
        type: 'BUY',
        status: 'PENDING',
        user: mockUser,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.order, 'create').mockResolvedValue(mockOrder as any);
      jest.spyOn(fraudDetectionService, 'checkBeforeCreateOrder').mockResolvedValue({
        isFraud: false,
        score: 0,
        reasons: [],
      });
      jest.spyOn(prisma, '$transaction').mockImplementation(async (fn) => fn(prisma as any));

      const result = await service.createOrder({
        telegramId: '123',
        username: '@test',
        type: 'BUY',
        rate: 92.5,
        minLimit: 1000,
        maxLimit: 50000,
        amount: 1000,
        paymentMethods: ['sbp'],
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('BUY');
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it('should reject SELL order if insufficient balance', async () => {
      const mockUser = { id: 'user-1', telegramId: '123', balance: 50 };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(fraudDetectionService, 'checkBeforeCreateOrder').mockResolvedValue({
        isFraud: false,
        score: 0,
        reasons: [],
      });

      await expect(
        service.createOrder({
          telegramId: '123',
          type: 'SELL',
          rate: 92.5,
          minLimit: 1000,
          maxLimit: 50000,
          amount: 1000, // Больше чем баланс
          paymentMethods: ['sbp'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject order if fraud detected', async () => {
      const mockUser = { id: 'user-1', telegramId: '123', balance: 5000 };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(fraudDetectionService, 'checkBeforeCreateOrder').mockResolvedValue({
        isFraud: true,
        score: 85,
        reasons: ['High risk score'],
      });

      await expect(
        service.createOrder({
          telegramId: '123',
          type: 'SELL',
          rate: 92.5,
          minLimit: 1000,
          maxLimit: 50000,
          amount: 1000,
          paymentMethods: ['sbp'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and release funds', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        sellerId: 'user-1',
        status: 'RESERVED',
        reservedAmount: 1000,
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue(mockOrder as any);
      jest.spyOn(transactionsService, 'releaseFunds').mockResolvedValue(undefined as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (fn) => fn(prisma as any));

      const result = await service.cancelOrder('order-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(transactionsService.releaseFunds).toHaveBeenCalled();
    });

    it('should reject cancel if transition invalid', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'COMPLETED', // Нельзя отменить завершённую
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

      await expect(service.cancelOrder('order-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getActiveOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        { id: 'order-1', type: 'SELL', status: 'ACTIVE' },
        { id: 'order-2', type: 'BUY', status: 'RESERVED' },
      ];

      jest.spyOn(prisma.order, 'findMany').mockResolvedValue(mockOrders as any);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(2);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (fn) => fn(prisma as any));

      const result = await service.getActiveOrders({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by type', async () => {
      jest.spyOn(prisma.order, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(0);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (fn) => fn(prisma as any));

      await service.getActiveOrders({ type: 'BUY' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'BUY',
          }),
        }),
      );
    });
  });
});
