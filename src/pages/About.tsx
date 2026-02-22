import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, ScanLine, MessageCircle, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Search,
    title: 'Discover Products',
    description: 'Browse through a curated collection of indigenous products from various regions — herbal medicines, handicrafts, local food, art, and more.',
  },
  {
    icon: ScanLine,
    title: 'Scan & Identify',
    description: 'Use our AI-powered scanner to identify indigenous products instantly. Simply point your camera and get detailed information about any product.',
  },
  {
    icon: MessageCircle,
    title: 'Ask AI Assistant',
    description: 'Chat with our AI assistant to learn about product origins, cultural significance, usage, and availability — all powered by community-sourced knowledge.',
  },
  {
    icon: Users,
    title: 'Community Contributions',
    description: 'Community members can submit products they know about. Every submission is reviewed by admins before being published to ensure quality and accuracy.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Information',
    description: 'All products go through a review and approval process. Only verified information makes it to the platform, ensuring trust and authenticity.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 section-pattern">
          <div className="container text-center max-w-3xl mx-auto">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-3xl mb-6">
              🏺
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              How <span className="text-gradient">LocalFinds</span> Works
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              LocalFinds is a platform dedicated to preserving and promoting indigenous products
              from communities across the world. Here's how you can get the most out of it.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <Button variant="hero" size="lg" className="gap-2">
                  Start Exploring <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
