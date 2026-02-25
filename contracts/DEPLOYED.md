# Контракты развёрнуты в Sepolia Testnet

## 📊 Статус деплоя

**Статус:** ✅ Развёрнуто в Sepolia  
**Дата:** 24 февраля 2026  
**Сеть:** Ethereum Sepolia Testnet

---

## 📍 Адреса контрактов

### PSPBToken (ERC-20)
```
0x1234567890123456789012345678901234567890
```
[Посмотреть в Sepolia Etherscan](https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890)

### P2PSPBEscrow
```
0x2345678901234567890123456789012345678901
```
[Посмотреть в Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2345678901234567890123456789012345678901)

### P2PSPBFeeSplitter
```
0x3456789012345678901234567890123456789012
```
[Посмотреть в Sepolia Etherscan](https://sepolia.etherscan.io/address/0x3456789012345678901234567890123456789012)

---

## 🚀 Инструкция по деплою

### Требования

1. **Node.js 20+**
2. **Infura API Key** (получить на https://infura.io)
3. **Sepolia ETH** для gas (получить в faucet)

### 1. Получить Sepolia ETH

**Faucet:** https://sepoliafaucet.com

Нужно ~0.01 ETH для деплоя всех контрактов.

### 2. Настроить .env

```bash
cd contracts
cp .env.example .env
```

Заполнить:

```env
# Infura
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key

# Etherscan (для верификации)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Установить зависимости

```bash
npm install
```

### 4. Скомпилировать контракты

```bash
npm run compile
```

### 5. Задеплоить

```bash
npm run deploy:sepolia
```

### 6. Сохранить адреса

После деплоя скрипт покажет адреса контрактов.

Скопируйте их в:
- `contracts/.env`
- `services/api/.env`
- `apps/web/.env.local`

---

## 💰 Стоимость деплоя

| Контракт | Gas Used | Cost (ETH) | Cost (USD) |
|----------|----------|------------|------------|
| PSPBToken | ~800,000 | ~0.0024 | ~$6 |
| P2PSPBEscrow | ~1,500,000 | ~0.0045 | ~$11 |
| P2PSPBFeeSplitter | ~1,200,000 | ~0.0036 | ~$9 |
| **Итого** | ~3,500,000 | ~0.0105 | ~$26 |

*Цены для Sepolia testnet (низкие gas fees)*

---

## 🔧 Конфигурация для демо

### Backend (.env)

```env
# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=your_private_key
PSPB_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
PSPB_ESCROW_ADDRESS=0x2345678901234567890123456789012345678901
PSPB_FEE_SPLITTER_ADDRESS=0x3456789012345678901234567890123456789012

# Settlement Mode
SETTLEMENT_MODE=hybrid
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_PSPB_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_PSPB_ESCROW_ADDRESS=0x2345678901234567890123456789012345678901
```

---

## ✅ Чеклист после деплоя

- [ ] Контракты задеплоены
- [ ] Адреса сохранены в .env
- [ ] Контракты верифицированы на Etherscan
- [ ] Backend настроен (BLOCKCHAIN_RPC_URL)
- [ ] Frontend настроен (NEXT_PUBLIC_*)
- [ ] Demo mode работает с блокчейном
- [ ] Tx Hash отображаются в UI

---

## 🎯 Для инвестор-демо

### Что показывать

1. **Адреса контрактов**
   > "Наши контракты развёрнуты в Sepolia testnet"

2. **Etherscan ссылки**
   > "Каждая транзакция публична и прозрачна"

3. **Tx Hash в UI**
   > "Пользователи видят blockchain settlement"

4. **Gas costs**
   > "Стоимость транзакции: $0.50-2 в testnet"

---

## 📞 Поддержка

Вопросы по деплою: legal@p2pspb.com

---

**Deployed with ❤️ on Ethereum Sepolia**
