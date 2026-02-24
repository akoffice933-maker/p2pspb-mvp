import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['cyrillic', 'latin'] });

export const metadata: Metadata = {
  title: 'P2PSPB | Закрытый P2P-обмен в Санкт-Петербурге',
  description: 'Безопасный P2P-обмен криптовалют в СПб. USDT/RUB, наличные, СБП. Без KYC, с арбитражем.',
  metadataBase: new URL('https://p2pspb.com'),
  openGraph: {
    title: 'P2PSPB',
    description: 'Закрытый P2P-обмен в Санкт-Петербурге',
    url: 'https://p2pspb.com',
    siteName: 'P2PSPB',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
