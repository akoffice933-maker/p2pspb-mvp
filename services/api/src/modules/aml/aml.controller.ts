import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AmlService, AmlCheckRequest } from './aml.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('aml')
@Controller('aml')
export class AmlController {
  private readonly logger = new Logger(AmlController.name);

  constructor(private amlService: AmlService) {}

  @Post('check')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверить транзакцию через AML' })
  @ApiResponse({ status: 200, description: 'Результат AML проверки' })
  async checkTransaction(@Body() data: AmlCheckRequest) {
    this.logger.log(`AML check requested for tx: ${data.transaction_id}`);
    
    const result = await this.amlService.checkTransaction(data);
    
    return {
      success: true,
      ...result,
    };
  }

  @Get('check-address/:address')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверить адрес на blacklist' })
  @ApiResponse({ status: 200, description: 'Результат проверки адреса' })
  async checkAddress(@Param('address') address: string) {
    const result = await this.amlService.checkAddress(address);
    
    return {
      success: true,
      ...result,
    };
  }

  @Post('update-blacklist')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить blacklist' })
  @ApiResponse({ status: 200, description: 'Blacklist обновлён' })
  async updateBlacklist(
    @Body() data: { addresses: string[]; source: string },
  ) {
    const success = await this.amlService.updateBlacklist(
      data.addresses,
      data.source,
    );
    
    return {
      success,
      message: success 
        ? `Added ${data.addresses.length} addresses from ${data.source}`
        : 'Failed to update blacklist',
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Статус AML сервиса' })
  @ApiResponse({ status: 200, description: 'Статус сервиса' })
  getStatus() {
    return {
      enabled: this.amlService['enabled'],
      apiUrl: this.amlService['amlApiUrl'],
      status: 'operational',
    };
  }
}
