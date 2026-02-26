# P2PSPB — Закрытый P2P-обмен криптовалют с AML и Blockchain-расчётами 🚀

> **Enterprise-Ready платформа** для безопасного обмена криптовалют  
> 🏗️ State Machine • 💰 Escrow • 🔐 2FA • ⛓️ Blockchain • 🛡️ AML • 🎯 Demo Mode

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org)
[![AML Integration](https://img.shields.io/badge/AML-Enterprise-green)]()
[![Demo Mode](https://img.shields.io/badge/Demo-Ready-green)]()

---

## 📋 Что такое P2PSPB?

**P2PSPB** — это полнофункциональная P2P-платформа для обмена криптовалют (USDT/RUB) с уникальной архитектурой:

| Компонент | Технология | Преимущество |
|-----------|------------|--------------|
| **UX** | Централизованный | Быстро (< 1 сек) |
| **Расчёты** | Blockchain (Ethereum) | Прозрачно + неизменно |
| **Безопасность** | AML + Anti-Fraud | Enterprise защита |
| **Гибкость** | Strategy Pattern | Переключение режимов |

### 🎯 Для кого

| Аудитория | Что получает |
|-----------|--------------|
| **Пользователи** | Быстрый обмен без KYC, арбитраж, AML защита |
| **Трейдеры** | Заработок на спреде (до $6K/месяц) |
| **Валидаторы** | Пассивный доход ($3-9K/месяц) |
| **Инвесторы** | Прозрачная экономика, токенизация, exit стратегия |

---

## ✨ Ключевые возможности

### 🔥 Для пользователей

- ✅ **Мгновенные сделки** — < 1 секунды
- ✅ **Наличные и СБП** — популярные способы оплаты
- ✅ **Арбитраж** — защита при спорах
- ✅ **Репутация** — рейтинг участников
- ✅ **Без KYC** — приватность
- ✅ **Demo Mode** — автоматические сделки для демонстрации
- ✅ **AML защита** — проверка на санкционные списки

### 🛡️ Безопасность (Enterprise-grade)

- ✅ **2FA** — двухфакторная аутентификация
- ✅ **JWT** — защищённые сессии
- ✅ **Escrow** — депонирование средств
- ✅ **Anti-Fraud** — velocity checks, multi-account detection
- ✅ **Risk Scoring** — автоматическая оценка рисков (0-100)
- ✅ **AML Integration** — OFAC, darknet detection, 17 бирж
- ✅ **Winston логирование** + Sentry error tracking
- ✅ **WORM логирование** — неизменяемый аудит (5 лет)

### ⛓️ Блокчейн интеграция

- ✅ **ERC-20 токен PSPB** — 100M supply
- ✅ **Smart Contracts** — автоматическое исполнение
- ✅ **On-chain Settlement** — прозрачные расчёты
- ✅ **Fee Distribution** — 60% валидаторам, 20% treasury, 20% development
- ✅ **Airdrop** — 1000 PSPB новым пользователям
- ✅ **Etherscan интеграция** — проверка транзакций

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js 14)           │
│  TailwindCSS + RainbowKit + wagmi       │
│  WebSocket + SSE                        │
└───────────────┬─────────────────────────┘
                │ HTTP + WebSocket
┌───────────────▼─────────────────────────┐
│         Backend (NestJS 10)             │
│  ┌─────────────────────────────────┐   │
│  │  Strategy Pattern               │   │
│  │  Centralized │ Blockchain │ Hybrid│  │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Modules:                       │   │
│  │  - Orders (State Machine)       │   │
│  │  - Fraud (Anti-Fraud + AML)     │   │
│  │  - Blockchain (ethers.js)       │   │
│  │  - Demo (Auto-trades)           │   │
│  └─────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
┌───────▼───────┐ ┌─────▼──────────────┐
│  PostgreSQL   │ │  AML Platform      │
│  Prisma ORM   │ │  n8n + Grafana     │
│  Redis Cache  │ │  WORM Logging      │
└───────────────┘ └────────────────────┘
        │
┌───────▼───────────────────────────────┐
│      Blockchain (Ethereum Sepolia)    │
│  PSPBToken + Escrow + FeeSplitter     │
└───────────────────────────────────────┘
```

---

## 🚀 Быстрый старт

### Требования

- Docker & Docker Compose
- Node.js 20+
- 1 GB свободного места

### 1. Клонирование

```bash
git clone https://github.com/akoffice933-maker/p2pspb-mvp.git
cd p2pspb-mvp
```

### 2. Настройка окружения

```bash
# Копируем примеры
cp .env.example .env
cp contracts/.env.example contracts/.env
cp services/api/.env.example services/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

**Важные переменные:**
```env
# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
PSPB_TOKEN_ADDRESS=0x...

# AML
AML_API_URL=http://localhost:5678/webhook
AML_ENABLED=false  # true если AML платформа установлена

# Demo Mode
DEMO_MODE=true
DEMO_INTERVAL_MS=30000
```

### 3. Запуск через Docker

```bash
docker-compose up -d
```

**Сервисы:**
- 🌐 Фронтенд: http://localhost:3000
- 🔧 API: http://localhost:4000
- 📖 Swagger: http://localhost:4000/api/docs
- 🗄️ PostgreSQL: localhost:5432
- 💾 Redis: localhost:6379
- 🛡️ AML Platform: http://localhost:5678 (требует отдельной установки)

### 4. Демо-режим (для инвесторов)

```env
# В services/api/.env
DEMO_MODE=true
SETTLEMENT_MODE=hybrid
```

**Что делает:**
- Автоматически создаёт сделки каждые 30 секунд
- Показывает live-активность платформы
- Идеально для презентаций (7 минут)

---

## 📱 Как использовать

### Для трейдеров

1. **Подключите кошелёк** (MetaMask / WalletConnect)
2. **Создайте заявку** — укажите курс и сумму
3. **Дождитесь контрагента** — система найдёт пару
4. **Пройдите AML проверку** — автоматически (< 1 сек)
5. **Подтвердите оплату** — следуйте инструкциям
6. **Получите средства** — автоматически в блокчейн

### Для инвесторов (Demo сценарий на 7 минут)

| Время | Действие | Комментарий |
|-------|----------|-------------|
| 0:00 | Открыть главную | "Наша платформа" |
| 1:00 | Показать заявки | "Live обновления через WebSocket" |
| 2:00 | Включить Demo Mode | "Автоматические сделки" |
| 3:00 | Показать админку | "Блокчейн интеграция" |
| 4:00 | Показать AML | "Enterprise защита" |
| 5:00 | Токеномика и revenue | "$1.2M/год при 1000 сделок/день" |
| 6:00 | Q&A | "Вопросы инвесторов" |
| 7:00 | Close | "Следующие шаги" |

---

## 💰 Токеномика PSPB

```
Максимальное предложение: 100,000,000 PSPB

Распределение:
├── 40% Airdrop и награды (40M)
├── 30% Развитие платформы (30M)
├── 20% Команда (20M)
└── 10% Резерв (10M)

Airdrop: 1,000 PSPB на пользователя
```

### Модель монетизации

```
Комиссия платформы: 0.5%

Распределение:
├── 60% Валидаторам/майнерам
├── 20% Treasury (казна)
└── 20% Development (развитие)
```

---

## ⛓️ Блокчейн Интеграция

### 3 Смарт-контракта

#### 1. PSPBToken (ERC-20)
```solidity
Name: "P2PSPB Token"
Symbol: "PSPB"
Total Supply: 100,000,000 PSPB
Functions: transfer(), approve(), claimAirdrop()
```

#### 2. P2PSPBEscrow (Депонирование)
```solidity
Statuses: Created → Reserved → Paid → Confirmed → Completed
Functions: createTrade(), completeTrade(), cancelTrade()
```

#### 3. P2PSPBFeeSplitter (Распределение)
```solidity
Distribution: 60% Validators, 20% Treasury, 20% Development
Functions: receiveFee(), distribute()
```

### Settlement Strategy Pattern

**Уникальная фича** — переключение режимов:

```env
SETTLEMENT_MODE=centralized  # Только БД (быстро, < 100ms)
SETTLEMENT_MODE=blockchain   # Только блокчейн (прозрачно, ~15 сек)
SETTLEMENT_MODE=hybrid       # БД + блокчейн для settlement (оптимально)
```

**Почему гибридный режим лучший:**

| Операция | Где | Время | Стоимость |
|----------|-----|-------|-----------|
| Создание заявки | БД | < 100ms | $0 |
| Резервирование | БД | < 100ms | $0 |
| Подтверждение | БД | < 100ms | $0 |
| **Settlement** | **Блокчейн** | **~15 сек** | **~$0.50** |

---

## 🛡️ AML Integration

### Что проверяет AML платформа

- ✅ **OFAC sanction lists** — санкционные списки
- ✅ **Darknet detection** — связи с даркнетом
- ✅ **Exchange freeze risk** — риск блокировки на 17 биржах
- ✅ **TRC-20 enhanced** — усиленные проверки для USDT TRC-20
- ✅ **Velocity monitoring** — частота транзакций
- ✅ **Blacklist/Whitelist** — управление списками

### API Endpoints

```bash
POST /api/aml/check              # Проверка транзакции
GET  /api/aml/check-address/:id  # Проверка адреса
POST /api/aml/update-blacklist   # Обновление blacklist
GET  /api/aml/status             # Статус сервиса
```

### Пример проверки

**Request:**
```json
{
  "transaction_id": "order_123",
  "wallet_address": "0x742d35Cc...",
  "amount": 1500.50,
  "currency": "USDT",
  "network": "ethereum"
}
```

**Response:**
```json
{
  "risk_score": 75,
  "risk_level": "HIGH",
  "decision": "BLOCK",
  "explanation": [
    "Адрес в OFAC санкционном списке",
    "Обнаружена связь со scam проектом"
  ],
  "recommendations": [
    "Заблокировать транзакцию",
    "Провести ручную проверку"
  ]
}
```

---

## 💰 Монетизация

### 5 источников дохода

| Источник | Формула | При 1000 сделок/день |
|----------|---------|----------------------|
| **Комиссия 0.5%** | Объём × 0.5% | $15,000/месяц |
| **Спред** | 2 RUB/USDT × объём | $66,000/месяц |
| **Premium** | $29 × пользователи | $14,500/месяц |
| **Стейкинг** | 5% комиссия | $5,000/месяц |
| **Листинг** | $10K × токены | $20,000/месяц |

**Итого: ~$120,500/месяц**

### Финансовая модель (Year 1)

| Месяц | Сделки/день | Revenue/месяц | Прибыль |
|-------|-------------|---------------|---------|
| 1-3   | 100         | $8,500        | -$50K   |
| 4-6   | 500         | $42,500       | -$10K   |
| 7-9   | 1000        | $85,000       | +$25K ✅ |
| 10-12 | 2000        | $170,000      | +$85K   |

**Годовой revenue: ~$1.2M**  
**Точка безубыточности: Месяц 8**

### Unit Economics

```
CAC (Customer Acquisition Cost):
Реклама: $5 за пользователя
Конверсия: 20%
CAC = $25

LTV (Lifetime Value):
50 сделок × ($0.50 комиссия + $2.00 спред) = $125

LTV/CAC Ratio: 5x ✅ (отлично!)
```

---

## 🔌 API Endpoints

### Публичные

```bash
GET  /api/orders              # Список заявок (с пагинацией)
GET  /api/orders/:id          # Детали заказа
GET  /api/sse/orders          # SSE обновления
```

### Блокчейн

```bash
GET  /api/blockchain/status           # Статус подключения
GET  /api/blockchain/trade/:id        # Информация о сделке
GET  /api/blockchain/balance/:address # Баланс токенов
```

### AML

```bash
POST /api/aml/check                   # Проверка транзакции
GET  /api/aml/check-address/:id       # Проверка адреса
POST /api/aml/update-blacklist        # Обновление blacklist
GET  /api/aml/status                  # Статус сервиса
```

### Админка

```bash
POST /api/admin/login         # Вход (JWT + 2FA)
GET  /api/admin/orders        # Все заявки
GET  /api/fraud/alerts        # Фрод-алерты
POST /api/admin/2fa/setup     # Настройка 2FA
```

### Demo

```bash
GET  /api/demo/status         # Статус демо-режима
POST /api/demo/start          # Запустить демо
POST /api/demo/stop           # Остановить демо
```

📖 **Полная документация:** [docs/API.md](docs/API.md)

---

## 📊 Roadmap

### ✅ Завершено (Q1 2026)

- [x] State Machine для заказов (11 статусов)
- [x] Escrow система с депонированием
- [x] Dispute system (арбитраж)
- [x] JWT + 2FA авторизация
- [x] Anti-fraud система
- [x] AML Integration (OFAC, darknet, 17 бирж)
- [x] WebSocket real-time уведомления
- [x] Smart Contracts (Solidity)
- [x] Backend интеграция (ethers.js)
- [x] Frontend интеграция (wagmi + RainbowKit)
- [x] Strategy Pattern для settlement
- [x] Demo Mode для презентаций

### 🔄 В процессе (Q2 2026)

- [ ] Деплой контрактов на Sepolia testnet
- [ ] Аудит смарт-контрактов
- [ ] E2E тесты
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment

### 📅 Планируется (Q3 2026)

- [ ] Prometheus + Grafana мониторинг
- [ ] Mobile app (React Native)
- [ ] Фиатные шлюзы
- [ ] Листинг на DEX

---

## 🧪 Тестирование

### Backend тесты

```bash
cd services/api
npm run test           # Unit тесты
npm run test:e2e       # E2E тесты
npm run test:cov       # С покрытием
```

### Blockchain тесты

```bash
cd contracts
npm run compile        # Компиляция
npm run test           # Тесты контрактов
npm run deploy:sepolia # Деплой на тестнет
```

### Frontend тесты

```bash
cd apps/web
npm run lint           # ESLint
npm run build          # Production сборка
```

---

## 📁 Структура проекта

```
p2pspb-mvp/
├── apps/web/                    # Next.js фронтенд
│   ├── app/
│   │   ├── profile/             # Страница профиля
│   │   ├── admin/               # Админ-панель
│   │   └── legal/               # Правовая информация
│   └── components/
│       ├── WalletConnect.tsx    # Подключение кошелька
│       ├── PSPBBalance.tsx      # Балансы токенов
│       └── OnChainHistory.tsx   # История транзакций
│
├── services/api/                # NestJS бэкенд
│   └── src/modules/
│       ├── blockchain/          # Blockchain сервисы
│       ├── orders/              # State Machine заказов
│       ├── fraud/               # Anti-fraud + AML
│       ├── aml/                 # AML Integration
│       └── demo/                # Demo Mode сервис
│
├── contracts/                   # Smart Contracts
│   ├── src/
│   │   ├── PSPBToken.sol        # ERC-20 токен
│   │   ├── P2PSPBEscrow.sol     # Депонирование
│   │   └── P2PSPBFeeSplitter.sol # Распределение
│   └── scripts/
│       └── deploy.ts            # Скрипт деплоя
│
├── k8s/                         # Kubernetes манифесты
├── docs/                        # Документация
│   ├── API.md
│   ├── SECURITY.md
│   ├── BLOCKCHAIN_INTEGRATION.md
│   ├── AML_INTEGRATION.md
│   ├── DEMO_MODE.md
│   └── SETTLEMENT_STRATEGY.md
└── docker-compose.yml           # Docker конфигурация
```

---

## 📞 Контакты

- **Telegram:** [@P2PSPB_bot](https://t.me/P2PSPB_bot)
- **Email:** legal@p2pspb.com
- **Website:** https://p2pspb.com

---

## ⚖️ Юридическая информация

Сервис является информационной платформой и:
- ❌ Не является обменным пунктом
- ❌ Не является финансовым учреждением
- ❌ Не хранит средства пользователей
- ❌ Не гарантирует доходность

Пользователи несут полную ответственность за соблюдение законодательства своей юрисдикции.

📖 **Подробно:** [docs/LEGAL.md](docs/LEGAL.md)

---

## 📄 Лицензия

MIT License — см. [LICENSE](LICENSE) файл.

---

## 🙏 Благодарности

- [NestJS](https://nestjs.com) — Backend фреймворк
- [Next.js](https://nextjs.org) — Frontend фреймворк
- [Prisma](https://prisma.io) — ORM
- [wagmi](https://wagmi.sh) — Ethereum хуки
- [RainbowKit](https://rainbowkit.com) — Wallet UI
- [OpenZeppelin](https://openzeppelin.com) — Smart Contracts
- [AML Platform](https://github.com/akoffice933-maker/aml-risk-intelligence-platform) — AML Integration

---

## 📊 Статистика проекта

![Lines of Code](https://img.shields.io/badge/Code%20Lines-20,000+-blue)
![Contributors](https://img.shields.io/github/contributors/akoffice933-maker/p2pspb-mvp)
![Last Commit](https://img.shields.io/github/last-commit/akoffice933-maker/p2pspb-mvp)
![Issues](https://img.shields.io/github/issues/akoffice933-maker/p2pspb-mvp)

---

**Made with ❤️ in Saint Petersburg**

---

## 🚀 Для инвесторов

### Почему P2PSPB?

| Критерий | Значение |
|----------|----------|
| **Рынок** | P2P crypto рынок = $500B+ (2026) |
| **Проблема** | Binance P2P ушёл из РФ, нет альтернатив |
| **Решение** | Гибрид централизованного UX и DeFi прозрачности |
| **Moat** | Strategy Pattern, AML, Anti-Fraud, Blockchain |
| **LTV/CAC** | 5x (отлично!) |
| **Точка безубыточности** | Месяц 8 |

### Финансовые прогнозы

```
Год 1:
├── Revenue: ~$1.2M
├── Пользователей: 2,000+
└── Прибыль: +$85K/месяц (к концу года)

Год 2:
├── Revenue: ~$5M (масштабирование)
├── Пользователей: 10,000+
└── Прибыль: +$400K/месяц
```

### Ask

Ищем **$500k** за **10% equity** для:

| Статья | Сумма | Срок |
|--------|-------|------|
| Запуск и тестирование | $150k | 3 месяца |
| Маркетинг | $200k | 6 месяцев |
| Аудит смарт-контрактов | $50k | 2 месяца |
| Расширение команды | $100k | 6 месяцев |

**Использование средств:**
```
$500k:
├── 40% → Маркетинг и CAC
├── 30% → Разработка (команда)
├── 20% → Операционные расходы
└── 10% → Резерв
```

**Exit стратегия:**
- Acquisition через 3-5 лет (Binance, Bybit, OKX)
- IPO через 5-7 лет
- Дивиденды с прибыли (ежеквартально)

**Contact:** legal@p2pspb.com

---

## 📈 Для трейдеров и валидаторов

### Как начать зарабатывать?

#### 1. Станьте валидатором

```
Требования:
- Стейк: 10,000 PSPB токенов
- Аптайм: > 99%
- Оборудование: VPS от $50/месяц

Доход:
- 60% от комиссий платформы
- ~$3,000-9,000/месяц (на масштабе)
- Пассивный доход
```

#### 2. Торгуйте на спреде

```
Стратегия:
1. Создайте заявку на покупку (ниже рынка)
2. Создайте заявку на продажу (выше рынка)
3. Получите спред 1-2%

Пример:
Покупка: 89 RUB/USDT
Продажа: 91 RUB/USDT
Спред: 2 RUB (2.2%)

При 100 сделках/день:
100 × 100 USDT × 2% = $200/день
$200 × 30 = $6,000/месяц
```

#### 3. Участвуйте в Airdrop

```
Бесплатные 1,000 PSPB токенов:
1. Зарегистрируйтесь
2. Пройдите верификацию
3. Claim в профиле

Стоимость токена (прогноз):
- Запуск: $0.01
- Год 1: $0.05-0.10
- Год 3: $0.50-1.00

1000 PSPB × $0.50 = $500 (потенциал)
```

---
