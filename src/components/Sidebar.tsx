import React, { useState } from 'react';
import { Map, Truck, Wrench, Activity, FileText, Settings, BoxSelect, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MENU_ITEMS = [
  { id: 'explore', icon: Map, label: 'Explorar' },
  { id: 'fleet', icon: Truck, label: 'Flota' },
  { id: 'management', icon: Wrench, label: 'Gestión' },
  { id: 'live', icon: Activity, label: 'En vivo' },
  { id: 'reports', icon: FileText, label: 'Informes' },
  { id: 'profile', icon: Settings, label: 'Perfil' },
];

export function Sidebar({ activeView, onViewChange }: { activeView: string, onViewChange: (view: string) => void }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="w-[72px] h-full bg-white flex flex-col items-center py-5 border-r border-gray-200/50 z-20 shrink-0 relative">
      <nav className="flex-1 w-full flex flex-col gap-1 px-2 pt-2 relative">
        {MENU_ITEMS.map((item, index) => {
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
                  if (item.id !== 'management') {
                    onViewChange(item.id);
                  }
                }}
                className={cn(
                  "w-full flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 ease-out",
                  isActive 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-[22px] h-[22px] mb-1.5", isActive ? "text-gray-900" : "text-gray-400")} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
              </motion.button>

              {/* Submenu Popover */}
              <AnimatePresence>
                {item.id === 'management' && hoveredItem === 'management' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-[calc(100%+14px)] top-0 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 z-50 flex flex-col"
                  >
                     {/* Flecha lateral */}
                     <div className="absolute top-[22px] -left-[6.5px] w-[12px] h-[12px] bg-white border-l border-b border-gray-100 rotate-45 rounded-bl-[2px]" />
                     
                     <div className="relative z-10 bg-white rounded-xl overflow-hidden py-0.5">
                       <button 
                         onClick={() => onViewChange('caminos')}
                         className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                       >
                         Caminos
                       </button>
                       <button className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                         Geocercas
                       </button>
                       <button className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                         Conductores
                       </button>
                       <button className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                         Vehículos
                       </button>
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
