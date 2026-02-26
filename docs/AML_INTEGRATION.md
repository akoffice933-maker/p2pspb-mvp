# AML Integration Guide

## 📋 Обзор

**AML (Anti-Money Laundering) Integration** — интеграция с AML Risk Intelligence Platform для проверки транзакций на соответствие правилам AML.

### Что даёт интеграция

- ✅ **Проверка на blacklist** — OFAC, санкционные списки
- ✅ **Darknet detection** — обнаружение связей с даркнетом
- ✅ **Exchange freeze risk** — оценка риска блокировки на 17 биржах
- ✅ **Velocity monitoring** — отслеживание частоты транзакций
- ✅ **TRC-20 enhanced** — усиленные проверки для USDT TRC-20

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         P2PSPB Platform                 │
│  ┌─────────────────────────────────┐   │
│  │  FraudDetectionService          │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  AmlService             │   │   │
│  │  └───────────┬─────────────┘   │   │
│  └──────────────┼─────────────────┘   │
└─────────────────┼─────────────────────┘
                  │ HTTP/Webhook
┌─────────────────▼─────────────────────┐
│    AML Risk Intelligence Platform     │
│  ┌─────────────────────────────────┐  │
│  │  n8n Workflows                  │  │
│  │  - AML Rules Engine             │  │
│  │  - Blacklist/Whitelist          │  │
│  │  - Risk Scoring                 │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │  PostgreSQL (WORM Log)          │  │
│  │  - Audit Trail                  │  │
│  │  - Transaction History          │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

---

## ⚙️ Настройка

### 1. Установите AML платформу

Следуйте инструкции: https://github.com/akoffice933-maker/aml-risk-intelligence-platform

**Минимальная установка:**
```bash
git clone https://github.com/akoffice933-maker/aml-risk-intelligence-platform.git
cd aml-risk-intelligence-platform
sudo ./scripts/deploy.sh
```

### 2. Настройте .env

```env
# AML Integration
AML_API_URL=http://localhost:5678/webhook
AML_ENABLED=true  # false для тестирования без AML
```

### 3. Проверьте подключение

```bash
curl http://localhost:5678/healthz
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2026-02-25T..."}
```

---

## 🔌 API Endpoints

### 1. Проверка транзакции

**POST** `/api/aml/check`

**Request:**
```json
{
  "transaction_id": "order_123_1708876543",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 1500.50,
  "currency": "USDT",
  "network": "ethereum",
  "counterparty": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
}
```

**Response:**
```json
{
  "success": true,
  "risk_score": 75,
  "risk_level": "HIGH",
  "decision": "BLOCK",
  "explanation": [
    "Адрес находится в OFAC санкционном списке",
    "Обнаружена связь со scam проектом"
  ],
  "evidence": {
    "blacklist_match": true,
    "blacklist_source": "OFAC_SDN",
    "scam_reports": 3
  },
  "recommendations": [
    "Заблокировать транзакцию",
    "Провести ручную проверку"
  ],
  "processing_time_ms": 324
}
```

### 2. Проверка адреса

**GET** `/api/aml/check-address/:address`

**Response:**
```json
{
  "success": true,
  "isBlacklisted": true,
  "riskScore": 85,
  "sources": ["OFAC_SDN", "ChainAbuse"]
}
```

### 3. Обновление blacklist

**POST** `/api/aml/update-blacklist`

**Request:**
```json
{
  "addresses": ["0x123...", "0x456..."],
  "source": "manual_review"
}
```

### 4. Статус AML сервиса

**GET** `/api/aml/status`

**Response:**
```json
{
  "enabled": true,
  "apiUrl": "http://localhost:5678/webhook",
  "status": "operational"
}
```

---

## 🎯 Как работает в P2PSPB

### 1. При создании заявки

```typescript
// OrdersService.createOrder()
const fraudCheck = await this.fraudDetectionService.checkBeforeCreateOrder(
  userId,
  amount,
  ipAddress,
  fingerprint,
);

// AML проверка внутри fraudDetectionService
const amlResult = await this.amlService.checkTransaction({
  transaction_id: `order_${userId}_${Date.now()}`,
  wallet_address: user.telegramId,
  amount,
  currency: 'USDT',
  network: 'ethereum',
});

// Если AML BLOCK
if (amlResult.decision === 'BLOCK') {
  score += 50;
  reasons.push(...amlResult.explanation);
  
  // Создаётся алерт
  await this.createAlert({
    userId,
    type: AlertType.BEHAVIOR,
    score: amlResult.risk_score,
    title: 'AML Check Failed',
    description: amlResult.explanation.join('; '),
  });
}
```

### 2. Результаты проверки

| AML Decision | Действие в P2PSPB |
|--------------|-------------------|
| **ALLOW** | Заявка создаётся |
| **REVIEW** | Заявка создаётся, но требует ручной проверки |
| **BLOCK** | Заявка отклоняется, создаётся алерт |

### 3. Автоматические алерты

AML интеграция автоматически создаёт алерты при:
- Risk score > 75
- Blacklist match
- > 3 scam reports
- Velocity > 10 транзакций/час

---

## 📊 Примеры использования

### Пример 1: Проверка перед созданием заявки

```typescript
// В frontend
const response = await api.post('/api/aml/check', {
  transaction_id: `order_${userId}_${Date.now()}`,
  wallet_address: walletAddress,
  amount: 1000,
  currency: 'USDT',
  network: 'ethereum',
});

if (response.data.decision === 'BLOCK') {
  alert('Транзакция заблокирована по AML правилам');
  return;
}

// Продолжить создание заявки
```

### Пример 2: Проверка контрагента

```typescript
// Проверить адрес перед сделкой
const check = await api.get(`/api/aml/check-address/${counterpartyAddress}`);

if (check.data.isBlacklisted) {
  console.warn('Контрагент в blacklist!');
  console.log('Источники:', check.data.sources);
}
```

### Пример 3: Обновление blacklist

```typescript
// Добавить адреса в blacklist после ручной проверки
await api.post('/api/aml/update-blacklist', {
  addresses: ['0x123...', '0x456...'],
  source: 'manual_review_case_123',
});
```

---

## 🛡️ Безопасность

### WORM логирование

Все AML проверки записываются в WORM (Write Once Read Many) лог:
- Нельзя изменить или удалить
- Хранится 5 лет (требование регуляторов)
- Доступен для аудита

### Rate Limiting

```
100 requests/minute на IP
```

### Data Protection

- ✅ Все данные шифруются (TLS 1.3)
- ✅ Доступ только по API key
- ✅ Audit trail всех запросов

---

## 📈 Мониторинг

### Grafana Dashboards

1. **AML Platform Overview**
   - Total transactions checked
   - Risk distribution
   - Block rate

2. **Transaction Risk Analysis**
   - Risk score trends
   - Top risk sources
   - False positive rate

3. **System Health**
   - API response time
   - Database connections
   - Queue length

### Prometheus Metrics

```prometheus
# Количество проверок
aml_checks_total{decision="ALLOW|REVIEW|BLOCK"}

# Время обработки
aml_processing_time_seconds

# Risk score distribution
aml_risk_score_bucket{le="25|50|75|100"}
```

---

## ⚠️ Troubleshooting

### AML сервис недоступен

**Симптомы:**
- Ошибки в логах: "AML check failed: Connection refused"
- Все транзакции проходят без AML проверки

**Решение:**
```bash
# Проверить статус AML платформы
docker ps | grep aml

# Перезапустить
cd aml-risk-intelligence-platform
docker-compose restart

# Проверить логи
docker-compose logs n8n
```

### Высокий latency

**Симптомы:**
- Проверка занимает > 5 секунд
- Таймауты

**Решение:**
```bash
# Проверить нагрузку на PostgreSQL
docker-compose top postgres

# Увеличить pool connections
# В docker-compose.yml:
POSTGRES_MAX_CONNECTIONS=300
```

### False positives

**Симптомы:**
- Много легальных транзакций блокируется

**Решение:**
1. Проверить правила в n8n dashboard
2. Настроить пороги risk score
3. Добавить whitelist адреса

---

## 📞 Контакты

- **AML Platform Docs:** https://github.com/akoffice933-maker/aml-risk-intelligence-platform
- **Support:** support@aml-platform.com
- **Telegram:** @aml_platform_support

---

**Интеграция завершена! 🎉**
