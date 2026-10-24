import { forwardRef } from 'react';

const variants = {
  default: 'bg-secondary text-foreground hover:bg-accent border-border',
  primary: 'bg-primary text-white border-primary hover:brightness-110',
  outline: 'bg-transparent border-border text-foreground hover:bg-accent',
  ghost: 'bg-transparent border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
  danger: 'bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10',
};

export const Button = forwardRef(function Button({ variant = 'default', size = 'md', className = '', type = 'button', ...props }, ref) {
  const dimensions = size === 'icon' ? 'h-9 w-9 p-0' : size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-3 text-sm';
  return <button ref={ref} type={type} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 ${variants[variant] || variants.default} ${dimensions} ${className}`} {...props} />;
});
