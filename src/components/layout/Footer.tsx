import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: 'All Products', path: '/products' },
      { label: 'Categories', path: '/categories' },
      { label: 'Featured', path: '/products?filter=featured' },
      { label: 'Trending', path: '/products?filter=trending' },
    ],
    categories: [
      { label: 'Herbal Medicine', path: '/category/herbal-medicine' },
      { label: 'Local Food', path: '/category/local-food' },
      { label: 'Handicrafts', path: '/category/handicrafts' },
      { label: 'Cultural Products', path: '/category/cultural-products' },
    ],
    support: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Contribute Knowledge', path: '/contribute' },
      { label: 'FAQ', path: '/faq' },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl">
                🏺
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  LocalFinds
                </h3>
                <p className="text-xs text-muted-foreground">
                  Discover Indigenous Products
                </p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting communities with their heritage through local and indigenous products. 
              Preserving traditional knowledge for future generations.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:hello@localfinds.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                hello@localfinds.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Supporting Local Communities Worldwide
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} LocalFinds. Preserving heritage, empowering communities.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for local artisans
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
