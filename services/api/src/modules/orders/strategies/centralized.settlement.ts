import { Injectable, Logger } from '@nestjs/common';
import { SettlementStrategy, SettlementContext, SettlementResult } from './settlement-strategy.interface';

/**
 * Централизованная стратегия расчётов
 * 
 * Все операции выполняются только в базе данных.
 * Блокчейн не используется.
 * 
 * Преимущества:
 * - Быстро
 * - Дёшево (нет gas fees)
 * - Просто
 * 
 * Недостатки:
 * - Нет прозрачности
 * - Централизованный риск
 */
@Injectable()
export class CentralizedSettlement implements SettlementStrategy {
  private readonly logger = new Logger(CentralizedSettlement.name);

  async create(context: SettlementContext): Promise<SettlementResult> {
    this.logger.log(`Creating centralized order: ${context.orderId}`);
    
    // В централизованном режиме просто создаём запись в БД
    // Блокчейн не используется
    return {
      success: true,
      message: 'Order created in centralized mode',
    };
  }

  async reserve(orderId: string, userId: string, amount: number): Promise<SettlementResult> {
    this.logger.log(`Reserving ${amount} for order ${orderId} (centralized)`);
    
    return {
      success: true,
      message: 'Funds reserved in database',
    };
  }

  async confirmPayment(orderId: string, userId: string): Promise<SettlementResult> {
    this.logger.log(`Confirming payment for order ${orderId} (centralized)`);
    
    return {
      success: true,
      message: 'Payment confirmed in database',
    };
  }

  async confirmReceipt(orderId: string, userId: string): Promise<SettlementResult> {
    this.logger.log(`Confirming receipt for order ${orderId} (centralized)`);
    
    return {
      success: true,
      message: 'Receipt confirmed in database',
    };
  }

  async complete(orderId: string): Promise<SettlementResult> {
    this.logger.log(`Completing order ${orderId} (centralized)`);
    
    return {
      success: true,
      message: 'Order completed in database',
    };
  }

  async cancel(orderId: string, userId: string): Promise<SettlementResult> {
    this.logger.log(`Cancelling order ${orderId} (centralized)`);
    
    return {
      success: true,
      message: 'Order cancelled in database',
    };
  }

  async getStatus(orderId: string): Promise<SettlementResult> {
    return {
      success: true,
      message: 'Centralized mode - no blockchain data',
    };
  }
}
