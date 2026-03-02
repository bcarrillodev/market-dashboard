'use client';

import { useTheme } from '../theme-provider';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CyanButtonProps extends React.ComponentProps<typeof Button> {
  glow?: boolean;
}

export function CyanButton({ className, glow = false, ...props }: CyanButtonProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      className={cn(
        // Base cyan styling
        'bg-cyan-300 hover:bg-cyan-400 text-slate-900 font-medium',
        'transition-all duration-200',
        
        // Light theme: skeuomorphic press effect
        !isDark && 'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,240,255,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,240,255,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]',
        
        // Dark theme: glass with glow
        isDark && 'shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] border border-cyan-300/50',
        
        glow && isDark && 'animate-pulse-glow',
        
        className
      )}
      {...props}
    />
  );
}
