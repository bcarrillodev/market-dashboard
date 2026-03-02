'use client';

import { useTheme } from '../theme-provider';
import { SkeuoCard } from './skeuo-card';
import { GlassCard } from './glass-card';
import { cn } from '@/lib/utils';

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  interactive?: boolean;
  glow?: boolean;
}

export function ThemedCard({ 
  children, 
  className,
  inset = false,
  interactive = false,
  glow = false
}: ThemedCardProps) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark') {
    return (
      <GlassCard glow={glow} className={className}>
        {children}
      </GlassCard>
    );
  }

  return (
    <SkeuoCard 
      inset={inset} 
      interactive={interactive}
      className={className}
    >
      {children}
    </SkeuoCard>
  );
}
