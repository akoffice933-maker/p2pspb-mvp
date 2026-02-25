# P2PSPB — Закрытый P2P-обмен криптовалют с блокчейн-интеграцией 🚀

> **Production-Ready P2P платформа** для обмена криптовалют в Санкт-Петербурге  
> 🏗️ State Machine • 💰 Escrow • 🔐 2FA • ⛓️ Blockchain • 🛡️ Anti-Fraud

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org)
[![Security: Awaiting Audit](https://img.shields.io/badge/Security-Awaiting%20Audit-orange)]()

---

## 📋 О проекте

**P2PSPB** — это полнофункциональная P2P-платформа для обмена криптовалют с полной интеграцией блокчейна, системой безопасности и готовой инфраструктурой для запуска.

### ✨ Ключевые особенности

- 🔄 **State Machine** — 11 статусов заказа для полного контроля сделки
- 💰 **Escrow система** — депонирование средств в смарт-контракте
- 🔐 **2FA + JWT** — двухфакторная аутентификация для админки
- ⛓️ **Blockchain** — ERC-20 токен PSPB + запись сделок в блокчейн
- 🛡️ **Anti-Fraud** — velocity checks, multi-account detection, risk scoring
- 📡 **Real-time** — WebSocket уведомления о всех событиях
- 🎨 **Modern UI** — адаптивный интерфейс с тёмной темой

---

## 🏗️ Архитектура

```
p2pspb-mvp/
├── apps/web/                    # Next.js фронтенд + админка
│   ├── app/
│   │   ├── profile/             ← Страница профиля с балансами
│   │   ├── admin/               ← Админ-панель (JWT + 2FA)
│   │   └── legal/               ← Правовая информация
│   └── components/
│       ├── WalletConnect.tsx    ← Подключение кошелька
│       ├── PSPBBalance.tsx      ← Балансы токенов
│       └── OnChainHistory.tsx   ← История транзакций
│
├── services/api/                # NestJS бэкенд
│   └── src/modules/
│       ├── blockchain/          ← Blockchain сервисы
│       ├── orders/              ← State Machine заказов
│       ├── fraud/               ← Anti-fraud система
│       └── auth/                ← JWT + 2FA
│
├── contracts/                   # Smart Contracts (Solidity)
│   ├── PSPBToken.sol            ← ERC-20 токен
│   ├── P2PSPBEscrow.sol         ← Депонирование сделок
│   └── P2PSPBFeeSplitter.sol    ← Распределение комиссий
│
├── k8s/                         # Kubernetes манифесты
├── docs/                        # Документация
└── docker-compose.yml           # Docker конфигурация
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
cp .env.example .env
# Заполните .env своими данными
```

### 3. Запуск через Docker

```bash
docker-compose up -d
```

**Сервисы:**
- Фронтенд: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Локальная разработка

```bash
# Бэкенд
cd services/api
npm install
npm run dev

# Фронтенд
cd apps/web
npm install
npm run dev
```

---

## 🔧 Технологический стек

### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| **NestJS** | 10.3 | API фреймворк |
| **Prisma** | 5.22 | ORM для PostgreSQL |
| **PostgreSQL** | 15 | База данных |
| **Redis** | 7 | Rate limiting + кэш |
| **ethers.js** | 6.10 | Работа с блокчейном |
| **Winston** | 3.11 | Логирование |
| **Sentry** | 7.100 | Error tracking |

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 14.1 | React фреймворк |
| **TypeScript** | 5 | Типизация |
| **TailwindCSS** | 3.4 | Стилизация |
| **wagmi** | 1.4 | Ethereum хуки |
| **viem** | 1.21 | Ethereum клиент |
| **RainbowKit** | 1.3 | UI для кошелька |
| **Socket.IO** | 4.7 | Real-time |

### Blockchain
| Контракт | Стандарт | Назначение |
|----------|----------|------------|
| **PSPBToken** | ERC-20 | Токен платформы (100M supply) |
| **P2PSPBEscrow** | Custom | Депонирование средств |
| **P2PSPBFeeSplitter** | Custom | Распределение комиссий |

---

## 📁 Структура БД

### User
```prisma
- id, telegramId, username
- balance, blockedBalance        # Балансы USDT
- riskScore, isBlocked           # Anti-fraud
- orders, transactions, disputes
```

### Order
```prisma
- id, userId, sellerId, buyerId
- type (BUY/SELL), rate, amount
- status (11 состояний)
- reservedAmount, expiresAt
- blockchainTradeId, txHash      # Интеграция с блокчейном
```

### Transaction
```prisma
- id, orderId, userId
- type (RESERVE/PAYMENT/RELEASE/REFUND)
- amount, balanceBefore, balanceAfter
```

### FraudAlert
```prisma
- id, userId, type
- status (OPEN/REVIEWING/RESOLVED/CONFIRMED)
- score (0-100)
```

---

## 🔌 API Endpoints

### Публичные
- `GET /api/orders` — список заявок (с пагинацией)
- `GET /api/orders/:id` — детали заказа
- `GET /api/sse/orders` — SSE обновления

### Блокчейн
- `GET /api/blockchain/status` — статус подключения
- `GET /api/blockchain/trade/:id` — информация о сделке
- `GET /api/blockchain/balance/:address` — баланс токенов

### Админка
- `POST /api/admin/login` — вход (JWT + 2FA)
- `GET /api/admin/orders` — все заявки
- `GET /api/fraud/alerts` — фрод-алерты

### Webhook
- `POST /api/webhook/order` — Telegram webhook (с secret token)

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

## ⛓️ Blockchain интеграция

### Токеномика PSPB

```
Максимальное предложение: 100,000,000 PSPB

Распределение:
├── 40% Airdrop и награды (40M)
├── 30% Развитие платформы (30M)
├── 20% Команда (20M)
└── 10% Резерв (10M)

Airdrop: 1,000 PSPB на пользователя (первые 10,000)
```

### Распределение комиссий

```
Комиссия платформы: 0.5%

Распределение:
├── 60% Валидаторам/майнерам
├── 20% Treasury (казна)
└── 20% Development (развитие)
```

### Жизненный цикл сделки

```
CREATED → RESERVED → PAYMENT_PENDING → PAID → CONFIRMED → COMPLETED
                     ↓              ↓              ↓
                  CANCELLED    DISPUTED       CANCELLED
                                ↓
                            RESOLVED
```

📖 **Подробно:** [docs/BLOCKCHAIN_INTEGRATION.md](docs/BLOCKCHAIN_INTEGRATION.md)

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
- [x] Пагинация и сортировка
- [x] Winston логирование + Sentry

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

## 📈 Мониторинг

### Health Checks

- `GET /api/health` — статус сервиса
- `GET /api/ready` — готовность к работе

### Метрики

- Запросов в минуту
- Среднее время ответа
- Количество активных сделок
- Total Volume (USDT)
- Fraud alerts count

### Логи

- `logs/error.log` — ошибки
- `logs/combined.log` — все события

---

## 🚀 Деплой

### Docker Compose (Development)

```bash
docker-compose up -d
```

### Kubernetes (Production)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

📖 **Подробно:** [docs/PRODUCTION.md](docs/PRODUCTION.md)

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
