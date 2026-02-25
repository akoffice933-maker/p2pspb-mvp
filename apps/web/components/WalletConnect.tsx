'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Подключить
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Неправильная сеть
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Индикатор сети */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-gray-800">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-gray-300">{chain.name}</span>
                  </div>

                  {/* Кнопка аккаунта */}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 bg-card hover:bg-card/80 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-gray-300">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
