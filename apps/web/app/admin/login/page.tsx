'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, Loader2, Key } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/admin/login', {
        username,
        password,
        otp: otp || undefined,
      }, {
        withCredentials: true, // Важно для cookies
      });

      if (data.requires2FA && !otp) {
        setShow2FA(true);
        setError('Введите код 2FA');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch (err: any) {
      if (err.response?.status === 401 && err.response?.data?.message === '2FA code required') {
        setShow2FA(true);
        setError('Введите код 2FA');
      } else {
        setError(err.response?.data?.message || 'Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bgdark">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-white">P2PSPB Admin</span>
            </div>
            <p className="text-gray-400">Вход в панель администратора</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!show2FA && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Логин
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-bgdark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="admin"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bgdark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {show2FA && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Key className="w-4 h-4 inline mr-1" />
                  Код 2FA
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-bgdark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-center tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-danger text-sm text-center bg-danger/10 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Вход...' : (show2FA ? 'Подтвердить' : 'Войти')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
