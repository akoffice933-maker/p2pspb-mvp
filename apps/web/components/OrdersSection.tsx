'use client';

import { useOrders } from '@/hooks/useOrders';
import { OfferCard } from './OfferCard';
import { Loader2, Filter, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { useState } from 'react';

type SortBy = 'createdAt' | 'rate' | 'amount';
type SortOrder = 'asc' | 'desc';

export function OrdersSection() {
  const [filter, setFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data, isLoading } = useOrders(
    filter !== 'all' ? { type: filter } : undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  );

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const filteredOrders = orders.filter((order: any) => {
    if (statusFilter === 'active') {
      return ['ACTIVE', 'RESERVED', 'PAYMENT_PENDING'].includes(order.status);
    }
    return true;
  });

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <section id="orders" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Актуальные заявки
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Выберите подходящее предложение и свяжитесь с контрагентом через Telegram-бота
        </p>

        {/* Фильтры */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Тип:</span>
          </div>
          <button
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-black'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => { setFilter('BUY'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'BUY'
                ? 'bg-success text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Покупка
          </button>
          <button
            onClick={() => { setFilter('SELL'); setPage(1); }}
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

        {/* Сортировка */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleSort('createdAt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'createdAt'
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            {sortBy === 'createdAt' ? (
              sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
            ) : null}
            Дата
          </button>
          <button
            onClick={() => handleSort('rate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'rate'
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            {sortBy === 'rate' ? (
              sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
            ) : null}
            Курс
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'amount'
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            {sortBy === 'amount' ? (
              sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
            ) : null}
            Сумма
          </button>
        </div>

        {/* Заявки */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Нет активных заявок. Будьте первым!
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {filteredOrders.map((order: any) => (
                <OfferCard key={order.id} order={order} />
              ))}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-card text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-400">
                  Страница {page} из {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg bg-card text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
