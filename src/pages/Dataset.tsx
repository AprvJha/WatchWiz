import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Database, Film, Users, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadMoviesFromCSV, fetchMoviePosters, Movie } from '@/lib/movieData';

const ITEMS_PER_PAGE = 24;

const Dataset = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [posterCache, setPosterCache] = useState<Map<number, string>>(new Map());
  const [loadingPosters, setLoadingPosters] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadMoviesFromCSV().then((data) => {
      setMovies(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const query = searchQuery.toLowerCase();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.genres.some((g) => g.toLowerCase().includes(query))
    );
  }, [movies, searchQuery]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Fetch posters for visible movies - using refs to avoid dependency issues
  useEffect(() => {
    const movieIdsToFetch = paginatedMovies
      .filter((m) => !posterCache.has(m.id) && !loadingPosters.has(m.id))
      .map((m) => m.id);

    if (movieIdsToFetch.length === 0) return;

    // Mark as loading
    setLoadingPosters((prev) => {
      const next = new Set(prev);
      movieIdsToFetch.forEach((id) => next.add(id));
      return next;
    });

    fetchMoviePosters(movieIdsToFetch).then((newPosters) => {
      setPosterCache((prev) => {
        const next = new Map(prev);
        newPosters.forEach((url, id) => next.set(id, url));
        return next;
      });
      setLoadingPosters((prev) => {
        const next = new Set(prev);
        movieIdsToFetch.forEach((id) => next.delete(id));
        return next;
      });
    });
    // Only trigger when paginated movie IDs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedMovies.map(m => m.id).join(',')]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const datasetInfo = [
    { label: 'Total Movies', value: movies.length.toLocaleString(), icon: Film },
    { label: 'Total Users', value: '943', icon: Users },
    { label: 'Total Ratings', value: '100,000', icon: Star },
    { label: 'Dataset', value: 'MovieLens', icon: Database },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10 pt-10 lg:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            Dataset <span className="text-gradient-accent">Explorer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Browse all {movies.length.toLocaleString()} movies from the dataset.
          </p>
        </div>

        {/* Dataset Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {datasetInfo.map((item, index) => (
            <Card 
              key={item.label}
              className="gradient-card border-border/50 opacity-0 animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search movies by title or genre..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-12 bg-secondary border-border"
          />
        </div>

        {/* Results count */}
        <p className="text-muted-foreground mb-6">
          Showing {paginatedMovies.length} of {filteredMovies.length} movies
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedMovies.map((movie) => {
              const posterUrl = posterCache.get(movie.id);
              const isLoadingPoster = loadingPosters.has(movie.id);

              return (
                <Card key={movie.id} className="gradient-card border-border/50 overflow-hidden group hover:scale-105 transition-transform duration-300">
                  <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary relative overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : isLoadingPoster ? (
                      <div className="w-full h-full flex items-center justify-center animate-pulse">
                        <Film className="h-12 w-12 text-primary/30" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{movie.year || 'N/A'}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-muted-foreground">{movie.rating.toFixed(1)}</span>
                    </div>
                    {movie.genres.length > 0 && (
                      <p className="text-xs text-primary mt-2 line-clamp-1">{movie.genres.slice(0, 2).join(', ')}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dataset;
