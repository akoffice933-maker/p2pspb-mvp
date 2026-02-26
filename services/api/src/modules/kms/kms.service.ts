import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KMS } from '@aws-sdk/client-kms';

/**
 * AWS KMS Service
 * 
 * Безопасное хранение и использование приватных ключей
 * 
 * Преимущества перед .env:
 * - Ключи зашифрованы в AWS KMS (HSM)
 * - Доступ через IAM роли
 * - Audit trail всех использований
 * - Автоматическая ротация ключей
 */
@Injectable()
export class KmsService implements OnModuleInit {
  private readonly logger = new Logger(KmsService.name);
  private kmsClient: KMS;
  private keyId: string;
  private useKms: boolean;

  constructor(private configService: ConfigService) {
    this.useKms = this.configService.get<boolean>('AWS_KMS_ENABLED') || false;
    this.keyId = this.configService.get<string>('AWS_KMS_KEY_ID') || '';
    
    if (this.useKms && this.keyId) {
      this.kmsClient = new KMS({
        region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      });
      this.logger.log('AWS KMS initialized');
    } else {
      this.logger.warn('AWS KMS disabled - using local keys (NOT FOR PRODUCTION)');
    }
  }

  async onModuleInit() {
    if (this.useKms) {
      try {
        // Проверка подключения к KMS
        await this.kmsClient.describeKey({ KeyId: this.keyId });
        this.logger.log('KMS key verified');
      } catch (error) {
        this.logger.error(`KMS connection failed: ${error.message}`);
        this.useKms = false;
      }
    }
  }

  /**
   * Расшифровать приватный ключ
   * 
   * @param encryptedKey Зашифрованный ключ (из .env или Secrets Manager)
   * @returns Расшифрованный приватный ключ
   */
  async decryptPrivateKey(encryptedKey: string): Promise<string> {
    if (!this.useKms) {
      // Fallback для локальной разработки
      this.logger.warn('Using local key (not encrypted)');
      return encryptedKey;
    }

    try {
      const response = await this.kmsClient.decrypt({
        CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      });

      const decryptedKey = Buffer.from(response.Plaintext!).toString('utf-8');
      this.logger.log('Key decrypted successfully');
      
      return decryptedKey;
    } catch (error) {
      this.logger.error(`Key decryption failed: ${error.message}`);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Зашифровать приватный ключ (для начальной настройки)
   * 
   * @param privateKey Приватный ключ в открытом виде
   * @returns Зашифрованный ключ (сохранить в .env или Secrets Manager)
   */
  async encryptPrivateKey(privateKey: string): Promise<string> {
    if (!this.useKms) {
      this.logger.warn('KMS not enabled - returning plain key');
      return privateKey;
    }

    try {
      const response = await this.kmsClient.encrypt({
        KeyId: this.keyId,
        Plaintext: Buffer.from(privateKey, 'utf-8'),
      });

      const encryptedKey = Buffer.from(response.CiphertextBlob!).toString('base64');
      this.logger.log('Key encrypted successfully');
      
      return encryptedKey;
    } catch (error) {
      this.logger.error(`Key encryption failed: ${error.message}`);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Подписать транзакцию с использованием KMS
   * 
   * @param transactionHash Хеш транзакции для подписи
   * @returns Подпись (signature)
   */
  async signTransaction(transactionHash: string): Promise<string> {
    if (!this.useKms) {
      throw new Error('KMS not enabled - cannot sign transactions');
    }

    try {
      const response = await this.kmsClient.sign({
        KeyId: this.keyId,
        Message: Buffer.from(transactionHash, 'hex'),
        MessageType: 'DIGEST',
        SigningAlgorithm: 'ECDSA_SHA_256',
      });

      const signature = Buffer.from(response.Signature!).toString('base64');
      this.logger.log('Transaction signed with KMS');
      
      return signature;
    } catch (error) {
      this.logger.error(`Transaction signing failed: ${error.message}`);
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Проверить статус KMS
   */
  getStatus() {
    return {
      enabled: this.useKms,
      keyId: this.keyId,
      keyStatus: this.useKms ? 'active' : 'disabled',
    };
  }
}
