'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinTrade: (orderId: string, userId: string) => void;
  leaveTrade: (orderId: string) => void;
  sendTradeMessage: (orderId: string, userId: string, message: string) => void;
  notifications: Array<{
    id: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    title: string;
    message: string;
    timestamp: string;
  }>;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    title: string;
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const wsUrl = apiUrl.replace('/api', '');

    const socketInstance = io(wsUrl, {
      path: '/trades',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('[WebSocket] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('[WebSocket] Disconnected');
    });

    socketInstance.on('notification', (event: any) => {
      console.log('[WebSocket] Notification:', event);
      setNotifications(prev => [...prev, {
        id: `${event.timestamp}-${event.title}`,
        ...event,
      }]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const joinTrade = (orderId: string, userId: string) => {
    if (socket) {
      socket.emit('join-trade', { orderId, userId });
    }
  };

  const leaveTrade = (orderId: string) => {
    if (socket) {
      socket.emit('leave-trade', { orderId });
    }
  };

  const sendTradeMessage = (orderId: string, userId: string, message: string) => {
    if (socket) {
      socket.emit('trade-message', { orderId, userId, message });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        joinTrade,
        leaveTrade,
        sendTradeMessage,
        notifications,
        clearNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
