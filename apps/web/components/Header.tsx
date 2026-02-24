'use client';

import Link from 'next/link';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { connected } = useWebSocketContext();

  return (
    <header className="border-b border-gray-800 bg-bgdark/95 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
            P2PSPB
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/30">
            СПб
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Главная
          </Link>
          <Link href="#orders" className="text-gray-300 hover:text-white transition-colors">
            Заявки
          </Link>
          <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
            Как работает
          </Link>
          <Link href="/legal" className="text-gray-300 hover:text-white transition-colors">
            Правовая информация
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* WebSocket статус */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-gray-800">
            {connected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            <span className={`text-xs ${connected ? 'text-green-500' : 'text-gray-500'}`}>
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>

          <a
            href="https://t.me/P2PSPB_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Открыть бота
          </a>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-card p-4">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              Главная
            </Link>
            <Link
              href="#orders"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              Заявки
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              Как работает
            </Link>
            <Link
              href="/legal"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              Правовая информация
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
