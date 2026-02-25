'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Wallet, Coins, History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PSPBBalance } from '@/components/PSPBBalance';
import { OnChainHistory } from '@/components/OnChainHistory';

export default function ProfilePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bgdark flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Кошелёк не подключён
          </h2>
          <p className="text-gray-400 mb-4">
            Подключите кошелёк для просмотра профиля
          </p>
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgdark">
      {/* Header */}
      <div className="border-b border-gray-800 bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Профиль</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Адрес кошелька */}
        <div className="bg-card rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold text-white">Ваш кошелёк</h2>
          </div>
          <div className="bg-bgdark rounded-lg p-4 font-mono text-sm break-all">
            <span className="text-gray-300">{address}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Сеть: Ethereum (Sepolia Testnet)
          </div>
        </div>

        {/* Балансы */}
        <PSPBBalance />

        {/* История */}
        <div className="mt-6">
          <OnChainHistory />
        </div>

        {/* Действия */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => alert('Функция будет доступна после деплоя')}
            className="bg-primary hover:bg-primary/90 text-black py-3 rounded-lg font-medium transition-colors"
          >
            Claim Airdrop
          </button>
          <button
            onClick={() => alert('Функция будет доступна после деплоя')}
            className="bg-card hover:bg-card/80 border border-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Stake PSPB
          </button>
        </div>
      </div>
    </div>
  );
}
