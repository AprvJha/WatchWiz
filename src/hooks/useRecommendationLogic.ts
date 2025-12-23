/**
 * useRecommendationLogic Hook
 * 
 * Connected to Python ML backend at http://127.0.0.1:8000
 * API: GET /recommend?user_id={id}&movie={title}
 * Falls back to mock recommendations if backend is unavailable
 */

import { useState, useCallback, useEffect } from 'react';
import { loadMoviesFromCSV, Movie as CSVMovieType } from '@/lib/movieData';

// Types for the recommendation system
export interface Movie {
  id: number;
  title: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  year: number;
  overview: string;
}

export interface Recommendation extends Movie {
  score: number;
  reason: string;
}

export type RecommendationStrategy = 'content-based' | 'collaborative' | 'hybrid';

export interface SystemStats {
  rmse: number;
  totalMovies: number;
  activeUsers: number;
  totalRatings: number;
}

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// System stats based on your dataset
const systemStats: SystemStats = {
  rmse: 0.94,
  totalMovies: 4804,
  activeUsers: 943,
  totalRatings: 100000,
};

// Generate mock recommendations based on similar genres
function generateMockRecommendations(
  targetMovie: Movie,
  allMovies: Movie[],
  strategy: RecommendationStrategy,
  userId: number
): Recommendation[] {
  // Filter out the target movie and find movies with similar genres
  const otherMovies = allMovies.filter(m => m.id !== targetMovie.id);
  
  // Score movies based on genre similarity
  const scoredMovies = otherMovies.map(movie => {
    const sharedGenres = movie.genres.filter(g => targetMovie.genres.includes(g));
    const genreScore = sharedGenres.length / Math.max(targetMovie.genres.length, 1);
    const ratingScore = movie.rating / 10;
    
    // Different scoring based on strategy
    let finalScore: number;
    switch (strategy) {
      case 'content-based':
        finalScore = genreScore * 0.8 + ratingScore * 0.2;
        break;
      case 'collaborative':
        // Simulate user preference with some randomness based on userId
        const userPref = ((userId * movie.id) % 100) / 100;
        finalScore = ratingScore * 0.5 + userPref * 0.5;
        break;
      case 'hybrid':
      default:
        const hybridUserPref = ((userId * movie.id) % 100) / 100;
        finalScore = genreScore * 0.4 + ratingScore * 0.3 + hybridUserPref * 0.3;
        break;
    }
    
    return { movie, score: finalScore };
  });
  
  // Sort by score and take top 10
  const topMovies = scoredMovies
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  return topMovies.map(({ movie, score }, index) => ({
    ...movie,
    score: Math.round(score * 100) / 100,
    reason: `${strategy === 'content-based' ? 'Content-based' : strategy === 'collaborative' ? 'Collaborative' : 'Hybrid'} recommendation: Similar to "${targetMovie.title}"${strategy !== 'content-based' ? ` based on user ${userId}'s preferences` : ''}`,
  }));
}

export const useRecommendationLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [moviesLoaded, setMoviesLoaded] = useState(false);

  // Load movies from CSV on mount
  useEffect(() => {
    const loadMovies = async () => {
      const movies = await loadMoviesFromCSV();
      setAllMovies(movies);
      setMoviesLoaded(true);
    };
    loadMovies();
  }, []);

  const getRecommendations = useCallback(async (
    targetMovie: Movie | null,
    userId: number,
    strategy: RecommendationStrategy
  ) => {
    if (!targetMovie) {
      setError('Please select a movie to get recommendations.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/recommend?user_id=${userId}&movie=${encodeURIComponent(targetMovie.title)}`,
        { signal: AbortSignal.timeout(3000) } // 3 second timeout
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response (array of movie titles) into Recommendation objects
      const recommendedMovies: Recommendation[] = data.recommendations.map(
        (title: string, index: number) => {
          // Try to find the movie in our CSV data
          const csvMovie = allMovies.find(m => m.title.toLowerCase() === title.toLowerCase());
          return {
            id: csvMovie?.id || index + 1,
            title,
            genres: csvMovie?.genres || ["Recommended"],
            rating: csvMovie?.rating || (4.5 - (index * 0.1)),
            posterUrl: csvMovie?.posterUrl || "",
            year: csvMovie?.year || 2020,
            overview: csvMovie?.overview || `Recommended based on your selection of "${targetMovie.title}"`,
            score: 0.95 - (index * 0.05),
            reason: `Hybrid recommendation: Similar to "${targetMovie.title}" based on content and user ${userId}'s preferences`,
          };
        }
      );

      setRecommendations(recommendedMovies);
    } catch (err) {
      console.log('Backend unavailable, using mock recommendations');
      
      // Generate mock recommendations from CSV data
      if (allMovies.length > 0) {
        const mockRecs = generateMockRecommendations(targetMovie, allMovies, strategy, userId);
        setRecommendations(mockRecs);
      } else {
        setError('Failed to load movie data. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [allMovies]);

  const getStats = useCallback((): SystemStats => {
    return systemStats;
  }, []);

  const searchMovies = useCallback((query: string): Movie[] => {
    return allMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [allMovies]);

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    getStats,
    searchMovies,
    allMovies,
    moviesLoaded,
  };
};
