import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ChatWidget from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockProducts';
import { PRODUCT_CATEGORIES } from '@/types/product';
import { Search, X, Grid, List, SlidersHorizontal, MapPin } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique cities from products
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    mockProducts.forEach(p => {
      if (p.location.localArea) citySet.add(p.location.localArea);
      if (p.location.district) citySet.add(p.location.district);
    });
    return Array.from(citySet).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.name.toLowerCase().includes(query) ||
          p.location.state.toLowerCase().includes(query) ||
          p.location.localArea.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      products = products.filter((p) => p.category.id === selectedCategory);
    }

    if (selectedCity) {
      products = products.filter(
        (p) => p.location.localArea === selectedCity || p.location.district === selectedCity
      );
    }

    const filter = searchParams.get('filter');
    if (filter === 'featured') {
      products = products.filter((p) => p.featured);
    } else if (filter === 'trending') {
      products = products.filter((p) => p.trending);
    }

    return products;
  }, [searchQuery, selectedCategory, selectedCity, searchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedCity(null);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCity || searchParams.get('filter');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12 border-b border-border bg-muted/30">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Explore Products</h1>
            <p className="text-muted-foreground">Discover indigenous products from local communities across the region</p>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> City / Area
                  </h3>
                  <Select value={selectedCity || ''} onValueChange={(v) => setSelectedCity(v || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Categories</h3>
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" /> Clear Filters
                  </Button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-6">
                <Button variant="outline" className="lg:hidden gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {hasActiveFilters && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">!</Badge>}
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{filteredProducts.length} products</span>
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                      <Grid className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters Panel */}
              {showFilters && (
                <div className="lg:hidden mb-6 p-4 rounded-xl bg-muted/50 border border-border space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={selectedCity || ''} onValueChange={(v) => setSelectedCity(v || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <Badge key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}>
                        {category.icon} {category.name}
                      </Badge>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" /> Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" /> {selectedCity}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity(null)} />
                    </Badge>
                  )}
                  {searchParams.get('filter') && (
                    <Badge variant="secondary" className="gap-1">
                      {searchParams.get('filter')}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => { const p = new URLSearchParams(searchParams); p.delete('filter'); setSearchParams(p); }} />
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                  <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Products;
