import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Проверка здоровья сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис здоров' })
  @ApiResponse({ status: 503, description: 'Сервис нездоров' })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('prisma', this.prisma),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Проверка готовности' })
  @ApiResponse({ status: 200, description: 'Сервис готов' })
  @ApiResponse({ status: 503, description: 'Сервис не готов' })
  ready() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
