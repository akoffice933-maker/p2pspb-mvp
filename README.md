# P2PSPB MVP

Закрытый P2P-сервис для обмена криптовалют в Санкт-Петербурге.

## 📋 Описание

MVP версия P2P-платформы для обмена USDT/RUB с поддержкой:
- Наличных расчётов
- СБП (Система быстрых платежей)
- Арбитража при спорах
- Рейтинговой системы участников

## 🏗️ Архитектура

```
p2pspb-mvp/
├── apps/web/           # Next.js фронтенд + админка
├── services/api/       # NestJS бэкенд API
├── docker-compose.yml  # Docker конфигурация
└── .env.example        # Шаблон переменных окружения
```

## 🚀 Быстрый старт

### Требования

- Docker & Docker Compose
- Node.js 20+ (для локальной разработки)

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
npx prisma migrate dev
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
- **Prisma** - ORM для работы с БД
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

### Order
- `id` - UUID
- `userId` - ссылка на пользователя
- `type` - BUY/SELL
- `pair` - торговая пара (USDT/RUB)
- `rate` - курс обмена
- `minLimit` / `maxLimit` - лимиты
- `availableAmount` - доступное количество
- `paymentMethods` - способы оплаты
- `status` - ACTIVE/HIDDEN/COMPLETED

### Admin
- `id` - UUID
- `username` - логин
- `passwordHash` - хеш пароля

## 🔌 API Endpoints

### Публичные
- `GET /api/orders` - список активных заявок
  - Query params: `type` (BUY/SELL), `payment` (sbp/cash)

- `GET /api/sse/orders` - SSE поток обновлений заявок

### Webhook (Telegram)
- `POST /api/webhook/order` - получение заявки из Telegram бота
  - Header: `x-telegram-bot-secret`

### Админка
- `POST /api/admin/login` - вход администратора
- `GET /api/admin/orders` - все заявки (требуется авторизация)
- `POST /api/admin/orders/hide` - скрыть заявку (требуется авторизация)

## 🔐 Безопасность

- Rate limiting (100 запросов в минуту)
- Helmet для защиты HTTP заголовков
- CORS с whitelist доменов
- Валидация всех входящих данных
- Хеширование паролей (bcrypt)

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

## 🎯 Roadmap MVP

- [x] Базовая структура проекта
- [x] CRUD заявок
- [x] Интеграция с Telegram
- [x] Админ-панель
- [x] Real-time обновления (SSE)
- [ ] JWT авторизация
- [ ] Уведомления в Telegram
- [ ] Расширенная аналитика
- [ ] Мобильная версия

## 📝 Лицензия

MIT

## 📞 Контакты

Telegram: @P2PSPB_bot
