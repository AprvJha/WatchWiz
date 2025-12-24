/**
 * Movie data utilities for parsing CSV dataset
 * Includes module-level caching to prevent redundant fetches
 */

import { supabase } from "@/integrations/supabase/client";

export interface CSVMovie {
  id: number;
  title: string;
  genres: string[];
  overview: string;
  release_date: string;
  vote_average: number;
  popularity: number;
  budget: number;
  revenue: number;
  runtime: number;
}

export interface Movie {
  id: number;
  title: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  year: number;
  overview: string;
}

// Module-level cache for movies
let cachedMovies: Movie[] | null = null;
let loadingPromise: Promise<Movie[]> | null = null;

// Parse genres from JSON-like string format in CSV
function parseGenres(genreString: string): string[] {
  try {
    // Format: [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]
    const parsed = JSON.parse(genreString.replace(/'/g, '"'));
    return parsed.map((g: { name: string }) => g.name);
  } catch {
    return [];
  }
}

// Parse CSV line handling quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

async function fetchAndParseCSV(): Promise<Movie[]> {
  try {
    const response = await fetch('/data/movies.csv');
    const text = await response.text();
    
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    // Find column indices
    const titleIdx = headers.indexOf('title');
    const genresIdx = headers.indexOf('genres');
    const overviewIdx = headers.indexOf('overview');
    const releaseDateIdx = headers.indexOf('release_date');
    const voteAvgIdx = headers.indexOf('vote_average');
    const idIdx = headers.indexOf('id');
    
    const movies: Movie[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      
      const title = values[titleIdx] || '';
      const releaseDate = values[releaseDateIdx] || '';
      const year = releaseDate ? parseInt(releaseDate.split('-')[0]) : 0;
      
      if (!title) continue;
      
      movies.push({
        id: parseInt(values[idIdx]) || i,
        title,
        genres: parseGenres(values[genresIdx] || '[]'),
        rating: parseFloat(values[voteAvgIdx]) || 0,
        posterUrl: '',
        year,
        overview: values[overviewIdx] || '',
      });
    }
    
    return movies;
  } catch (error) {
    console.error('Error loading movies CSV:', error);
    return [];
  }
}

// Cached loader - returns cached data or fetches once
export async function loadMoviesFromCSV(): Promise<Movie[]> {
  // Return cached movies if available
  if (cachedMovies) {
    return cachedMovies;
  }
  
  // If already loading, wait for that promise
  if (loadingPromise) {
    return loadingPromise;
  }
  
  // Start loading and cache the promise
  loadingPromise = fetchAndParseCSV().then(movies => {
    cachedMovies = movies;
    loadingPromise = null;
    return movies;
  });
  
  return loadingPromise;
}

// Get cached movies synchronously (returns empty if not loaded yet)
export function getCachedMovies(): Movie[] {
  return cachedMovies || [];
}

// Check if movies are already cached
export function isMoviesCached(): boolean {
  return cachedMovies !== null;
}

// Fetch poster URLs from TMDB via edge function
export async function fetchMoviePosters(movieIds: number[]): Promise<Map<number, string>> {
  const posterMap = new Map<number, string>();
  
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-poster', {
      body: { movieIds },
    });

    if (error) {
      console.error('Error fetching posters:', error);
      return posterMap;
    }

    if (data?.posters) {
      for (const poster of data.posters) {
        if (poster.posterUrl) {
          posterMap.set(poster.id, poster.posterUrl);
        }
      }
    }
  } catch (error) {
    console.error('Error invoking tmdb-poster function:', error);
  }
  
  return posterMap;
}
