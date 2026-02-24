import { TrendingUp, TrendingDown, Star, Shield, Clock } from 'lucide-react';

interface Order {
  id: string;
  type: string;
  rate: number;
  minLimit: number;
  maxLimit: number;
  amount: number;
  reservedAmount?: number;
  paymentMethods: string[];
  status: string;
  user: {
    username: string;
    reputationScore: number;
    totalTrades: number;
  };
  seller?: {
    id: string;
    username: string;
    reputationScore: number;
    totalTrades: number;
  };
  buyer?: {
    id: string;
    username: string;
    reputationScore: number;
    totalTrades: number;
  };
  createdAt: string;
  expiresAt?: string;
}

interface OfferCardProps {
  order: Order;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  ACTIVE: 'Активна',
  RESERVED: 'Зарезервирована',
  PAYMENT_PENDING: 'Ожидает оплаты',
  PAID: 'Оплачена',
  CONFIRMED: 'Подтверждена',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
  DISPUTED: 'Спор',
  RESOLVED: 'Решена',
  HIDDEN: 'Скрыта',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-700 text-gray-400',
  ACTIVE: 'bg-success/10 text-success',
  RESERVED: 'bg-primary/10 text-primary',
  PAYMENT_PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAID: 'bg-blue-500/10 text-blue-500',
  CONFIRMED: 'bg-purple-500/10 text-purple-500',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
  DISPUTED: 'bg-orange-500/10 text-orange-500',
  RESOLVED: 'bg-green-500/10 text-green-500',
  HIDDEN: 'bg-gray-700 text-gray-500',
};

export function OfferCard({ order }: OfferCardProps) {
  const isBuy = order.type.toUpperCase() === 'BUY';
  const statusLabel = statusLabels[order.status] || order.status;
  const statusColor = statusColors[order.status] || 'bg-gray-700 text-gray-400';

  const isActive = ['ACTIVE', 'RESERVED', 'PAYMENT_PENDING'].includes(order.status);

  return (
    <div className={`rounded-xl border p-6 transition-colors ${
      isActive 
        ? 'bg-card border-gray-800 hover:border-gray-700' 
        : 'bg-card/50 border-gray-800/50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-success/10' : 'bg-danger/10'}`}>
            {isBuy ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isBuy ? 'text-success' : 'text-danger'}`}>
                {isBuy ? 'Покупка' : 'Продажа'}
              </span>
              <span className="text-xs text-gray-500">{order.pair || 'USDT/RUB'}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {order.rate.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </div>
          {order.seller && (
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {order.seller.reputationScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Лимиты:</span>
          <span className="text-white">
            {order.minLimit.toLocaleString('ru-RU')} - {order.maxLimit.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Доступно:</span>
          <span className="text-white">{order.amount?.toLocaleString('ru-RU') || order.availableAmount?.toLocaleString('ru-RU')} USDT</span>
        </div>
        {order.reservedAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Зарезервировано:</span>
            <span className="text-primary">{order.reservedAmount.toLocaleString('ru-RU')} USDT</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Оплата:</span>
          <div className="flex gap-2">
            {order.paymentMethods.map((method) => (
              <span
                key={method}
                className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs"
              >
                {method === 'sbp' ? 'СБП' : method === 'cash' ? 'Наличные' : method.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        {order.expiresAt && isActive && (
          <div className="flex items-center gap-2 text-xs text-yellow-500">
            <Clock className="w-4 h-4" />
            <span>
              Истекает: {new Date(order.expiresAt).toLocaleString('ru-RU')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">
            {order.seller?.username || order.user?.username || 'Аноним'}
          </span>
          <span className="text-xs text-gray-500">
            ({order.seller?.totalTrades || order.user?.totalTrades || 0} сделок)
          </span>
        </div>
        {isActive ? (
          <a
            href="https://t.me/P2PSPB_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Связаться
          </a>
        ) : (
          <span className="text-gray-500 text-sm">Неактивно</span>
        )}
      </div>
    </div>
  );
}
