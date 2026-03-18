import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockProducts';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProducts } from '@/hooks/useSavedProducts';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, MapPin, Share2, Heart, MessageCircle, ExternalLink,
  Leaf, Utensils, BookOpen, History, ShoppingBag, Lock, Phone,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleSave, isSaved } = useSavedProducts();
  const product = mockProducts.find((p) => p.id === id);
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [sellerPhone, setSellerPhone] = useState('');

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products"><Button>Browse Products</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const availabilityColors = {
    available: 'bg-sage/10 text-sage border-sage/20',
    limited: 'bg-amber/10 text-amber border-amber/20',
    seasonal: 'bg-primary/10 text-primary border-primary/20',
    unavailable: 'bg-muted text-muted-foreground border-muted',
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: product.name, text: product.description, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Product link copied to clipboard' });
    }
  };

  const handleFindSeller = () => {
    setSellerDialogOpen(true);
  };

  const openWhatsApp = () => {
    const phone = sellerPhone.replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'Enter a phone number', variant: 'destructive' });
      return;
    }
    const msg = encodeURIComponent(`Hi, I'm interested in "${product.name}" listed on LocalFinds. Is it available?`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    setSellerDialogOpen(false);
  };

  const callSeller = () => {
    const phone = sellerPhone.replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'Enter a phone number', variant: 'destructive' });
      return;
    }
    window.open(`tel:+${phone}`, '_self');
    setSellerDialogOpen(false);
  };

  const saved = isSaved(product.id);

  const infoSections = [
    { icon: BookOpen, title: 'Description', content: product.description },
    { icon: Leaf, title: 'Importance', content: product.importance },
    { icon: Utensils, title: 'Daily Life Uses', content: product.dailyLifeUses },
    { icon: BookOpen, title: 'How to Use', content: product.howToUse },
    { icon: Leaf, title: 'Ingredients / Materials', content: product.ingredients },
    { icon: History, title: 'Cultural & Historical Background', content: product.culturalBackground },
    { icon: ShoppingBag, title: 'Where to Find / Buy', content: product.whereToFind },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted/30">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/products" className="text-muted-foreground hover:text-foreground">Products</Link>
              <span className="text-muted-foreground">/</span>
              <Link to={`/category/${product.category.id}`} className="text-muted-foreground hover:text-foreground">
                {product.category.name}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img src={product.images[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 ring-primary transition-all">
                      <img src={image} alt={`${product.name} ${index + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">{product.category.icon} {product.category.name}</Badge>
                {product.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
                {product.trending && <Badge className="bg-amber text-accent-foreground">Trending</Badge>}
                <Badge variant="outline" className={availabilityColors[product.availability]}>
                  {product.availability.charAt(0).toUpperCase() + product.availability.slice(1)}
                </Badge>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{product.location.localArea}, {product.location.district}, {product.location.state}, {product.location.country}</span>
              </div>

              {product.price && <div className="text-2xl font-bold text-primary">{product.price}</div>}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="lg" className="gap-2" onClick={handleFindSeller}>
                  <ExternalLink className="h-5 w-5" /> Find Seller
                </Button>
                <Button
                  variant={saved ? 'default' : 'outline'}
                  size="lg"
                  className="gap-2"
                  onClick={() => toggleSave(product.id)}
                >
                  <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
                  <Share2 className="h-5 w-5" /> Share
                </Button>
              </div>

              {/* Ask AI */}
              <div className="p-4 rounded-xl bg-sage-light border border-sage/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Have questions about this product?</h4>
                    <p className="text-sm text-muted-foreground mb-3">Ask our AI assistant for more details about usage, availability, or cultural significance.</p>
                    <Button variant="sage" size="sm">Ask AI Assistant</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information - gated */}
          {user ? (
            <div className="mt-12 space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Product Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {infoSections.map((section) => (
                  <div key={section.title} className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground">{section.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12 p-8 rounded-2xl bg-muted/50 border border-border text-center">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Verify to See Full Details</h2>
              <p className="text-muted-foreground mb-4">Product details like ingredients, cultural background, and usage info are available after email verification.</p>
              <Button variant="hero" size="lg" onClick={() => navigate(`/verify?redirect=/product/${id}`)}>Verify Now</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />

      {/* Find Seller Dialog */}
      <Dialog open={sellerDialogOpen} onOpenChange={setSellerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>Enter the seller's phone number to connect via WhatsApp or phone call.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {product.whereToFind && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Where to find</p>
                <p className="text-sm text-foreground">{product.whereToFind}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Seller Phone Number</label>
              <Input
                placeholder="e.g. 919876543210"
                value={sellerPhone}
                onChange={e => setSellerPhone(e.target.value)}
                type="tel"
              />
              <p className="text-xs text-muted-foreground mt-1">Include country code (e.g. 91 for India)</p>
            </div>
            <div className="flex gap-3">
              <Button variant="hero" className="flex-1 gap-2" onClick={openWhatsApp}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={callSeller}>
                <Phone className="h-4 w-4" /> Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
