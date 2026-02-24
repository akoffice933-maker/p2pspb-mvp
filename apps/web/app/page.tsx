import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { OrdersSection } from '@/components/OrdersSection';
import { Footer } from '@/components/Footer';
import { Notifications } from '@/components/Notifications';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <OrdersSection />
      <Footer />
      <Notifications />
    </main>
  );
}
