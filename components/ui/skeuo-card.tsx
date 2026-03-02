import { cn } from '@/lib/utils';

interface SkeuoCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  interactive?: boolean;
}

export function SkeuoCard({ 
  children, 
  className, 
  inset = false,
  interactive = false 
}: SkeuoCardProps) {
  return (
    <div
      className={cn(
        // Base styling
        'rounded-xl bg-white transition-all duration-200',
        
        // Shadow/depth based on type
        inset 
          ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-slate-100 border border-slate-200'
          : 'shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]',
        
        // Interactive states
        interactive && !inset && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px]',
        
        className
      )}
    >
      {children}
    </div>
  );
}
