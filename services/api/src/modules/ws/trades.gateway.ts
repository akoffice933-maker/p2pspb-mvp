import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface JoinTradeRoomDto {
  orderId: string;
  userId: string;
}

export interface SendMessageDto {
  orderId: string;
  userId: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'trades',
})
export class TradesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradesGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.logger.log(`Connected clients: ${server.sockets.sockets.size}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Присоединиться к комнате сделки
   */
  @SubscribeMessage('join-trade')
  handleJoinTrade(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinTradeRoomDto,
  ) {
    const { orderId, userId } = data;
    
    // Создаём комнату для заказа
    const roomName = `trade:${orderId}`;
    client.join(roomName);
    
    // Также подписываем пользователя на его личные уведомления
    const userRoomName = `user:${userId}`;
    client.join(userRoomName);

    this.logger.log(
      `User ${userId} joined trade room ${orderId}, socket: ${client.id}`,
    );

    // Отправляем подтверждение
    client.emit('joined-trade', {
      orderId,
      userId,
      rooms: Array.from(client.rooms),
    });

    // Уведомляем других участников комнаты
    client.to(roomName).emit('user-joined', {
      orderId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Покинуть комнату сделки
   */
  @SubscribeMessage('leave-trade')
  handleLeaveTrade(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const { orderId } = data;
    const roomName = `trade:${orderId}`;
    client.leave(roomName);

    this.logger.log(`User left trade room ${orderId}`);

    // Уведомляем других участников
    client.to(roomName).emit('user-left', {
      orderId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Отправить сообщение в комнату сделки
   */
  @SubscribeMessage('trade-message')
  handleTradeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const { orderId, userId, message } = data;
    const roomName = `trade:${orderId}`;

    const messageData = {
      orderId,
      userId,
      message,
      timestamp: new Date().toISOString(),
    };

    // Отправляем всем в комнате включая отправителя
    this.server.to(roomName).emit('trade-message', messageData);

    this.logger.log(`Message in trade ${orderId} from user ${userId}`);
  }

  /**
   * Получить список участников комнаты
   */
  @SubscribeMessage('get-room-users')
  handleGetRoomUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const { orderId } = data;
    const roomName = `trade:${orderId}`;
    
    const room = this.server.sockets.adapter.rooms.get(roomName);
    const users = room ? Array.from(room) : [];

    return { orderId, users, count: users.length };
  }
}
