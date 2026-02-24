import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from '../auth/jwt-auth.service';
import { Request, Response } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 1. Проверяем JWT из httpOnly cookie
    const token = request.cookies?.['admin_token'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // 2. Верифицируем токен
      const payload = this.jwtAuthService.verifyToken(token);

      // 3. Добавляем пользователя в request
      request['user'] = payload;

      return true;
    } catch (error) {
      // 4. Если токен невалиден - очищаем cookie
      response.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
