# Demo Mode — Investor Presentation

## 🎯 Назначение

Demo Mode автоматически создаёт и проводит сделки для демонстрации инвесторам.

**Время демонстрации:** 5-7 минут  
**Эффект:** Вау! 🚀

---

## 🚀 Быстрый старт

### 1. Включить демо-режим

```env
# .env
DEMO_MODE=true
DEMO_INTERVAL_MS=30000  # 30 секунд между сделками
```

### 2. Запустить API

```bash
npm run dev
```

### 3. Открыть фронтенд

```
http://localhost:3000
```

---

## 🎬 Сценарий демонстрации

### Сцена 1: "Это работает" (2 минуты)

1. **Открываем главную страницу**
   - Видим список заявок
   - Фильтры BUY/SELL

2. **Показываем live-обновления**
   - Новые заявки появляются автоматически
   - Статусы меняются в реальном времени

3. **Комментарий для инвесторов:**
   > "Наша платформа обрабатывает сделки в реальном времени с WebSocket обновлениями"

---

### Сцена 2: "Blockchain интеграция" (2 минуты)

1. **Открываем админ-панель**
   ```
   http://localhost:3000/admin
   ```

2. **Показываем блокчейн-статус**
   - Tx Hash
   - Ссылка на Etherscan
   - Статус подтверждения

3. **Комментарий для инвесторов:**
   > "Каждая сделка записывается в блокчейн для прозрачности и безопасности"

---

### Сцена 3: "Масштабируемость" (1 минута)

1. **Показываем метрики**
   - Количество сделок в минуту
   - Среднее время обработки
   - Gas fees

2. **Комментарий для инвесторов:**
   > "Архитектура готова к 10,000 транзакций в день"

---

### Сцена 4: "Token & Revenue" (2 минуты)

1. **Показываем PSPB токен**
   - Contract address
   - Total supply
   - Distribution

2. **Модель монетизации:**
   - 0.5% комиссия
   - 60% валидаторам
   - 20% treasury
   - 20% development

3. **Комментарий для инвесторов:**
   > "Наш токен создаёт экономический стимул для всех участников"

---

## 📊 Демо-метрики

### Что показывать инвесторам

| Метрика | Значение | Комментарий |
|---------|----------|-------------|
| Сделки в минуту | 2-4 | Автоматически |
| Среднее время сделки | < 1 сек | Для centralized |
| Gas cost (blockchain) | $0.50-2 | Sepolia testnet |
| Активные пользователи | 10-20 | Демо-аккаунты |

---

## 🎨 Визуальные эффекты

### 1. Live уведомления

```typescript
// В админ-панели
socket.on('order-update', (event) => {
  // Показываем toast уведомление
  showNotification(`New order: ${event.type}`);
});
```

### 2. Blockchain Badge

```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
  <span className="text-xs text-green-500">On-chain</span>
</div>
```

### 3. Tx Hash Link

```tsx
<a
  href={`https://sepolia.etherscan.io/tx/${txHash}`}
  target="_blank"
  className="text-primary hover:underline"
>
  {txHash.slice(0, 10)}...{txHash.slice(-8)}
</a>
```

---

## 🎯 Ключевые сообщения для инвесторов

### 1. Технологический moat

> "Мы используем Strategy Pattern для гибкого переключения между centralized и blockchain режимами"

### 2. Рынок

> "Объём P2P crypto рынка в 2026: $500B+"

### 3. Монетизация

> "0.5% комиссия × 1000 сделок/день = $500/день revenue"

### 4. Масштабируемость

> "Архитектура готова к горизонтальному масштабированию"

---

## 📹 Скрипт для видео-демо

### Вступление (30 сек)

> "Привет! Я покажу вам P2PSPB — платформу для обмена криптовалют с blockchain settlement."

### Основная часть (3 мин)

1. Показываем главную страницу
2. Создаём сделку
3. Показываем blockchain tx
4. Показываем админ-панель

### Заключение (1 мин)

> "Мы ищем $500k для запуска и захвата 1% рынка в первый год"

---

## ⚙️ Конфигурация

### Переменные окружения

```env
# Demo Mode
DEMO_MODE=true
DEMO_INTERVAL_MS=30000

# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=your_key
PSPB_TOKEN_ADDRESS=0x...
PSPB_ESCROW_ADDRESS=0x...
```

### API Endpoints

```bash
# Статус демо-режима
GET /api/demo/status

# Запустить демо
POST /api/demo/start

# Остановить демо
POST /api/demo/stop

# Создать демо-сделку
POST /api/demo/create-trade
```

---

## 🎭 Демо-режимы

### Centralized Demo

```env
DEMO_MODE=true
SETTLEMENT_MODE=centralized
```

**Что происходит:**
- Сделки создаются в БД
- Нет blockchain вызовов
- Быстро (< 100ms)

---

### Blockchain Demo

```env
DEMO_MODE=true
SETTLEMENT_MODE=blockchain
```

**Что происходит:**
- Сделки в блокчейне
- Tx Hash в UI
- Газ $0.50-2

---

### Hybrid Demo (рекомендуется)

```env
DEMO_MODE=true
SETTLEMENT_MODE=hybrid
```

**Что происходит:**
- Управление в БД
- Settlement в блокчейне
- Лучший UX

---

## 📞 Контакты

Вопросы по демо: legal@p2pspb.com

---

**Made for Investor Presentations 💼**
