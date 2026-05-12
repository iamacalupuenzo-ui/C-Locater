import type { ChangeEventHandler } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

interface TextareaProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
  rows?: number;
  name?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, required, error, helperText, containerClassName, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col', containerClassName)}>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2.5 bg-white border rounded-lg text-[12px] font-mono text-gray-900',
            'placeholder:text-gray-400',
            'focus:border-brand focus:ring-4 focus:ring-brand-ring transition-all outline-none',
            'min-h-[140px] resize-y leading-relaxed',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error ? 'border-red-300' : 'border-gray-200',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />

        {error && (
          <p className="text-[11px] font-medium text-red-500 mt-1.5">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] font-medium text-gray-400 mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
