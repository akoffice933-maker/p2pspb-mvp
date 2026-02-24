import { IsString, IsNumber, IsOptional, IsArray, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Telegram ID пользователя', example: '123456789' })
  @IsString()
  telegram_id: string;

  @ApiPropertyOptional({ description: 'Имя пользователя', example: '@username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Тип заявки', enum: ['buy', 'sell'], example: 'sell' })
  @IsString()
  @IsIn(['buy', 'sell'], { message: 'Type must be buy or sell' })
  type: 'buy' | 'sell';

  @ApiProperty({ description: 'Курс обмена', example: 92.5 })
  @IsNumber()
  @Min(0.01)
  rate: number;

  @ApiPropertyOptional({ description: 'Минимальный лимит', example: 1000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_limit?: number;

  @ApiPropertyOptional({ description: 'Максимальный лимит', example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  max_limit?: number;

  @ApiProperty({ description: 'Сумма в USDT', example: 1000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    description: 'Способы оплаты',
    example: ['sbp', 'cash'],
    default: ['sbp'],
  })
  @IsArray()
  @IsOptional()
  payment_methods?: string[];

  @ApiPropertyOptional({ description: 'IP адрес', example: '192.168.1.1' })
  @IsString()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'Отпечаток устройства' })
  @IsString()
  @IsOptional()
  fingerprint?: string;
}
