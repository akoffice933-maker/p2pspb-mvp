'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, Key, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Admin2FAPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    check2FAStatus();
  }, [router]);

  const check2FAStatus = async () => {
    try {
      const { data } = await api.get('/admin/me', { withCredentials: true });
      setEnabled(data.user?.twoFactorEnabled || false);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      setError('');
      const { data } = await api.post('/admin/2fa/setup', {}, { withCredentials: true });
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка настройки 2FA');
    }
  };

  const enable2FA = async () => {
    try {
      setError('');
      await api.post('/admin/2fa/enable', { otp }, { withCredentials: true });
      setSuccess('2FA успешно включён!');
      setQrCodeUrl('');
      setSecret('');
      setOtp('');
      setEnabled(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный код 2FA');
    }
  };

  const disable2FA = async () => {
    if (!confirm('Вы уверены, что хотите отключить 2FA?')) return;

    try {
      setError('');
      await api.post('/admin/2fa/disable', { otp }, { withCredentials: true });
      setSuccess('2FA успешно отключён!');
      setOtp('');
      setEnabled(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный код 2FA');
    }
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
      <div className="border-b border-gray-800 bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-white">P2PSPB Admin</span>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Назад
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Двухфакторная аутентификация</h1>

        {success && (
          <div className="bg-success/10 border border-success/30 text-success p-4 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-lg mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-card rounded-xl border border-gray-800 p-6">
          {enabled ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  2FA включён
                </h2>
                <p className="text-gray-400">
                  Ваш аккаунт защищён двухфакторной аутентификацией
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Код 2FA для отключения
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-bgdark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-center tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={disable2FA}
                  className="w-full bg-danger hover:bg-danger/90 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Отключить 2FA
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Настройка 2FA
                </h2>
                <p className="text-gray-400">
                  Защитите свой аккаунт двухфакторной аутентификацией
                </p>
              </div>

              {!qrCodeUrl ? (
                <button
                  onClick={setup2FA}
                  className="w-full bg-primary hover:bg-primary/90 text-black py-3 rounded-lg font-medium transition-colors"
                >
                  Начать настройку
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-4">
                      1. Отсканируйте QR-код в приложении аутентификации
                    </p>
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="mx-auto border-4 border-white rounded-lg"
                      />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">
                      2. Или введите секрет вручную:
                    </p>
                    <code className="bg-bgdark px-4 py-2 rounded text-primary text-sm break-all">
                      {secret}
                    </code>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      3. Введите код из приложения
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-bgdark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-center tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={enable2FA}
                    className="w-full bg-success hover:bg-success/90 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Включить 2FA
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
