import { MainLayout } from '@/components/layout/MainLayout';
import { RecommendationForm } from '@/components/recommendations/RecommendationForm';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { useRecommendationLogic } from '@/hooks/useRecommendationLogic';

const Recommendations = () => {
  const { 
    allMovies, 
    recommendations, 
    isLoading, 
    getRecommendations,
    moviesLoaded 
  } = useRecommendationLogic();

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10 pt-10 lg:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            Recommendation <span className="text-gradient-accent">Engine</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Select a movie, choose your strategy, and discover personalized recommendations 
            powered by machine learning algorithms.
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-12 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <RecommendationForm 
            movies={allMovies} 
            onSubmit={getRecommendations}
            isLoading={isLoading || !moviesLoaded}
          />
          {!moviesLoaded && (
            <p className="text-sm text-muted-foreground mt-2">Loading {allMovies.length > 0 ? allMovies.length : ''} movies...</p>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {recommendations.length > 0 ? 'Your Recommendations' : 'Results will appear here'}
            </h2>
            {recommendations.length > 0 && (
              <span className="text-muted-foreground">
                {recommendations.length} movies found
              </span>
            )}
          </div>
          <MovieGrid 
            movies={recommendations} 
            isLoading={isLoading}
            showScore={true}
            emptyMessage="Select a movie and strategy above to get personalized recommendations"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Recommendations;
