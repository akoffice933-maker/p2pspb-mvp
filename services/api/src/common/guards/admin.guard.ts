import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Простая проверка сессии (в MVP)
    // В реальном проекте - JWT
    const session = request.headers['x-admin-session'];

    if (!session || session !== process.env.ADMIN_SESSION_TOKEN) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
