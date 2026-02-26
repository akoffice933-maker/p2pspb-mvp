import { Module, Global } from '@nestjs/common';
import { AmlService } from './aml.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AmlService],
  exports: [AmlService],
})
export class AmlModule {}
