import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, MessageCircle, User, LogOut, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/categories', label: 'Categories' },
    { path: '/products', label: 'Products' },
    { path: '/community', label: 'Community' },
    { path: '/chat', label: 'AI Chat' },
    { path: '/support', label: 'Support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl transition-transform group-hover:scale-105">
            🏺
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg font-bold leading-tight text-foreground">LocalFinds</h1>
            <p className="text-xs text-muted-foreground">Discover Indigenous Products</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 bg-muted/50 border-transparent focus:border-primary" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>AI Assistant</span>
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 text-left">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Login / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
