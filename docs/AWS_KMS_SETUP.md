# AWS KMS + Multi-Sig Security Setup

## 🔐 Обзор

Этот гайд описывает как безопасно хранить и использовать приватные ключи для blockchain settlement.

### Проблемы .env подхода

```env
# ❌ ПЛОХО (для production)
BLOCKCHAIN_PRIVATE_KEY=0x1234567890abcdef...
```

**Риски:**
- Ключ в открытом виде
- Доступен любому с доступом к файлу
- Нет audit trail
- Нельзя отозвать доступ

### Решение: AWS KMS + Multi-Sig

```env
# ✅ ХОРОШО (для production)
AWS_KMS_ENABLED=true
AWS_KMS_KEY_ID=alias/p2pspb-settlement
BLOCKCHAIN_PRIVATE_KEY_ENCRYPTED=CQICA... (зашифрованный ключ)
```

**Преимущества:**
- Ключи зашифрованы в HSM (Hardware Security Module)
- Доступ через IAM роли
- Audit trail всех использований в CloudTrail
- Автоматическая ротация ключей

---

## 📋 Часть 1: Настройка AWS KMS

### Шаг 1: Создать KMS ключ

```bash
# Через AWS Console:
1. Откройте AWS KMS Console
2. Create Key
3. Symmetric key
4. Key type: Encrypt and decrypt
5. Key ID: alias/p2pspb-settlement
```

```bash
# Через AWS CLI:
aws kms create-key \
  --description "P2PSPB Settlement Private Key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS \
  --tags TagKey=Project,TagValue=P2PSPB
```

**Результат:**
```
Key ID: 1234abcd-12ab-34cd-56ef-1234567890ab
Key ARN: arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab
```

---

### Шаг 2: Настроить IAM политики

**Создать IAM роль для приложения:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:Sign",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  ]
}
```

**Для EC2/ECS:**
```bash
# Прикрепить IAM роль к EC2 инстансу
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=P2PSPB-KMS-Role
```

---

### Шаг 3: Зашифровать приватный ключ

**Скрипт для шифрования:**

```bash
#!/bin/bash

# Ваш приватный ключ (НИКОГДА не коммитьте в git!)
PRIVATE_KEY="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# KMS Key ID
KEY_ID="arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab"

# Зашифровать
aws kms encrypt \
  --key-id $KEY_ID \
  --plaintext "$PRIVATE_KEY" \
  --output text \
  --query CiphertextBlob > encrypted_key.txt

# Результат: зашифрованный ключ в base64
cat encrypted_key.txt
# CQICA... (длинная строка)
```

**Сохранить в .env:**

```env
# services/api/.env
AWS_KMS_ENABLED=true
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab
BLOCKCHAIN_PRIVATE_KEY_ENCRYPTED=CQICA... (из encrypted_key.txt)
```

---

### Шаг 4: Проверка работы

```bash
# Тест расшифровки
aws kms decrypt \
  --key-id $KEY_ID \
  --ciphertext-blob fileb://encrypted_key.txt \
  --output text \
  --query Plaintext | base64 --decode

# Должен вернуть оригинальный приватный ключ
```

---

## 📋 Часть 2: Multi-Sig Wallet

### Зачем нужен Multi-Sig?

**Проблема:**
- Один приватный ключ = single point of failure
- Если ключ украден — злоумышленник имеет полный доступ

**Решение:**
- Multi-Sig требует 2 из 3 подписей
- Ключи у разных людей (CEO, CTO, Compliance)
- Даже если один ключ украден — злоумышленник не может подписать транзакцию

---

### Шаг 1: Развернуть Multi-Sig контракт

**Установить Foundry:**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Развернуть контракт:**

```bash
cd contracts

# Компилировать
forge build --contracts src/P2PSPBMultiSigWallet.sol

# Развернуть (Sepolia testnet)
forge create src/P2PSPBMultiSigWallet.sol:P2PSPBMultiSigWallet \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_KEY \
  --constructor-args \
    "[0xCEO_Address,0xCTO_Address,0xCompliance_Address]" \
    2 \
    1000000000000000000
```

**Параметры:**
- `[addresses]` — 3 владельца (CEO, CTO, Compliance)
- `2` — требуется 2 подписи
- `1000000000000000000` — threshold 1 ETH (10^18 wei)

**Результат:**
```
Deployed to: 0xMultiSigWalletAddress123456789
```

---

### Шаг 2: Настроить settlement через Multi-Sig

**В .env:**

```env
# services/api/.env
PSPB_MULTI_SIG_WALLET_ADDRESS=0xMultiSigWalletAddress123456789
SETTLEMENT_MODE=hybrid
```

**В BlockchainService:**

```typescript
// При settlement > threshold
if (amount > threshold) {
  // Создать транзакцию в Multi-Sig
  await multiSigWallet.submitTransaction(
    recipientAddress,
    amount,
    '0x'
  );
  
  // Требуется 2 подписи от владельцев
  // Отправить уведомления CEO и CTO
}
```

---

### Шаг 3: Подписание транзакций

**Владелец 1 (CEO) подписывает:**

```bash
# Через ethers.js
const wallet = new ethers.Wallet(CEO_PRIVATE_KEY);
const multiSig = new ethers.Contract(MULTI_SIG_ADDRESS, ABI, wallet);

await multiSig.confirmTransaction(txId);
```

**Владелец 2 (CTO) подписывает:**

```bash
const wallet = new ethers.Wallet(CTO_PRIVATE_KEY);
const multiSig = new ethers.Contract(MULTI_SIG_ADDRESS, ABI, wallet);

await multiSig.confirmTransaction(txId);
// Транзакция выполнена автоматически!
```

---

## 📊 Архитектура безопасности

```
┌─────────────────────────────────────────┐
│         P2PSPB Platform                 │
│  ┌─────────────────────────────────┐   │
│  │  BlockchainService              │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  KmsService             │   │   │
│  │  │  - AWS KMS Decrypt      │   │   │
│  │  │  - Sign Transaction     │   │   │
│  │  └───────────┬─────────────┘   │   │
│  └──────────────┼─────────────────┘   │
└─────────────────┼─────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    AWS KMS (HSM)                        │
│  - Ключи зашифрованы                   │
│  - Доступ через IAM                     │
│  - Audit trail в CloudTrail             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Multi-Sig Wallet (Ethereum)          │
│  - Требуется 2/3 подписи                │
│  - Threshold: 1 ETH                     │
│  - Владельцы: CEO, CTO, Compliance      │
└─────────────────────────────────────────┘
```

---

## ⚙️ Конфигурация

### Production .env

```env
# AWS KMS
AWS_KMS_ENABLED=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab

# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY_ENCRYPTED=CQICA... (зашифрованный ключ)

# Multi-Sig
PSPB_MULTI_SIG_WALLET_ADDRESS=0xMultiSigWalletAddress
MULTI_SIG_THRESHOLD=1000000000000000000  # 1 ETH
MULTI_SIG_REQUIRED_CONFIRMATIONS=2
```

### Development .env

```env
# Для локальной разработки (НЕ для production!)
AWS_KMS_ENABLED=false
BLOCKCHAIN_PRIVATE_KEY=0x1234... (открытый ключ)
```

---

## 🛡️ Best Practices

### 1. Ротация ключей

```bash
# Раз в 90 дней
aws kms rotate-key --key-id $KEY_ID

# Создать новую версию ключа
aws kms create-key --tags TagKey=Rotation,TagValue=2026-Q2
```

### 2. Мониторинг

```bash
# CloudTrail алерты на:
- DecryptKey операции
- Sign операции
- Failed попытки доступа
```

### 3. Backup

```bash
# Экспортировать зашифрованный ключ
aws kms export-key --key-id $KEY_ID > backup.key.enc

# Хранить в безопасном месте (не в git!)
```

### 4. Доступы

```bash
# Минимальные привилегии
# Только decrypt, encrypt, sign
# Никаких delete или schedule-key-deletion
```

---

## 📞 Troubleshooting

### "AccessDeniedException"

**Проблема:** IAM роль не имеет доступа к KMS

**Решение:**
```bash
# Проверить IAM политику
aws iam get-role-policy --role-name P2PSPB-KMS-Role --policy-name KMSAccess

# Добавить доступ
aws kms put-key-policy --key-id $KEY_ID --policy file://kms-policy.json
```

### "InvalidCiphertextException"

**Проблема:** Неправильный зашифрованный ключ

**Решение:**
```bash
# Перешифровать ключ
aws kms encrypt --key-id $KEY_ID --plaintext "0x..." > new_encrypted_key.txt
```

### "Multi-Sig transaction not executing"

**Проблема:** Недостаточно подтверждений

**Решение:**
```bash
# Проверить количество подтверждений
await multiSig.getConfirmationCount(txId);

# Если < 2, отправить напоминания владельцам
```

---

## 📚 Дополнительные ресурсы

- [AWS KMS Documentation](https://docs.aws.amazon.com/kms/)
- [Gnosis Safe Multi-Sig](https://safe.global/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Security first! 🔐**
