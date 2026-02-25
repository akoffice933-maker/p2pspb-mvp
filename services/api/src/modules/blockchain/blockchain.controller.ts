import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { BlockchainService } from './blockchain.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(
    private escrowService: EscrowService,
    private blockchainService: BlockchainService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Получить статус подключения к блокчейну' })
  @ApiResponse({ status: 200, description: 'Статус подключения' })
  getStatus() {
    return {
      connected: this.blockchainService.isConnected(),
      escrowAddress: this.blockchainService.getEscrowAddress(),
      tokenAddress: this.blockchainService.getTokenAddress(),
    };
  }

  @Get('trade/:id')
  @ApiOperation({ summary: 'Получить информацию о сделке в блокчейне' })
  @ApiResponse({ status: 200, description: 'Информация о сделке' })
  async getTrade(@Param('id') tradeId: number) {
    const trade = await this.escrowService.getTrade(tradeId);
    
    if (!trade) {
      throw new BadRequestException('Trade not found');
    }

    return {
      ...trade,
      statusText: this.getTradeStatusText(trade.status),
    };
  }

  @Post('trade/:id/complete')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Завершить сделку в блокчейне' })
  @ApiResponse({ status: 200, description: 'Сделка завершена' })
  async completeTrade(@Param('id') tradeId: number) {
    const txHash = await this.escrowService.completeTrade(tradeId);
    return { success: true, txHash };
  }

  @Post('trade/:id/cancel')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отменить сделку в блокчейне' })
  @ApiResponse({ status: 200, description: 'Сделка отменена' })
  async cancelTrade(@Param('id') tradeId: number) {
    const txHash = await this.escrowService.cancelTrade(tradeId);
    return { success: true, txHash };
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Получить баланс токенов адреса' })
  @ApiResponse({ status: 200, description: 'Баланс токенов' })
  async getTokenBalance(@Param('address') address: string) {
    const balance = await this.blockchainService.getTokenBalance(address);
    return { address, balance };
  }

  private getTradeStatusText(status: number): string {
    const statuses = [
      'Created',
      'Reserved',
      'PaymentPending',
      'Paid',
      'Confirmed',
      'Completed',
      'Disputed',
      'Resolved',
      'Cancelled',
    ];
    return statuses[status] || 'Unknown';
  }
}
