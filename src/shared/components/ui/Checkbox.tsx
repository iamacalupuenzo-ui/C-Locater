import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

type CheckboxSize = 'sm' | 'md';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: CheckboxSize;
  className?: string;
}

const sizes: Record<CheckboxSize, { box: string; icon: string; dash: string }> = {
  sm: { box: 'w-[18px] h-[18px] rounded-[5px]', icon: 'w-3 h-3', dash: 'w-2 h-0.5' },
  md: { box: 'w-[20px] h-[20px] rounded-[6px]', icon: 'w-3.5 h-3.5', dash: 'w-2.5 h-0.5' },
};

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: CheckboxProps) {
  const s = sizes[size];

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center border shrink-0',
          s.box,
          checked && !indeterminate
            ? 'bg-brand border-brand'
            : indeterminate
            ? 'bg-brand/10 border-brand/40'
            : 'bg-white border-gray-300 hover:border-gray-400'
        )}
      >
        {checked && !indeterminate && (
          <Check className={cn(s.icon, 'text-white')} strokeWidth={3} />
        )}
        {indeterminate && (
          <div className={cn(s.dash, 'bg-brand/60 rounded-full')} />
        )}
      </div>

      {label && (
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
      )}
    </div>
  );
}
