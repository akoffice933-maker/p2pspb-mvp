'use client';

import { useOrders } from '@/hooks/useOrders';
import { OfferCard } from './OfferCard';
import { Loader2, Filter } from 'lucide-react';
import { useState } from 'react';

export function OrdersSection() {
  const [filter, setFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active');
  const { orders, isLoading } = useOrders(
    filter !== 'all' ? { type: filter } : undefined
  );

  const filteredOrders = orders.filter((order: any) => {
    if (statusFilter === 'active') {
      return ['ACTIVE', 'RESERVED', 'PAYMENT_PENDING'].includes(order.status);
    }
    return true;
  });

  return (
    <section id="orders" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Актуальные заявки
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Выберите подходящее предложение и свяжитесь с контрагентом через Telegram-бота
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Тип:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-black'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('BUY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'BUY'
                ? 'bg-success text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Покупка
          </button>
          <button
            onClick={() => setFilter('SELL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'SELL'
                ? 'bg-danger text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Продажа
          </button>

          <div className="flex items-center gap-2 ml-4 mr-2">
            <span className="text-sm text-gray-400">Статус:</span>
          </div>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-primary text-black'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-card text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Все
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Нет активных заявок. Будьте первым!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredOrders.map((order: any) => (
              <OfferCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
