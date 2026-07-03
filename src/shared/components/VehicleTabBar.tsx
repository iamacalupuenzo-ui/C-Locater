import { motion, AnimatePresence } from 'motion/react';
import { Map, X, ShieldAlert, Route, MonitorCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Vehicle } from '../lib/data';

const MAP_TAB_ID = '__map__';

interface VehicleTabBarProps {
  tabs: Vehicle[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onClose: (id: string) => void;
  isDark?: boolean;
  label?: 'Captura' | 'Viajes' | 'Monitor';
  hideMapTab?: boolean;
  mapActive?: boolean;
}

function Tab({
  isActive, isDark, activeColor, onClick, children,
}: {
  isActive: boolean; isDark: boolean; activeColor: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-full flex items-center gap-2 px-3 border-r text-left transition-colors relative shrink-0',
        isDark
          ? isActive
            ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
          : isActive
            ? 'bg-white border-neutral-200 text-slate-800'
            : 'bg-neutral-100 border-neutral-200 text-slate-500 hover:bg-neutral-50 hover:text-slate-700',
      )}
    >
      {isActive && <span className={cn('absolute top-0 left-0 right-0 h-[2px]', activeColor)} />}
      {children}
    </button>
  );
}

export function VehicleTabBar({ tabs, activeId, onSelect, onClose, isDark = false, label, hideMapTab = false, mapActive: overrideMapActive }: VehicleTabBarProps) {
  if (tabs.length === 0 && hideMapTab) return null;

  const mapActive = overrideMapActive ?? activeId === null;

  return (
    <div
      className={cn(
        'flex items-stretch h-[34px] border-t overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden',
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-neutral-100 border-neutral-200',
      )}
      style={{ scrollbarWidth: 'none' }}
    >
      {!hideMapTab && (
        <Tab
          isActive={mapActive}
          isDark={isDark}
          activeColor={label === 'Monitor' ? 'bg-violet-500' : 'bg-blue-500'}
          onClick={() => onSelect(null)}
        >
          {label === 'Monitor'
            ? <MonitorCheck className="w-3 h-3 shrink-0 text-violet-500" strokeWidth={1.75} />
            : <Map          className="w-3 h-3 shrink-0" strokeWidth={1.75} />
          }
          <span className="text-[11px] font-medium whitespace-nowrap leading-none">
            {label === 'Monitor' ? 'En vivo' : 'Mapa'}
          </span>
        </Tab>
      )}

      {/* Tabs de vehículos capturados */}
      <AnimatePresence initial={false}>
        {tabs.map(vehicle => {
          const isActive = vehicle.id === activeId;
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="overflow-hidden shrink-0"
            >
              <Tab
                isActive={isActive}
                isDark={isDark}
                activeColor={label === 'Captura' ? 'bg-red-500' : label === 'Monitor' ? 'bg-violet-500' : 'bg-blue-500'}
                onClick={() => onSelect(vehicle.id)}
              >
                {label === 'Captura' ? (
                  <ShieldAlert className="w-3 h-3 shrink-0 text-red-500" strokeWidth={2} />
                ) : label === 'Monitor' ? (
                  <MonitorCheck className="w-3 h-3 shrink-0 text-violet-500" strokeWidth={2} />
                ) : (
                  <Route className="w-3 h-3 shrink-0 text-blue-500" strokeWidth={2} />
                )}
                <span className="text-[11px] font-medium whitespace-nowrap leading-none">
                  {vehicle.plate}
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); onClose(vehicle.id); }}
                  className={cn(
                    'w-3.5 h-3.5 flex items-center justify-center rounded-sm transition-colors cursor-pointer',
                    isDark
                      ? 'text-zinc-500 hover:bg-zinc-600 hover:text-zinc-200'
                      : 'text-slate-400 hover:bg-neutral-200 hover:text-slate-600',
                  )}
                >
                  <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                </span>
              </Tab>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export { MAP_TAB_ID };
