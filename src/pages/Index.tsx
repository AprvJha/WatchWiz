import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { StatCard } from '@/components/dashboard/StatCard';
import { TechStackBadges } from '@/components/dashboard/TechStackBadges';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { loadMoviesFromCSV, Movie, isMoviesCached, getCachedMovies } from '@/lib/movieData';
import { Activity, Film, Users, Star } from 'lucide-react';

// Static system stats - no need to compute
const stats = {
  rmse: 0.94,
  totalMovies: 4804,
  activeUsers: 943,
  totalRatings: 100000,
};

const Index = () => {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>(() => {
    // Use cached data if available for instant render
    return isMoviesCached() ? getCachedMovies().slice(0, 12) : [];
  });
  const [isLoading, setIsLoading] = useState(!isMoviesCached());

  useEffect(() => {
    // Skip if already have featured movies
    if (featuredMovies.length > 0) return;
    
    loadMoviesFromCSV().then((movies) => {
      // Only take first 12 for featured section
      setFeaturedMovies(movies.slice(0, 12));
      setIsLoading(false);
    });
  }, [featuredMovies.length]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Model Accuracy (RMSE)"
            value={stats.rmse.toFixed(2)}
            subtitle="Lower is better"
            icon={Activity}
            accentColor="primary"
            delay={100}
          />
          <StatCard
            title="Total Movies"
            value={stats.totalMovies.toLocaleString()}
            subtitle="In the MovieLens dataset"
            icon={Film}
            accentColor="blue"
            delay={200}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            subtitle="Contributing ratings"
            icon={Users}
            accentColor="green"
            delay={300}
          />
          <StatCard
            title="Total Ratings"
            value={stats.totalRatings.toLocaleString()}
            subtitle="User interactions"
            icon={Star}
            accentColor="orange"
            delay={400}
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-6 py-8">
        <TechStackBadges />
      </section>

      {/* Featured Movies */}
      <section className="container mx-auto px-6 py-16">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Movies</h2>
              <p className="text-muted-foreground mt-2">
                Sample movies from the MovieLens dataset
              </p>
            </div>
          </div>
          <MovieGrid movies={featuredMovies} isLoading={isLoading} />
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto glass border border-border/50 rounded-2xl p-8 md:p-12 opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <h2 className="text-3xl font-bold text-foreground mb-6">About the System</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground text-lg leading-relaxed">
              This system uses a <span className="text-primary font-semibold">Hybrid approach</span> combining{' '}
              <span className="text-foreground font-medium">Content-Based Filtering</span> (Cosine Similarity with TF-IDF vectors) 
              and <span className="text-foreground font-medium">Collaborative Filtering</span> (SVD Matrix Factorization) 
              to solve the cold-start problem and deliver highly accurate recommendations.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-secondary/50 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Content-Based</h3>
                <p className="text-muted-foreground">
                  Analyzes movie features (genres, descriptions) using TF-IDF vectorization and 
                  computes similarity scores using Cosine Similarity.
                </p>
              </div>
              <div className="p-6 bg-secondary/50 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Collaborative</h3>
                <p className="text-muted-foreground">
                  Leverages user-item interactions using SVD (Singular Value Decomposition) to 
                  identify latent factors and predict missing ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
