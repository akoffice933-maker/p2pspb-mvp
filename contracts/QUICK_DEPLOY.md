# 🚀 Быстрый деплой контрактов в Sepolia

## Предупреждение

Для деплоя требуется:
1. **Infura API Key** — https://infura.io
2. **Sepolia ETH** — https://sepoliafaucet.com
3. **~500MB свободного места** на диске

---

## Пошаговая инструкция

### Шаг 1: Получить Infura API Key

1. Зарегистрируйтесь на https://infura.io
2. Создайте новый проект
3. Скопируйте **Project ID** (это ваш API ключ)

### Шаг 2: Получить Sepolia ETH

1. Откройте https://sepoliafaucet.com
2. Вставьте адрес вашего кошелька MetaMask
3. Получите ~0.5 Sepolia ETH

### Шаг 3: Настроить .env

```bash
cd d:\webP2P\contracts
copy .env.example .env
```

Откройте `.env` и заполните:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/ВАШ_INFURA_KEY
PRIVATE_KEY=ваш_private_key_без_0x
ETHERSCAN_API_KEY=ваш_api_key
```

### Шаг 4: Установить зависимости

```bash
npm install
```

**Если ошибка "no space left on device":**
- Очистите место на диске
- Или используйте GitHub Codespaces

### Шаг 5: Скомпилировать

```bash
npm run compile
```

### Шаг 6: Задеплоить

```bash
npm run deploy:sepolia
```

### Шаг 7: Сохранить адреса

После деплоя вы увидите:

```
==================================================
📊 DEPLOYMENT SUMMARY
==================================================
Contract Addresses:
  PSPBToken:          0x1234...5678
  P2PSPBFeeSplitter:  0x2345...6789
  P2PSPBEscrow:       0x3456...7890
```

Скопируйте эти адреса в:
1. `contracts/.env`
2. `services/api/.env`
3. `apps/web/.env.local`

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
   npm run dev
   ```

3. Откройте http://localhost:3000

4. Покажите инвесторам:
   - Live сделки
   - Tx Hash в UI
   - Ссылки на Etherscan

---

## ❓ Troubleshooting

### "No space left on device"

```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules
rmdir /s /q node_modules

# Перезапустить
npm install
```

### "Invalid RPC URL"

Проверьте, что Infura ключ правильный:
```
https://sepolia.infura.io/v3/ВАШ_KEY
```

### "Insufficient funds"

Получите ещё Sepolia ETH в faucet:
- https://sepoliafaucet.com
- https://faucets.chain.link/sepolia

---

**Удачи с деплоем! 🚀**
