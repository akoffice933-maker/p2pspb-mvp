import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    Logger.warn('Sentry DSN not provided. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV !== 'production',
    
    // Sample rate for transactions
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: 0.1,
    
    // Release version
    release: process.env.npm_package_version || 'development',
    
    // Integrations
    integrations: [
      // HTTP integration
      new Sentry.Integrations.Http({ tracing: true }),
      
      // PostgreSQL integration
      new Sentry.Integrations.Prisma({ client: require('@prisma/client').PrismaClient }),
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      return event;
    },
  });

  Logger.log('Sentry initialized');
}

export const SentryHandler = Sentry.Handlers.requestHandler();
export const SentryErrorHandler = Sentry.Handlers.errorHandler();
export const SentryTracingHandler = Sentry.Handlers.tracingHandler();
