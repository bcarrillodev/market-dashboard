'use client';

import { useTheme } from '../theme-provider';
import { cn } from '@/lib/utils';

interface NumberDisplayProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  positive?: boolean;
  negative?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NumberDisplay({
  value,
  prefix = '',
  suffix = '',
  positive,
  negative,
  className,
  size = 'md'
}: NumberDisplayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-semibold',
    xl: 'text-4xl font-bold'
  };

  const colorClass = positive 
    ? 'text-emerald-500' 
    : negative 
    ? 'text-rose-500' 
    : isDark 
    ? 'text-slate-100' 
    : 'text-slate-900';

  return (
    <span
      className={cn(
        'font-mono tabular-nums inline-flex items-baseline gap-1',
        sizeClasses[size],
        colorClass,
        
        // Glow effect for dark theme on positive/negative
        isDark && (positive || negative) && 'drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]',
        
        className
      )}
    >
      {prefix && <span className="opacity-60">{prefix}</span>}
      {value}
      {suffix && <span className="opacity-60">{suffix}</span>}
    </span>
  );
}
