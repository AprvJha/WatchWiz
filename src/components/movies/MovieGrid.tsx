import { forwardRef } from 'react';
import { MovieCard } from './MovieCard';
import { Recommendation, Movie } from '@/hooks/useRecommendationLogic';
import { Loader2 } from 'lucide-react';

interface MovieGridProps {
  movies: (Movie | Recommendation)[];
  isLoading?: boolean;
  showScore?: boolean;
  emptyMessage?: string;
}

export const MovieGrid = forwardRef<HTMLDivElement, MovieGridProps>(({ 
  movies, 
  isLoading = false, 
  showScore = false,
  emptyMessage = "No movies found"
}, ref) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Generating recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎬</span>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {movies.map((movie, index) => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          index={index}
          showScore={showScore}
        />
      ))}
    </div>
  );
});

MovieGrid.displayName = 'MovieGrid';
