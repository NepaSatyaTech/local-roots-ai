import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin } from 'lucide-react';
import type { DbProduct } from '@/hooks/useProducts';
import type { DbCategory } from '@/hooks/useCategories';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<DbCategory | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch category
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId!)
        .single();

      if (catData) {
        setCategory(catData as unknown as DbCategory);
      }

      // Fetch products in this category
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId!)
        .eq('review_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (prodData) {
        setProducts(prodData as unknown as DbProduct[]);
      }

      setLoading(false);
    };

    if (categoryId) fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🏺</div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">This category doesn't exist.</p>
          <Link to="/categories"><Button>Browse Categories</Button></Link>
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
            <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{category.icon}</div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary">{products.length} product{products.length !== 1 ? 's' : ''}</Badge>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group block rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="text-xl">{product.category_icon}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">{product.category_name}</p>
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{product.location_local_area}{product.location_local_area && product.location_state ? ', ' : ''}{product.location_state}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {product.price && <span className="font-semibold text-foreground">₹{product.price}</span>}
                      <Badge variant="outline" className="text-xs">{product.availability}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                No products have been added to the {category.name} category yet.
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
