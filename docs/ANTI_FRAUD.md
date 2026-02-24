# Anti-Fraud Система

## Обзор

P2PSPB включает в себя комплексную систему обнаружения мошеннических операций (Anti-Fraud).

## Компоненты системы

### 1. Velocity Checks (Проверка частоты операций)

Отслеживает подозрительно частые действия:

| Параметр | Порог |
|----------|-------|
| Заявок в час | 10 |
| Заявок в день | 50 |
| Отмен в день | 5 |

**Пример:**
```typescript
const fraudCheck = await fraudDetectionService.checkBeforeCreateOrder(
  userId,
  amount,
  ipAddress,
  fingerprint
);

if (fraudCheck.isFraud) {
  throw new ForbiddenException('Заявка отклонена');
}
```

### 2. Amount Checks (Проверка сумм)

| Параметр | Значение |
|----------|----------|
| Минимальная сумма | 100 USDT |
| Максимальная сумма | 100,000 USDT |
| Подозрительный шаг | 10,000 USDT |

### 3. Multi-Account Detection

Обнаружение нескольких аккаунтов у одного пользователя:

- **По IP адресу**: Если один IP используется 3+ пользователями
- **По fingerprint устройства**: Если одно устройство используется 2+ пользователями

```typescript
await fraudDetectionService.checkMultiAccount(
  userId,
  ipAddress,
  fingerprint
);
```

### 4. Behavior Pattern Analysis

Анализ поведенческих паттернов:

| Паттерн | Порог |
|---------|-------|
| Процент отмен | > 30% |
| Процент споров | > 10% |
| Среднее время сделки | < 5 минут |

### 5. Risk Score

Каждый пользователь имеет `riskScore` (0-100):

**Факторы риска:**
- Процент отмен: +30% к риску
- Процент споров: +40% к риску
- Открытые алерты: +10% за каждый
- Возраст аккаунта < 7 дней: +15%
- Возраст аккаунта < 30 дней: +5%
- Меньше 5 сделок: +10%

**Автоматическая блокировка:** При `riskScore >= 80`

## Типы алертов

### AlertType

| Тип | Описание |
|-----|----------|
| VELOCITY | Слишком частые операции |
| AMOUNT | Подозрительная сумма |
| MULTI_ACCOUNT | Несколько аккаунтов |
| BEHAVIOR | Аномальное поведение |
| DEVICE | Подозрительное устройство |
| IP | Подозрительный IP |
| CANCEL_RATE | Высокий процент отмен |
| DISPUTE_RATE | Частые споры |

### AlertStatus

| Статус | Описание |
|--------|----------|
| OPEN | Открыт (требует проверки) |
| REVIEWING | На проверке (взят в работу) |
| RESOLVED | Решён (ложный алерт) |
| CONFIRMED | Подтверждён (фрод обнаружен) |

## API Endpoints

### Получить алерты
```
GET /api/fraud/alerts?status=OPEN&type=VELOCITY&limit=50
```

### Обновить статус алерта
```
POST /api/fraud/alerts/:id/status
Body: { status: "REVIEWING" | "RESOLVED" | "CONFIRMED", adminId: string }
```

### Разблокировать пользователя
```
POST /api/fraud/users/:id/unblock
```

### Получить risk score пользователя
```
GET /api/fraud/users/:id/risk
```

## Интеграция с State Machine

Anti-fraud интегрирован в жизненный цикл заказов:

1. **Перед созданием заявки**: `checkBeforeCreateOrder()`
2. **Перед принятием заявки**: `checkBeforeAcceptOrder()`
3. **После завершения сделки**: `updateUserRiskScore()`

## Админ-панель

### Просмотр алертов
- URL: `/admin/fraud`
- Фильтрация по статусу и типу
- Сортировка по score

### Действия администратора
- Взять в работу (REVIEWING)
- Пометить как ложный (RESOLVED)
- Подтвердить фрод (CONFIRMED)
- Разблокировать пользователя

## WebSocket уведомления

Админы получают real-time уведомления:

```typescript
socket.on('fraud-alert', (data) => {
  console.log('New fraud alert:', data);
  // alertId, userId, type, score, title
});
```

## Пример использования

### Создание заявки с проверкой

```typescript
// Фронтенд
const fingerprint = await getDeviceFingerprint();

await api.post('/orders/create', {
  telegram_id: '123456',
  type: 'SELL',
  rate: 92.5,
  amount: 1000,
}, {
  headers: { 'x-fingerprint': fingerprint }
});

// Бэкенд автоматически:
// 1. Проверит velocity
// 2. Проверит сумму
// 3. Проверит risk score
// 4. Проверит multi-account
// 5. Создаст алерт при подозрении
// 6. Обновит risk score
```

### Проверка multi-account

```typescript
// При входе пользователя
await fraudDetectionService.logLoginSession(
  userId,
  ipAddress,
  userAgent,
  fingerprint
);

// Автоматически создаст алерт если:
// - Один IP у 3+ пользователей
// - Один fingerprint у 2+ пользователей
```

## Настройка порогов

В `fraud-detection.service.ts`:

```typescript
private readonly THRESHOLDS = {
  ORDERS_PER_HOUR: 10,
  ORDERS_PER_DAY: 50,
  CANCELS_PER_DAY: 5,
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 100000,
  CANCEL_RATE_THRESHOLD: 0.3,
  DISPUTE_RATE_THRESHOLD: 0.1,
  RISK_BLOCK_THRESHOLD: 80,
  RISK_WARNING_THRESHOLD: 50,
};
```

## Рекомендации

1. **Не устанавливайте слишком низкие пороги** - это увеличит количество ложных срабатываний
2. **Регулярно проверяйте алерты** - особенно со статусом OPEN
3. **Анализируйте CONFIRMED алерты** - для улучшения алгоритмов
4. **Мониторьте risk score** - пользователи с высоким риском требуют внимания
