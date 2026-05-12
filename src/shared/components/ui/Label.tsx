import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface LabelProps {
  required?: boolean;
  children?: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function Label({ required, children, className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-[13px] font-bold text-gray-700 mb-1.5 block',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
