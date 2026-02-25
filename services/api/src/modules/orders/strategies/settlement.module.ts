import { Module, Global } from '@nestjs/common';
import { SettlementStrategyFactory } from './settlement-strategy.factory';
import { CentralizedSettlement } from './centralized.settlement';
import { BlockchainSettlement } from './blockchain.settlement';
import { HybridSettlement } from './hybrid.settlement';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Global()
@Module({
  imports: [BlockchainModule],
  providers: [
    SettlementStrategyFactory,
    CentralizedSettlement,
    BlockchainSettlement,
    HybridSettlement,
  ],
  exports: [SettlementStrategyFactory],
})
export class SettlementModule {}
