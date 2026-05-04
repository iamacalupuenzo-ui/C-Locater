import type { ElementType } from 'react';
import { cn } from '../../lib/utils';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: ElementType;
}

type SegmentedSize = 'sm' | 'md';
type SegmentedVariant = 'default' | 'dark';

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: SegmentedSize;
  variant?: SegmentedVariant;
  className?: string;
}

const sizeStyles: Record<SegmentedSize, { container: string; button: string; icon: string }> = {
  sm: {
    container: 'p-[3px] gap-[2px]',
    button: 'px-3 py-1.5 text-xs',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'p-1',
    button: 'px-5 py-2 text-[11px]',
    icon: 'w-3.5 h-3.5',
  },
};

const variantConfig: Record<SegmentedVariant, { track: string; active: string; inactive: string }> = {
  default: {
    track: 'bg-gray-100 rounded-lg',
    active: 'bg-white text-gray-900 shadow-sm',
    inactive: 'text-gray-500 hover:text-gray-700',
  },
  dark: {
    track: 'bg-gray-50/80 rounded-2xl border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]',
    active: 'bg-gray-900 text-white shadow-md border border-transparent',
    inactive: 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]',
  },
};

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'sm',
  variant = 'default',
  className,
}: SegmentedControlProps) {
  const s = sizeStyles[size];
  const v = variantConfig[variant];

  return (
    <div
      className={cn('flex items-center', v.track, s.container, className)}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all outline-none',
              s.button,
              isActive ? v.active : v.inactive
            )}
          >
            {Icon && <Icon className={s.icon} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
