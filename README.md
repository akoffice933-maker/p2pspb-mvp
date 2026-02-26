# P2PSPB — Закрытый P2P-обмен криптовалют с блокчейн-расчётами 🚀

> **Production-Ready платформа** для безопасного обмена криптовалют в Санкт-Петербурге  
> 🏗️ State Machine • 💰 Escrow • 🔐 2FA • ⛓️ Blockchain Settlement • 🛡️ Anti-Fraud

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org)
[![Demo Mode](https://img.shields.io/badge/Demo-Ready-green)]()

---

## 📋 Что такое P2PSPB?

**P2PSPB** — это современная P2P-платформа для обмена криптовалют (USDT/RUB) с уникальной гибридной архитектурой:

- **Централизованный UX** — быстро и удобно как в приложении
- **Блокчейн-расчёты** — прозрачно и безопасно как в DeFi
- **Anti-Fraud защита** — интеллектуальная система безопасности

### 🎯 Для кого

| Для кого | Что получает |
|----------|--------------|
| **Пользователи** | Быстрый обмен без KYC, арбитраж при спорах |
| **Трейдеры** | Заработок на спреде, репутация |
| **Инвесторы** | Прозрачная экономика, токенизация |
| **Валидаторы** | Пассивный доход на комиссиях |

---

## ✨ Ключевые возможности

### 🔥 Для пользователей

- ✅ **Мгновенные сделки** — < 1 секунды
- ✅ **Наличные и СБП** — популярные способы оплаты
- ✅ **Арбитраж** — защита при спорах
- ✅ **Репутация** — рейтинг участников
- ✅ **Без KYC** — приватность
- ✅ **Demo Mode** — автоматические сделки для демонстрации

### 🛡️ Безопасность

- ✅ **2FA** — двухфакторная аутентификация
- ✅ **JWT** — защищённые сессии
- ✅ **Escrow** — депонирование средств
- ✅ **Anti-Fraud** — velocity checks, multi-account detection
- ✅ **Risk Scoring** — автоматическая оценка рисков
- ✅ **Blockchain** — неизменяемая история сделок

### ⛓️ Блокчейн интеграция

- ✅ **ERC-20 токен PSPB** — 100M supply
- ✅ **Smart Contracts** — автоматическое исполнение
- ✅ **On-chain Settlement** — прозрачные расчёты
- ✅ **Fee Distribution** — 60% валидаторам, 20% treasury, 20% development
- ✅ **Airdrop** — 1000 PSPB новым пользователям

---

## 🏗️ Архитектура

```
┌─────────────────┐
│   Frontend      │  Next.js 14 + TailwindCSS
│   (Next.js)     │  WebSocket + RainbowKit
└────────┬────────┘
         │ HTTP + WebSocket
┌────────▼────────┐
│   Backend       │  NestJS 10 + Prisma
│   (NestJS)      │  Redis + Sentry
└────────┬────────┘
         │ JSON-RPC
┌────────▼────────┐
│   Blockchain    │  Ethereum Sepolia
│   (Solidity)    │  PSPB Token + Escrow
└─────────────────┘
```

### Стратегии расчётов

Проект использует **Strategy Pattern** для гибкости:

```env
SETTLEMENT_MODE=centralized  # Только БД (быстро)
SETTLEMENT_MODE=blockchain   # Только блокчейн (прозрачно)
SETTLEMENT_MODE=hybrid       # БД + блокчейн для settlement (оптимально)
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

# Заполняем ключами (важно!)
# - Infura API Key: https://infura.io
# - Private Key от MetaMask
# - Etherscan API Key: https://etherscan.io
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

### 4. Демо-режим (для инвесторов)

```env
# В services/api/.env
DEMO_MODE=true
DEMO_INTERVAL_MS=30000
SETTLEMENT_MODE=hybrid
```

**Что делает:**
- Автоматически создаёт сделки каждые 30 секунд
- Показывает live-активность платформы
- Идеально для презентаций

---

## 📱 Как использовать

### Для трейдеров

1. **Подключите кошелёк** (MetaMask / WalletConnect)
2. **Создайте заявку** — укажите курс и сумму
3. **Дождитесь контрагента** — система найдёт пару
4. **Подтвердите оплату** — следуйте инструкциям
5. **Получите средства** — автоматически в блокчейн

### Для инвесторов

1. **Запустите Demo Mode**
2. **Откройте главную страницу**
3. **Покажите live-сделки**
4. **Откройте админ-панель**
5. **Покажите блокчейн-транзакции**

**Сценарий на 7 минут:**
- 0:00 — Открытие платформы
- 2:00 — Демонстрация сделок
- 4:00 — Блокчейн интеграция
- 5:00 — Токеномика и revenue
- 6:00 — Q&A

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

**Пример revenue:**
- 1000 сделок/день × $50 средняя сумма × 0.5% = **$250/день**
- $250 × 30 = **$7,500/месяц**

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

## 🛡️ Безопасность

### Реализовано

- ✅ **JWT авторизация** с httpOnly cookies
- ✅ **2FA (TOTP)** для администраторов
- ✅ **Webhook Secret Token** + replay protection
- ✅ **Rate Limiting** на Redis (100 req/min)
- ✅ **DTO валидация** с class-validator
- ✅ **Anti-Fraud** система с risk scoring
- ✅ **Winston логирование** + Sentry error tracking
- ✅ **Атомарные транзакции** через Prisma

### Требуется перед production

- ⚠️ Аудит смарт-контрактов (Certik/PeckShield)
- ⚠️ Penetration testing
- ⚠️ HTTPS настройка
- ⚠️ Bug bounty программа

📖 **Подробно:** [docs/SECURITY.md](docs/SECURITY.md)

---

## 📊 Roadmap

### ✅ Завершено (Q1 2026)

- [x] State Machine для заказов (11 статусов)
- [x] Escrow система с депонированием
- [x] Dispute system (арбитраж)
- [x] JWT + 2FA авторизация
- [x] Anti-fraud система
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
│       ├── fraud/               # Anti-fraud система
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

---

## 📊 Статистика проекта

![Lines of Code](https://img.shields.io/badge/Code%20Lines-15,000+-blue)
![Contributors](https://img.shields.io/github/contributors/akoffice933-maker/p2pspb-mvp)
![Last Commit](https://img.shields.io/github/last-commit/akoffice933-maker/p2pspb-mvp)
![Issues](https://img.shields.io/github/issues/akoffice933-maker/p2pspb-mvp)

---

**Made with ❤️ in Saint Petersburg**

---

## 🚀 Для инвесторов

### Почему P2PSPB?

1. **Рынок:** P2P crypto рынок = $500B+ (2026)
2. **Проблема:** Binance P2P ушёл из РФ, нет альтернатив
3. **Решение:** Гибрид централизованного UX и DeFi прозрачности
4. **Moat:** Strategy Pattern, Anti-Fraud, Blockchain Settlement

### Ask

Ищем **$500k** для:
- Запуска и тестирования (3 месяца)
- Маркетинга и привлечения пользователей
- Аудита смарт-контрактов
- Расширения команды

**Contact:** legal@p2pspb.com
