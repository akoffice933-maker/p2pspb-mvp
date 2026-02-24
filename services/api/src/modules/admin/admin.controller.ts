import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.adminService.validateAdmin(body.username, body.password);
    // В MVP используем простую сессию через cookie
    // В реальном проекте нужен JWT
    return { success: true, admin };
  }

  @Get('orders')
  @UseGuards(AdminGuard)
  async getOrders() {
    // Получаем все заявки (включая скрытые) для админки
    const orders = await this.ordersService['prisma'].order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return orders;
  }

  @Post('orders/:id/hide')
  @UseGuards(AdminGuard)
  async hideOrder(@Body() body: { id: string }) {
    return this.ordersService.hideOrder(body.id);
  }
}
