import { Injectable, Logger } from '@nestjs/common';
import { SettlementStrategy } from './settlement-strategy.interface';
import { CentralizedSettlement } from './centralized.settlement';
import { BlockchainSettlement } from './blockchain.settlement';
import { HybridSettlement } from './hybrid.settlement';
import { EscrowService } from '../../blockchain/escrow.service';

export type SettlementMode = 'centralized' | 'blockchain' | 'hybrid';

/**
 * Фабрика стратегий расчётов
 * 
 * Выбирает стратегию на основе конфигурации SETTLEMENT_MODE
 */
@Injectable()
export class SettlementStrategyFactory {
  private readonly logger = new Logger(SettlementStrategyFactory.name);
  private readonly mode: SettlementMode;

  constructor(private escrowService: EscrowService) {
    this.mode = this.determineMode();
    this.logger.log(`Settlement mode: ${this.mode}`);
  }

  /**
   * Получить стратегию для текущего режима
   */
  getStrategy(): SettlementStrategy {
    switch (this.mode) {
      case 'blockchain':
        return new BlockchainSettlement(this.escrowService);
      case 'hybrid':
        return new HybridSettlement(this.escrowService);
      case 'centralized':
      default:
        return new CentralizedSettlement();
    }
  }

  /**
   * Определить режим из переменных окружения
   */
  private determineMode(): SettlementMode {
    const envMode = process.env.SETTLEMENT_MODE?.toLowerCase();

    switch (envMode) {
      case 'blockchain':
        return 'blockchain';
      case 'hybrid':
        return 'hybrid';
      case 'centralized':
        return 'centralized';
      default:
        // По умолчанию централизованный режим (безопаснее)
        return 'centralized';
    }
  }

  /**
   * Получить текущий режим
   */
  getCurrentMode(): SettlementMode {
    return this.mode;
  }

  /**
   * Проверить, доступен ли блокчейн режим
   */
  isBlockchainEnabled(): boolean {
    return this.mode === 'blockchain' || this.mode === 'hybrid';
  }
}
