# Backend Testing Guide

## ✅ Тестирование Blockchain Backend

### 1. Установка зависимостей

```cmd
cd D:\webP2P\services\api
npm install
```

**Результат:** Должно установиться ~750 пакетов.

---

### 2. Настройка окружения

Создайте файл `.env` (уже создан):

```env
# Database
DATABASE_URL="postgresql://p2pspb:test_password@localhost:5432/p2pspb?schema=public"

# Security
JWT_SECRET=test_jwt_secret_key_for_testing_only_32_chars

# Blockchain (оставьте пустым для offline теста)
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_PRIVATE_KEY=
```

---

### 3. Запуск тестового скрипта

```cmd
npx ts-node test-blockchain.ts
```

**Ожидаемый результат:**
```
🧪 Testing Blockchain Integration...

📋 Test 1: Connection Status
   Connected: false
   Provider: Not initialized
   Wallet: Not initialized

⚠️  Blockchain not configured. Running in offline mode.
   Set BLOCKCHAIN_RPC_URL and BLOCKCHAIN_PRIVATE_KEY in .env

✅ Tests completed!
```

---

### 4. Запуск NestJS API

```cmd
npm run dev
```

**Ожидаемый результат:**
```
[Nest] XXXXX  - DD.MM.YYYY, HH:MM:SS LOG [NestFactory] Starting Nest application...
[Nest] XXXXX  - DD.MM.YYYY, HH:MM:SS LOG [InstanceLoader] AppModule dependencies initialized
[Nest] XXXXX  - DD.MM.YYYY, HH:MM:SS LOG [BlockchainService] Blockchain credentials not configured. Running in offline mode.
[Nest] XXXXX  - DD.MM.YYYY, HH:MM:SS LOG API running on port 4000
```

---

### 5. Проверка API endpoints

Откройте в браузере или через curl:

#### Health Check
```bash
curl http://localhost:4000/api/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-25T..."
}
```

#### Blockchain Status
```bash
curl http://localhost:4000/api/blockchain/status
```

**Ожидаемый ответ:**
```json
{
  "connected": false,
  "escrowAddress": "",
  "tokenAddress": ""
}
```

#### Swagger Documentation
Откройте: http://localhost:4000/api/docs

**Ожидаемый результат:** Интерактивная Swagger UI со всеми endpoints.

---

### 6. Тестирование с реальным блокчейном (опционально)

#### 1. Получить Infura API Key

1. Зарегистрируйтесь на https://infura.io
2. Создайте проект
3. Скопируйте **Project ID**

#### 2. Обновить .env

```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=your_wallet_private_key
```

#### 3. Перезапустить API

```cmd
# Остановить текущий процесс (Ctrl+C)
npm run dev
```

**Ожидаемый результат:**
```
[Nest] XXXXX  - DD.MM.YYYY, HH:MM:SS LOG [BlockchainService] Connected to blockchain: ChainID 11155111, Balance: 0.5 ETH
```

#### 4. Проверить статус

```bash
curl http://localhost:4000/api/blockchain/status
```

**Ожидаемый ответ:**
```json
{
  "connected": true,
  "escrowAddress": "0x...",
  "tokenAddress": "0x..."
}
```

---

## 🐛 Troubleshooting

### Ошибка: "Cannot find module 'ethers'"

```cmd
npm install ethers
```

### Ошибка: "Blockchain credentials not configured"

Это нормально для offline теста. Для реальной работы заполните:
```env
BLOCKCHAIN_RPC_URL=...
BLOCKCHAIN_PRIVATE_KEY=...
```

### Ошибка: "Port 4000 already in use"

```cmd
# Найти процесс на порту 4000
netstat -ano | findstr :4000

# Убить процесс
taskkill /F /PID <PID>
```

### Ошибка: "Prisma Client not generated"

```cmd
npx prisma generate
```

---

## 📊 Checklist успешного тестирования

- [ ] Зависимости установлены (npm install)
- [ ] .env файл создан
- [ ] Тестовый скрипт прошёл (test-blockchain.ts)
- [ ] API запустился (npm run dev)
- [ ] Health endpoint отвечает (200 OK)
- [ ] Swagger доступен (/api/docs)
- [ ] Blockchain status показывает "connected: false" (offline mode)

---

## 🎯 Следующие шаги

1. ✅ Backend протестирован
2. ⏭️ Деплой контрактов на Sepolia
3. ⏭️ Frontend интеграция (WalletConnect)
4. ⏭️ End-to-End тестирование
