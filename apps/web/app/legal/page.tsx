import { Shield, AlertTriangle } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-bgdark">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Правовая информация</h1>
        </div>

        <div className="space-y-8">
          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              1. Общие положения
            </h2>
            <p className="text-gray-400 leading-relaxed">
              P2PSPB является информационным сервисом, предоставляющим площадку для размещения 
              объявлений о купле-продаже криптовалюты. Сервис не является обменным пунктом, 
              финансовым учреждением или платёжным агентом.
            </p>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              2. Статус сервиса
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              P2PSPB предоставляет исключительно информационные услуги по размещению объявлений. 
              Все сделки совершаются напрямую между пользователями без участия администрации сервиса.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Сервис не хранит средства пользователей, не проводит финансовые операции и не несёт 
              ответственности за действия контрагентов.
            </p>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              3. Предупреждение о рисках
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 leading-relaxed">
                Криптовалюты являются высокорисковым активом. Перед совершением сделок убедитесь, 
                что вы понимаете все риски и действуете в рамках законодательства вашей юрисдикции.
              </p>
            </div>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              4. Ответственность пользователей
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Пользователи несут полную ответственность за соблюдение применимого законодательства, 
              включая налоговые обязательства. Используя сервис, вы подтверждаете, что имеете право 
              совершать операции с криптовалютой в вашей юрисдикции.
            </p>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              5. Контакты
            </h2>
            <p className="text-gray-400 leading-relaxed">
              По всем вопросам обращайтесь через Telegram-бот: @P2PSPB_bot
            </p>
          </section>

          <div className="border-t border-gray-800 pt-6 text-sm text-gray-500">
            <p>Последнее обновление: 2024 г.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
