# P2PSPB MVP

Закрытый P2P-сервис для обмена криптовалют в Санкт-Петербурге.

## 📋 Описание

MVP версия P2P-платформы для обмена USDT/RUB с поддержкой:
- Наличных расчётов
- СБП (Система быстрых платежей)
- **Escrow-система** (резервирование средств)
- **State Machine** для жизненного цикла сделок
- **Dispute system** (арбитраж споров)
- Рейтинговой системы участников

## 🏗️ Архитектура

```
p2pspb-mvp/
├── apps/web/           # Next.js фронтенд + админка
├── services/api/       # NestJS бэкенд API
├── docs/               # Документация
├── docker-compose.yml  # Docker конфигурация
└── .env.example        # Шаблон переменных окружения
```

## 🚀 Быстрый старт

### Требования

- Docker & Docker Compose
- Node.js 20+ (для локальной разработки)
- Минимум 500MB свободного места на диске

### Запуск через Docker

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Измените пароли и секреты в `.env`:
```
POSTGRES_PASSWORD=your_secure_password
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
ADMIN_SESSION_TOKEN=your_admin_token
```

3. Запустите все сервисы:
```bash
docker-compose up -d
```

4. Откройте в браузере:
   - Фронтенд: http://localhost:3000
   - Админка: http://localhost:3000/admin/login
   - API: http://localhost:4000/api

### Локальная разработка

#### Бэкенд

```bash
cd services/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

#### Фронтенд

```bash
cd apps/web
npm install
npm run dev
```

## 🔧 Технологический стек

### Бэкенд
- **NestJS** - Node.js фреймворк
- **Prisma 5** - ORM для работы с БД
- **PostgreSQL** - база данных
- **bcryptjs** - хеширование паролей
- **Helmet** - безопасность HTTP заголовков

### Фронтенд
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **TailwindCSS** - стилизация
- **React Query** - управление состоянием сервера
- **Lucide React** - иконки

## 📁 Структура БД

### User
- `id` - UUID
- `telegramId` - ID Telegram
- `username` - имя пользователя
- `reputationScore` - рейтинг (по умолчанию 5.0)
- `totalTrades` - количество сделок
- `balance` - баланс USDT
- `blockedBalance` - заблокировано в эскроу

### Order
- `id` - UUID
- `userId` - ссылка на создателя
- `sellerId` / `buyerId` - стороны сделки
- `type` - BUY/SELL
- `pair` - торговая пара (USDT/RUB)
- `rate` - курс обмена
- `minLimit` / `maxLimit` - лимиты
- `amount` - сумма в USDT
- `reservedAmount` - зарезервировано
- `paymentMethods` - способы оплаты
- `status` - PENDING, ACTIVE, RESERVED, PAYMENT_PENDING, PAID, CONFIRMED, COMPLETED, CANCELLED, DISPUTED, RESOLVED, HIDDEN
- `expiresAt` - время истечения

### Transaction
- `id` - UUID
- `orderId` - ссылка на заказ
- `userId` - пользователь
- `type` - RESERVE, PAYMENT, RELEASE, REFUND, ESCROW
- `amount` - сумма
- `balanceBefore` / `balanceAfter` - баланс до/после
- `description` - описание
- `metadata` - дополнительные данные

### Dispute
- `id` - UUID
- `orderId` - ссылка на заказ
- `initiatorId` - кто создал
- `reason` - причина
- `description` - описание
- `status` - OPEN, IN_REVIEW, RESOLVED
- `resolution` - решение арбитра
- `resolvedBy` - ID админа

## 🔌 API Endpoints

### Публичные
- `GET /api/orders` - список активных заявок
  - Query params: `type` (BUY/SELL), `payment` (sbp/cash)

- `GET /api/orders/:id` - детали заказа

- `GET /api/sse/orders` - SSE поток обновлений заявок

### Создание и управление заявками
- `POST /api/orders/create` - создать новую заявку
- `POST /api/orders/:id/accept` - принять заявку (покупатель)
- `POST /api/orders/:id/confirm-payment` - подтвердить оплату (продавец)
- `POST /api/orders/:id/confirm-receipt` - подтвердить получение (покупатель)
- `POST /api/orders/:id/cancel` - отменить заявку
- `POST /api/orders/:id/dispute` - создать спор

### Webhook (Telegram)
- `POST /api/webhook/order` - получение заявки из Telegram бота
  - Header: `x-telegram-bot-secret`

### Админка
- `POST /api/admin/login` - вход администратора
- `GET /api/admin/orders` - все заявки (требуется авторизация)
- `POST /api/admin/orders/:id/hide` - скрыть заявку (требуется авторизация)

## 🔄 State Machine

Жизненный цикл заказа:

```
PENDING → ACTIVE → RESERVED → PAYMENT_PENDING → PAID → CONFIRMED → COMPLETED
                     ↓              ↓              ↓
                  CANCELLED    DISPUTED       CANCELLED
                                ↓
                            RESOLVED
```

Подробная документация: [docs/STATE_MACHINE.md](docs/STATE_MACHINE.md)

## 🔐 Безопасность

- Rate limiting (100 запросов в минуту)
- Helmet для защиты HTTP заголовков
- CORS с whitelist доменов
- Валидация всех входящих данных
- Хеширование паролей (bcrypt)
- **Атомарные транзакции** через Prisma $transaction

## 📱 Telegram интеграция

Для работы webhook установите:
```
TELEGRAM_WEBHOOK_SECRET=ваш_секретный_ключ
```

Пример отправки заявки из бота:
```json
POST /api/webhook/order
Headers: x-telegram-bot-secret: ваш_секрет
Body: {
  "telegram_id": "123456789",
  "username": "@username",
  "type": "buy",
  "rate": 92.5,
  "min_limit": 1000,
  "max_limit": 50000,
  "amount": 1000,
  "payment_methods": ["sbp", "cash"]
}
```

## 👤 Админка по умолчанию

Для первого входа создайте администратора через Prisma Studio:
```bash
cd services/api
npx prisma studio
```

Или через скрипт:
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = await bcrypt.hash('admin_password', 10);

await prisma.admin.create({
  data: {
    username: 'admin',
    passwordHash: hash,
  },
});
```

## 🎯 Roadmap

### ✅ Этап 1: State Machine + Escrow (выполнено)
- [x] Расширенная схема статусов заказа
- [x] Таблица Transaction с историей операций
- [x] Атомарные транзакции через Prisma
- [x] Методы резервирования/освобождения средств
- [x] API для управления сделками
- [x] Dispute system

### ✅ Этап 2: WebSocket + Realtime (выполнено)
- [x] Socket.IO интеграция
- [x] WebSocket шлюз для сделок
- [x] Сервис уведомлений (NotificationsService)
- [x] Real-time обновления статуса заказов
- [x] Персональные уведомления пользователей
- [x] Комнаты для сторон сделки
- [x] WebSocket хук для фронтенда
- [x] Компонент уведомлений с иконками
- [x] Индикатор подключения в Header

### 📈 Этап 3: Anti-fraud (планируется)
- [ ] Velocity checks
- [ ] Behavior patterns
- [ ] Multi-account detection

## 📝 Лицензия

MIT

## 📞 Контакты

Telegram: @P2PSPB_bot
