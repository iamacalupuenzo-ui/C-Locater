import type { ReactNode, ChangeEventHandler } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

interface InputProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
  className?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, error, helperText, leftIcon, containerClassName, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col', containerClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3.5 py-2.5 bg-white border rounded-lg text-[14px] font-medium text-gray-900',
              'placeholder:text-gray-400',
              'focus:border-brand focus:ring-4 focus:ring-brand-ring transition-all outline-none',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200',
              leftIcon && 'pl-10',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-[11px] font-medium text-red-500 mt-1.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-[11px] font-medium text-gray-400 mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
