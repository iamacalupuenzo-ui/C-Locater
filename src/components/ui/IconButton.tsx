import type { ElementType, MouseEventHandler } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type IconButtonVariant = 'ghost' | 'outline' | 'filled';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: ElementType;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  'aria-label': string;
  badge?: boolean;
  iconStrokeWidth?: number;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
  outline: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200',
  filled: 'text-white bg-brand hover:bg-brand-hover',
};

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: 'w-8 h-8 rounded-lg', icon: 'w-3.5 h-3.5' },
  md: { button: 'w-10 h-10 rounded-xl', icon: 'w-[18px] h-[18px]' },
  lg: { button: 'w-12 h-12 rounded-xl', icon: 'w-5 h-5' },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, variant = 'ghost', size = 'md', badge, className, iconStrokeWidth, ...props }, ref) => {
    const s = sizeStyles[size];
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          s.button,
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className={s.icon} strokeWidth={iconStrokeWidth} />
        {badge && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-stopped rounded-full border-2 border-white" />
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
