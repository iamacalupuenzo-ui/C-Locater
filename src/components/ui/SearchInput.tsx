import type { ChangeEventHandler } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  containerClassName?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchInput({ containerClassName, className, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        className={cn(
          'w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm',
          'text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all',
          className
        )}
        {...props}
      />
    </div>
  );
}
