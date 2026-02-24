import { Shield, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-bgdark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                P2PSPB
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Закрытый P2P-сервис для обмена криптовалют в Санкт-Петербурге.
              Безопасно, анонимно, надёжно.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Главная
              </a>
              <a href="#orders" className="text-gray-400 hover:text-white transition-colors">
                Заявки
              </a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                Как работает
              </a>
              <a href="/legal" className="text-gray-400 hover:text-white transition-colors">
                Правовая информация
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://t.me/P2PSPB_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Telegram-бот
              </a>
              <span className="text-gray-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Санкт-Петербург
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 P2PSPB. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
