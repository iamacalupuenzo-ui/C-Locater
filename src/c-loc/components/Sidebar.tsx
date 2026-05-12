import { useState, useRef } from 'react';
import { Map, Truck, Activity, FileText, Settings, Route, Hexagon, Users, ChevronRight, ClipboardList, ChevronLeft } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import logo2 from '../../img/logo2.png';
import logoPeque from '../../img/clo-peque.png';

interface NavChild {
  id: string;
  icon: React.ElementType;
  label: string;
}

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'explore', icon: Map, label: 'Explorar' },
  {
    id: 'fleet', icon: Truck, label: 'Flota',
    children: [
      { id: 'vehiculos',    icon: Truck,         label: 'Vehículos'    },
      { id: 'conductores',  icon: Users,         label: 'Conductores'  },
      { id: 'asignaciones', icon: ClipboardList, label: 'Asignaciones' },
    ],
  },
  { id: 'live', icon: Activity, label: 'En vivo', badge: 3 },
  {
    id: 'reports', icon: FileText, label: 'Informes',
    children: [
      { id: 'actividad', icon: Activity, label: 'Actividad' },
      { id: 'historico', icon: FileText, label: 'Histórico' },
    ],
  },
];

const MANAGEMENT_ITEMS: NavItem[] = [
  { id: 'caminos',   icon: Route,   label: 'Caminos'   },
  { id: 'geocercas', icon: Hexagon, label: 'Geocercas' },
];

function CollapsedNavButton({
  item, isActive, hasActiveChild, onViewChange,
}: {
  item: NavItem;
  isActive: boolean;
  hasActiveChild: boolean;
  onViewChange: (v: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [popoverY, setPopoverY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.icon;
  const highlighted = isActive || hasActiveChild;

  function handleMouseEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopoverY(rect.top);
    }
    setHovered(true);
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => !item.children && onViewChange(item.id)}
        className={cn(
          'w-full flex items-center justify-center py-2.5 rounded-xl transition-colors relative',
          highlighted ? 'bg-gray-900/[0.06] text-gray-900' : 'text-gray-400 hover:bg-gray-900/[0.03] hover:text-gray-700'
        )}
      >
        <Icon
          className={cn('w-[18px] h-[18px]', highlighted ? 'text-gray-900' : 'text-gray-400')}
          strokeWidth={highlighted ? 2 : 1.75}
        />
        {item.badge && (
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-gray-800 text-white text-[9px] font-bold leading-none">
            {item.badge}
          </span>
        )}
      </motion.button>

      {/* Popover — fuera del flujo normal para no ser cortado */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="fixed z-[100]"
            style={{ left: 82, top: popoverY }}
          >
            {item.children ? (
              <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] py-1.5 min-w-[164px]">
                <p className="px-4 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  {item.label}
                </p>
                {item.children.map(child => {
                  const ChildIcon = child.icon;
                  return (
                    <button
                      key={child.id}
                      onClick={() => onViewChange(child.id)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <ChildIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.75} />
                      {child.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-900 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                {item.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({
  item, isActive, isExpanded, hasActiveChild, onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  hasActiveChild: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const highlighted = isActive || hasActiveChild;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors text-left',
        highlighted
          ? 'bg-gray-900/[0.06] text-gray-900 font-semibold'
          : 'text-gray-500 hover:bg-gray-900/[0.03] hover:text-gray-800 font-medium'
      )}
    >
      <Icon
        className={cn('w-4 h-4 shrink-0', highlighted ? 'text-gray-900' : 'text-gray-400')}
        strokeWidth={highlighted ? 2 : 1.75}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-800 text-white leading-none">
          {item.badge}
        </span>
      )}
      {item.children && (
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.75} />
        </motion.span>
      )}
    </motion.button>
  );
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function SidebarCLoc({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNavClick(item: NavItem) {
    if (item.children) toggle(item.id);
    else onViewChange(item.id);
  }

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative h-full bg-white flex flex-col z-20 shrink-0"
      style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Botón toggle — borde derecho, centrado verticalmente */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors z-30 bg-gray-900 hover:bg-gray-700"
      >
        <motion.span
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <ChevronLeft
            className="w-3 h-3 text-white"
            strokeWidth={2.5}
          />
        </motion.span>
      </button>

      {/* Brand */}
      <div className="h-16 flex items-center justify-center px-4 shrink-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.img key="peque" src={logoPeque} alt="C-Loc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-7 w-auto object-contain"
            />
          ) : (
            <motion.img key="full" src={logo2} alt="C-Loc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-7 w-auto object-contain"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Separador sutil */}
      <div className="mx-4 shrink-0" style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />

      {/* Nav */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div key="col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }} className="flex-1 flex flex-col min-h-0"
            >
              <nav className="flex-1 px-2 pt-3 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                  {NAV_ITEMS.map(item => (
                    <CollapsedNavButton
                      key={item.id}
                      item={item}
                      isActive={!item.children && activeView === item.id}
                      hasActiveChild={item.children ? item.children.some(c => c.id === activeView) : false}
                      onViewChange={onViewChange}
                    />
                  ))}
                  <div className="my-2 mx-1" style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />
                  {MANAGEMENT_ITEMS.map(item => (
                    <CollapsedNavButton
                      key={item.id}
                      item={item}
                      isActive={activeView === item.id}
                      hasActiveChild={false}
                      onViewChange={onViewChange}
                    />
                  ))}
                </div>
              </nav>
              <div className="px-2 pb-4 pt-3 shrink-0">
                <CollapsedNavButton
                  item={{ id: 'settings', icon: Settings, label: 'Configuración' }}
                  isActive={activeView === 'settings'}
                  hasActiveChild={false}
                  onViewChange={onViewChange}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }} className="flex-1 flex flex-col min-h-0"
            >
              <nav className="flex-1 px-3 pt-4 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                  {NAV_ITEMS.map(item => {
                    const hasChildren = !!item.children;
                    const isExpanded = !!expanded[item.id];
                    const hasActiveChild = hasChildren
                      ? item.children!.some(c => c.id === activeView)
                      : false;

                    return (
                      <div key={item.id}>
                        <NavButton
                          item={item}
                          isActive={!hasChildren && activeView === item.id}
                          isExpanded={isExpanded}
                          hasActiveChild={hasActiveChild}
                          onClick={() => handleNavClick(item)}
                        />
                        <AnimatePresence initial={false}>
                          {hasChildren && isExpanded && (
                            <motion.div
                              key="sub"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-0.5 pt-0.5 pb-1">
                                {item.children!.map(child => {
                                  const ChildIcon = child.icon;
                                  const childActive = activeView === child.id;
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => onViewChange(child.id)}
                                      className={cn(
                                        'w-full flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-lg text-[12px] transition-colors text-left',
                                        childActive
                                          ? 'text-gray-900 font-semibold'
                                          : 'text-gray-400 hover:text-gray-700 font-medium'
                                      )}
                                    >
                                      <ChildIcon
                                        className={cn('w-3.5 h-3.5 shrink-0', childActive ? 'text-gray-700' : 'text-gray-400')}
                                        strokeWidth={childActive ? 2 : 1.75}
                                      />
                                      <span className="truncate">{child.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  <div className="mt-5 mb-2 px-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Gestión
                    </span>
                  </div>
                  {MANAGEMENT_ITEMS.map(item => (
                    <NavButton
                      key={item.id}
                      item={item}
                      isActive={activeView === item.id}
                      isExpanded={false}
                      hasActiveChild={false}
                      onClick={() => onViewChange(item.id)}
                    />
                  ))}
                </div>
              </nav>

              <div className="px-3 pb-4 pt-3 shrink-0">
                <NavButton
                  item={{ id: 'settings', icon: Settings, label: 'Configuración' }}
                  isActive={activeView === 'settings'}
                  isExpanded={false}
                  hasActiveChild={false}
                  onClick={() => onViewChange('settings')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
