# P2PSPB API Documentation

## Базовый URL

```
http://localhost:4000/api
```

## Swagger/OpenAPI

Интерактивная документация доступна по адресу:
```
http://localhost:4000/api/docs
```

---

## Авторизация

### Admin Login

```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Ответ:**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "username": "admin"
  }
}
```

---

## Заявки (Orders)

### Получить список активных заявок

```http
GET /api/orders?type=BUY&payment=sbp
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| type | string | BUY или SELL |
| payment | string | sbp, cash |

**Ответ:**
```json
[
  {
    "id": "uuid",
    "type": "SELL",
    "rate": 92.5,
    "minLimit": 1000,
    "maxLimit": 50000,
    "amount": 1000,
    "reservedAmount": 1000,
    "status": "RESERVED",
    "paymentMethods": ["sbp"],
    "seller": {
      "username": "trader123",
      "reputationScore": 4.9,
      "totalTrades": 150
    }
  }
]
```

### Получить детали заказа

```http
GET /api/orders/:id
```

### Создать заявку

```http
POST /api/orders/create
Content-Type: application/json
x-fingerprint: device-fingerprint

{
  "telegram_id": "123456789",
  "username": "@username",
  "type": "SELL",
  "rate": 92.5,
  "min_limit": 1000,
  "max_limit": 50000,
  "amount": 1000,
  "payment_methods": ["sbp", "cash"]
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "status": "RESERVED",
  "user": { ... }
}
```

### Принять заявку

```http
POST /api/orders/:id/accept
Content-Type: application/json

{
  "buyer_id": "uuid",
  "amount": 500
}
```

### Подтвердить оплату

```http
POST /api/orders/:id/confirm-payment
Content-Type: application/json

{
  "user_id": "uuid"
}
```

### Подтвердить получение

```http
POST /api/orders/:id/confirm-receipt
Content-Type: application/json

{
  "user_id": "uuid"
}
```

### Отменить заявку

```http
POST /api/orders/:id/cancel
Content-Type: application/json

{
  "user_id": "uuid"
}
```

### Создать спор

```http
POST /api/orders/:id/dispute
Content-Type: application/json

{
  "user_id": "uuid",
  "reason": "Продавец не отвечает",
  "description": "Не выходит на связь более 24 часов"
}
```

---

## Anti-Fraud

### Получить алерты

```http
GET /api/fraud/alerts?status=OPEN&type=VELOCITY&limit=50
Authorization: Bearer {admin_session}
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| status | string | OPEN, REVIEWING, RESOLVED, CONFIRMED |
| type | string | VELOCITY, AMOUNT, MULTI_ACCOUNT, и т.д. |
| userId | string | ID пользователя |
| limit | number | Лимит записей |

### Обновить статус алерта

```http
POST /api/fraud/alerts/:id/status
Authorization: Bearer {admin_session}
Content-Type: application/json

{
  "status": "REVIEWING",
  "adminId": "admin"
}
```

### Разблокировать пользователя

```http
POST /api/fraud/users/:id/unblock
Authorization: Bearer {admin_session}
```

### Получить risk score

```http
GET /api/fraud/users/:id/risk
Authorization: Bearer {admin_session}
```

**Ответ:**
```json
{
  "userId": "uuid",
  "riskScore": 75
}
```

---

## Admin

### Получить все заявки

```http
GET /api/admin/orders
Authorization: Bearer {admin_session}
```

### Скрыть заявку

```http
POST /api/admin/orders/:id/hide
Authorization: Bearer {admin_session}
```

---

## Webhook (Telegram)

### Получить заявку из Telegram

```http
POST /api/webhook/order
Content-Type: application/json
x-telegram-bot-secret: {secret}

{
  "telegram_id": "123456789",
  "username": "@username",
  "type": "buy",
  "rate": 92.5,
  "min_limit": 1000,
  "max_limit": 50000,
  "amount": 1000,
  "payment_methods": ["sbp"]
}
```

**Ответ:**
```json
{
  "success": true,
  "orderId": "uuid"
}
```

---

## Server-Sent Events (SSE)

### Подписаться на обновления заказов

```http
GET /api/sse/orders
```

**События:**
```
event: orders-update
data: {"orders":[...],"timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## WebSocket

### Подключение

```
ws://localhost:4000/trades
```

### События

#### join-trade
```json
{
  "orderId": "uuid",
  "userId": "uuid"
}
```

#### leave-trade
```json
{
  "orderId": "uuid"
}
```

#### trade-message
```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "message": "Привет!"
}
```

#### order-update (от сервера)
```json
{
  "orderId": "uuid",
  "type": "ORDER_CREATED",
  "status": "ACTIVE",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### notification (от сервера)
```json
{
  "userId": "uuid",
  "type": "SUCCESS",
  "title": "Заявка создана",
  "message": "Ваша заявка успешно создана",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Статусы заказов

| Статус | Описание |
|--------|----------|
| PENDING | Ожидает подтверждения |
| ACTIVE | Активная заявка |
| RESERVED | Средства зарезервированы |
| PAYMENT_PENDING | Ожидает оплаты |
| PAID | Оплата получена |
| CONFIRMED | Подтверждено покупателем |
| COMPLETED | Завершено успешно |
| CANCELLED | Отменено |
| DISPUTED | Спор |
| RESOLVED | Спор решён |
| HIDDEN | Скрыто админом |

---

## Типы фрод-алертов

| Тип | Описание |
|-----|----------|
| VELOCITY | Слишком частые операции |
| AMOUNT | Подозрительная сумма |
| MULTI_ACCOUNT | Несколько аккаунтов |
| BEHAVIOR | Аномальное поведение |
| CANCEL_RATE | Высокий процент отмен |
| DISPUTE_RATE | Частые споры |

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверные данные |
| 401 | Не авторизован |
| 403 | Доступ запрещён (anti-fraud) |
| 404 | Не найдено |
| 429 | Слишком много запросов |
| 500 | Внутренняя ошибка |
