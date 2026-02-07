import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrendingProducts from '@/components/home/TrendingProducts';
import CommunitySection from '@/components/home/CommunitySection';
import ChatWidget from '@/components/chat/ChatWidget';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <TrendingProducts />
        <CommunitySection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
