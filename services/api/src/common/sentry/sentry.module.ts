import { Module, Global } from '@nestjs/common';
import { initSentry } from './sentry.init';

@Global()
@Module({
  providers: [
    {
      provide: 'SENTRY_INIT',
      useFactory: () => {
        initSentry();
        return true;
      },
    },
  ],
  exports: [],
})
export class SentryModule {}
