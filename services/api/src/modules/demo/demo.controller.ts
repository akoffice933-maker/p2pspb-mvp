import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DemoService } from './demo.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private demoService: DemoService) {}

  @Get('status')
  @ApiOperation({ summary: 'Получить статус демо-режима' })
  @ApiResponse({ status: 200, description: 'Статус демо-режима' })
  getStatus() {
    return this.demoService.getStatus();
  }

  @Post('start')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Запустить демо-режим' })
  @ApiResponse({ status: 200, description: 'Демо-режим запущен' })
  start() {
    process.env.DEMO_MODE = 'true';
    return { success: true, message: 'Demo mode started' };
  }

  @Post('stop')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Остановить демо-режим' })
  @ApiResponse({ status: 200, description: 'Демо-режим остановлен' })
  stop() {
    this.demoService.stop();
    process.env.DEMO_MODE = 'false';
    return { success: true, message: 'Demo mode stopped' };
  }

  @Post('create-trade')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать демо-сделку' })
  @ApiResponse({ status: 200, description: 'Демо-сделка создана' })
  async createTrade() {
    // Триггер на создание одной демо-сделки
    return { success: true, message: 'Demo trade created' };
  }
}
