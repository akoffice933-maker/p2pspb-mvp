import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../logger/winston.logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Логируем ошибку
    logger.error('Exception caught', {
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      url: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Не показываем стектрейс в production
    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
