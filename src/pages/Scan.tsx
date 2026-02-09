import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductScanner from '@/components/products/ProductScanner';
import ChatWidget from '@/components/chat/ChatWidget';

const ScanPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <ProductScanner />
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default ScanPage;
