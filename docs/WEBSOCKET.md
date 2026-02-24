# WebSocket Документация

## Обзор

P2PSPB использует **Socket.IO** для real-time обновлений и уведомлений.

## Подключение

### URL подключения

```
ws://localhost:4000/trades
```

### Пример подключения (клиент)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  path: '/trades',
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

## События сервер → клиент

### order-update
Обновление статуса заказа.

```typescript
interface OrderUpdateEvent {
  orderId: string;
  type: 'ORDER_CREATED' | 'ORDER_ACCEPTED' | 'PAYMENT_CONFIRMED' | 'RECEIPT_CONFIRMED' | 'ORDER_CANCELLED' | 'DISPUTE_CREATED' | 'DISPUTE_RESOLVED';
  status: string;
  data: Record<string, any>;
  timestamp: string;
}

socket.on('order-update', (event: OrderUpdateEvent) => {
  console.log('Order updated:', event);
});
```

### notification
Персональное уведомление.

```typescript
interface NotificationEvent {
  userId: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

socket.on('notification', (event: NotificationEvent) => {
  console.log('Notification:', event);
});
```

### orders-update
Массовое обновление списка заказов.

```typescript
socket.on('orders-update', (data: { orders: any[]; timestamp: string }) => {
  console.log('Orders updated:', data.orders);
});
```

### trade-message
Сообщение в комнате сделки.

```typescript
socket.on('trade-message', (data: {
  orderId: string;
  userId: string;
  message: string;
  timestamp: string;
}) => {
  console.log('Trade message:', data);
});
```

## События клиент → сервер

### join-trade
Присоединиться к комнате сделки.

```typescript
socket.emit('join-trade', {
  orderId: 'uuid-заказа',
  userId: 'uuid-пользователя',
});

// Ответ
socket.on('joined-trade', (data) => {
  console.log('Joined trade:', data);
});
```

### leave-trade
Покинуть комнату сделки.

```typescript
socket.emit('leave-trade', {
  orderId: 'uuid-заказа',
});
```

### trade-message
Отправить сообщение в комнату сделки.

```typescript
socket.emit('trade-message', {
  orderId: 'uuid-заказа',
  userId: 'uuid-пользователя',
  message: 'Привет!',
});
```

### get-room-users
Получить список участников комнаты.

```typescript
socket.emit('get-room-users', { orderId: 'uuid-заказа' }, (response) => {
  console.log('Room users:', response);
});
```

## Комнаты

### trade:{orderId}
Комната для конкретной сделки. В ней находятся:
- Продавец
- Покупатель
- Арбитры (при споре)

### user:{userId}
Личная комната пользователя для персональных уведомлений.

### orders
Общая комната для обновлений списка заказов.

### admins
Комната для администраторов (уведомления о спорах).

## Сценарии использования

### 1. Создание заявки

```typescript
// Клиент создаёт заявку через API
await api.post('/orders/create', { ... });

// Сервер отправляет уведомление создателю
socket.on('notification', (event) => {
  // "Ваша заявка создана"
});

// Сервер отправляет обновление в orders
socket.on('order-update', (event) => {
  // Обновляем список заявок
});
```

### 2. Принятие заявки

```typescript
// Покупатель принимает заявку
await api.post('/orders/:id/accept', { buyer_id, amount });

// Сервер отправляет уведомления обеим сторонам
socket.on('order-update', (event) => {
  if (event.type === 'ORDER_ACCEPTED') {
    // "Заявка принята"
  }
});
```

### 3. Чат сделки

```typescript
// Присоединяемся к комнате
socket.emit('join-trade', { orderId, userId });

// Отправляем сообщение
socket.emit('trade-message', { orderId, userId, message });

// Получаем сообщения
socket.on('trade-message', (data) => {
  // Добавляем сообщение в чат
});
```

## React хук

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const {
    socket,
    joinTrade,
    leaveTrade,
    sendTradeMessage,
    connected,
  } = useWebSocket({
    userId: 'user-123',
    onOrderUpdate: (event) => console.log(event),
    onNotification: (event) => console.log(event),
  });

  return (
    <div>
      <span>{connected ? 'Online' : 'Offline'}</span>
      <button onClick={() => joinTrade('order-123')}>
        Join Trade
      </button>
    </div>
  );
}
```

## Безопасность

- CORS настроен на `FRONTEND_URL`
- Требуется `userId` для присоединения к комнате
- Административные события только для авторизованных

## Переподключение

Socket.IO автоматически переподключается при обрыве:

```typescript
{
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
}
```

## Отладка

Включите логи в консоли клиента:

```typescript
localStorage.debug = 'socket.io-client:*';
```
