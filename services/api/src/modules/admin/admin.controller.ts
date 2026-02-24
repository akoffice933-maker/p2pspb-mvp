import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Response, Request } from 'express';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход администратора с JWT' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  async login(
    @Body() body: { username: string; password: string; otp?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.adminService.login(body.username, body.password, body.otp);

    // Устанавливаем httpOnly cookie
    response.cookie('admin_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
      path: '/api',
    });

    return result;
  }

  @Post('logout')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Выход администратора' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
    });

    return { success: true };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущий профиль админа' })
  async getMe(@Req() req: Request) {
    return {
      user: req['user'],
    };
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

  @Post('2fa/setup')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Настроить 2FA' })
  async setup2FA(@Req() req: Request) {
    const adminId = req['user'].sub;
    return this.adminService.setup2FA(adminId);
  }

  @Post('2fa/enable')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Включить 2FA' })
  async enable2FA(@Req() req: Request, @Body() body: { otp: string }) {
    const adminId = req['user'].sub;
    return this.adminService.enable2FA(adminId, body.otp);
  }

  @Post('2fa/disable')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выключить 2FA' })
  async disable2FA(@Req() req: Request, @Body() body: { otp: string }) {
    const adminId = req['user'].sub;
    return this.adminService.disable2FA(adminId, body.otp);
  }
}
