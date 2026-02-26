import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AmlCheckRequest {
  transaction_id: string;
  wallet_address: string;
  amount: number;
  currency: string;
  network: string;
  counterparty?: string;
  timestamp?: string;
}

export interface AmlCheckResponse {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: 'ALLOW' | 'REVIEW' | 'BLOCK';
  explanation: string[];
  evidence: {
    blacklist_match?: boolean;
    blacklist_source?: string;
    scam_reports?: number;
    velocity_count?: number;
    wallet_age_days?: number;
  };
  recommendations: string[];
  transaction_log_id?: string;
  processing_time_ms: number;
}

/**
 * AML Service
 * Интеграция с AML Risk Intelligence Platform
 */
@Injectable()
export class AmlService {
  private readonly logger = new Logger(AmlService.name);
  private readonly amlApiUrl: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.amlApiUrl = this.configService.get<string>('AML_API_URL') || 'http://localhost:5678/webhook';
    this.enabled = this.configService.get<boolean>('AML_ENABLED') || false;
    
    if (this.enabled) {
      this.logger.log(`AML Service enabled. API URL: ${this.amlApiUrl}`);
    } else {
      this.logger.warn('AML Service disabled (set AML_ENABLED=true to enable)');
    }
  }

  /**
   * Проверка транзакции через AML платформу
   */
  async checkTransaction(data: AmlCheckRequest): Promise<AmlCheckResponse> {
    if (!this.enabled) {
      return this.getMockResponse(data);
    }

    try {
      const response = await axios.post<AmlCheckResponse>(
        `${this.amlApiUrl}/aml-check`,
        data,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `AML check completed: ${data.transaction_id} - Risk: ${response.data.risk_level} (${response.data.risk_score})`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`AML check failed: ${error.message}`);
      
      // В случае ошибки AML сервиса, возвращаем mock-ответ
      // В production лучше заблокировать транзакцию
      return this.getMockResponse(data, true);
    }
  }

  /**
   * Проверка адреса на наличие в blacklist
   */
  async checkAddress(walletAddress: string): Promise<{
    isBlacklisted: boolean;
    riskScore: number;
    sources: string[];
  }> {
    if (!this.enabled) {
      return { isBlacklisted: false, riskScore: 0, sources: [] };
    }

    try {
      const response = await axios.get(
        `${this.amlApiUrl}/risk-profile/${walletAddress}`,
        { timeout: 3000 },
      );

      return {
        isBlacklisted: response.data.is_blacklisted || false,
        riskScore: response.data.risk_score || 0,
        sources: response.data.sources || [],
      };
    } catch (error) {
      this.logger.error(`Address check failed: ${error.message}`);
      return { isBlacklisted: false, riskScore: 0, sources: [] };
    }
  }

  /**
   * Обновление blacklist
   */
  async updateBlacklist(addresses: string[], source: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await axios.post(`${this.amlApiUrl}/update-blacklist`, {
        addresses,
        source,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Blacklist updated: ${addresses.length} addresses from ${source}`);
      return true;
    } catch (error) {
      this.logger.error(`Blacklist update failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Mock ответ для тестирования или fallback
   */
  private getMockResponse(data: AmlCheckRequest, errorMode = false): AmlCheckResponse {
    const mockRiskScore = Math.floor(Math.random() * 100);
    let riskLevel: AmlCheckResponse['risk_level'] = 'LOW';
    let decision: AmlCheckResponse['decision'] = 'ALLOW';

    if (mockRiskScore > 75) {
      riskLevel = 'CRITICAL';
      decision = 'BLOCK';
    } else if (mockRiskScore > 50) {
      riskLevel = 'HIGH';
      decision = 'REVIEW';
    } else if (mockRiskScore > 25) {
      riskLevel = 'MEDIUM';
      decision = 'REVIEW';
    }

    return {
      risk_score: mockRiskScore,
      risk_level: errorMode ? 'MEDIUM' : riskLevel,
      decision: errorMode ? 'REVIEW' : decision,
      explanation: errorMode
        ? ['AML service unavailable', 'Manual review required']
        : ['Mock AML check - no issues detected'],
      evidence: {
        blacklist_match: false,
        scam_reports: 0,
        velocity_count: Math.floor(Math.random() * 10),
        wallet_age_days: Math.floor(Math.random() * 365),
      },
      recommendations: errorMode
        ? ['Check AML service status', 'Manual verification required']
        : ['Transaction approved'],
      transaction_log_id: `mock_${Date.now()}`,
      processing_time_ms: Math.floor(Math.random() * 100),
    };
  }

  /**
   * Интерпретация решения AML
   */
  interpretDecision(decision: AmlCheckResponse['decision']): {
    allow: boolean;
    requiresManualReview: boolean;
    reason: string;
  } {
    switch (decision) {
      case 'ALLOW':
        return {
          allow: true,
          requiresManualReview: false,
          reason: 'AML check passed',
        };
      case 'REVIEW':
        return {
          allow: false,
          requiresManualReview: true,
          reason: 'Requires manual review',
        };
      case 'BLOCK':
        return {
          allow: false,
          requiresManualReview: false,
          reason: 'Blocked by AML rules',
        };
      default:
        return {
          allow: false,
          requiresManualReview: true,
          reason: 'Unknown decision',
        };
    }
  }
}
