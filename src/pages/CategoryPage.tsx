import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockProducts';
import { PRODUCT_CATEGORIES } from '@/types/product';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => p.category.id === categoryId);
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">This category doesn't exist.</p>
          <Link to="/products"><Button>Browse Products</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Category Header */}
        <section className="py-12 md:py-16 bg-muted/30 border-b border-border">
          <div className="container">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{category.icon}</div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</Badge>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                No products have been added to the {category.name} category yet. Be the first to contribute!
              </p>
              <Link to="/chat">
                <Button variant="outline">Contribute via AI Chat</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default CategoryPage;
