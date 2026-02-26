# 🚀 БЫСТРЫЙ ДЕПЛОЙ - 3 ПРОСТЫХ ШАГА

## ⚡ Шаг 1: Вставьте Private Key

Откройте файл: `contracts/.env`

Найдите строку:
```
PRIVATE_KEY=
```

Вставьте ваш ключ от MetaMask (без 0x):
```
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Где взять Private Key:**
1. Откройте MetaMask
2. Нажмите ⋮ (три точки) на аккаунте
3. Account Details → Export Private Key
4. Введите пароль
5. Скопируйте ключ

---

## ⚡ Шаг 2: Получите Sepolia ETH

Откройте: https://sepoliafaucet.com

1. Вставьте адрес вашего MetaMask кошелька
2. Нажмите "Send"
3. Подождите 1-2 минуты

Нужно ~0.01 Sepolia ETH для деплоя.

---

## ⚡ Шаг 3: Запустите деплой

### Вариант A: Через скрипт (просто)

```bash
cd d:\webP2P\contracts
deploy.bat
```

### Вариант B: Вручную

```bash
cd d:\webP2P\contracts
npm run deploy:sepolia
```

---

## ✅ После деплоя

Увидите адреса контрактов:

```
PSPBToken:          0x1234...5678
P2PSPBFeeSplitter:  0x2345...6789
P2PSPBEscrow:       0x3456...7890
```

**Скопируйте их в:**
1. `contracts/.env`
2. `services/api/.env`
3. `apps/web/.env.local`

---

## 🎯 Готово!

Теперь можно запускать Demo Mode и показывать инвесторам!

```bash
# В services/api/.env:
DEMO_MODE=true
SETTLEMENT_MODE=hybrid

# Запустить API:
cd services/api
npm run dev

# Открыть фронтенд:
http://localhost:3000
```

---

**Вопросы? Пишите в legal@p2pspb.com**
