'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface OrderUpdateEvent {
  orderId: string;
  type: 'ORDER_CREATED' | 'ORDER_ACCEPTED' | 'PAYMENT_CONFIRMED' | 'RECEIPT_CONFIRMED' | 'ORDER_CANCELLED' | 'DISPUTE_CREATED' | 'DISPUTE_RESOLVED';
  status: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface NotificationEvent {
  userId: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

interface UseWebSocketOptions {
  userId?: string;
  onOrderUpdate?: (event: OrderUpdateEvent) => void;
  onNotification?: (event: NotificationEvent) => void;
  onOrdersUpdate?: (orders: any[]) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { userId, onOrderUpdate, onNotification, onOrdersUpdate } = options;

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const wsUrl = apiUrl.replace('/api', '');

    // Подключаемся к WebSocket
    const socket = io(wsUrl, {
      path: '/trades',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    // Обработчик подключения
    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
    });

    // Обработчик отключения
    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    // Обработчик ошибок
    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Обработчик обновлений заказа
    socket.on('order-update', (event: OrderUpdateEvent) => {
      console.log('[WebSocket] Order update:', event);
      onOrderUpdate?.(event);
    });

    // Обработчик персональных уведомлений
    socket.on('notification', (event: NotificationEvent) => {
      console.log('[WebSocket] Notification:', event);
      onNotification?.(event);
    });

    // Обработчик массового обновления заказов
    socket.on('orders-update', (data: { orders: any[]; timestamp: string }) => {
      console.log('[WebSocket] Orders update:', data);
      onOrdersUpdate?.(data.orders);
    });

    return () => {
      socket.close();
    };
  }, [onOrderUpdate, onNotification, onOrdersUpdate]);

  // Присоединиться к комнате сделки
  const joinTrade = useCallback((orderId: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('join-trade', { orderId, userId });
      console.log(`[WebSocket] Joined trade ${orderId}`);
    }
  }, [userId]);

  // Покинуть комнату сделки
  const leaveTrade = useCallback((orderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-trade', { orderId });
      console.log(`[WebSocket] Left trade ${orderId}`);
    }
  }, []);

  // Отправить сообщение в комнату сделки
  const sendTradeMessage = useCallback((orderId: string, message: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('trade-message', { orderId, userId, message });
      console.log(`[WebSocket] Sent message to trade ${orderId}`);
    }
  }, [userId]);

  // Подписаться на обновления всех заказов
  const subscribeToOrders = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('join', 'orders');
      console.log('[WebSocket] Subscribed to orders');
    }
  }, []);

  // Отписаться от обновлений заказов
  const unsubscribeFromOrders = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave', 'orders');
      console.log('[WebSocket] Unsubscribed from orders');
    }
  }, []);

  return {
    socket: socketRef.current,
    joinTrade,
    leaveTrade,
    sendTradeMessage,
    subscribeToOrders,
    unsubscribeFromOrders,
    connected: socketRef.current?.connected || false,
  };
}
