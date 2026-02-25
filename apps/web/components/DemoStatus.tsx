'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, CheckCircle } from 'lucide-react';

export function DemoStatus() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/demo/status');
      const data = await res.json();
      setEnabled(data.enabled);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const toggleDemo = async () => {
    const endpoint = enabled ? '/api/demo/stop' : '/api/demo/start';
    await fetch(endpoint, { method: 'POST' });
    fetchStatus();
  };

  if (loading) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-card border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
        {/* Индикатор */}
        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        
        {/* Текст */}
        <div>
          <div className="text-sm font-medium text-white">
            {enabled ? 'Demo Mode Active' : 'Demo Mode Inactive'}
          </div>
          <div className="text-xs text-gray-500">
            {enabled ? 'Auto-creating trades every 30s' : 'Click to enable'}
          </div>
        </div>

        {/* Кнопка */}
        <button
          onClick={toggleDemo}
          className={`p-2 rounded-lg transition-colors ${
            enabled
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
          }`}
        >
          {enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
