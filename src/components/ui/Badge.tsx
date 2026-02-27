import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        {
          'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30': variant === 'default',
          'bg-white/30 dark:bg-white/10 text-foreground border border-white/30': variant === 'secondary',
          // High priority — vibrant red
          'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-400/40 backdrop-blur-sm': variant === 'destructive',
          'border border-border/60 text-foreground': variant === 'outline',
          // Low priority — green
          'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm': variant === 'success',
          // Medium priority — amber
          'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 backdrop-blur-sm': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
