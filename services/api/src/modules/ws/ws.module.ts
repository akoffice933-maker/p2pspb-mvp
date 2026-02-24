import { Module, Global } from '@nestjs/common';
import { TradesGateway } from './trades.gateway';

@Global()
@Module({
  providers: [TradesGateway],
  exports: [TradesGateway],
})
export class WsModule {}
