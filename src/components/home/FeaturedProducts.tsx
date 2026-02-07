import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { ArrowRight, Sparkles } from 'lucide-react';

const FeaturedProducts = () => {
  const featuredProducts = mockProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Featured Collection</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Handpicked Local Treasures
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Discover our carefully curated selection of authentic indigenous products
            </p>
          </div>
          <Link to="/products?filter=featured">
            <Button variant="outline" className="gap-2 group">
              View All Featured
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
