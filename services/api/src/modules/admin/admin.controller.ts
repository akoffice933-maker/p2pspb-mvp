import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Вход администратора' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.adminService.validateAdmin(body.username, body.password);
    return { success: true, admin };
  }

  @Get('orders')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все заявки (включая скрытые)' })
  @ApiResponse({ status: 200, description: 'Список всех заявок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getOrders() {
    const orders = await this.ordersService['prisma'].order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return orders;
  }

  @Post('orders/:id/hide')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Скрыть заявку' })
  @ApiResponse({ status: 200, description: 'Заявка скрыта' })
  async hideOrder(@Body() body: { id: string }) {
    return this.ordersService.hideOrder(body.id);
  }
}
