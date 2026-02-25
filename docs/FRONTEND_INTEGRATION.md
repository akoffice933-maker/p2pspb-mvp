# Frontend Blockchain Integration Guide

## Обзор

Frontend интегрирован с блокчейном через:
- **wagmi** — React хуки для Ethereum
- **viem** — TypeScript интерфейс для Ethereum
- **RainbowKit** — UI для подключения кошелька

---

## 📦 Установленные зависимости

```json
{
  "wagmi": "^1.4.12",
  "viem": "^1.21.4",
  "@wagmi/connectors": "^4.1.0",
  "@rainbow-me/rainbowkit": "^1.3.0"
}
```

---

## 🚀 Установка

```bash
cd apps/web
npm install
```

---

## ⚙️ Настройка окружения

Создайте `.env.local`:

```bash
cp .env.local.example .env.local
```

Заполните переменные:

```env
# WalletConnect Project ID (получить на https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

# Адрес контракта PSPB (после деплоя)
NEXT_PUBLIC_PSPB_TOKEN_ADDRESS=0x...
```

---

## 🎨 Компоненты

### 1. BlockchainProvider

Обёртывает приложение в wagmi и RainbowKit контексты.

```tsx
// app/layout.tsx
<BlockchainProvider>
  <Header />
  {children}
</BlockchainProvider>
```

**Функционал:**
- Поддержка Sepolia, Mainnet, Polygon
- MetaMask, WalletConnect, Injected кошельки
- Тёмная тема RainbowKit

---

### 2. WalletConnect

Кнопка подключения кошелька в Header.

```tsx
// components/Header.tsx
<WalletConnect />
```

**Функционал:**
- Подключение кошелька
- Отображение баланса
- Индикатор сети
- Предупреждение о неправильной сети

---

### 3. PSPBBalance

Отображение балансов ETH и PSPB токенов.

```tsx
// components/PSPBBalance.tsx
<PSPBBalance />
```

**Функционал:**
- Баланс ETH
- Баланс PSPB токенов
- Кнопка Claim Airdrop

---

### 4. OnChainHistory

История блокчейн транзакций.

```tsx
// components/OnChainHistory.tsx
<OnChainHistory />
```

**Функционал:**
- Список сделок
- Статусы (Completed, Pending, Cancelled)
- Ссылки на Etherscan

---

### 5. Profile Page

Страница профиля пользователя.

```
/profile
```

**Функционал:**
- Адрес кошелька
- Балансы
- История сделок
- Кнопки Claim/Stake

---

## 🔌 Wagmi Хуки

### useAccount

```typescript
import { useAccount } from 'wagmi';

const { address, isConnected, chain } = useAccount();
```

### useBalance

```typescript
import { useBalance } from 'wagmi';

const { data: balance } = useBalance({
  address,
  watch: true,
});
```

### useToken

```typescript
import { useToken } from 'wagmi';

const { data: token } = useToken({
  address: PSPB_TOKEN_ADDRESS,
  watch: true,
});
```

### useWriteContract

```typescript
import { useWriteContract } from 'wagmi';

const { writeContract } = useWriteContract();

await writeContract({
  address: PSPB_TOKEN_ADDRESS,
  abi: PSPB_ABI,
  functionName: 'transfer',
  args: [recipient, amount],
});
```

---

## 🎯 Поддерживаемые кошельки

- ✅ MetaMask
- ✅ WalletConnect (Trust Wallet, Rainbow, etc.)
- ✅ Injected кошельки (Brave, etc.)

---

## 🌐 Поддерживаемые сети

| Сеть | Chain ID | Статус |
|------|----------|--------|
| Ethereum Sepolia | 11155111 | ✅ Тестнет |
| Ethereum Mainnet | 1 | ✅ Production |
| Polygon | 137 | ✅ Production |

---

## 📱 Адаптивность

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

**Мобильное меню:**
- Бургер-меню
- Compact modal для WalletConnect
- Оптимизированные балансы

---

## 🎨 Стилизация

**Цвета RainbowKit:**
```typescript
darkTheme({
  accentColor: '#F0B90B',  // P2PSPB Primary
  accentColorForeground: 'black',
  borderRadius: 'medium',
  fontStack: 'system',
})
```

---

## 🧪 Тестирование

### 1. Запустить frontend

```bash
npm run dev
```

### 2. Открыть http://localhost:3000

### 3. Нажать "Подключить"

### 4. Выбрать кошелёк

### 5. Проверить:
- ✅ Кошелёк подключился
- ✅ Баланс отображается
- ✅ Сеть определилась
- ✅ Profile page доступен

---

## 🔧 Troubleshooting

### "WalletConnect Project ID not configured"

Получите Project ID на https://cloud.walletconnect.com и добавьте в `.env.local`.

### "Unsupported chain"

Переключите сеть в кошельке на Sepolia Testnet.

### "Token balance not showing"

Проверьте `NEXT_PUBLIC_PSPB_TOKEN_ADDRESS` в `.env.local`.

---

## 📁 Структура

```
apps/web/
├── components/
│   ├── BlockchainProvider.tsx  ← Wagmi конфиг
│   ├── WalletConnect.tsx       ← Кнопка подключения
│   ├── PSPBBalance.tsx         ← Балансы
│   └── OnChainHistory.tsx      ← История
├── app/
│   ├── profile/
│   │   └── page.tsx            ← Страница профиля
│   ├── layout.tsx              ← С BlockchainProvider
│   └── ...
└── .env.local.example          ← Шаблон окружения
```

---

## 🚀 Следующие шаги

1. ✅ Wagmi настроен
2. ✅ Компоненты созданы
3. ⏭️ Деплой контрактов
4. ⏭️ Интеграция с реальными контрактами
5. ⏭️ Тестирование end-to-end

---

## 📞 Контакты

- Telegram: @P2PSPB_bot
- Документация: /docs/BLOCKCHAIN_INTEGRATION.md
