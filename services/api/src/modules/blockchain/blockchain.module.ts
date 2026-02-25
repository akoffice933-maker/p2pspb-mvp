import { Module, Global } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EscrowService } from './escrow.service';
import { EventsListenerService } from './events-listener.service';
import { WsModule } from '../ws/ws.module';

@Global()
@Module({
  imports: [WsModule],
  providers: [BlockchainService, EscrowService, EventsListenerService],
  exports: [BlockchainService, EscrowService],
})
export class BlockchainModule {}
