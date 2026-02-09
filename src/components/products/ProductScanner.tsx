import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ScanLine, X } from 'lucide-react';
import type { DbProduct } from '@/hooks/useProducts';

const ProductScanner = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DbProduct[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,category_name.ilike.%${query}%,location_state.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      setResults((data as unknown as DbProduct[]) || []);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <ScanLine className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Product Scanner</h2>
        <p className="text-muted-foreground mt-1">Search for registered products by name, category, or location</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter product name, category, or location..."
            className="pl-10"
          />
        </div>
        {searched && (
          <Button variant="ghost" size="icon" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={handleSearch} disabled={loading || !query.trim()} variant="hero">
          {loading ? 'Scanning...' : 'Scan'}
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <div className="max-w-3xl mx-auto">
          {results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{results.length} product(s) found</p>
              {results.map(product => (
                <div key={product.id} className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category_icon} {product.category_name} • {product.location_state}{product.location_district ? `, ${product.location_district}` : ''}
                      </p>
                    </div>
                    <Badge variant={product.review_status === 'approved' ? 'default' : 'secondary'}>
                      {product.review_status}
                    </Badge>
                  </div>
                  {product.description && <p className="text-sm text-muted-foreground mb-3">{product.description}</p>}
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {product.importance && (
                      <div><span className="font-medium text-foreground">Importance:</span> <span className="text-muted-foreground">{product.importance}</span></div>
                    )}
                    {product.daily_life_uses && (
                      <div><span className="font-medium text-foreground">Daily Uses:</span> <span className="text-muted-foreground">{product.daily_life_uses}</span></div>
                    )}
                    {product.how_to_use && (
                      <div><span className="font-medium text-foreground">How to Use:</span> <span className="text-muted-foreground">{product.how_to_use}</span></div>
                    )}
                    {product.where_to_find && (
                      <div><span className="font-medium text-foreground">Where to Find:</span> <span className="text-muted-foreground">{product.where_to_find}</span></div>
                    )}
                    {product.price && (
                      <div><span className="font-medium text-foreground">Price:</span> <span className="text-muted-foreground">{product.price}</span></div>
                    )}
                    {product.cultural_background && (
                      <div className="sm:col-span-2"><span className="font-medium text-foreground">Cultural Background:</span> <span className="text-muted-foreground">{product.cultural_background}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Product not found</h3>
              <p className="text-muted-foreground mb-4">This product isn't registered yet. You can contribute its information through our community chatbot!</p>
              <Button variant="outline" onClick={() => window.location.href = '/chat'}>
                Open AI Chatbot
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductScanner;
