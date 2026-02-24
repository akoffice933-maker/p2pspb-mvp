import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { AlertStatus, AlertType } from '@prisma/client';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('fraud')
@ApiBearerAuth()
@Controller('fraud')
export class FraudController {
  constructor(
    private readonly fraudDetectionService: FraudDetectionService,
  ) {}

  @Get('alerts')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Получить список фрод-алертов' })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  @ApiQuery({ name: 'type', required: false, enum: AlertType })
  @ApiQuery({ name: 'userId', required: false, description: 'ID пользователя' })
  @ApiQuery({ name: 'limit', required: false, description: 'Лимит записей' })
  @ApiResponse({ status: 200, description: 'Список алертов' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getAlerts(
    @Query('status') status?: AlertStatus,
    @Query('type') type?: AlertType,
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.fraudDetectionService.getAlerts({
      status,
      type,
      userId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('alerts/:id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Обновить статус алерта' })
  @ApiResponse({ status: 200, description: 'Статус обновлён' })
  async updateAlertStatus(
    @Param('id') alertId: string,
    @Body() body: { status: AlertStatus; adminId: string },
  ) {
    return this.fraudDetectionService.updateAlertStatus(
      alertId,
      body.status,
      body.adminId,
    );
  }

  @Post('users/:id/unblock')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Разблокировать пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь разблокирован' })
  async unblockUser(@Param('id') userId: string) {
    return this.fraudDetectionService.unblockUser(userId);
  }

  @Get('users/:id/risk')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Получить risk score пользователя' })
  @ApiResponse({ status: 200, description: 'Risk score' })
  async getUserRiskScore(@Param('id') userId: string) {
    const riskScore = await this.fraudDetectionService.updateUserRiskScore(userId);
    return { userId, riskScore };
  }
}
