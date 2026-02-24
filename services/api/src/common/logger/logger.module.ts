import { Module, Global, Logger } from '@nestjs/common';
import { logger } from './winston.logger';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useValue: logger,
    },
  ],
  exports: [Logger],
})
export class LoggerModule {}
