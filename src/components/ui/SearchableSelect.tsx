import type { ElementType } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  leftIcon?: ElementType;
  error?: string;
  containerClassName?: string;
}

export function SearchableSelect({
  label, required, value, options, onChange, placeholder = 'Seleccione',
  searchPlaceholder = 'Buscar...', leftIcon: LeftIcon, error, containerClassName,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={cn('flex flex-col', containerClassName)} ref={ref}>
      {label && <Label required={required}>{label}</Label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full pl-3 pr-3 py-2.5 bg-white border rounded-lg flex items-center justify-between text-[14px] font-medium transition-all outline-none',
          'focus:border-brand focus:ring-4 focus:ring-brand-ring shadow-sm',
          error ? 'border-red-300' : 'border-gray-200',
        )}
      >
        <div className="flex items-center gap-2">
          {LeftIcon && <LeftIcon className="w-4 h-4 text-gray-400 shrink-0" />}
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || placeholder}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  autoFocus type="text" placeholder={searchPlaceholder} value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length > 0 ? filtered.map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => { onChange(opt); setIsOpen(false); setQuery(''); }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-[13px] rounded-md transition-colors',
                    value === opt ? 'bg-blue-50 text-brand font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
                  )}
                >{opt}</button>
              )) : (
                <div className="px-3 py-4 text-center text-[13px] text-gray-500 font-medium">Sin resultados</div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
