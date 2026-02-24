'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminHeader } from '@/components/AdminHeader';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface FraudAlert {
  id: string;
  userId: string;
  type: string;
  status: string;
  score: number;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  user: {
    username: string;
    telegramId: string;
    riskScore: number;
  };
}

export default function FraudAdminPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'CONFIRMED'>('OPEN');

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    loadAlerts();
  }, [router, filter]);

  const loadAlerts = async () => {
    try {
      const { data } = await api.get('/fraud/alerts', {
        params: { status: filter !== 'all' ? filter : undefined },
        headers: { 'x-admin-session': process.env.NEXT_PUBLIC_ADMIN_SESSION_TOKEN },
      });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: 'REVIEWING' | 'RESOLVED' | 'CONFIRMED') => {
    try {
      await api.post(
        `/fraud/alerts/${alertId}/status`,
        { status, adminId: 'admin' },
        { headers: { 'x-admin-session': process.env.NEXT_PUBLIC_ADMIN_SESSION_TOKEN } }
      );
      loadAlerts();
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      await api.post(
        `/fraud/users/${userId}/unblock`,
        {},
        { headers: { 'x-admin-session': process.env.NEXT_PUBLIC_ADMIN_SESSION_TOKEN } }
      );
      loadAlerts();
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      VELOCITY: 'text-yellow-500',
      AMOUNT: 'text-red-500',
      MULTI_ACCOUNT: 'text-purple-500',
      BEHAVIOR: 'text-blue-500',
      CANCEL_RATE: 'text-orange-500',
      DISPUTE_RATE: 'text-pink-500',
    };
    return colors[type] || 'text-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      OPEN: <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">Открыт</span>,
      REVIEWING: <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">На проверке</span>,
      RESOLVED: <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">Решён</span>,
      CONFIRMED: <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">Подтверждён</span>,
    };
    return badges[status] || null;
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Фрод-алерты</h1>
          
          <div className="flex gap-2">
            {(['all', 'OPEN', 'REVIEWING', 'RESOLVED', 'CONFIRMED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-black'
                    : 'bg-card text-gray-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Все' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-bgdark">
              <tr>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Статус</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Тип</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Счет</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Пользователь</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Описание</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Дата</th>
                <th className="text-left text-sm text-gray-400 font-medium px-6 py-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-t border-gray-800">
                  <td className="px-6 py-4">{getStatusBadge(alert.status)}</td>
                  <td className={`px-6 py-4 font-medium ${getTypeColor(alert.type)}`}>
                    {alert.type}
                  </td>
                  <td className={`px-6 py-4 font-bold ${getScoreColor(alert.score)}`}>
                    {alert.score}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white text-sm">{alert.user.username}</div>
                      <div className="text-gray-500 text-xs">{alert.user.telegramId}</div>
                      <div className={`text-xs mt-1 ${getScoreColor(alert.user.riskScore)}`}>
                        Risk: {alert.user.riskScore}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-white text-sm truncate">{alert.title}</div>
                    {alert.description && (
                      <div className="text-gray-500 text-xs truncate">{alert.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(alert.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {alert.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'REVIEWING')}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Взять в работу"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Ложный"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'CONFIRMED')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Подтвердить фрод"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {alert.status === 'CONFIRMED' && (
                        <button
                          onClick={() => unblockUser(alert.userId)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Разблокировать"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {alerts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Нет алертов для отображения
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
