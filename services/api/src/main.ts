import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('P2PSPB API')
    .setDescription('API для P2P-обмена криптовалют в Санкт-Петербурге')
    .setVersion('1.0')
    .addTag('orders', 'Заявки на обмен')
    .addTag('fraud', 'Anti-fraud система')
    .addTag('admin', 'Админ-панель')
    .addTag('webhook', 'Telegram webhook')
    .addTag('sse', 'Server-Sent Events')
    .addBearerAuth()
    .addSecurity('api_key', {
      type: 'apiKey',
      name: 'x-telegram-bot-secret',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API running on port ${port}`);
  console.log(`WebSocket gateway available on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
