import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Scan, Sparkles, MapPin } from 'lucide-react';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden section-pattern">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light border border-sage/20 text-sage text-sm font-medium animate-fade-up">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Local Discovery</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Discover the <span className="text-gradient">Treasures</span> of Local Heritage
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Explore indigenous products, herbal medicines, traditional crafts, and cultural artifacts 
            from local communities. Powered by community knowledge and AI assistance.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative flex gap-2 p-2 bg-card rounded-2xl border border-border shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, herbs, crafts, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="px-6">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate('/scan')}>
              <Scan className="h-5 w-5" />
              Scan Product
            </Button>
            <Button variant="ghost" size="lg" className="gap-2" onClick={() => navigate('/chat')}>
              <Sparkles className="h-5 w-5" />
              Ask AI Assistant
            </Button>
            <Button variant="ghost" size="lg" className="gap-2" onClick={() => navigate('/products?filter=nearby')}>
              <MapPin className="h-5 w-5" />
              Near Me
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-8 mt-8 border-t border-border/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { value: '500+', label: 'Local Products' },
              { value: '50+', label: 'Categories' },
              { value: '100+', label: 'Communities' },
              { value: '1000+', label: 'Contributors' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
