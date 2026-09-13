import './globals.css';
import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { TopBanner } from '@/components/TopBanner';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Luxora Perfume Shop | Shine Through Fragrance',
  description: 'Nước hoa chính hãng cao cấp, Body Mist, Lăn khử mùi & Bộ sưu tập sáp thơm Luxora. Nâng tầm cảm xúc với hương thơm quyến rũ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-pink-500 selection:text-white">
        <StoreProvider>
          <TopBanner />
          <Navbar />
          <main className="min-h-screen bg-zinc-50/30">
            {children}
          </main>
          <CartDrawer />
          <WishlistDrawer />
          <ProductDetailModal />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
