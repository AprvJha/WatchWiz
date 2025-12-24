import { useState, useMemo, useCallback } from 'react';
import { Search, User, Sparkles, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movie, RecommendationStrategy } from '@/hooks/useRecommendationLogic';
import { cn } from '@/lib/utils';

interface RecommendationFormProps {
  movies: Movie[];
  onSubmit: (movie: Movie | null, userId: number, strategy: RecommendationStrategy) => void;
  isLoading?: boolean;
}

const strategies: { value: RecommendationStrategy; label: string; description: string }[] = [
  { 
    value: 'content-based', 
    label: 'Content-Based', 
    description: 'Uses TF-IDF & Cosine Similarity' 
  },
  { 
    value: 'collaborative', 
    label: 'Collaborative', 
    description: 'Uses SVD Matrix Factorization' 
  },
  { 
    value: 'hybrid', 
    label: 'Hybrid', 
    description: 'Best of both worlds' 
  },
];

export const RecommendationForm = ({ movies, onSubmit, isLoading }: RecommendationFormProps) => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [userId, setUserId] = useState<string>('1');
  const [strategy, setStrategy] = useState<RecommendationStrategy>('hybrid');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered movies - only filter when search query changes
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) {
      return movies.slice(0, 100); // Show first 100 when no search
    }
    const query = searchQuery.toLowerCase();
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(query)
    ).slice(0, 100); // Limit results for performance
  }, [movies, searchQuery]);

  const selectedMovie = useMemo(() => 
    movies.find(m => m.id.toString() === selectedMovieId) || null,
    [movies, selectedMovieId]
  );

  const handleMovieSelect = useCallback((movieId: string) => {
    setSelectedMovieId(movieId);
    setOpen(false);
    setSearchQuery('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userIdNum = parseInt(userId) || 1;
    onSubmit(selectedMovie, userIdNum, strategy);
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Movie Selection - Using Command for better performance */}
          <div className="space-y-2">
            <Label htmlFor="movie" className="text-foreground">Target Movie</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-secondary border-border hover:bg-secondary/80"
                >
                  {selectedMovie ? (
                    <span className="flex items-center gap-2 truncate">
                      <Film className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{selectedMovie.title}</span>
                      <span className="text-muted-foreground text-xs shrink-0">({selectedMovie.year})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search from {movies.length.toLocaleString()} movies...</span>
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Type to search movies..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {searchQuery ? 'No movies found.' : 'Type to search...'}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredMovies.map((movie) => (
                        <CommandItem
                          key={movie.id}
                          value={movie.id.toString()}
                          onSelect={handleMovieSelect}
                          className="cursor-pointer"
                        >
                          <Film className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate">{movie.title}</span>
                          <span className="text-muted-foreground text-xs ml-2">({movie.year})</span>
                        </CommandItem>
                      ))}
                      {!searchQuery && movies.length > 100 && (
                        <div className="py-2 px-3 text-xs text-muted-foreground text-center">
                          Type to search all {movies.length.toLocaleString()} movies
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              User ID (1-943)
            </Label>
            <Input
              id="userId"
              type="number"
              min="1"
              max="943"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="bg-secondary border-border"
            />
          </div>

          {/* Strategy Selection */}
          <div className="space-y-3">
            <Label className="text-foreground">Recommendation Strategy</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {strategies.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrategy(s.value)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all duration-300",
                    strategy === s.value
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-secondary hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Get Recommendations
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
