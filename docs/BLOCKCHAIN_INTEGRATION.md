# Blockchain Integration Guide

## Обзор

P2PSPB интегрирован с блокчейном для:
- **Прозрачности** — все сделки записываются в блокчейн
- **Безопасности** — средства депонируются в смарт-контракте
- **Наград** — комиссия распределяется между валидаторами

---

## Архитектура

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │ ───> │ NestJS API   │ ───> │  Blockchain │
│  (Next.js)  │ <─── │ (Backend)    │ <─── │ (Ethereum)  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  Services:  │
                     │  - BlockchainService
                     │  - EscrowService
                     │  - EventsListener
                     └─────────────┘
```

---

## Смарт-контракты

### 1. PSPBToken (ERC-20)
- **Адрес:** `PSPB_TOKEN_ADDRESS`
- **Функции:**
  - `balanceOf(address)` — баланс токенов
  - `transfer(address, amount)` — перевод
  - `claimAirdrop()` — получить airdrop (1000 PSPB)
  - `mint(address, amount)` — минтинг (только owner)

### 2. P2PSPBEscrow
- **Адрес:** `PSPB_ESCROW_ADDRESS`
- **Функции:**
  - `createTrade(buyer, amount, rate, orderHash)` — создать сделку
  - `reserveFunds(tradeId)` — зарезервировать средства
  - `confirmPayment(tradeId)` — подтвердить оплату
  - `confirmReceipt(tradeId)` — подтвердить получение
  - `completeTrade(tradeId)` — завершить сделку
  - `cancelTrade(tradeId)` — отменить сделку

### 3. P2PSPBFeeSplitter
- **Адрес:** `PSPB_FEE_SPLITTER_ADDRESS`
- **Функции:**
  - `stake(amount)` — стейкинг для валидаторов
  - `claimRewards()` — claim наград
  - `receiveFee(amount)` — получить комиссию

---

## Настройка окружения

### 1. Получить Infura API Key

1. Зарегистрируйтесь на https://infura.io
2. Создайте проект
3. Скопируйте **Project ID**

### 2. Заполнить .env

```env
# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=your_wallet_private_key
PSPB_TOKEN_ADDRESS=0x...
PSPB_ESCROW_ADDRESS=0x...
PSPB_FEE_SPLITTER_ADDRESS=0x...
```

### 3. Установить зависимости

```bash
cd services/api
npm install
```

---

## API Endpoints

### Получить статус блокчейна

```http
GET /api/blockchain/status
```

**Ответ:**
```json
{
  "connected": true,
  "escrowAddress": "0x...",
  "tokenAddress": "0x..."
}
```

### Получить информацию о сделке

```http
GET /api/blockchain/trade/:id
```

**Ответ:**
```json
{
  "id": 1,
  "seller": "0x...",
  "buyer": "0x...",
  "amount": "10.0",
  "rate": "92.5",
  "fee": "0.05",
  "status": 5,
  "statusText": "Completed",
  "txHash": "0x..."
}
```

### Завершить сделку (Admin)

```http
POST /api/blockchain/trade/:id/complete
Authorization: Bearer {token}
```

### Получить баланс токенов

```http
GET /api/blockchain/balance/:address
```

**Ответ:**
```json
{
  "address": "0x...",
  "balance": "1500.5"
}
```

---

## Интеграция с OrdersService

### Создание сделки в блокчейне

```typescript
// При создании заказа
const orderHash = this.blockchainService.createOrderHash(
  order.id,
  Date.now(),
);

// Создаём сделку в блокчейне
const { tradeId, txHash } = await this.escrowService.createTrade({
  buyerAddress: order.buyerId,
  amount: order.amount.toString(),
  rate: order.rate.toString(),
  orderHash,
});

// Сохраняем tradeId в базу
await this.prisma.order.update({
  where: { id: order.id },
  data: { blockchainTradeId: tradeId, txHash },
});
```

### Прослушивание событий

```typescript
// EventsListenerService автоматически слушает:
// - TradeCreated
// - TradeCompleted
// - TradeCancelled

// События отправляются через WebSocket в админку
socket.to('admins').emit('blockchain-event', {
  type: 'TradeCompleted',
  tradeId: 1,
  amount: '10.0',
  txHash: '0x...',
});
```

---

## Деплой контрактов

### 1. Локально (Ganache/Hardhat Network)

```bash
cd contracts
npm install
npx hardhat node
npm run deploy:local
```

### 2. Sepolia Testnet

```bash
# Настроить .env
cp .env.example .env

# Задеплоить
npm run deploy:sepolia
```

### 3. Polygon Mainnet

```bash
npm run deploy:polygon
```

---

## Стоимость транзакций (Gas)

| Операция | Gas Limit | Цена (Sepolia) |
|----------|-----------|----------------|
| CreateTrade | ~150,000 | ~0.001 ETH |
| ReserveFunds | ~80,000 | ~0.0005 ETH |
| CompleteTrade | ~120,000 | ~0.0008 ETH |
| CancelTrade | ~60,000 | ~0.0004 ETH |

**Итого на сделку:** ~0.0027 ETH (~$5-10 на mainnet)

---

## Безопасность

### Рекомендации

1. **Храните private key в .env** (не в коде!)
2. **Используйте мультисиг** для owner адресов
3. **Проведите аудит** контрактов перед production
4. **Тестируйте на тестнете** (Sepolia/Mumbai)

### Аудит

- [ ] Certik
- [ ] PeckShield
- [ ] OpenZeppelin

---

## Troubleshooting

### "Blockchain not connected"

Проверьте .env:
```bash
BLOCKCHAIN_RPC_URL=...
BLOCKCHAIN_PRIVATE_KEY=...
```

### "Gas too low"

Увеличьте gas limit в `blockchain.service.ts`:
```typescript
gasLimit: 500000, // Вместо 300000
```

### "Transaction reverted"

Проверьте:
- Баланс кошелька
- Права доступа (owner только для некоторых функций)
- Статус сделки (нельзя завершить отменённую)

---

## Ссылки

- **Infura:** https://infura.io
- **Ethers.js:** https://docs.ethers.org
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Polygon Mumbai Faucet:** https://mumbaifaucet.com
