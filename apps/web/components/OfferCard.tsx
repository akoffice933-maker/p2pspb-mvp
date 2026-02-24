import { TrendingUp, TrendingDown, Star, Shield } from 'lucide-react';

interface Order {
  id: string;
  type: string;
  rate: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string[];
  user: {
    username: string;
    reputationScore: number;
    totalTrades: number;
  };
  createdAt: string;
}

interface OfferCardProps {
  order: Order;
}

export function OfferCard({ order }: OfferCardProps) {
  const isBuy = order.type.toUpperCase() === 'BUY';

  return (
    <div className="bg-card rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
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

        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{order.user.reputationScore.toFixed(1)}</span>
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
          <span className="text-white">{order.availableAmount.toLocaleString('ru-RU')} USDT</span>
        </div>
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
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">{order.user.username}</span>
          <span className="text-xs text-gray-500">({order.user.totalTrades} сделок)</span>
        </div>
        <a
          href="https://t.me/P2PSPB_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Связаться
        </a>
      </div>
    </div>
  );
}
