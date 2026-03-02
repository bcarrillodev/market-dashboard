'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-border p-1", className)}>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === 'system' 
            ? "bg-cyan-300 text-slate-900" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === 'light' 
            ? "bg-cyan-300 text-slate-900" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === 'dark' 
            ? "bg-cyan-300 text-slate-900" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
