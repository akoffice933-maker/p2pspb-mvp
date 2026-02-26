import { Module, Global } from '@nestjs/common';
import { KmsService } from './kms.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [KmsService],
  exports: [KmsService],
})
export class KmsModule {}
