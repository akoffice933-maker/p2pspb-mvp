'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BarChart3, AlertTriangle } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800 bg-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-white">P2PSPB Admin</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            className={`flex items-center gap-2 text-sm transition-colors ${
              pathname === '/admin'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Заявки
          </Link>
          <Link
            href="/admin/fraud"
            className={`flex items-center gap-2 text-sm transition-colors ${
              pathname === '/admin/fraud'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Anti-Fraud
          </Link>
        </nav>
      </div>
    </header>
  );
}
