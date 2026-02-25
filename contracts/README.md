# P2PSPB Smart Contracts

Смарт-контракты для P2P-платформы обмена криптовалют.

## 📦 Контракты

### 1. PSPBToken.sol
**ERC-20 токен платформы**

- **Название:** P2PSPB Token
- **Символ:** PSPB
- **Макс. предложение:** 100,000,000 токенов
- **Функционал:**
  - Minting для наград валидаторам
  - Burning с комиссией 5%
  - Airdrop (1000 токенов на пользователя)
  - Стиaking для валидаторов

### 2. P2PSPBEscrow.sol
**Депонирование средств для P2P сделок**

- **Статусы сделки:**
  - Created → Reserved → PaymentPending → Paid → Confirmed → Completed
  - Disputed → Resolved
  - Cancelled
- **Комиссия платформы:** 0.5% (настраиваемо)
- **Функционал:**
  - Резервирование средств
  - Подтверждение оплаты/получения
  - Споры и арбитраж
  - Автоматическое распределение комиссий

### 3. P2PSPBFeeSplitter.sol
**Распределение комиссий между валидаторами**

- **Распределение:**
  - 60% Валидаторам/майнерам
  - 20% Treasury (казна)
  - 20% Development (развитие)
- **Минимальный стейк:** 10,000 PSPB
- **Функционал:**
  - Стейкинг для валидаторов
  - Claim наград
  - Автоматическое распределение

---

## 🚀 Быстрый старт

### Установка зависимостей

```bash
cd contracts
npm install
```

### Настройка окружения

```bash
cp .env.example .env
# Заполните .env своими данными
```

### Компиляция

```bash
npm run compile
```

### Тесты

```bash
npm run test
```

### Деплой (Sepolia Testnet)

```bash
npm run deploy:sepolia
```

### Деплой (Polygon Mainnet)

```bash
npm run deploy:polygon
```

---

## 📋 Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
# Ethereum
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_api_key

# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_key
```

---

## 🔧 Настройка контрактов

### 1. Обновить комиссию платформы

```solidity
// В P2PSPBEscrow
await escrow.setPlatformFeeBps(50); // 0.5%
```

### 2. Обновить адреса для комиссий

```solidity
// В P2PSPBFeeSplitter
await feeSplitter.setTreasury(treasuryAddress);
await feeSplitter.setDevelopmentFund(devFundAddress);
```

### 3. Обновить минимальный стейк

```solidity
// В P2PSPBFeeSplitter
await feeSplitter.setMinimumStake(ethers.parseEther("10000"));
```

---

## 📊 Токеномика

```
Максимальное предложение: 100,000,000 PSPB

Распределение:
├── 40% Airdrop и награды (40M)
├── 30% Развитие платформы (30M)
├── 20% Команда (20M)
└── 10% Резерв (10M)

Airdrop:
└── 1,000 PSPB на пользователя (первые 10,000 пользователей)
```

---

## 🔐 Безопасность

### Аудит
- [ ] Провести аудит контрактов (Certik/PeckShield)
- [ ] Протестировать на тестнете
- [ ] Bug bounty программа

### Рекомендации
1. Используйте мультисиг для owner адресов
2. Включите timelock для критических изменений
3. Настройте emergency pause механизм

---

## 📁 Структура

```
contracts/
├── PSPBToken.sol           # ERC-20 токен
├── P2PSPBEscrow.sol        # Депонирование
├── P2PSPBFeeSplitter.sol   # Распределение комиссий
├── package.json
├── hardhat.config.js
├── scripts/
│   └── deploy.ts
└── test/
    └── P2PSPB.test.ts
```

---

## 🌐 Деплой в различные сети

| Сеть | Команда | Explorer |
|------|---------|----------|
| Sepolia | `npm run deploy:sepolia` | https://sepolia.etherscan.io |
| Polygon Mumbai | `npm run deploy:mumbai` | https://mumbai.polygonscan.com |
| Polygon Mainnet | `npm run deploy:polygon` | https://polygonscan.com |

---

## 📞 Контакты

- Telegram: @P2PSPB_bot
- Email: legal@p2pspb.com

---

## 📄 Лицензия

MIT
