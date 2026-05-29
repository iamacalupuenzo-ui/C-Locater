import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls, useAnimationControls } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { Search, X, ChevronDown, Tag, SlidersHorizontal, ListFilter } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserRole } from '../lib/utils';
import { useVehicles } from '../lib/VehicleContext';
import { useTheme } from '../lib/ThemeContext';
import { VehicleAccordionItem } from './fleet/VehicleAccordionItem';
import { Toast } from './ui';

type StatusFilter = 'all' | 'active' | 'stopped' | 'offline';
type TypeFilter = 'all' | 'motorcycle' | 'car' | 'truck' | 'bus';

const STATUS_OPTIONS: { id: StatusFilter; label: string; dot: string }[] = [
  { id: 'all',     label: 'Todos',     dot: 'bg-neutral-400' },
  { id: 'active',  label: 'En ruta',   dot: 'bg-emerald-500' },
  { id: 'stopped', label: 'Detenido',  dot: 'bg-amber-400'   },
  { id: 'offline', label: 'Sin señal', dot: 'bg-red-400'     },
];

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all',        label: 'Todos'  },
  { id: 'motorcycle', label: 'Moto'   },
  { id: 'car',        label: 'Auto'   },
  { id: 'truck',      label: 'Camión' },
  { id: 'bus',        label: 'Bus'    },
];

interface FloatingMonitorProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  profile: 'c-go' | 'c-loc';
  userRole: UserRole;
  isDark?: boolean;
  onSideChange?: (side: 'left' | 'right', width: number) => void;
}

export function FloatingMonitor({ isOpen, onToggle, onClose, profile, userRole, onSideChange }: FloatingMonitorProps) {
  const { isDark } = useTheme();
  const vehicles = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<'status' | 'type' | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [pinnedVehicleIds, setPinnedVehicleIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMapCardOpen, setIsMapCardOpen] = useState(false);
  const [mapMoving, setMapMoving] = useState(false);

  const containerRef   = useRef<HTMLDivElement>(null);
  const listRef        = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const parentRef      = useRef<HTMLElement | null>(null);
  const dragControls   = useDragControls();
  const snapControls   = useAnimationControls();

  const PANEL_W_MAX = 306;
  const EDGE_GAP    = 16;

  const [panelW, setPanelW]         = useState(PANEL_W_MAX);
  const currentSideRef              = useRef<'left' | 'right'>('left');
  const didDragRef                  = useRef(false);
  const highlightedIndexRef         = useRef(highlightedIndex);
  highlightedIndexRef.current       = highlightedIndex;
  const resultsRef                  = useRef<typeof results>([]);
  const togglePinRef                = useRef(togglePin);
  togglePinRef.current              = togglePin;

  const getSnapX = useCallback((side: 'left' | 'right') => {
    const parent = parentRef.current;
    if (!parent) return EDGE_GAP;
    const pw = Math.min(PANEL_W_MAX, parent.clientWidth - EDGE_GAP * 2);
    return side === 'left' ? EDGE_GAP : parent.clientWidth - pw - EDGE_GAP;
  }, []);

  const snapTo = useCallback((side: 'left' | 'right') => {
    currentSideRef.current = side;
    snapControls.start({ x: getSnapX(side), transition: { type: 'spring', stiffness: 420, damping: 36 } });
    onSideChange?.(side, panelW);
  }, [snapControls, getSnapX, onSideChange]);

  useEffect(() => {
    const parent = containerRef.current?.parentElement as HTMLElement | null;
    if (!parent) return;
    parentRef.current = parent;
    const update = () => {
      const pw = Math.min(PANEL_W_MAX, parent.clientWidth - EDGE_GAP * 2);
      setPanelW(pw);
      snapTo(currentSideRef.current);
    };
    snapControls.set({ x: EDGE_GAP });
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [snapControls, snapTo]);

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > 4) didDragRef.current = true;
    const leftX  = getSnapX('left');
    const rightX = getSnapX('right');
    const mid    = (leftX + rightX) / 2;
    const currentX = getSnapX(currentSideRef.current) + info.offset.x;
    snapTo(currentX > mid ? 'right' : 'left');
  }

  const flyTo = (position: [number, number]) =>
    window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position } }));

  const filtered = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType   = typeFilter === 'all'   || v.type   === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  const pinned   = filtered.filter(v => pinnedVehicleIds.has(v.id));
  const unpinned = filtered.filter(v => !pinnedVehicleIds.has(v.id));
  const results  = [...pinned, ...unpinned];
  resultsRef.current = results;

  const handleToggleVehicle = (id: string) => {
    const expanding = selectedVehicleId !== id;
    setSelectedVehicleId(expanding ? id : null);
    if (expanding) {
      setTimeout(() => {
        document.getElementById(`vehicle-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  function togglePin(id: string) {
    setPinnedVehicleIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  // Sync selected vehicle with map
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: selectedVehicleId, source: 'monitor' } }));
  }, [selectedVehicleId]);

  // Listen for map deselect
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail.source === 'map') setSelectedVehicleId(null);
    };
    window.addEventListener('vehicleSelected', handler);
    return () => window.removeEventListener('vehicleSelected', handler);
  }, []);


  // Ctrl+F focuses search input; Escape closes the panel
  // focusMonitorSearch event: fired by Ctrl+B (open + focus) or Ctrl+F
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          focusInput();
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          const idx = highlightedIndexRef.current;
          const list = resultsRef.current;
          if (idx >= 0 && idx < list.length) togglePinRef.current(list[idx].id);
        }
        return;
      }

      if (e.key === 'Escape') { onClose(); return; }

      const list = resultsRef.current;
      if (!list.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, list.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter' && highlightedIndexRef.current >= 0) {
        e.preventDefault();
        const vehicle = list[highlightedIndexRef.current];
        if (vehicle) {
          const expanding = selectedVehicleId !== vehicle.id;
          setSelectedVehicleId(expanding ? vehicle.id : null);
          if (expanding) {
            setTimeout(() => {
              document.getElementById(`vehicle-item-${vehicle.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
            flyTo(vehicle.position as [number, number]);
          }
        }
      }
    };
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('focusMonitorSearch', focusInput);
    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('focusMonitorSearch', focusInput);
    };
  }, [isOpen, onClose, selectedVehicleId]);

  // Focus input when opening; reset filters on close
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
    else {
      setSearchQuery('');
      setStatusFilter('all');
      setTypeFilter('all');
      setOpenDropdown(null);
    }
  }, [isOpen]);

  useEffect(() => { setTimeout(checkScroll, 80); }, [selectedVehicleId, searchQuery, statusFilter, typeFilter, checkScroll]);
  useEffect(() => { if (isOpen) setTimeout(checkScroll, 320); }, [isOpen, checkScroll]);

  useEffect(() => {
    const onStart = () => setMapMoving(true);
    const onEnd   = () => setMapMoving(false);
    window.addEventListener('mapMoveStart', onStart);
    window.addEventListener('mapMoveEnd',   onEnd);
    return () => {
      window.removeEventListener('mapMoveStart', onStart);
      window.removeEventListener('mapMoveEnd',   onEnd);
    };
  }, []);

  // Reset highlight when results change
  useEffect(() => { setHighlightedIndex(-1); }, [searchQuery, statusFilter, typeFilter]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const el = document.querySelector(`[data-vehicle-index="${highlightedIndex}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedIndex]);

  // Track map vehicle card open/close — only react to marker/map, not monitor accordion
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, source } = (e as CustomEvent<{ id: string | null; source: string }>).detail;
      if (source === 'marker') setIsMapCardOpen(id !== null);
      else if (source === 'map' && id === null) setIsMapCardOpen(false);
    };
    window.addEventListener('vehicleSelected', handler);
    return () => window.removeEventListener('vehicleSelected', handler);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="absolute top-4 left-0 z-10 flex flex-col items-start"
      animate={snapControls}
      style={{ opacity: mapMoving ? 0 : 1, transition: 'opacity 0.15s ease', pointerEvents: mapMoving ? 'none' : undefined }}
      drag="x"
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={parentRef as React.RefObject<HTMLElement>}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isOpen ? (
          /* ── Pill collapsed ── */
          <motion.button
            key="pill"
            onClick={() => { if (didDragRef.current) { didDragRef.current = false; return; } onToggle(); }}
            onPointerDown={(e) => dragControls.start(e)}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'flex items-center gap-2.5 backdrop-blur-xl rounded-full pl-3.5 pr-3 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.11)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] transition-shadow border',
              isDark ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-white/70'
            )}
            style={{ width: panelW }}
          >
            <Search className={cn('w-[15px] h-[15px] shrink-0', isDark ? 'text-zinc-500' : 'text-neutral-400')} strokeWidth={2} />
            <span className={cn('text-[13px] font-medium whitespace-nowrap flex-1 text-left', isDark ? 'text-zinc-500' : 'text-neutral-400')}>
              Buscar {vehicles.length} vehículos...
            </span>
            <span className="flex items-center gap-0.5 shrink-0">
              {['Ctrl', 'B'].map(k => (
                <kbd key={k} className={cn('inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded text-[9px] font-semibold font-mono leading-none border', isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400')}>{k}</kbd>
              ))}
            </span>
          </motion.button>
        ) : (
          /* ── Panel expanded ── */
          <motion.div
            key="panel"
            data-floating-monitor
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.13)] border flex flex-col overflow-hidden backdrop-blur-2xl',
              isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
            )}
            style={{ width: panelW, maxHeight: isMapCardOpen ? 'calc(100vh - 233px)' : 'calc(100vh - 88px)' }}
          >
            {/* Search header — drag handle */}
            <div
              className={cn('relative z-[100] flex items-center gap-2.5 px-4 py-3 shrink-0 cursor-grab active:cursor-grabbing', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <Search className={cn('w-4 h-4 shrink-0', isDark ? 'text-zinc-500' : 'text-neutral-400')} strokeWidth={2} />
              <input
                ref={inputRef}
                type="text"
                placeholder={`Buscar ${vehicles.length} vehículos...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onPointerDown={e => e.stopPropagation()}
                className={cn('flex-1 bg-transparent text-[13px] font-medium outline-none min-w-0 cursor-text', isDark ? 'text-zinc-100 placeholder:text-zinc-600' : 'text-neutral-800 placeholder:text-neutral-400')}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={cn('transition-colors shrink-0', isDark ? 'text-zinc-600 hover:text-zinc-300' : 'text-neutral-300 hover:text-neutral-500')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className={cn('w-px h-4 shrink-0 mx-0.5', isDark ? 'bg-zinc-700' : 'bg-neutral-200')} />
              <button
                onClick={() => { if (didDragRef.current) { didDragRef.current = false; return; } onClose(); }}
                className={cn('transition-colors shrink-0 p-0.5 rounded-md', isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />

            {/* Filter dropdowns */}
            <div className={cn('relative z-[100] px-1.5 py-2.5 shrink-0 flex items-center gap-2', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}>
              {/* Estado dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(prev => prev === 'status' ? null : 'status')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                    statusFilter !== 'all'
                      ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
                      : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70')
                  )}
                >
                  <Tag className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>
                    {statusFilter === 'all'
                      ? 'Estado'
                      : STATUS_OPTIONS.find(o => o.id === statusFilter)?.label}
                  </span>
                  <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', openDropdown === 'status' && 'rotate-180')} strokeWidth={2.5} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'status' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className={cn('absolute top-full left-0 mt-1 z-20 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.18)] border py-1 min-w-[140px]', isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-neutral-100')}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setStatusFilter(opt.id); setOpenDropdown(null); }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors text-left',
                            statusFilter === opt.id
                              ? (isDark ? 'text-zinc-100 font-semibold bg-zinc-800' : 'text-neutral-900 font-semibold bg-neutral-50')
                              : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50')
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', opt.dot)} />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tipo dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(prev => prev === 'type' ? null : 'type')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                    typeFilter !== 'all'
                      ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
                      : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70')
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>
                    {typeFilter === 'all'
                      ? 'Tipo'
                      : TYPE_OPTIONS.find(o => o.id === typeFilter)?.label}
                  </span>
                  <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', openDropdown === 'type' && 'rotate-180')} strokeWidth={2.5} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className={cn('absolute top-full left-0 mt-1 z-20 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border py-1 min-w-[120px]', isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-neutral-100')}
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setTypeFilter(opt.id); setOpenDropdown(null); }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors text-left',
                            typeFilter === opt.id
                              ? (isDark ? 'text-zinc-100 font-semibold bg-zinc-800' : 'text-neutral-900 font-semibold bg-neutral-50')
                              : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50')
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Más filtros */}
              <button
                className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors', isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70')}
              >
                <ListFilter className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span>Más</span>
                <ChevronDown className="w-3 h-3 shrink-0" strokeWidth={2.5} />
              </button>

            </div>

            {/* Active filter chips */}
            <AnimatePresence initial={false}>
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <motion.div className={cn('relative z-[100] overflow-hidden shrink-0', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.16, ease: 'easeInOut' }}
                >
                  <div className="px-3 pb-2.5 flex items-center gap-1.5 flex-wrap">
                    {statusFilter !== 'all' && (() => {
                      const opt = STATUS_OPTIONS.find(o => o.id === statusFilter)!;
                      return (
                        <motion.span
                          key="status-chip"
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.88 }}
                          transition={{ duration: 0.12 }}
                          className={cn('flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-full text-white text-[11px] font-medium', isDark ? 'bg-zinc-700' : 'bg-zinc-900')}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', opt.dot)} />
                          {opt.label}
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="ml-0.5 rounded-full hover:bg-white/20 p-0.5 transition-colors"
                          >
                            <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                          </button>
                        </motion.span>
                      );
                    })()}
                    {typeFilter !== 'all' && (() => {
                      const opt = TYPE_OPTIONS.find(o => o.id === typeFilter)!;
                      return (
                        <motion.span
                          key="type-chip"
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.88 }}
                          transition={{ duration: 0.12 }}
                          className={cn('flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-full text-white text-[11px] font-medium', isDark ? 'bg-zinc-700' : 'bg-zinc-900')}
                        >
                          {opt.label}
                          <button
                            onClick={() => setTypeFilter('all')}
                            className="ml-0.5 rounded-full hover:bg-white/20 p-0.5 transition-colors"
                          >
                            <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                          </button>
                        </motion.span>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />

            {/* Vehicle list */}
            <div
              ref={listRef}
              onScroll={checkScroll}
              onMouseEnter={() => setHighlightedIndex(-1)}
              className="overflow-y-auto flex flex-col pb-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Pinned */}
              {pinned.length > 0 && (
                <div className={cn('sticky top-0 backdrop-blur-sm z-[10] pb-1', isDark ? 'bg-zinc-900/95' : 'bg-white/90')}>
                  {pinned.map((vehicle, idx) => (
                    <div key={vehicle.id} data-vehicle-index={idx}>
                      <VehicleAccordionItem
                        vehicle={vehicle}
                        isExpanded={selectedVehicleId === vehicle.id}
                        onToggle={() => handleToggleVehicle(vehicle.id)}
                        onFlyTo={() => flyTo(vehicle.position as [number, number])}
                        onShowToast={setToastMessage}
                        userRole={userRole}
                        profile={profile}
                        highlighted={idx === highlightedIndex}
                        isPinned
                        onTogglePin={() => togglePin(vehicle.id)}
                        isDark={isDark}
                      />
                    </div>
                  ))}
                  <div className="h-px bg-brand/15 mx-3 mt-1" />
                </div>
              )}

              {/* Unpinned */}
              {unpinned.map((vehicle, idx) => {
                const actualIdx = pinned.length + idx;
                return (
                  <div key={vehicle.id} data-vehicle-index={actualIdx}>
                    <VehicleAccordionItem
                      vehicle={vehicle}
                      isExpanded={selectedVehicleId === vehicle.id}
                      onToggle={() => handleToggleVehicle(vehicle.id)}
                      onFlyTo={() => flyTo(vehicle.position as [number, number])}
                      onShowToast={setToastMessage}
                      userRole={userRole}
                      profile={profile}
                      highlighted={actualIdx === highlightedIndex}
                      isPinned={pinnedVehicleIds.has(vehicle.id)}
                      onTogglePin={() => togglePin(vehicle.id)}
                      isDark={isDark}
                    />
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-8 text-center px-4">
                  <p className="text-[12px] text-neutral-400 font-medium">Sin resultados</p>
                </div>
              )}
            </div>

            {/* Scroll hint */}
            <AnimatePresence>
              {showScrollHint && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="sticky bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none"
                >
                  <div className={cn('w-full h-5 bg-gradient-to-t to-transparent', isDark ? 'from-zinc-900/90 via-zinc-900/60' : 'from-white/90 via-white/60')} />
                  <div className={cn('w-full flex justify-center pb-2', isDark ? 'bg-zinc-900/90' : 'bg-white/90')}>
                    <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                      <ChevronDown className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toastMessage} isVisible={!!toastMessage} onClose={() => setToastMessage('')} />
    </motion.div>
  );
}
