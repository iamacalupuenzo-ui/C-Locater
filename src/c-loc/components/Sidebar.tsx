import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Map, LayoutDashboard, Truck, Activity, FileText, Settings, Route, Hexagon, Users, ChevronRight, ClipboardList, ChevronLeft, History, FlaskConical, Sun, Moon, HelpCircle, MessageSquare, LogOut, Check, Bell } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import type { UserRole } from '../../shared/lib/utils';
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
  shortcut?: string[];
  children?: NavChild[];
}

function ShortcutBadge({ keys, isDark }: { keys: string[]; isDark?: boolean }) {
  return (
    <span className="flex items-center gap-0.5 shrink-0">
      {keys.map((key, i) => (
        <kbd key={i} className={cn(
          'inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded text-[9px] font-semibold font-mono leading-none border',
          isDark ? 'bg-white/8 border-white/10 text-white/25' : 'bg-slate-100 border-slate-200 text-slate-400'
        )}>
          {key}
        </kbd>
      ))}
    </span>
  );
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: ['D'] },
  { id: 'explore', icon: Map, label: 'Explorar', shortcut: ['1'] },
  {
    id: 'fleet', icon: Truck, label: 'Flota', shortcut: ['2'],
    children: [
      { id: 'vehiculos', icon: Truck, label: 'Vehículos' },
      { id: 'conductores', icon: Users, label: 'Conductores' },
      { id: 'asignaciones', icon: ClipboardList, label: 'Asignaciones' },
    ],
  },
  { id: 'live', icon: Activity, label: 'En vivo', badge: 3, shortcut: ['3'] },
  {
    id: 'reports', icon: FileText, label: 'Informes', shortcut: ['4'],
    children: [
      { id: 'actividad', icon: Activity, label: 'Actividad' },
      { id: 'historico', icon: FileText, label: 'Histórico' },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  esad: 'ESAD',
  operator: 'Concesionaria',
  client: 'Cliente Directo',
  developer: 'Desarrollador',
};

const MANAGEMENT_ITEMS: NavItem[] = [
  { id: 'caminos',   icon: Route,   label: 'Caminos',   shortcut: ['C'] },
  { id: 'geocercas', icon: Hexagon, label: 'Geocercas', shortcut: ['G'] },
  { id: 'alertas',   icon: Bell,    label: 'Alertas' },
];

interface ThemeTokens {
  activeBtn: string;
  inactiveBtn: string;
  activeIcon: string;
  inactiveIcon: string;
  chevron: string;
  sectionLabel: string;
  childActive: string;
  childInactive: string;
  childIconActive: string;
  childIconInactive: string;
  badge: string;
  divider: string;
  border: string;
}

const LIGHT_THEME: ThemeTokens = {
  activeBtn: 'bg-gray-900/[0.06] text-gray-900 font-semibold',
  inactiveBtn: 'text-gray-500 hover:bg-gray-900/[0.03] hover:text-gray-800 font-medium',
  activeIcon: 'text-gray-900',
  inactiveIcon: 'text-gray-400',
  chevron: 'text-gray-400',
  sectionLabel: 'text-gray-400',
  childActive: 'text-gray-900 font-semibold',
  childInactive: 'text-gray-400 hover:text-gray-700 font-medium',
  childIconActive: 'text-gray-700',
  childIconInactive: 'text-gray-400',
  badge: 'bg-gray-800 text-white',
  divider: 'rgba(0,0,0,0.05)',
  border: 'rgba(0,0,0,0.06)',
};

const DARK_THEME: ThemeTokens = {
  activeBtn: 'bg-white/[0.12] text-white font-semibold',
  inactiveBtn: 'text-white/50 hover:bg-white/[0.06] hover:text-white/80 font-medium',
  activeIcon: 'text-white',
  inactiveIcon: 'text-white/40',
  chevron: 'text-white/30',
  sectionLabel: 'text-white/30',
  childActive: 'text-white font-semibold',
  childInactive: 'text-white/40 hover:text-white/70 font-medium',
  childIconActive: 'text-white/80',
  childIconInactive: 'text-white/30',
  badge: 'bg-white/20 text-white',
  divider: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
};

function CollapsedNavButton({
  item, isActive, hasActiveChild, onViewChange, theme,
}: {
  item: NavItem;
  isActive: boolean;
  hasActiveChild: boolean;
  onViewChange: (v: string) => void;
  theme: ThemeTokens;
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
          'w-full flex items-center justify-center py-2.5 rounded-md transition-colors relative',
          highlighted ? theme.activeBtn : theme.inactiveBtn
        )}
      >
        <Icon
          className={cn('w-[18px] h-[18px]', highlighted ? theme.activeIcon : theme.inactiveIcon)}
          strokeWidth={highlighted ? 2 : 1.75}
        />
        {item.badge && (
          <span className={cn('absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold leading-none', theme.badge)}>
            {item.badge}
          </span>
        )}
      </motion.button>

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
              <div className="bg-gray-900 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-2">
                {item.label}
                {item.shortcut && <ShortcutBadge keys={item.shortcut} isDark />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({
  item, isActive, isExpanded, hasActiveChild, onClick, theme, isDark,
}: {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  hasActiveChild: boolean;
  onClick: () => void;
  theme: ThemeTokens;
  isDark?: boolean;
}) {
  const Icon = item.icon;
  const highlighted = isActive || hasActiveChild;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors text-left',
        highlighted ? theme.activeBtn : theme.inactiveBtn
      )}
    >
      <Icon
        className={cn('w-4 h-4 shrink-0', highlighted ? theme.activeIcon : theme.inactiveIcon)}
        strokeWidth={highlighted ? 2 : 1.75}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none', theme.badge)}>
          {item.badge}
        </span>
      )}
      {item.shortcut && <ShortcutBadge keys={item.shortcut} isDark={isDark} />}
      {item.children && (
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronRight className={cn('w-3.5 h-3.5', theme.chevron)} strokeWidth={1.75} />
        </motion.span>
      )}
    </motion.button>
  );
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  isDark?: boolean;
  onToggleDark?: () => void;
  user?: { name: string; initials: string };
  onLogout?: () => void;
  onRoleChange?: (r: UserRole) => void;
}

export function SidebarCLoc({ activeView, onViewChange, userRole, isDark = false, onToggleDark, user, onLogout, onRoleChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [settingsPos, setSettingsPos] = useState<{ bottom: number; left: number } | null>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const collapsedRef = useRef(collapsed);
  const savedCollapsedRef = useRef(true);
  useEffect(() => { collapsedRef.current = collapsed; }, [collapsed]);

  useEffect(() => {
    const collapse = () => {
      savedCollapsedRef.current = collapsedRef.current;
      setCollapsed(true);
    };
    window.addEventListener('collapseSidebar', collapse);
    return () => window.removeEventListener('collapseSidebar', collapse);
  }, []);

  useEffect(() => {
    const restore = () => setCollapsed(savedCollapsedRef.current);
    window.addEventListener('restoreSidebar', restore);
    return () => window.removeEventListener('restoreSidebar', restore);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '\\' || e.key === '|') { e.preventDefault(); setCollapsed(v => !v); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case 'd': case 'D': onViewChange('dashboard'); break;
        case '1': onViewChange('explore'); break;
        case '2': onViewChange('fleet'); break;
        case '3': onViewChange('live'); break;
        case '4': onViewChange('reports'); break;
        case 'c': case 'C': onViewChange('caminos'); break;
        case 'g': case 'G': onViewChange('geocercas'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onViewChange]);

  useEffect(() => {
    if (!settingsPos) return;
    const handler = (e: MouseEvent) => {
      if (settingsPanelRef.current?.contains(e.target as Node)) return;
      setSettingsPos(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsPos]);

  function openSettingsPopover() {
    if (!settingsRef.current) return;
    const rect = settingsRef.current.getBoundingClientRect();
    setSettingsPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
  }

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNavClick(item: NavItem) {
    if (item.children) toggle(item.id);
    else onViewChange(item.id);
  }

  return (
    <>
    <motion.div
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className={cn(
        'relative h-full flex flex-col z-20 shrink-0 transition-colors duration-200',
        isDark ? 'bg-zinc-900' : 'bg-white'
      )}
      style={{ borderRight: `1px solid ${theme.border}` }}
    >

      {/* Brand */}
      <div className="h-16 flex items-center justify-center px-4 shrink-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.img key="peque" src={logoPeque} alt="C-Loc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-7 w-auto object-contain"
              style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
          ) : (
            <motion.img key="full" src={logo2} alt="C-Loc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-7 w-auto object-contain"
              style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div key="col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }} className="flex-1 flex flex-col min-h-0"
            >
              <nav className="flex-1 px-2 pt-3 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                  {userRole === 'developer' ? (
                    <>
                      <CollapsedNavButton
                        item={{ id: 'card-preview', icon: FlaskConical, label: 'Preview' }}
                        isActive={activeView === 'card-preview'}
                        hasActiveChild={false}
                        onViewChange={onViewChange}
                        theme={theme}
                      />
                      <CollapsedNavButton
                        item={{ id: 'historial', icon: History, label: 'Historial' }}
                        isActive={activeView === 'historial'}
                        hasActiveChild={false}
                        onViewChange={onViewChange}
                        theme={theme}
                      />
                    </>
                  ) : (
                    <>
                      {NAV_ITEMS.map(item => (
                        <CollapsedNavButton
                          key={item.id}
                          item={item}
                          isActive={!item.children && activeView === item.id}
                          hasActiveChild={item.children ? item.children.some(c => c.id === activeView) : false}
                          onViewChange={onViewChange}
                          theme={theme}
                        />
                      ))}
                      <div className="my-2 mx-1 transition-colors duration-200" style={{ height: 1, background: theme.divider }} />
                      {MANAGEMENT_ITEMS.map(item => (
                        <CollapsedNavButton
                          key={item.id}
                          item={item}
                          isActive={activeView === item.id}
                          hasActiveChild={false}
                          onViewChange={onViewChange}
                          theme={theme}
                        />
                      ))}
                    </>
                  )}
                </div>
              </nav>
              {/* User section — collapsed */}
              {user && (
                <div className="px-2 py-2.5 shrink-0 flex flex-col items-center gap-1.5" style={{ borderTop: `1px solid ${theme.divider}` }}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[11px] shadow-sm',
                    isDark ? 'bg-white/20 text-white' : 'bg-gradient-to-tr from-gray-800 to-gray-600 text-white'
                  )}>
                    {user.initials}
                  </div>
                  <button
                    onClick={onLogout}
                    className={cn('w-full flex items-center justify-center py-1.5 rounded-md transition-colors', theme.inactiveBtn)}
                    title="Cerrar sesión"
                  >
                    <LogOut className={cn('w-[14px] h-[14px]', theme.inactiveIcon)} strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {/* Bottom bar — collapsed */}
              <div className="px-2 pb-3 pt-2 shrink-0 flex flex-col items-center" style={{ borderTop: user ? undefined : `1px solid ${theme.divider}` }}>
                <button
                  onClick={() => setCollapsed(false)}
                  className={cn('w-full flex items-center justify-center py-2 rounded-md transition-colors', theme.inactiveBtn)}
                  title="Expandir"
                >
                  <ChevronRight className={cn('w-[15px] h-[15px]', theme.inactiveIcon)} strokeWidth={1.75} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }} className="flex-1 flex flex-col min-h-0"
            >
              <nav className="flex-1 px-3 pt-4 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                  {userRole === 'developer' ? (
                    <>
                      <NavButton
                        item={{ id: 'card-preview', icon: FlaskConical, label: 'Preview' }}
                        isActive={activeView === 'card-preview'}
                        isExpanded={false}
                        hasActiveChild={false}
                        onClick={() => onViewChange('card-preview')}
                        theme={theme}
                      />
                      <NavButton
                        item={{ id: 'historial', icon: History, label: 'Historial' }}
                        isActive={activeView === 'historial'}
                        isExpanded={false}
                        hasActiveChild={false}
                        onClick={() => onViewChange('historial')}
                        theme={theme}
                      />
                    </>
                  ) : (
                    <>
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
                              theme={theme}
                              isDark={isDark}
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
                                            'w-full flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-md text-[12px] transition-colors text-left',
                                            childActive ? theme.childActive : theme.childInactive
                                          )}
                                        >
                                          <ChildIcon
                                            className={cn('w-3.5 h-3.5 shrink-0', childActive ? theme.childIconActive : theme.childIconInactive)}
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
                        <span className={cn('text-[10px] font-semibold uppercase tracking-widest', theme.sectionLabel)}>
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
                          theme={theme}
                          isDark={isDark}
                        />
                      ))}
                    </>
                  )}
                </div>
              </nav>

              {/* User section — expanded */}
              {user && (
                <div
                  className="px-3 py-2.5 shrink-0"
                  style={{ borderTop: `1px solid ${theme.divider}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[11px] shadow-sm shrink-0',
                      isDark ? 'bg-white/20 text-white' : 'bg-gradient-to-tr from-gray-800 to-gray-600 text-white'
                    )}>
                      {user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[13px] font-semibold leading-none truncate', isDark ? 'text-white' : 'text-gray-900')}>
                        {user.name}
                      </p>
                      <p className={cn('text-[11px] leading-none mt-1 truncate', theme.sectionLabel)}>
                        {ROLE_LABELS[userRole]}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className={cn('p-1.5 rounded-lg transition-colors shrink-0', theme.inactiveBtn)}
                      title="Cerrar sesión"
                    >
                      <LogOut className={cn('w-[14px] h-[14px]', theme.inactiveIcon)} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom bar — expanded: ? · ⚙ · Feedback | < */}
              <div
                className="px-3 py-2.5 shrink-0 flex items-center gap-1"
                style={{ borderTop: `1px solid ${theme.divider}` }}
              >
                {/* Left group */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <button
                    className={cn('p-1.5 rounded-lg transition-colors', theme.inactiveBtn)}
                    title="Ayuda"
                  >
                    <HelpCircle className={cn('w-[15px] h-[15px]', theme.inactiveIcon)} strokeWidth={1.75} />
                  </button>
                  <span className={cn('text-[10px] select-none', theme.sectionLabel)}>·</span>
                  <button
                    ref={settingsRef}
                    onClick={openSettingsPopover}
                    className={cn('p-1.5 rounded-lg transition-colors', settingsPos ? theme.activeBtn : theme.inactiveBtn)}
                    title="Configuración"
                  >
                    <Settings className={cn('w-[15px] h-[15px]', settingsPos ? theme.activeIcon : theme.inactiveIcon)} strokeWidth={1.75} />
                  </button>
                  <span className={cn('text-[10px] select-none', theme.sectionLabel)}>·</span>
                  <button className={cn('text-[12px] font-medium transition-colors truncate', theme.inactiveBtn)}>
                    Feedback
                  </button>
                </div>
                {/* Divider vertical */}
                <div className="w-px h-4 shrink-0 mx-1" style={{ background: theme.divider }} />
                {/* Theme toggle */}
                <button
                  onClick={onToggleDark}
                  className={cn('p-1.5 rounded-lg transition-colors shrink-0', theme.inactiveBtn)}
                  title={isDark ? 'Modo claro' : 'Modo oscuro'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                      <motion.span key="moon" initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Moon className={cn('w-[15px] h-[15px]', theme.inactiveIcon)} strokeWidth={1.75} />
                      </motion.span>
                    ) : (
                      <motion.span key="sun" initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Sun className={cn('w-[15px] h-[15px]', theme.inactiveIcon)} strokeWidth={1.75} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                {/* Collapse */}
                <button
                  onClick={() => setCollapsed(true)}
                  className={cn('p-1.5 rounded-lg transition-colors shrink-0', theme.inactiveBtn)}
                  title="Colapsar"
                >
                  <ChevronLeft className={cn('w-[15px] h-[15px]', theme.inactiveIcon)} strokeWidth={1.75} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* Settings popover — role switcher */}
    {settingsPos && createPortal(
      <div
        ref={settingsPanelRef}
        onMouseDown={e => e.stopPropagation()}
        style={{ bottom: settingsPos.bottom, left: settingsPos.left, minWidth: 168 }}
        className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1.5 overflow-hidden"
      >
        <p className="px-3.5 pt-1 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Perfil
        </p>
        {Object.entries(ROLE_LABELS).map(([id, label]) => (
          <button
            key={id}
            onClick={() => { onRoleChange?.(id as UserRole); setSettingsPos(null); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Check className={cn('w-3 h-3 shrink-0', userRole === id ? 'text-gray-900' : 'text-transparent')} />
            {label}
          </button>
        ))}
      </div>,
      document.body
    )}
    </>
  );
}
