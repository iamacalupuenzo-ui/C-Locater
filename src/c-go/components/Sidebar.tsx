import { useState } from 'react';
import { Map, Truck, Wrench, Activity, FileText, Settings, Route, Hexagon, Users } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MENU_ITEMS = [
  { id: 'explore',    icon: Map,      label: 'Explorar' },
  { id: 'fleet',      icon: Truck,    label: 'Flota'    },
  { id: 'management', icon: Wrench,   label: 'Gestión'  },
  { id: 'live',       icon: Activity, label: 'En vivo'  },
  { id: 'reports',    icon: FileText, label: 'Informes' },
  { id: 'profile',    icon: Settings, label: 'Perfil'   },
];

const MANAGEMENT_ITEMS = [
  { label: 'Caminos',     icon: Route,   onClick: (nav: (v: string) => void) => nav('caminos') },
  { label: 'Geocercas',   icon: Hexagon, onClick: () => {} },
  { label: 'Conductores', icon: Users,   onClick: () => {} },
  { label: 'Vehículos',   icon: Truck,   onClick: () => {} },
];

export function Sidebar({ activeView, onViewChange }: { activeView: string; onViewChange: (view: string) => void }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="w-[72px] h-full bg-white flex flex-col items-center border-r border-gray-200/50 z-20 shrink-0 relative">
      <nav className="flex-1 w-full flex flex-col gap-1 px-2 pt-3 pb-5 relative overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = activeView === item.id || (activeView === 'caminos' && item.id === 'management');
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (item.id !== 'management') onViewChange(item.id);
                }}
                className={cn(
                  'w-full flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 ease-out',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon
                  className={cn('w-[22px] h-[22px] mb-1.5', isActive ? 'text-gray-900' : 'text-gray-400')}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </motion.button>

              {/* Submenu Gestión */}
              <AnimatePresence>
                {item.id === 'management' && hoveredItem === 'management' && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-[calc(100%+12px)] top-0 w-44 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 py-1 z-50"
                  >
                    <div className="absolute top-[20px] -left-[6px] w-[11px] h-[11px] bg-white border-l border-b border-gray-100 rotate-45 rounded-bl-[2px]" />
                    <div className="relative z-10">
                      {MANAGEMENT_ITEMS.map(({ label, icon: ItemIcon, onClick }) => (
                        <button
                          key={label}
                          onClick={() => onClick(onViewChange)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <ItemIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.75} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
