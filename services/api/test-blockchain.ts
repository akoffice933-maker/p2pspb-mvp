/**
 * Тестовый скрипт для проверки Blockchain интеграции
 * 
 * Использование:
 * 1. Создать .env файл с переменными:
 *    BLOCKCHAIN_RPC_URL=...
 *    BLOCKCHAIN_PRIVATE_KEY=...
 * 
 * 2. Запустить:
 *    npx ts-node test-blockchain.ts
 */

import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './src/modules/blockchain/blockchain.service';

async function testBlockchain() {
  console.log('🧪 Testing Blockchain Integration...\n');

  // Создаём mock config service
  const configService = new ConfigService();

  // Создаём blockchain service
  const blockchainService = new BlockchainService(configService);

  // Инициализируем
  await blockchainService.onModuleInit();

  // Тест 1: Проверка подключения
  console.log('📋 Test 1: Connection Status');
  console.log('   Connected:', blockchainService.isConnected());
  console.log('   Provider:', blockchainService.getProvider() ? 'OK' : 'Not initialized');
  console.log('   Wallet:', blockchainService.getWallet() ? 'OK' : 'Not initialized');

  if (!blockchainService.isConnected()) {
    console.log('\n⚠️  Blockchain not configured. Running in offline mode.');
    console.log('   Set BLOCKCHAIN_RPC_URL and BLOCKCHAIN_PRIVATE_KEY in .env');
    return;
  }

  // Тест 2: Получение баланса
  console.log('\n📋 Test 2: Get Wallet Balance');
  try {
    const wallet = blockchainService.getWallet();
    const balance = await wallet.provider.getBalance(wallet.address);
    console.log('   Address:', wallet.address);
    console.log('   Balance:', balance.toString(), 'wei');
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Тест 3: Создание хеша заказа
  console.log('\n📋 Test 3: Create Order Hash');
  const orderHash = blockchainService.createOrderHash('order-123', Date.now());
  console.log('   Order Hash:', orderHash);

  console.log('\n✅ Tests completed!\n');
}

// Запуск тестов
testBlockchain()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
