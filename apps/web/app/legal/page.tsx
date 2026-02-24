import { Shield, AlertTriangle, AlertCircle, Scale } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-bgdark">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Правовая информация</h1>
        </div>

        <div className="space-y-8">
          {/* Критическое предупреждение */}
          <div className="bg-danger/10 border-2 border-danger/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-danger mb-2">
                  КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Используя этот сервис, вы подтверждаете, что:
                </p>
                <ul className="mt-3 space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-danger mt-1">•</span>
                    <span>Достигли 18 лет и обладаете полной дееспособностью</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger mt-1">•</span>
                    <span>Действуете в рамках законодательства вашей юрисдикции</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger mt-1">•</span>
                    <span>Понимаете риски операций с криптовалютами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger mt-1">•</span>
                    <span>Самостоятельно несёте ответственность за уплату налогов</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              1. Статус сервиса
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              P2PSPB является <strong className="text-white">информационной платформой</strong> для размещения объявлений о купле-продаже криптовалюты. 
              Сервис <strong className="text-white">НЕ является</strong>:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✗</span>
                <span>Обменным пунктом или платёжным агентом</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✗</span>
                <span>Финансовым учреждением или банком</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✗</span>
                <span>Гарантом сделок (только арбитраж при спорах)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✗</span>
                <span>Хранителем средств пользователей</span>
              </li>
            </ul>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              2. Предупреждение о рисках
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-400 leading-relaxed mb-3">
                  <strong className="text-white">Криптовалюты являются высокорисковым активом.</strong> Вы можете потерять все вложенные средства.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Курсы криптовалют могут изменяться на 20-50% и более в течение короткого периода времени. 
                  Прошлые результаты не гарантируют будущих доходов.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              3. Законодательство РФ (2026)
            </h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-yellow-500">Внимание:</strong> Согласно Федеральному закону № 259-ФЗ «О цифровых финансовых активах», 
                операции с криптовалютами на территории РФ подлежат обязательному декларированию и налогообложению.
              </p>
            </div>
            <p className="text-gray-400 leading-relaxed mb-3">
              Используя сервис, вы обязуетесь:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Самостоятельно декларировать доходы от операций с криптовалютой</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Уплачивать НДФЛ (13-15%) с прибыли от сделок</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Соблюдать требования валютного законодательства</span>
              </li>
            </ul>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              4. Ответственность пользователей
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              <strong className="text-white">Вы несёте полную ответственность</strong> за:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Соответствие вашей деятельности применимому законодательству</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Уплату всех необходимых налогов и сборов</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Проверку контрагента перед совершением сделки</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Сохранность ваших учётных данных</span>
              </li>
            </ul>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              5. Ограничения
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Сервис <strong className="text-white">не обслуживает</strong>:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-danger mt-1">✗</span>
                <span>Лиц младше 18 лет</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger mt-1">✗</span>
                <span>Лиц из санкционных списков</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger mt-1">✗</span>
                <span>Лиц, действующих от имени третьих лиц без надлежащих полномочий</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-danger mt-1">✗</span>
                <span>Лиц, преследующих незаконные цели (отмывание, финансирование терроризма)</span>
              </li>
            </ul>
          </section>

          <section className="bg-card rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              6. Контакты и жалобы
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              По всем вопросам и для подачи жалоб:
            </p>
            <div className="space-y-2 text-gray-400">
              <p>Telegram-бот: @P2PSPB_bot</p>
              <p>Email для юридических вопросов: legal@p2pspb.com</p>
            </div>
            <p className="text-gray-400 leading-relaxed mt-4">
              Срок рассмотрения жалоб: до 5 рабочих дней
            </p>
          </section>

          <div className="border-t border-gray-800 pt-6 text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Последнее обновление: 24 февраля 2026 г.
            </p>
            <p className="mt-2">
              Версия документа: 2.0 (с учётом требований законодательства РФ 2026)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
