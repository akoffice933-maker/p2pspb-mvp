'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminHeader } from '@/components/AdminHeader';
import { Shield, Eye, EyeOff, Loader2, LogOut } from 'lucide-react';

interface Order {
  id: string;
  type: string;
  rate: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string[];
  status: string;
  user: {
    username: string;
    reputationScore: number;
    totalTrades: number;
  };
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders', {
        headers: { 'x-admin-session': process.env.NEXT_PUBLIC_ADMIN_SESSION_TOKEN },
      });
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const hideOrder = async (id: string) => {
    try {
      await api.post(
        '/admin/orders/hide',
        { id },
        { headers: { 'x-admin-session': process.env.NEXT_PUBLIC_ADMIN_SESSION_TOKEN } }
      );
      setHiddenIds(new Set([...hiddenIds, id]));
    } catch (error) {
      console.error('Failed to hide order:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgdark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgdark">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Управление заявками</h1>

        <div className="bg-card rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-bgdark">
              <tr>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Тип</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Курс</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Лимиты</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Доступно</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Пользователь</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Статус</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-t border-gray-800 ${
                    hiddenIds.has(order.id) ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        order.type === 'BUY' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {order.type === 'BUY' ? 'Покупка' : 'Продажа'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {order.rate.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {order.minLimit.toLocaleString('ru-RU')} - {order.maxLimit.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {order.availableAmount.toLocaleString('ru-RU')} USDT
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white text-sm">{order.user.username}</div>
                      <div className="text-gray-500 text-xs">
                        ★ {order.user.reputationScore.toFixed(1)} ({order.user.totalTrades} сделок)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === 'ACTIVE'
                          ? 'bg-success/10 text-success'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {order.status === 'ACTIVE' ? 'Активна' : 'Скрыта'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'ACTIVE' && !hiddenIds.has(order.id) ? (
                      <button
                        onClick={() => hideOrder(order.id)}
                        className="text-gray-400 hover:text-danger transition-colors"
                        title="Скрыть заявку"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Нет заявок
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
