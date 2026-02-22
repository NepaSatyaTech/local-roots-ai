import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoriesSection from '@/components/home/CategoriesSection';

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12 section-pattern">
          <div className="container text-center max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              All <span className="text-gradient">Categories</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse indigenous products organized by their cultural significance and purpose
            </p>
          </div>
        </section>
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
