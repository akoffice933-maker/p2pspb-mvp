'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useWebSocketContext } from './WebSocketProvider';

export function Notifications() {
  const { notifications, clearNotifications } = useWebSocketContext();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-500/10 border-green-500/30';
      case 'ERROR':
        return 'bg-red-500/10 border-red-500/30';
      case 'WARNING':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm ${getBgColor(
            notification.type
          )}`}
        >
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{notification.title}</p>
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => clearNotifications()}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
