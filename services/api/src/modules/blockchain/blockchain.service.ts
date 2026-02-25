import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

/**
 * @title BlockchainService
 * @dev Основной сервис для подключения к блокчейну
 */
@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  
  // Адреса контрактов (заполняются после деплоя)
  private contractAddresses = {
    token: process.env.PSPB_TOKEN_ADDRESS || '',
    escrow: process.env.PSPB_ESCROW_ADDRESS || '',
    feeSplitter: process.env.PSPB_FEE_SPLITTER_ADDRESS || '',
  };

  // ABI контрактов (упрощённые версии)
  private readonly escrowABI = [
    'function createTrade(address buyer, uint256 amount, uint256 rate, bytes32 orderHash) external returns (uint256)',
    'function reserveFunds(uint256 tradeId) external',
    'function confirmPayment(uint256 tradeId) external',
    'function confirmReceipt(uint256 tradeId) external',
    'function completeTrade(uint256 tradeId) external',
    'function cancelTrade(uint256 tradeId) external',
    'function createDispute(uint256 tradeId) external',
    'function getTrade(uint256 tradeId) external view returns (tuple(uint256 id, address seller, address buyer, uint256 amount, uint256 rate, uint256 fee, uint256 createdAt, uint256 expiresAt, uint8 status, bytes32 orderHash))',
    'event TradeCreated(uint256 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount, uint256 fee)',
    'event TradeCompleted(uint256 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount)',
    'event TradeCancelled(uint256 indexed tradeId)',
  ];

  private readonly tokenABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function mint(address to, uint256 amount) external',
    'function claimAirdrop() external',
  ];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeProvider();
  }

  /**
   * @dev Инициализация провайдера и кошелька
   */
  private async initializeProvider() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      this.logger.warn('Blockchain credentials not configured. Running in offline mode.');
      return;
    }

    try {
      // Создаём провайдер и кошелёк
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Проверяем подключение
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);

      this.logger.log(
        `Connected to blockchain: ChainID ${network}, Balance: ${ethers.formatEther(balance)} ETH`,
      );
    } catch (error) {
      this.logger.error(`Failed to connect to blockchain: ${error.message}`);
    }
  }

  /**
   * @dev Получить провайдер
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }

  /**
   * @dev Получить кошелёк
   */
  getWallet(): ethers.Wallet {
    return this.wallet;
  }

  /**
   * @dev Получить адрес контракта Escrow
   */
  getEscrowAddress(): string {
    return this.contractAddresses.escrow;
  }

  /**
   * @dev Получить адрес контракта Token
   */
  getTokenAddress(): string {
    return this.contractAddresses.token;
  }

  /**
   * @dev Получить контракт Escrow
   */
  getEscrowContract(): ethers.Contract {
    if (!this.wallet || !this.contractAddresses.escrow) {
      throw new Error('Blockchain not initialized');
    }
    return new ethers.Contract(this.contractAddresses.escrow, this.escrowABI, this.wallet);
  }

  /**
   * @dev Получить контракт Token
   */
  getTokenContract(): ethers.Contract {
    if (!this.wallet || !this.contractAddresses.token) {
      throw new Error('Blockchain not initialized');
    }
    return new ethers.Contract(this.contractAddresses.token, this.tokenABI, this.wallet);
  }

  /**
   * @dev Проверить подключение к блокчейну
   */
  isConnected(): boolean {
    return !!this.provider && !!this.wallet;
  }

  /**
   * @dev Получить баланс адреса в токенах
   */
  async getTokenBalance(address: string): Promise<string> {
    if (!this.isConnected()) {
      return '0';
    }

    try {
      const tokenContract = this.getTokenContract();
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get token balance: ${error.message}`);
      return '0';
    }
  }

  /**
   * @dev Отправить транзакцию с газом
   */
  async sendTransaction(tx: ethers.TransactionRequest) {
    if (!this.isConnected()) {
      throw new Error('Blockchain not connected');
    }

    try {
      // Получаем gas price
      const feeData = await this.provider.getFeeData();
      
      // Отправляем транзакцию
      const txResponse = await this.wallet.sendTransaction({
        ...tx,
        gasLimit: tx.gasLimit || 300000,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      this.logger.log(`Transaction sent: ${txResponse.hash}`);
      return txResponse;
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Дождаться подтверждения транзакции
   */
  async waitForTransaction(txHash: string, confirmations: number = 1) {
    if (!this.isConnected()) {
      throw new Error('Blockchain not connected');
    }

    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      this.logger.log(`Transaction confirmed: ${txHash}`);
      return receipt;
    } catch (error) {
      this.logger.error(`Transaction confirmation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * @dev Создать хеш заказа
   */
  createOrderHash(orderId: string, timestamp: number): string {
    return ethers.keccak256(
      ethers.solidityPacked(['string', 'uint256'], [orderId, timestamp]),
    );
  }
}
