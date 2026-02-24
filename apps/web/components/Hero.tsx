export function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-bgdark to-black">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent mb-6">
          Закрытый P2P-обмен в Санкт-Петербурге
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Без KYC · Арбитраж при спорах · Только проверенные участники · Наличка, СБП, карты
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://t.me/P2PSPB_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Получить приглашение
          </a>
          <a
            href="#orders"
            className="bg-card hover:bg-card/80 border border-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Смотреть заявки
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">1000+</div>
            <div className="text-sm text-gray-400">сделок</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">4.9★</div>
            <div className="text-sm text-gray-400">средний рейтинг</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0%</div>
            <div className="text-sm text-gray-400">комиссия</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-gray-400">поддержка</div>
          </div>
        </div>
      </div>
    </section>
  );
}
