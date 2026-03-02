import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <TrendingUp className="h-6 w-6 text-cyan-300" />
          <span>MarketDash</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-cyan-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/search" className="text-sm font-medium hover:text-cyan-300 transition-colors">
            Search
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
