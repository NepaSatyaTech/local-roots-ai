import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { ArrowRight, TrendingUp } from 'lucide-react';

const TrendingProducts = () => {
  const trendingProducts = mockProducts.filter((p) => p.trending).slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-terracotta-light/30 to-transparent">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 text-amber text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Community Favorites
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Products that are gaining popularity in our community right now
            </p>
          </div>
          <Link to="/products?filter=trending">
            <Button variant="outline" className="gap-2 group">
              View All Trending
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {trendingProducts.map((product, index) => (
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

export default TrendingProducts;
