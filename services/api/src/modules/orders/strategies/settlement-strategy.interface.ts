import { Order } from '@prisma/client';

/**
 * Settlement Strategy Pattern
 * 
 * Позволяет переключаться между режимами расчётов:
 * - Centralized (только БД)
 * - Blockchain (только блокчейн)
 * - Hybrid (БД + блокчейн для settlement)
 */
export interface SettlementResult {
  success: boolean;
  txHash?: string;
  blockchainTradeId?: number;
  message?: string;
}

export interface SettlementContext {
  orderId: string;
  sellerId: string;
  buyerId?: string;
  amount: number;
  rate: number;
  orderHash: string;
}

/**
 * Интерфейс стратегии расчётов
 */
export interface SettlementStrategy {
  /**
   * Создать сделку
   */
  create(context: SettlementContext): Promise<SettlementResult>;

  /**
   * Зарезервировать средства
   */
  reserve(orderId: string, userId: string, amount: number): Promise<SettlementResult>;

  /**
   * Подтвердить оплату
   */
  confirmPayment(orderId: string, userId: string): Promise<SettlementResult>;

  /**
   * Подтвердить получение
   */
  confirmReceipt(orderId: string, userId: string): Promise<SettlementResult>;

  /**
   * Завершить сделку
   */
  complete(orderId: string): Promise<SettlementResult>;

  /**
   * Отменить сделку
   */
  cancel(orderId: string, userId: string): Promise<SettlementResult>;

  /**
   * Получить статус сделки
   */
  getStatus(orderId: string): Promise<SettlementResult>;
}
