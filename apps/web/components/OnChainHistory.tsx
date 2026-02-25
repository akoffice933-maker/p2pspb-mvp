'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { History, ExternalLink, Loader2 } from 'lucide-react';

interface Trade {
  id: number;
  type: string;
  amount: string;
  status: string;
  txHash: string;
  timestamp: string;
}

// Mock данные для демонстрации
const mockTrades: Trade[] = [
  {
    id: 1,
    type: 'SELL',
    amount: '100 USDT',
    status: 'Completed',
    txHash: '0x1234...5678',
    timestamp: '2026-02-24 10:30',
  },
  {
    id: 2,
    type: 'BUY',
    amount: '50 USDT',
    status: 'Pending',
    txHash: '0xabcd...efgh',
    timestamp: '2026-02-23 15:45',
  },
];

export function OnChainHistory() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [trades] = useState<Trade[]>(mockTrades);

  if (!isConnected) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: 'text-success',
      Pending: 'text-yellow-500',
      Cancelled: 'text-danger',
    };
    return colors[status] || 'text-gray-400';
  };

  const getTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-success' : 'text-danger';
  };

  return (
    <div className="bg-card rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">История сделок</h3>
        </div>
        <button
          onClick={() => setLoading(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Нет сделок в блокчейне
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 bg-bgdark rounded-lg border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`text-sm font-semibold ${getTypeColor(trade.type)}`}
                >
                  {trade.type}
                </div>
                <div className="text-sm text-white">{trade.amount}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`text-sm ${getStatusColor(trade.status)}`}>
                  {trade.status}
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Адрес кошелька: {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
    </div>
  );
}
