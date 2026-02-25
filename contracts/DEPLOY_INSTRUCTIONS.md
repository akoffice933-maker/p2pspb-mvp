# 🚀 Деплой контрактов в Sepolia Testnet

## ✅ Контракты скомпилированы!

Теперь нужно задеплоить их в сеть Sepolia.

---

## 📋 Что нужно для деплоя

### 1. Infura API Key

1. Зарегистрируйтесь на https://infura.io
2. Создайте проект
3. Скопируйте **Project ID** (это ваш API ключ)

### 2. Sepolia ETH

1. Откройте https://sepoliafaucet.com
2. Вставьте адрес вашего MetaMask кошелька
3. Получите ~0.5 Sepolia ETH

### 3. Private Key

1. Откройте MetaMask
2. Экспортируйте приватный ключ одного из аккаунтов
3. **НЕ используйте основной аккаунт с большими средствами!**

---

## ⚙️ Настройка .env

```bash
cd d:\webP2P\contracts
copy .env.example .env
```

Откройте `.env` и заполните:

```env
# Infura RPC
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/ВАШ_INFURA_KEY

# Private Key (без 0x)
PRIVATE_KEY=ваш_private_key_без_0x

# Etherscan API (для верификации)
ETHERSCAN_API_KEY=ваш_api_key
```

---

## 🚀 Деплой

### 1. Запустить деплой

```bash
npm run deploy:sepolia
```

### 2. Дождаться подтверждения

Деплой займёт 1-3 минуты.

После завершения вы увидите:

```
============================================================
📊 DEPLOYMENT SUMMARY
============================================================
Network: Sepolia Testnet

Contract Addresses:
  PSPBToken:          0x1234...5678
  P2PSPBFeeSplitter:  0x2345...6789
  P2PSPBEscrow:       0x3456...7890
============================================================

🎉 Deployment successful!
```

---

## 📝 Сохранение адресов

### 1. Скопируйте адреса контрактов

### 2. Обновите `contracts/.env`:

```env
PSPB_TOKEN_ADDRESS=0x1234...
PSPB_ESCROW_ADDRESS=0x2345...
PSPB_FEE_SPLITTER_ADDRESS=0x3456...
```

### 3. Обновите `services/api/.env`:

```env
PSPB_TOKEN_ADDRESS=0x1234...
PSPB_ESCROW_ADDRESS=0x3456...
PSPB_FEE_SPLITTER_ADDRESS=0x4567...
```

### 4. Обновите `apps/web/.env.local`:

```env
NEXT_PUBLIC_PSPB_TOKEN_ADDRESS=0x1234...
NEXT_PUBLIC_PSPB_ESCROW_ADDRESS=0x3456...
```

---

## ✅ Верификация на Etherscan

### 1. Верифицировать токены

```bash
npx hardhat verify --network sepolia 0x1234...5678
```

### 2. Открыть на Etherscan

```
https://sepolia.etherscan.io/address/0x1234...5678
```

---

## 💰 Стоимость деплоя

| Контракт | Gas | Cost (ETH) | Cost (USD) |
|----------|-----|------------|------------|
| PSPBToken | ~400k | ~0.0012 | ~$3 |
| FeeSplitter | ~600k | ~0.0018 | ~$4 |
| Escrow | ~800k | ~0.0024 | ~$6 |
| **Итого** | ~1.8M | ~0.0054 | ~$13 |

*Цены для Sepolia testnet*

---

## 🎯 Для демо

После деплоя:

1. Включите Demo Mode:
   ```env
   DEMO_MODE=true
   SETTLEMENT_MODE=hybrid
   ```

2. Запустите API:
   ```bash
   cd services/api
   npm run dev
   ```

3. Откройте фронтенд:
   ```
   http://localhost:3000
   ```

4. Покажите инвесторам:
   - Tx Hash в UI
   - Ссылки на Etherscan
   - Blockchain settlement

---

## ❓ Troubleshooting

### "Insufficient funds"

Получите ещё Sepolia ETH:
- https://sepoliafaucet.com
- https://faucets.chain.link/sepolia

### "Invalid RPC URL"

Проверьте Infura ключ в `.env`:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/ВАШ_KEY
```

### "Nonce too low"

Подождите пару минут и попробуйте снова.

---

**Удачи с деплоем! 🚀**
