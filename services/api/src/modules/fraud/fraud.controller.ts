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

@Controller('fraud')
export class FraudController {
  constructor(
    private readonly fraudDetectionService: FraudDetectionService,
  ) {}

  @Get('alerts')
  @UseGuards(AdminGuard)
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
  async unblockUser(@Param('id') userId: string) {
    return this.fraudDetectionService.unblockUser(userId);
  }

  @Get('users/:id/risk')
  @UseGuards(AdminGuard)
  async getUserRiskScore(@Param('id') userId: string) {
    const riskScore = await this.fraudDetectionService.updateUserRiskScore(userId);
    return { userId, riskScore };
  }
}
