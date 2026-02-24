import { Module, Global } from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WsModule } from '../ws/ws.module';

@Global()
@Module({
  imports: [PrismaModule, WsModule],
  providers: [FraudDetectionService],
  exports: [FraudDetectionService],
})
export class FraudModule {}
