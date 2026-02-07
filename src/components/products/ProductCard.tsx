import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const availabilityColors = {
    available: 'bg-sage/10 text-sage border-sage/20',
    limited: 'bg-amber/10 text-amber border-amber/20',
    seasonal: 'bg-primary/10 text-primary border-primary/20',
    unavailable: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {product.featured && (
            <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {product.trending && (
            <Badge className="bg-amber text-accent-foreground border-0 shadow-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xl" title={product.category.name}>
            {product.category.icon}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <p className="text-xs font-medium text-primary uppercase tracking-wide">
          {product.category.name}
        </p>

        {/* Title */}
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {product.location.localArea}, {product.location.state}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {product.price && (
            <span className="font-semibold text-foreground">
              {product.price}
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${availabilityColors[product.availability]}`}
          >
            {product.availability.charAt(0).toUpperCase() + product.availability.slice(1)}
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
