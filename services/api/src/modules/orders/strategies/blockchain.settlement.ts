import { Injectable, Logger } from '@nestjs/common';
import { SettlementStrategy, SettlementContext, SettlementResult } from './settlement-strategy.interface';
import { EscrowService } from '../../blockchain/escrow.service';

/**
 * Полная блокчейн стратегия расчётов
 * 
 * Все операции выполняются в блокчейне.
 * 
 * Преимущества:
 * - Прозрачность
 * - Децентрализация
 * - Неизменяемость
 * 
 * Недостатки:
 * - Gas fees
 * - Медленнее
 * - Нужен аудит
 */
@Injectable()
export class BlockchainSettlement implements SettlementStrategy {
  private readonly logger = new Logger(BlockchainSettlement.name);

  constructor(private escrowService: EscrowService) {}

  async create(context: SettlementContext): Promise<SettlementResult> {
    try {
      this.logger.log(`Creating blockchain order: ${context.orderId}`);
      
      const { tradeId, txHash } = await this.escrowService.createTrade({
        buyerAddress: context.buyerId || context.sellerId,
        amount: context.amount.toString(),
        rate: context.rate.toString(),
        orderHash: context.orderHash,
      });

      return {
        success: true,
        txHash,
        blockchainTradeId: tradeId,
        message: 'Order created on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain create failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async reserve(orderId: string, userId: string, amount: number): Promise<SettlementResult> {
    try {
      this.logger.log(`Reserving ${amount} on blockchain for order ${orderId}`);
      
      const tradeId = await this.getTradeId(orderId);
      const txHash = await this.escrowService.reserveFunds(tradeId);

      return {
        success: true,
        txHash,
        message: 'Funds reserved on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain reserve failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async confirmPayment(orderId: string, userId: string): Promise<SettlementResult> {
    try {
      this.logger.log(`Confirming payment on blockchain for order ${orderId}`);
      
      const tradeId = await this.getTradeId(orderId);
      const txHash = await this.escrowService.confirmPayment(tradeId);

      return {
        success: true,
        txHash,
        message: 'Payment confirmed on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain confirmPayment failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async confirmReceipt(orderId: string, userId: string): Promise<SettlementResult> {
    try {
      this.logger.log(`Confirming receipt on blockchain for order ${orderId}`);
      
      const tradeId = await this.getTradeId(orderId);
      const txHash = await this.escrowService.confirmReceipt(tradeId);

      return {
        success: true,
        txHash,
        message: 'Receipt confirmed on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain confirmReceipt failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async complete(orderId: string): Promise<SettlementResult> {
    try {
      this.logger.log(`Completing order on blockchain: ${orderId}`);
      
      const tradeId = await this.getTradeId(orderId);
      const txHash = await this.escrowService.completeTrade(tradeId);

      return {
        success: true,
        txHash,
        message: 'Order completed on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain complete failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async cancel(orderId: string, userId: string): Promise<SettlementResult> {
    try {
      this.logger.log(`Cancelling order on blockchain: ${orderId}`);
      
      const tradeId = await this.getTradeId(orderId);
      const txHash = await this.escrowService.cancelTrade(tradeId);

      return {
        success: true,
        txHash,
        message: 'Order cancelled on blockchain',
      };
    } catch (error) {
      this.logger.error(`Blockchain cancel failed: ${error.message}`);
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  async getStatus(orderId: string): Promise<SettlementResult> {
    try {
      const tradeId = await this.getTradeId(orderId);
      const trade = await this.escrowService.getTrade(tradeId);

      if (!trade) {
        return {
          success: false,
          message: 'Trade not found',
        };
      }

      return {
        success: true,
        message: `Status: ${trade.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Blockchain error: ${error.message}`,
      };
    }
  }

  private async getTradeId(orderId: string): Promise<number> {
    // В реальной реализации нужно хранить mapping orderId -> tradeId
    // Для простоты возвращаем orderId как число
    return parseInt(orderId.replace(/[^0-9]/g, '').slice(0, 10)) || 1;
  }
}
