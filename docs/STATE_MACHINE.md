# State Machine Документация

## Жизненный цикл заказа (Order State Machine)

### Статусы заказа

```
┌─────────────┐
│   PENDING   │ ← Новая заявка создана
└──────┬──────┘
       │
       ├─────────────┐
       │             ↓
       │        ┌──────────┐
       │        │  ACTIVE  │ ← Заявка видна в списке
       │        └────┬─────┘
       │             │
       │             ├──────────────┐
       │             │              ↓
       │             │         ┌──────────┐
       │             │         │ RESERVED │ ← Средства зарезервированы
       │             │         └────┬─────┘
       │             │              │
       │             │              ↓
       │             │        ┌───────────────┐
       │             │        │ PAYMENT_PENDING│ ← Ожидает оплаты
       │             │        └───────┬───────┘
       │             │                │
       │             │                ├────────────┐
       │             │                │            ↓
       │             │                │       ┌─────────┐
       │             │                │       │  PAID   │ ← Оплата подтверждена
       │             │                │       └────┬────┘
       │             │                │            │
       │             │                │            ↓
       │             │                │      ┌───────────┐
       │             │                │      │ CONFIRMED │ ← Покупатель подтвердил
       │             │                │      └─────┬─────┘
       │             │                │            │
       │             │                │            ↓
       │             │                │      ┌───────────┐
       │             │                │      │ COMPLETED │ ← Завершено успешно
       │             │                │      └───────────┘
       │             │                │
       │             │                ├──────→ DISPUTED → RESOLVED
       │             │                │
       │             ├────────────────┴──────→ CANCELLED
       │
       ├─────────────────────────────→ HIDDEN
       │
       └─────────────────────────────→ CANCELLED
```

### Переходы состояний

| Из статуса | В статус | Описание |
|------------|----------|----------|
| PENDING | ACTIVE | Заявка активирована |
| PENDING | CANCELLED | Заявка отменена при создании |
| ACTIVE | RESERVED | Средства зарезервированы |
| ACTIVE | CANCELLED | Заявка отменена |
| ACTIVE | HIDDEN | Скрыто админом |
| RESERVED | PAYMENT_PENDING | Покупатель принял заявку |
| RESERVED | CANCELLED | Резерв отменён |
| PAYMENT_PENDING | PAID | Продавец подтвердил оплату |
| PAYMENT_PENDING | CANCELLED | Оплата не поступила |
| PAYMENT_PENDING | DISPUTED | Создан спор |
| PAID | CONFIRMED | Покупатель подтвердил получение |
| PAID | DISPUTED | Создан спор |
| CONFIRMED | COMPLETED | Сделка завершена |
| DISPUTED | RESOLVED | Спор решён админом |
| RESOLVED | COMPLETED | Завершено после решения спора |
| RESOLVED | CANCELLED | Отменено после решения спора |

---

## Escrow Логика

### Резервирование средств

1. **Продавец создаёт заявку на продажу (SELL)**
   - Проверяется баланс продавца
   - Средства резервируются на эскроу
   - Статус: `RESERVED`

2. **Покупатель принимает заявку**
   - Проверяется баланс покупателя (сумма в RUB)
   - Средства покупателя резервируются
   - Статус: `PAYMENT_PENDING`

### Освобождение средств

1. **Успешная сделка**
   - Средства покупателя списываются навсегда
   - Средства продавца переводятся покупателю
   - Статус: `COMPLETED`

2. **Отмена сделки**
   - Все зарезервированные средства возвращаются
   - Статус: `CANCELLED`

3. **Решение спора**
   - Средства передаются победителю
   - Статус: `RESOLVED` → `COMPLETED`/`CANCELLED`

---

## API Endpoints

### Создание заявки
```
POST /api/orders/create
Body: {
  telegram_id: string,
  username?: string,
  type: "BUY" | "SELL",
  rate: number,
  min_limit: number,
  max_limit: number,
  amount: number,
  payment_methods: string[]
}
```

### Принятие заявки
```
POST /api/orders/:id/accept
Body: {
  buyer_id: string,
  amount: number
}
```

### Подтверждение оплаты
```
POST /api/orders/:id/confirm-payment
Body: { user_id: string }
```

### Подтверждение получения
```
POST /api/orders/:id/confirm-receipt
Body: { user_id: string }
```

### Отмена заявки
```
POST /api/orders/:id/cancel
Body: { user_id: string }
```

### Создание спора
```
POST /api/orders/:id/dispute
Body: {
  user_id: string,
  reason: string,
  description?: string
}
```

---

## Транзакции

Каждая операция записывается в таблицу `Transaction`:

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | ID транзакции |
| orderId | UUID | ID заказа |
| userId | UUID | ID пользователя |
| type | TransactionType | RESERVE, PAYMENT, RELEASE, REFUND, ESCROW |
| amount | Float | Сумма |
| balanceBefore | Float | Баланс до |
| balanceAfter | Float | Баланс после |
| description | String? | Описание |
| metadata | Json? | Дополнительные данные |

---

## Безопасность

- Все операции с средствами выполняются **атомарно** через `Prisma.$transaction`
- Проверка прав доступа для каждой операции
- Rate limiting на endpoints
- Валидация всех входных данных
