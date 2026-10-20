import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ScrollProgress from '@/components/ScrollProgress';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import VelocityMarquee from '@/components/VelocityMarquee';
import Manifesto from '@/components/Manifesto';
import FeaturedShowcase from '@/components/FeaturedShowcase';
import ProductGrid from '@/components/ProductGrid';
import Stats from '@/components/Stats';
import Footer from '@/components/Footer';
import CartSheet from '@/components/CartSheet';
import LiveActivity from '@/components/LiveActivity';
import AdminPage from '@/components/admin/AdminPage';
import { Toaster } from '@/components/ui/sonner';
import { fetchCategories, fetchFeatured } from '@/features/products/productsSlice';
import { useHashRoute } from '@/hooks/useHashRoute';
import { startLiveStream } from '@/lib/liveStream';

function Storefront() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <VelocityMarquee />
        <Manifesto />
        <FeaturedShowcase />
        <ProductGrid />
        <Stats />
      </main>
      <Footer />
      <CartSheet />
      <LiveActivity />
    </>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const route = useHashRoute();

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
    return startLiveStream(dispatch); // SSE: live stock, purchases and catalogue changes
  }, [dispatch]);

  return (
    <>
      {route === 'admin' ? <AdminPage /> : <Storefront />}
      <Toaster />
    </>
  );
}
