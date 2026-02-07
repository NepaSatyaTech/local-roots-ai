import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockProducts';
import {
  ArrowLeft,
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  ExternalLink,
  Leaf,
  Utensils,
  BookOpen,
  History,
  ShoppingBag,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
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

  const infoSections = [
    {
      icon: BookOpen,
      title: 'Description',
      content: product.description,
    },
    {
      icon: Leaf,
      title: 'Importance',
      content: product.importance,
    },
    {
      icon: Utensils,
      title: 'Daily Life Uses',
      content: product.dailyLifeUses,
    },
    {
      icon: BookOpen,
      title: 'How to Use',
      content: product.howToUse,
    },
    {
      icon: Leaf,
      title: 'Ingredients / Materials',
      content: product.ingredients,
    },
    {
      icon: History,
      title: 'Cultural & Historical Background',
      content: product.culturalBackground,
    },
    {
      icon: ShoppingBag,
      title: 'Where to Find / Buy',
      content: product.whereToFind,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted/30">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link
                to={`/category/${product.category.id}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {product.category.name}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          {/* Back Button */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 ring-primary transition-all"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {product.category.icon} {product.category.name}
                </Badge>
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
                {product.trending && (
                  <Badge className="bg-amber text-accent-foreground">Trending</Badge>
                )}
                <Badge
                  variant="outline"
                  className={availabilityColors[product.availability]}
                >
                  {product.availability.charAt(0).toUpperCase() +
                    product.availability.slice(1)}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>
                  {product.location.localArea}, {product.location.district},{' '}
                  {product.location.state}, {product.location.country}
                </span>
              </div>

              {/* Price */}
              {product.price && (
                <div className="text-2xl font-bold text-primary">{product.price}</div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Find Seller
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Heart className="h-5 w-5" />
                  Save
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>

              {/* Ask AI */}
              <div className="p-4 rounded-xl bg-sage-light border border-sage/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Have questions about this product?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ask our AI assistant for more details about usage, availability, or
                      cultural significance.
                    </p>
                    <Button variant="sage" size="sm">
                      Ask AI Assistant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Product Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {infoSections.map((section) => (
                <div
                  key={section.title}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default ProductDetail;
