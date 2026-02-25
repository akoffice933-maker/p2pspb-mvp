'use client';

import { useAccount, useBalance, useToken } from 'wagmi';
import { Coins, Loader2 } from 'lucide-react';

// Адрес токена PSPB (замените после деплоя)
const PSPB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PSPB_TOKEN_ADDRESS as `0x${string}`;

export function PSPBBalance() {
  const { address, isConnected } = useAccount();

  // Баланс ETH
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    watch: true,
  });

  // Баланс PSPB токенов
  const { data: pspbBalance, isLoading: pspbLoading } = useToken({
    address: PSPB_TOKEN_ADDRESS,
    watch: true,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Балансы</h3>
      </div>

      <div className="space-y-4">
        {/* ETH баланс */}
        <div>
          <div className="text-sm text-gray-400 mb-1">ETH</div>
          {ethLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <div className="text-xl font-bold text-white">
              {ethBalance?.formatted.slice(0, 6) || '0'} {ethBalance?.symbol}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            ≈ ${((parseFloat(ethBalance?.formatted || '0') * 2000)).toFixed(2)}
          </div>
        </div>

        {/* PSPB баланс */}
        <div>
          <div className="text-sm text-gray-400 mb-1">PSPB Token</div>
          {pspbLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <div className="text-xl font-bold text-primary">
              {pspbBalance?.symbol || 'PSPB'}: {parseFloat(pspbBalance?.formatted || '0').toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Кнопка для получения airdrop */}
      <button
        className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-2 rounded-lg text-sm font-medium transition-colors"
        onClick={() => alert('Airdrop claim будет доступен после деплоя контракта')}
      >
        Claim Airdrop (1000 PSPB)
      </button>
    </div>
  );
}
