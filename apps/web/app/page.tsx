import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { OrdersSection } from '@/components/OrdersSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <OrdersSection />
      <Footer />
    </main>
  );
}
