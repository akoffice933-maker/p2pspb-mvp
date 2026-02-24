# Security Improvements

## Критические уязвимости исправленные в феврале 2026

### 1. ✅ JWT авторизация для админки (Приоритет ★★★★★)

**Проблема:**
- Авторизация через `sessionStorage.getItem('adminSession')`
- Любой мог подставить значение в консоли браузера
- Нет проверки на сервере

**Решение:**
- JWT токены с httpOnly cookies
- 2FA (TOTP) с QR-кодом
- Cookie-parser middleware
- Верификация токена в AdminGuard

**Файлы:**
- `services/api/src/modules/auth/jwt-auth.service.ts`
- `services/api/src/modules/auth/jwt-auth.module.ts`
- `services/api/src/common/guards/admin.guard.ts`
- `services/api/src/modules/admin/admin.service.ts`
- `services/api/src/modules/admin/admin.controller.ts`
- `apps/web/app/admin/login/page.tsx`
- `apps/web/app/admin/2fa/page.tsx`

**Использование:**
```bash
# Логин
POST /api/admin/login
{
  "username": "admin",
  "password": "password"
}

# Ответ устанавливает httpOnly cookie с JWT
{
  "access_token": "eyJhbG...",
  "requires2FA": false
}

# 2FA Setup
POST /api/admin/2fa/setup
# Возвращает QR-код и secret

# 2FA Enable
POST /api/admin/2fa/enable
{
  "otp": "123456"
}
```

---

### 2. ✅ Webhook Secret Token (Приоритет ★★★★★)

**Проблема:**
- Нет проверки подписи от Telegram
- Нет защиты от replay-атак
- Любой мог спамить фейковыми заявками

**Решение:**
- Проверка `x-telegram-bot-secret` заголовка
- Timestamp validation (окно 5 минут)
- Хранение использованных timestamp (защита от replay)
- Валидация данных с class-validator
- Интеграция с FraudDetectionService

**Файлы:**
- `services/api/src/modules/webhook/webhook.service.ts`
- `services/api/src/modules/webhook/webhook.controller.ts`
- `services/api/src/modules/webhook/create-order.dto.ts`

**Использование:**
```bash
POST /api/webhook/order
Headers:
  x-telegram-bot-secret: your_secret
  x-telegram-timestamp: 1708800000000

Body:
{
  "telegram_id": "123456789",
  "type": "sell",
  "rate": 92.5,
  "amount": 1000
}
```

---

### 3. ✅ Rate Limiting на Redis (Приоритет ★★★★☆)

**Проблема:**
- In-memory throttler не работает для нескольких инстансов
- Нет защиты от DDoS

**Решение:**
- Redis-based ThrottlerStorage
- Распределённый rate limiting
- 100 запросов в минуту на IP

**Файлы:**
- `services/api/src/modules/redis/redis.module.ts`
- `services/api/src/modules/redis/redis.service.ts`
- `services/api/src/modules/redis/throttler-storage-redis.service.ts`

**Конфигурация:**
```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

---

### 4. ✅ DTO Валидация (Приоритет ★★★★☆)

**Проблема:**
- Нет валидации входных данных
- Любой мусор мог попасть в сервисы

**Решение:**
- class-validator декораторы
- class-transformer для авто-конвертации
- Global ValidationPipe

**Пример:**
```typescript
export class CreateOrderDto {
  @IsString()
  telegram_id: string;

  @IsIn(['buy', 'sell'])
  type: 'buy' | 'sell';

  @IsNumber()
  @Min(0.01)
  rate: number;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
```

---

### 5. 🔄 Логирование Winston (Приоритет ★★★☆☆)

**Проблема:**
- console.log везде
- Нет структуры логов
- Нет уровня логирования

**Решение:** (планируется)
- Winston с transports (file, console)
- Уровни: error, warn, info, debug
- Форматирование JSON

---

## Дополнительные улучшения

### CORS
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

### Helmet
```typescript
app.use(helmet());
```

### Global ValidationPipe
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

---

## Checklist безопасности перед запуском

### Обязательно
- [ ] Изменить `JWT_SECRET` на случайную строку 32+ символов
- [ ] Изменить `TELEGRAM_WEBHOOK_SECRET`
- [ ] Изменить `REDIS_PASSWORD`
- [ ] Включить HTTPS (SSL сертификат)
- [ ] Настроить rate limiting (100 req/min)
- [ ] Включить 2FA для всех админов

### Рекомендуется
- [ ] Настроить логирование в файл
- [ ] Настроить алерты на ошибки
- [ ] Включить CSP headers
- [ ] Настроить backup БД
- [ ] Провести penetration testing

---

## Тестирование безопасности

### 1. Проверка JWT
```bash
# Без токена
curl http://localhost:4000/api/admin/orders
# Ожидается: 401 Unauthorized

# С неверным токеном
curl -H "Cookie: admin_token=invalid" http://localhost:4000/api/admin/orders
# Ожидается: 401 Unauthorized

# С верным токеном
curl -H "Cookie: admin_token=eyJhbG..." http://localhost:4000/api/admin/orders
# Ожидается: 200 OK
```

### 2. Проверка Webhook
```bash
# Без секрета
curl -X POST http://localhost:4000/api/webhook/order
# Ожидается: 401 Unauthorized

# С неверным секретом
curl -X POST http://localhost:4000/api/webhook/order \
  -H "x-telegram-bot-secret: wrong"
# Ожидается: 401 Unauthorized

# С верным секретом
curl -X POST http://localhost:4000/api/webhook/order \
  -H "x-telegram-bot-secret: correct" \
  -d '{"telegram_id":"123","type":"sell","rate":92.5,"amount":1000}'
# Ожидается: 200 OK
```

### 3. Проверка 2FA
```bash
# Логин без 2FA когда он включён
curl -X POST http://localhost:4000/api/admin/login \
  -d '{"username":"admin","password":"password"}'
# Ожидается: 401 + "2FA code required"

# Логин с 2FA
curl -X POST http://localhost:4000/api/admin/login \
  -d '{"username":"admin","password":"password","otp":"123456"}'
# Ожидается: 200 OK
```

---

## Security Policy

### Поддерживаемые версии
| Версия | Поддержка |
|--------|-----------|
| 1.0.x  | ✅ Security updates |

### Как сообщить об уязвимости
1. Не создавайте Issue в GitHub
2. Пишите на: security@p2pspb.com
3. Укажите:
   - Тип уязвимости
   - Шаги воспроизведения
   - Потенциальный impact

### Response Time
- Критические: 24 часа
- Высокие: 72 часа
- Средние: 1 неделя
