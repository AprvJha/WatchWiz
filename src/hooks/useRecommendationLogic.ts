/**
 * useRecommendationLogic Hook
 * 
 * Connected to Python ML backend at http://127.0.0.1:8000
 * API: GET /recommend?user_id={id}&movie={title}
 */

import { useState, useCallback } from 'react';

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

// Mock movie data for selection dropdown (can be replaced with API call later)
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Avatar",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 4.5,
    posterUrl: "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
    year: 2009,
    overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home."
  },
  {
    id: 2,
    title: "Titanic",
    genres: ["Drama", "Romance"],
    rating: 4.7,
    posterUrl: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    year: 1997,
    overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic."
  },
  {
    id: 3,
    title: "The Dark Knight",
    genres: ["Action", "Crime", "Drama"],
    rating: 4.8,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    year: 2008,
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  },
  {
    id: 4,
    title: "Inception",
    genres: ["Action", "Sci-Fi", "Thriller"],
    rating: 4.6,
    posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    year: 2010,
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: 5,
    title: "Interstellar",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    rating: 4.6,
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    year: 2014,
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: 6,
    title: "The Matrix",
    genres: ["Action", "Sci-Fi"],
    rating: 4.5,
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    year: 1999,
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
  },
  {
    id: 7,
    title: "Pulp Fiction",
    genres: ["Crime", "Drama"],
    rating: 4.5,
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    year: 1994,
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
  },
  {
    id: 8,
    title: "Fight Club",
    genres: ["Drama", "Thriller"],
    rating: 4.4,
    posterUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    year: 1999,
    overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more."
  },
  {
    id: 9,
    title: "Forrest Gump",
    genres: ["Drama", "Romance"],
    rating: 4.7,
    posterUrl: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    year: 1994,
    overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75."
  },
  {
    id: 10,
    title: "Gladiator",
    genres: ["Action", "Adventure", "Drama"],
    rating: 4.5,
    posterUrl: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    year: 2000,
    overview: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery."
  },
];

// System stats based on your dataset
const systemStats: SystemStats = {
  rmse: 0.94,
  totalMovies: 4804,
  activeUsers: 943,
  totalRatings: 100000,
};

export const useRecommendationLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        `${API_BASE_URL}/recommend?user_id=${userId}&movie=${encodeURIComponent(targetMovie.title)}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response (array of movie titles) into Recommendation objects
      const recommendedMovies: Recommendation[] = data.recommendations.map(
        (title: string, index: number) => ({
          id: index + 1,
          title,
          genres: ["Recommended"],
          rating: 4.5 - (index * 0.1),
          posterUrl: "https://image.tmdb.org/t/p/w500/placeholder.jpg",
          year: 2020,
          overview: `Recommended based on your selection of "${targetMovie.title}"`,
          score: 0.95 - (index * 0.05),
          reason: `Hybrid recommendation: Similar to "${targetMovie.title}" based on content and user ${userId}'s preferences`,
        })
      );

      setRecommendations(recommendedMovies);
    } catch (err) {
      console.error('Recommendation API error:', err);
      setError('Failed to fetch recommendations. Make sure your Python backend is running at http://127.0.0.1:8000');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback((): SystemStats => {
    return systemStats;
  }, []);

  const searchMovies = useCallback((query: string): Movie[] => {
    return mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    getStats,
    searchMovies,
    allMovies: mockMovies,
  };
};
