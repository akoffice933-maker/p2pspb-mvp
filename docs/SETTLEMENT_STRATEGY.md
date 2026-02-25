# Settlement Strategy Pattern

## Обзор

P2PSPB использует **Strategy Pattern** для гибкого переключения между режимами расчётов.

---

## 🎯 Зачем это нужно

**Проблема:**
- Блокчейн = прозрачно, но дорого и медленно
- Централизованно = быстро, но нет прозрачности
- Нужно переключаться без изменения кода

**Решение:**
Strategy Pattern позволяет выбирать режим через `.env`:

```env
SETTLEMENT_MODE=centralized  # centralized | blockchain | hybrid
```

---

## 📊 Режимы работы

### 1. Centralized (по умолчанию)

**Все операции в БД.**

```
User → API → PostgreSQL
```

**Преимущества:**
- ✅ Быстро (< 100ms)
- ✅ Дёшево (нет gas)
- ✅ Просто

**Недостатки:**
- ❌ Нет прозрачности
- ❌ Централизованный риск

**Использование:**
- MVP запуск
- Тестирование спроса
- Внутренние тесты

---

### 2. Blockchain

**Все операции в блокчейне.**

```
User → API → Smart Contract → Ethereum
```

**Преимущества:**
- ✅ Полная прозрачность
- ✅ Децентрализация
- ✅ Неизменяемость

**Недостатки:**
- ❌ Gas fees ($5-50 за сделку)
- ❌ Медленно (15 сек - 5 мин)
- ❌ Нужен аудит

**Использование:**
- Production с on-chain
- Требование регуляторов
- Premium пользователи

---

### 3. Hybrid (рекомендуется)

**Управление в БД, settlement в блокчейне.**

```
Создание → БД
Резерв → БД
Оплата → БД
└── Settlement → Блокчейн
```

**Преимущества:**
- ✅ UX не страдает
- ✅ Газ только при settlement
- ✅ Прозрачность финала

**Недостатки:**
- ⚠️ Сложнее реализация

**Использование:**
- **Рекомендуемый режим**
- Баланс UX/прозрачность
- Постепенный переход on-chain

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         OrdersService                   │
├─────────────────────────────────────────┤
│  - createOrder()                        │
│  - cancelOrder()                        │
│  - completeOrder()                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    SettlementStrategyFactory            │
│    (выбирает стратегию)                 │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│Central- │ │Blockchain│ │ Hybrid   │
│ized     │ │Settlement│ │Settlement│
└─────────┘ └─────────┘ └──────────┘
```

---

## 📁 Структура файлов

```
services/api/src/modules/orders/strategies/
├── settlement-strategy.interface.ts   ← Интерфейс
├── centralized.settlement.ts          ← БД режим
├── blockchain.settlement.ts           ← Блокчейн режим
├── hybrid.settlement.ts               ← Гибридный режим
├── settlement-strategy.factory.ts     ← Фабрика
└── settlement.module.ts               ← Модуль
```

---

## 🔧 Настройка

### 1. Выбрать режим

```env
# .env
SETTLEMENT_MODE=centralized  # или blockchain, или hybrid
```

### 2. Перезапустить API

```bash
npm run dev
```

### 3. Проверить логи

```
[Nest] LOG [SettlementStrategyFactory] Settlement mode: centralized
```

---

## 💡 Примеры использования

### Centralized (тестирование)

```env
SETTLEMENT_MODE=centralized
```

**Что происходит:**
- Заявки создаются в БД
- Нет blockchain вызовов
- Нет gas fees

---

### Hybrid (production)

```env
SETTLEMENT_MODE=hybrid
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/KEY
```

**Что происходит:**
- Заявки в БД
- Settlement в блокчейне
- Газ только при завершении

---

### Blockchain (full on-chain)

```env
SETTLEMENT_MODE=blockchain
BLOCKCHAIN_RPC_URL=...
BLOCKCHAIN_PRIVATE_KEY=...
```

**Что происходит:**
- Все операции в блокчейне
- Полная прозрачность
- Максимальный газ

---

## 🧪 Тестирование

### Unit тесты

```typescript
describe('SettlementStrategy', () => {
  it('centralized mode works', async () => {
    const strategy = new CentralizedSettlement();
    const result = await strategy.create(context);
    expect(result.success).toBe(true);
  });

  it('blockchain mode calls contract', async () => {
    const escrowService = { createTrade: jest.fn() };
    const strategy = new BlockchainSettlement(escrowService);
    const result = await strategy.create(context);
    expect(escrowService.createTrade).toHaveBeenCalled();
  });
});
```

---

## 📊 Сравнение режиммов

| Критерий | Centralized | Blockchain | Hybrid |
|----------|-------------|------------|--------|
| Скорость | < 100ms | 15 сек - 5 мин | < 100ms + settlement |
| Газ | $0 | $5-50 | $5-50 (только settlement) |
| Прозрачность | ❌ | ✅ | ✅ (частично) |
| UX | ✅ | ❌ | ✅ |
| Риск | Централизованный | Смарт-контракт | Смешанный |

---

## 🎯 Рекомендации

### Для MVP

```env
SETTLEMENT_MODE=centralized
```

**Почему:**
- Быстрый запуск
- Тестирование спроса
- Нет расходов на газ

---

### Для Production

```env
SETTLEMENT_MODE=hybrid
```

**Почему:**
- Баланс UX/прозрачность
- Газ только при settlement
- Постепенный переход

---

### Для регуляторов

```env
SETTLEMENT_MODE=blockchain
```

**Почему:**
- Полная прозрачность
- Аудит on-chain
- Compliance

---

## 🚀 Миграция между режимами

### Centralized → Hybrid

1. Задеплоить контракты
2. Изменить `.env`
3. Перезапустить API
4. Протестировать

**Время:** 1-2 часа

### Hybrid → Blockchain

1. Провести аудит контрактов
2. Обновить `.env`
3. Поэтапный rollout
4. Мониторинг

**Время:** 1-2 недели

---

## ⚠️ Важные заметки

### Безопасность

- Centralized: риск взлома БД
- Blockchain: риск смарт-контракта
- Hybrid: оба риска, но изолированы

### Масштабирование

- Centralized: вертикальное (БД)
- Blockchain: горизонтальное (ноды)
- Hybrid: комбинация

### Мониторинг

```typescript
// Логирование режима
logger.log(`Settlement mode: ${factory.getCurrentMode()}`);

// Метрики
if (factory.isBlockchainEnabled()) {
  metrics.blockchainTransactions++;
}
```

---

## 📞 Контакты

Вопросы по архитектуре: legal@p2pspb.com
