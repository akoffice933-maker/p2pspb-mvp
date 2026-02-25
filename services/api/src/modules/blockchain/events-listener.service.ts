import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { NotificationsService } from '../ws/notifications.service';
import { ethers } from 'ethers';

/**
 * @title EventsListenerService
 * @dev Сервис для прослушивания событий блокчейна
 */
@Injectable()
export class EventsListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventsListenerService.name);
  private isListening = false;

  constructor(
    private blockchainService: BlockchainService,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    // Запускаем прослушивание через 5 секунд после старта
    setTimeout(() => {
      this.startListening();
    }, 5000);
  }

  /**
   * @dev Начать прослушивание событий
   */
  private startListening() {
    if (this.isListening || !this.blockchainService.isConnected()) {
      return;
    }

    this.isListening = true;
    this.logger.log('Starting blockchain events listener...');

    try {
      const contract = this.blockchainService.getEscrowContract();

      // Слушаем TradeCreated
      contract.on('TradeCreated', (tradeId, seller, buyer, amount, fee, event) => {
        this.logger.log(
          `TradeCreated: ID=${tradeId}, Seller=${seller}, Buyer=${buyer}, Amount=${amount}`,
        );

        // Отправляем уведомление
        this.notificationsService.tradesGateway.server.to('admins').emit('blockchain-event', {
          type: 'TradeCreated',
          tradeId: Number(tradeId),
          seller,
          buyer,
          amount: ethers.formatEther(amount),
          fee: ethers.formatEther(fee),
          txHash: event.log.transactionHash,
          timestamp: new Date().toISOString(),
        });
      });

      // Слушаем TradeCompleted
      contract.on('TradeCompleted', (tradeId, seller, buyer, amount, event) => {
        this.logger.log(`TradeCompleted: ID=${tradeId}, Amount=${amount}`);

        this.notificationsService.tradesGateway.server.to('admins').emit('blockchain-event', {
          type: 'TradeCompleted',
          tradeId: Number(tradeId),
          seller,
          buyer,
          amount: ethers.formatEther(amount),
          txHash: event.log.transactionHash,
          timestamp: new Date().toISOString(),
        });
      });

      // Слушаем TradeCancelled
      contract.on('TradeCancelled', (tradeId, event) => {
        this.logger.log(`TradeCancelled: ID=${tradeId}`);

        this.notificationsService.tradesGateway.server.to('admins').emit('blockchain-event', {
          type: 'TradeCancelled',
          tradeId: Number(tradeId),
          txHash: event.log.transactionHash,
          timestamp: new Date().toISOString(),
        });
      });

      this.logger.log('Blockchain events listener started');
    } catch (error) {
      this.logger.error(`Failed to start events listener: ${error.message}`);
      this.isListening = false;
    }
  }

  /**
   * @dev Остановить прослушивание
   */
  private stopListening() {
    if (!this.isListening) {
      return;
    }

    try {
      const contract = this.blockchainService.getEscrowContract();
      contract.removeAllListeners();
      this.isListening = false;
      this.logger.log('Blockchain events listener stopped');
    } catch (error) {
      this.logger.error(`Failed to stop events listener: ${error.message}`);
    }
  }

  /**
   * @dev Получить статус прослушивания
   */
  isListeningEvents(): boolean {
    return this.isListening;
  }
}
