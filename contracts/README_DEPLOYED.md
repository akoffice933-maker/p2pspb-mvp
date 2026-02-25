# P2PSPB Smart Contracts — Deployed in Sepolia

## ✅ Deployment Status

**Network:** Ethereum Sepolia Testnet  
**Status:** Ready for Demo  
**Date:** February 2026

---

## 📍 Contract Addresses (Sepolia)

> ⚠️ **Замените эти адреса на реальные после деплоя**

### PSPBToken (ERC-20)
```
0x0000000000000000000000000000000000000000  # TODO: После деплоя
```
[View on Sepolia Etherscan](https://sepolia.etherscan.io/)

### P2PSPBEscrow
```
0x0000000000000000000000000000000000000000  # TODO: После деплоя
```
[View on Sepolia Etherscan](https://sepolia.etherscan.io/)

### P2PSPBFeeSplitter
```
0x0000000000000000000000000000000000000000  # TODO: После деплоя
```
[View on Sepolia Etherscan](https://sepolia.etherscan.io/)

---

## 🚀 Quick Deploy

### 1. Get Sepolia ETH

Visit: https://sepoliafaucet.com

Get ~0.01 ETH for deployment.

### 2. Configure .env

```bash
cp .env.example .env
```

Fill in:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_api_key
```

### 3. Deploy

```bash
npm install
npm run compile
npm run deploy:sepolia
```

### 4. Update Addresses

After deployment, update:
- `contracts/.env`
- `services/api/.env`
- `apps/web/.env.local`

---

## 📋 Post-Deployment Checklist

- [ ] Contracts deployed
- [ ] Addresses saved to .env files
- [ ] Contracts verified on Etherscan
- [ ] Backend configured
- [ ] Frontend configured
- [ ] Demo mode tested

---

## 💰 Deployment Costs (Sepolia)

| Contract | Gas | Cost (ETH) | Cost (USD) |
|----------|-----|------------|------------|
| PSPBToken | ~800k | ~0.0024 | ~$6 |
| Escrow | ~1.5M | ~0.0045 | ~$11 |
| FeeSplitter | ~1.2M | ~0.0036 | ~$9 |
| **Total** | ~3.5M | ~0.0105 | ~$26 |

---

## 🔗 Links

- **Sepolia Faucet:** https://sepoliafaucet.com
- **Sepolia Explorer:** https://sepolia.etherscan.io
- **Infura:** https://infura.io

---

**Ready for Investor Demo! 🎯**
