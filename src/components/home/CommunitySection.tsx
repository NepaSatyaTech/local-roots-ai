import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, BookOpen, Award } from 'lucide-react';

const CommunitySection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Knowledge Assistant',
      description: 'Get instant answers about local products, their uses, and where to find them.',
      action: 'Ask AI',
      link: '/chat',
    },
    {
      icon: BookOpen,
      title: 'Contribute Knowledge',
      description: 'Share your expertise about local products and help preserve traditional wisdom.',
      action: 'Contribute',
      link: '/contribute',
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with artisans, collectors, and enthusiasts who share your passion.',
      action: 'Join Now',
      link: '/community',
    },
    {
      icon: Award,
      title: 'Verified Sellers',
      description: 'Find authentic products from verified local artisans and trusted sources.',
      action: 'Browse Sellers',
      link: '/sellers',
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 text-sage text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            <span>Community Powered</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built by the Community, for the Community
          </h2>
          <p className="text-muted-foreground">
            Our platform thrives on collective knowledge. Join thousands of contributors 
            who are preserving and sharing traditional wisdom.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>

              {/* Action */}
              <Link to={feature.link}>
                <Button variant="ghost" size="sm" className="px-0 text-primary hover:text-primary/80">
                  {feature.action} →
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-sage/5 border border-border">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Have knowledge to share?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Help us build the world's largest database of local and indigenous products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/chat">
                <Button variant="hero" size="lg" className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Talk to AI Assistant
                </Button>
              </Link>
              <Link to="/contribute">
                <Button variant="outline" size="lg">
                  Submit a Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
