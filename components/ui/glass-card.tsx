import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  glow = false 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glass effect
        'rounded-xl backdrop-blur-md',
        'bg-white/5 border border-white/10',
        
        // Optional glow
        glow && 'shadow-[0_0_30px_rgba(0,240,255,0.1)]',
        
        className
      )}
    >
      {children}
    </div>
  );
}
