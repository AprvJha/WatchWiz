import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Clapperboard, 
  BarChart3, 
  Database, 
  Info, 
  Menu, 
  X,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Recommendation Engine', href: '/recommendations', icon: Clapperboard },
  { label: 'Dataset Explorer', href: '/dataset', icon: Database },
  { label: 'System Architecture', href: '/architecture', icon: Info },
];

export const AppSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="glass"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 flex flex-col",
          isOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-lg text-foreground animate-fade-in">
                WatchWise
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  !isActive && "group-hover:scale-110"
                )} />
                {isOpen && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button (desktop) */}
        <div className="p-4 border-t border-sidebar-border hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <span className="flex items-center gap-2">
                <X className="h-4 w-4" /> Collapse
              </span>
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
};
