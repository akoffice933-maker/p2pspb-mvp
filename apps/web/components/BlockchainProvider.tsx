'use client';

import { ReactNode, useState } from 'react';
import { WagmiConfig, createConfig, fallback, http } from 'wagmi';
import { sepolia, mainnet, polygon } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Конфигурация wagmi для P2PSPB
export const p2pspbConfig = createConfig({
  chains: [sepolia, mainnet, polygon],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default',
    }),
    injected(),
  ],
  transports: {
    [sepolia.id]: fallback([
      http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
      http('https://rpc.sepolia.org'),
    ]),
    [mainnet.id]: fallback([
      http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
      http('https://rpc.ankr.com/eth'),
    ]),
    [polygon.id]: fallback([
      http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL),
      http('https://rpc.ankr.com/polygon'),
    ]),
  },
});

// Создаём QueryClient для wagmi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 минута
      refetchOnWindowFocus: false,
    },
  },
});

interface BlockchainProviderProps {
  children: ReactNode;
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  const [config] = useState(p2pspbConfig);

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#F0B90B',
            accentColorForeground: 'black',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
