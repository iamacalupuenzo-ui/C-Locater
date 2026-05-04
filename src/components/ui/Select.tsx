import type { ChangeEventHandler } from 'react';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
  name?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, required, options, placeholder, error, containerClassName, className, id, value, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col', containerClassName)}>
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            className={cn(
              'w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-lg text-[14px] font-medium',
              'transition-all outline-none appearance-none cursor-pointer',
              'focus:border-brand focus:ring-4 focus:ring-brand-ring',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              error ? 'border-red-300' : 'border-gray-200',
              value ? 'text-gray-900' : 'text-gray-400',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {error && (
          <p className="text-[11px] font-medium text-red-500 mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
