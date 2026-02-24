import { Shield, Clock, Users, Headphones } from 'lucide-react';

export function Features() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Как это работает
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Простой и безопасный процесс обмена криптовалют через наш P2P-сервис
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Проверенные участники</h3>
            <p className="text-gray-400">
              Только верифицированные пользователи с подтверждённой репутацией
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Безопасные сделки</h3>
            <p className="text-gray-400">
              Арбитраж при спорах и гарантия исполнения обязательств
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Быстрые переводы</h3>
            <p className="text-gray-400">
              Моментальное исполнение сделок через СБП или наличные
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Поддержка 24/7</h3>
            <p className="text-gray-400">
              Круглосуточная помощь в решении любых вопросов
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
