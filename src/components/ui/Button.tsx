import * as React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          {
            'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 active:scale-95': variant === 'default',
            'bg-destructive text-white shadow-sm hover:bg-destructive/90 active:scale-95': variant === 'destructive',
            'border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-white/10 text-foreground': variant === 'outline',
            'bg-white/60 dark:bg-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm': variant === 'secondary',
            'hover:bg-white/30 dark:hover:bg-white/10 text-foreground rounded-lg': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline p-0 h-auto': variant === 'link',
            'h-10 px-5 py-2': size === 'default',
            'h-8 rounded-lg px-3 text-xs': size === 'sm',
            'h-11 rounded-xl px-8 text-base': size === 'lg',
            'h-9 w-9 rounded-lg': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
