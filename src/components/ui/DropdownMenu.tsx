import type { ElementType, RefObject, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface MenuItem {
  icon: ElementType;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
  children: (props: { open: () => void; ref: RefObject<HTMLButtonElement | null> }) => ReactNode;
}

export function DropdownMenu({ items, children }: DropdownMenuProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.right - 168, // ancho del menú
    });
  }, []);

  const close = useCallback(() => setPos(null), []);

  // Cierra con click fuera o scroll
  useEffect(() => {
    if (!pos) return;
    const handler = () => close();
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', handler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', handler, true);
    };
  }, [pos, close]);

  const isOpen = pos !== null;

  return (
    <>
      {children({ open: () => (isOpen ? close() : open()), ref: triggerRef })}

      {isOpen && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-44 bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] py-1 overflow-hidden"
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i}>
                {item.dividerBefore && <div className="h-px bg-gray-100 my-1 mx-3" />}
                <button
                  onClick={() => { item.onClick?.(); close(); }}
                  className={cn(
                    'w-full px-3.5 py-2 text-left text-sm flex items-center gap-2.5 transition-colors',
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', item.danger ? 'text-red-400' : 'text-gray-400')} />
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
