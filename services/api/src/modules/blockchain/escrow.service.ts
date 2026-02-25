import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ethers } from 'ethers';

export interface CreateTradeDto {
  buyerAddress: string;
  amount: string; // В wei
  rate: string;
  orderHash: string;
}

export interface TradeStatus {
  id: number;
  seller: string;
  buyer: string;
  amount: string;
  rate: string;
  fee: string;
  createdAt: number;
  expiresAt: number;
  status: number;
  orderHash: string;
}

/**
 * @title EscrowService
 * @dev Сервис для работы с Escrow контрактом
 */
@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(private blockchainService: BlockchainService) {}

  /**
   * @dev Создать новую сделку в блокчейне
   */
  async createTrade(data: CreateTradeDto): Promise<{ tradeId: number; txHash: string }> {
    if (!this.blockchainService.isConnected()) {
      this.logger.warn('Blockchain not connected. Running in mock mode.');
      return { tradeId: Date.now(), txHash: 'mock-tx-hash' };
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      
      // Создаём транзакцию
      const tx = await contract.createTrade(
        data.buyerAddress,
        ethers.parseEther(data.amount),
        ethers.parseEther(data.rate),
        data.orderHash,
      );

      this.logger.log(`CreateTrade tx sent: ${tx.hash}`);

      // Ждём подтверждения
      const receipt = await tx.wait();

      // Извлекаем TradeCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'TradeCreated';
        } catch {
          return false;
        }
      });

      const tradeId = event ? contract.interface.parseLog(event).args[0] : 0;

      this.logger.log(`Trade created: ID=${tradeId}, TX=${receipt.hash}`);

      return {
        tradeId: Number(tradeId),
        txHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`CreateTrade failed: ${error.message}`);
      throw new BadRequestException(`Failed to create trade: ${error.message}`);
    }
  }

  /**
   * @dev Зарезервировать средства продавца
   */
  async reserveFunds(tradeId: number): Promise<string> {
    if (!this.blockchainService.isConnected()) {
      return 'mock-tx-hash';
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tx = await contract.reserveFunds(tradeId);
      await tx.wait();
      
      this.logger.log(`Funds reserved for trade ${tradeId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`ReserveFunds failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Подтвердить оплату
   */
  async confirmPayment(tradeId: number): Promise<string> {
    if (!this.blockchainService.isConnected()) {
      return 'mock-tx-hash';
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tx = await contract.confirmPayment(tradeId);
      await tx.wait();
      
      this.logger.log(`Payment confirmed for trade ${tradeId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`ConfirmPayment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Подтвердить получение средств
   */
  async confirmReceipt(tradeId: number): Promise<string> {
    if (!this.blockchainService.isConnected()) {
      return 'mock-tx-hash';
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tx = await contract.confirmReceipt(tradeId);
      await tx.wait();
      
      this.logger.log(`Receipt confirmed for trade ${tradeId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`ConfirmReceipt failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Завершить сделку
   */
  async completeTrade(tradeId: number): Promise<string> {
    if (!this.blockchainService.isConnected()) {
      return 'mock-tx-hash';
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tx = await contract.completeTrade(tradeId);
      await tx.wait();
      
      this.logger.log(`Trade completed: ${tradeId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`CompleteTrade failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Отменить сделку
   */
  async cancelTrade(tradeId: number): Promise<string> {
    if (!this.blockchainService.isConnected()) {
      return 'mock-tx-hash';
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tx = await contract.cancelTrade(tradeId);
      await tx.wait();
      
      this.logger.log(`Trade cancelled: ${tradeId}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`CancelTrade failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Получить информацию о сделке
   */
  async getTrade(tradeId: number): Promise<TradeStatus | null> {
    if (!this.blockchainService.isConnected()) {
      return null;
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const trade = await contract.getTrade(tradeId);
      
      return {
        id: Number(trade.id),
        seller: trade.seller,
        buyer: trade.buyer,
        amount: ethers.formatEther(trade.amount),
        rate: ethers.formatEther(trade.rate),
        fee: ethers.formatEther(trade.fee),
        createdAt: Number(trade.createdAt),
        expiresAt: Number(trade.expiresAt),
        status: trade.status,
        orderHash: trade.orderHash,
      };
    } catch (error) {
      this.logger.error(`GetTrade failed: ${error.message}`);
      return null;
    }
  }

  /**
   * @dev Получить ID сделки по хешу заказа
   */
  async getTradeIdByOrderHash(orderHash: string): Promise<number> {
    if (!this.blockchainService.isConnected()) {
      return 0;
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      const tradeId = await contract.orderHashToTradeId(orderHash);
      return Number(tradeId);
    } catch (error) {
      this.logger.error(`GetTradeIdByOrderHash failed: ${error.message}`);
      return 0;
    }
  }
}
