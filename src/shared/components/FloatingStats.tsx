import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Car, Clock, Star, CreditCard, Route, MapPin,
  Filter, Search, Calendar, Check, X, ChevronDown, ChevronLeft, Tag, Layers, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserRole } from '../lib/utils';
import { Toast } from './ui';
import { useVehicles } from '../lib/VehicleContext';
import { StatCard } from './fleet/StatCard';
import { VehicleAccordionItem } from './fleet/VehicleAccordionItem';

export { StatCard };

export function FloatingStats({ profile = 'c-go', userRole = 'operator', mode = 'float', onClose, isDark = false }: { profile?: 'c-go' | 'c-loc'; userRole?: UserRole; mode?: 'float' | 'sidebar'; onClose?: () => void; isDark?: boolean }) {
  const vehicles = useVehicles();
  const [activeTab, setActiveTab] = useState<string | null>(mode === 'sidebar' ? 'ubicaciones' : null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('Día');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(vehicles.map(v => v.id));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [showListScrollHint, setShowListScrollHint] = useState(false);
  const [pinnedVehicleIds, setPinnedVehicleIds] = useState<Set<string>>(new Set());

  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const mapIdleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkListScroll = React.useCallback(() => {
    const el = listScrollRef.current;
    if (!el) return;
    setShowListScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  React.useEffect(() => {
    setTimeout(checkListScroll, 80);
  }, [selectedVehicleId, searchQuery, selectedVehicles, activeTab, checkListScroll]);

  React.useEffect(() => {
    const onMoveStart = () => {
      if (mapIdleTimer.current) clearTimeout(mapIdleTimer.current);
      setIsMapMoving(true);
    };
    const onMoveEnd = () => {
      if (mapIdleTimer.current) clearTimeout(mapIdleTimer.current);
      mapIdleTimer.current = setTimeout(() => setIsMapMoving(false), 300);
    };
    window.addEventListener('mapMoveStart', onMoveStart);
    window.addEventListener('mapMoveEnd', onMoveEnd);
    return () => {
      window.removeEventListener('mapMoveStart', onMoveStart);
      window.removeEventListener('mapMoveEnd', onMoveEnd);
      if (mapIdleTimer.current) clearTimeout(mapIdleTimer.current);
    };
  }, []);

  const handleToggleVehicle = (id: string) => {
    const isExpanding = selectedVehicleId !== id;
    setSelectedVehicleId(isExpanding ? id : null);
    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`vehicle-item-${id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: selectedVehicleId, source: 'monitor' } }));
  }, [selectedVehicleId]);

  React.useEffect(() => {
    const onMapDeselect = (e: Event) => {
      if ((e as CustomEvent).detail.source === 'map') setSelectedVehicleId(null);
    };
    window.addEventListener('vehicleSelected', onMapDeselect);
    return () => window.removeEventListener('vehicleSelected', onMapDeselect);
  }, []);

  const isFilterActive = selectedVehicles.length !== vehicles.length || dateFilter !== 'Día' || customStartDate !== '' || customEndDate !== '';

  const clearFilters = () => {
    setDateFilter('Día');
    setSelectedVehicles(vehicles.map(v => v.id));
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const togglePin = (id: string) => {
    setPinnedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedVehicles(selectedVehicles.length === vehicles.length ? [] : vehicles.map(v => v.id));
  };

  const toggleTab = (tab: string) => {
    setActiveTab(mode === 'sidebar' ? tab : (activeTab === tab ? null : tab));
    setSelectedVehicleId(null);
  };

  const visibleFleet = vehicles
    .filter(v => selectedVehicles.includes(v.id))
    .filter(v =>
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedFleet = visibleFleet.filter(v => pinnedVehicleIds.has(v.id));
  const unpinnedFleet = visibleFleet.filter(v => !pinnedVehicleIds.has(v.id));

  const filteredFleetForCheckboxes = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (mode === 'sidebar') {
    // offsetX: monitor panel (272px) / 2 = 136px — centers vehicle in the visible map area
    const flyTo = (position: [number, number]) =>
      window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position, offsetX: 136 } }));

    return (
      <div className={cn('w-[304px] h-full flex flex-col shrink-0 transition-colors duration-200', isDark ? 'bg-neutral-900 border-r border-neutral-800' : 'bg-neutral-50 border-r border-neutral-200')}>
        {/* Header estilo search */}
        <div className="pl-3 pr-[18px] pt-3 pb-3 shrink-0 flex flex-col gap-3">
          {/* Search bar + botón colapsar centrado */}
          <div className="relative flex items-center">
            <div className={cn('flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5', isDark ? 'bg-neutral-800' : 'bg-neutral-100')}>
              <Search className={cn('w-4 h-4 shrink-0', isDark ? 'text-neutral-400' : 'text-neutral-400')} />
              <input
                type="text"
                placeholder={`Buscar ${vehicles.length} vehículos`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('bg-transparent outline-none text-[13px] w-full placeholder:font-normal', isDark ? 'text-neutral-100 placeholder:text-neutral-500' : 'text-neutral-800 placeholder:text-neutral-400')}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn('absolute -right-[30px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors z-10', isDark ? 'bg-neutral-600 hover:bg-neutral-500 text-white' : 'bg-gray-900 hover:bg-gray-700 text-white')}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          {/* Filter chips — sin fondo, texto plano con iconos */}
          <div className="flex items-center gap-4 pl-3.5">
            <button className={cn('flex items-center gap-1 text-[11px] font-medium transition-colors', isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')}>
              <Tag className="w-3 h-3" />
              Estado
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            <button className={cn('flex items-center gap-1 text-[11px] font-medium transition-colors', isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')}>
              <Layers className="w-3 h-3" />
              Tipo
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('flex items-center gap-1 text-[11px] font-medium transition-colors',
                showFilters || isFilterActive
                  ? (isDark ? 'text-neutral-200' : 'text-neutral-700')
                  : (isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Más
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {isFilterActive && (
              <button onClick={clearFilters} className="ml-auto text-[11px] font-medium text-red-400 hover:text-red-500 transition-colors">
                Limpiar
              </button>
            )}
          </div>
        </div>


        {/* Content area */}
        {true && (
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Filter bar legacy — oculto, lógica se mantiene */}
            {/* List / Filters */}
            <div
              ref={listScrollRef}
              onScroll={checkListScroll}
              className={cn('flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200', isDark ? 'bg-neutral-900' : 'bg-neutral-50')}
              style={{ scrollbarWidth: 'none' }}
            >
              {showFilters ? (
                <div className="p-3 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {['Día', 'Semana', 'Mes'].map(d => (
                      <button key={d} onClick={() => setDateFilter(d)}
                        className={cn('px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border',
                          dateFilter === d ? 'bg-neutral-900 text-white border-transparent' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        )}
                      >{d}</button>
                    ))}
                    <button onClick={() => setDateFilter('Personalizado')}
                      className={cn('px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all border',
                        dateFilter === 'Personalizado' ? 'bg-neutral-900 text-white border-transparent' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      )}
                    >
                      <Calendar className="w-3 h-3" /> Personalizado
                    </button>
                  </div>
                  {dateFilter === 'Personalizado' && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-neutral-400 mb-1 block uppercase tracking-wider">Desde</label>
                        <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full text-[11px] bg-white border border-neutral-200 rounded-md px-2 py-1.5 outline-none font-medium text-neutral-700 focus:border-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-neutral-400 mb-1 block uppercase tracking-wider">Hasta</label>
                        <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full text-[11px] bg-white border border-neutral-200 rounded-md px-2 py-1.5 outline-none font-medium text-neutral-700 focus:border-neutral-400" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 border-t border-neutral-100 pt-3">
                    <div className="flex items-center justify-between py-1.5 mb-1">
                      <button onClick={toggleAll} className={cn('w-4 h-4 rounded flex items-center justify-center border transition-colors', selectedVehicles.length === vehicles.length ? 'bg-brand border-brand' : 'bg-white border-neutral-300 hover:border-neutral-400')}>
                        {selectedVehicles.length === vehicles.length
                          ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          : selectedVehicles.length > 0 ? <div className="w-2 h-0.5 bg-brand rounded-full" /> : null
                        }
                      </button>
                      <span className="text-[10px] font-medium text-neutral-400">{selectedVehicles.length} de {vehicles.length} seleccionados</span>
                    </div>
                    {filteredFleetForCheckboxes.map(vehicle => (
                      <div key={vehicle.id} className="flex items-center gap-2.5 py-1.5 hover:bg-neutral-50 cursor-pointer px-1 rounded-md" onClick={() => toggleVehicle(vehicle.id)}>
                        <div className={cn('w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0', selectedVehicles.includes(vehicle.id) ? 'bg-brand border-brand' : 'bg-white border-neutral-300')}>
                          {selectedVehicles.includes(vehicle.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[12px] font-medium text-neutral-700 truncate">{vehicle.plate} <span className="text-neutral-400 font-normal">· {vehicle.name}</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-neutral-100 sticky bottom-0 bg-white pb-2">
                    <button onClick={() => { clearFilters(); setShowFilters(false); }} className="flex-1 py-2 rounded-md text-[12px] font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors">Limpiar</button>
                    <button onClick={() => setShowFilters(false)} className="flex-1 py-2 rounded-md text-[12px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors">Aplicar</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {pinnedFleet.length > 0 && (
                    <div className={cn('sticky top-0 z-[60] border-b overflow-visible transition-colors duration-200', isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-100')}>
                      {pinnedFleet.map(vehicle => (
                        <VehicleAccordionItem
                          key={vehicle.id}
                          vehicle={vehicle}
                          isExpanded={selectedVehicleId === vehicle.id}
                          onToggle={() => handleToggleVehicle(vehicle.id)}
                          onShowToast={setToastMessage}
                          userRole={userRole}
                          profile={profile}
                          isPinned={true}
                          onTogglePin={() => togglePin(vehicle.id)}
                          onFlyTo={() => flyTo(vehicle.position as [number, number])}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  )}
                  <div className={pinnedFleet.length > 0 ? 'pt-2' : ''}>
                    {unpinnedFleet.map(vehicle => (
                      <VehicleAccordionItem
                        key={vehicle.id}
                        vehicle={vehicle}
                        isExpanded={selectedVehicleId === vehicle.id}
                        onToggle={() => handleToggleVehicle(vehicle.id)}
                        onShowToast={setToastMessage}
                        userRole={userRole}
                        profile={profile}
                        isPinned={false}
                        onTogglePin={() => togglePin(vehicle.id)}
                        onFlyTo={() => flyTo(vehicle.position as [number, number])}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  {visibleFleet.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[12px] text-neutral-400 font-medium">Sin resultados</p>
                    </div>
                  )}

                  {/* Scroll hint — C-Loc */}
                  <AnimatePresence>
                    {showListScrollHint && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="sticky bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none"
                      >
                        <div className={cn('w-full h-5 bg-gradient-to-t to-transparent', isDark ? 'from-neutral-900 via-neutral-900/60' : 'from-neutral-50 via-neutral-50/60')} />
                        <div className={cn('w-full flex justify-center pb-2', isDark ? 'bg-neutral-900' : 'bg-neutral-50')}>
                          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                            <ChevronDown className="w-5 h-5 text-neutral-500" strokeWidth={2.5} />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'viajes' && (
          <div className="flex flex-col flex-1 items-center justify-center gap-2 text-neutral-300">
            <Route className="w-8 h-8" strokeWidth={1.5} />
            <p className="text-[12px] font-medium text-neutral-400">Próximamente</p>
          </div>
        )}

        <Toast message={toastMessage} isVisible={!!toastMessage} onClose={() => setToastMessage('')} />
      </div>
    );
  }

  return (
    <div className="absolute top-5 left-5 right-5 z-10 flex gap-4 items-start pointer-events-none">

      {/* Panel principal */}
      <motion.div
        data-vehicle-panel
        animate={{ opacity: isMapMoving ? 0 : 1, x: isMapMoving ? -12 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col gap-4 pointer-events-auto"
        style={{ pointerEvents: isMapMoving ? 'none' : undefined }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white/85 backdrop-blur-2xl rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200/50 min-w-[340px] w-[340px] flex flex-col"
        >
          {/* Header del monitor */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 mb-0.5 tracking-widest uppercase">Monitor general</div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">Actividad de hoy</h2>
                <div className="w-2 h-2 bg-[#34C759] rounded-full shadow-[0_0_8px_rgba(52,199,89,0.5)]" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[18px] font-bold text-slate-900 leading-none">{vehicles.length}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Unidades</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleTab('ubicaciones')}
              className={cn('flex-1 py-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none',
                activeTab === 'ubicaciones' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} /> Ubicaciones
            </button>
            <button
              onClick={() => toggleTab('viajes')}
              className={cn('flex-1 py-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none',
                activeTab === 'viajes' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Route className="w-3.5 h-3.5" strokeWidth={1.75} /> Viajes
            </button>
          </div>

          <AnimatePresence>
            {activeTab === 'ubicaciones' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="w-full flex justify-center"
              >
                <div className="w-full overflow-hidden flex flex-col">

                  {/* Búsqueda */}
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 transition-all shadow-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por placa o conductor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent outline-none text-[12px] font-medium text-slate-900 w-full placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Barra de filtros */}
                  <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      {showFilters ? 'Filtros' : `${visibleFleet.length} vehículos`}
                    </span>
                    <div className="flex items-center gap-2">
                      {isFilterActive && !showFilters && (
                        <button onClick={clearFilters} className="text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors">
                          Limpiar
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors',
                          showFilters || isFilterActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        )}
                      >
                        <Filter className="w-3 h-3" />
                        {showFilters ? 'VOLVER' : (isFilterActive ? 'FILTRADO' : 'FILTROS')}
                      </button>
                    </div>
                  </div>

                  {/* Área de contenido */}
                  <div className={cn('relative flex flex-col px-0.5 pb-2 transition-all', showFilters ? 'h-[calc(100vh-320px)]' : 'max-h-[calc(100vh-320px)]')}>
                    <AnimatePresence mode="wait">
                      {showFilters ? (
                        /* Panel de filtros */
                        <motion.div
                          key="filters"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col h-full overflow-hidden"
                        >
                          <div className="shrink-0 mb-2 px-1 mt-1">
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {['Día', 'Semana', 'Mes'].map(d => (
                                <button key={d} onClick={() => setDateFilter(d)}
                                  className={cn('px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border',
                                    dateFilter === d ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  )}
                                >{d}</button>
                              ))}
                              <button onClick={() => setDateFilter('Personalizado')}
                                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border',
                                  dateFilter === 'Personalizado' ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                )}
                              >
                                <Calendar className="w-3.5 h-3.5" /> Personalizado
                              </button>
                            </div>

                            <AnimatePresence>
                              {dateFilter === 'Personalizado' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center gap-2 mb-3 overflow-hidden">
                                  <div className="flex-1">
                                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Desde</label>
                                    <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full text-[12px] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Hasta</label>
                                    <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full text-[12px] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100/80 px-1 mt-1">
                              <button onClick={toggleAll} className={cn('w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm', selectedVehicles.length === vehicles.length ? 'bg-brand border-brand' : 'bg-white border-gray-300 hover:border-gray-400')}>
                                {selectedVehicles.length === vehicles.length
                                  ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                  : selectedVehicles.length > 0
                                    ? <div className="w-2.5 h-0.5 bg-brand rounded-full" />
                                    : null
                                }
                              </button>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{selectedVehicles.length} de {vehicles.length} seleccionados</span>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
                            <div className="flex flex-col gap-0.5">
                              {filteredFleetForCheckboxes.map(vehicle => (
                                <div key={vehicle.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={() => toggleVehicle(vehicle.id)}>
                                  <div className={cn('w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm shrink-0', selectedVehicles.includes(vehicle.id) ? 'bg-brand border-brand' : 'bg-white border-gray-300')}>
                                    {selectedVehicles.includes(vehicle.id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                  </div>
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="text-[13px] font-semibold text-gray-900 truncate">{vehicle.plate}</span>
                                    <span className="text-gray-400 font-medium text-[11px] truncate">• {vehicle.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="shrink-0 flex gap-2 mt-3 pt-3 border-t border-gray-100/80 px-1">
                            <button onClick={() => { clearFilters(); setShowFilters(false); }} className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors">
                              Limpiar
                            </button>
                            <button onClick={() => setShowFilters(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white bg-gray-900 hover:bg-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors">
                              Aplicar
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        /* Lista de vehículos */
                        <motion.div
                          key="list"
                          ref={listScrollRef}
                          onScroll={checkListScroll}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col overflow-y-auto scrollbar-hide flex-1 px-0.5 h-full [&::-webkit-scrollbar]:hidden bg-white"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {/* Sección fijada — sticky dentro del scroll */}
                          {pinnedFleet.length > 0 && (
                            <div className="sticky top-0 z-10 flex flex-col gap-0.5 pb-1 bg-white">
                              {pinnedFleet.map(vehicle => (
                                <VehicleAccordionItem
                                  key={vehicle.id}
                                  vehicle={vehicle}
                                  isExpanded={selectedVehicleId === vehicle.id}
                                  onToggle={() => handleToggleVehicle(vehicle.id)}
                                  onShowToast={setToastMessage}
                                  userRole={userRole}
                                  profile={profile}
                                  isPinned={true}
                                  onTogglePin={() => togglePin(vehicle.id)}
                                  onFlyTo={() => {
                                    window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position: vehicle.position, offsetX: 180 } }));
                                  }}
                                />
                              ))}
                              <div className="w-full h-px bg-brand/15 mt-0.5" />
                            </div>
                          )}

                          {/* Sección regular — scrollable */}
                          <div className="flex flex-col gap-0.5 pb-2 pt-0.5">
                            {unpinnedFleet.map(vehicle => (
                              <VehicleAccordionItem
                                key={vehicle.id}
                                vehicle={vehicle}
                                isExpanded={selectedVehicleId === vehicle.id}
                                onToggle={() => handleToggleVehicle(vehicle.id)}
                                onShowToast={setToastMessage}
                                userRole={userRole}
                                profile={profile}
                                isPinned={false}
                                onTogglePin={() => togglePin(vehicle.id)}
                                onFlyTo={() => {
                                  window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position: vehicle.position, offsetX: 180 } }));
                                }}
                              />
                            ))}
                            {visibleFleet.length === 0 && (
                              <div className="py-8 text-center">
                                <p className="text-[12px] text-gray-400 font-medium">Sin resultados</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Scroll hint */}
                    <AnimatePresence>
                      {showListScrollHint && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none rounded-b-xl overflow-hidden"
                        >
                          <div className="w-full h-5 bg-gradient-to-t from-white via-white/60 to-transparent" />
                          <div className="w-full bg-white flex justify-center pb-1">
                            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                              <ChevronDown className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* StatCards — solo C-Go, no admin/esad */}
      <AnimatePresence>
        {profile === 'c-go' && userRole !== 'admin' && userRole !== 'esad' && (
          <motion.div
            data-stats-row
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: isMapMoving ? 0 : 1, y: isMapMoving ? -8 : 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex gap-2 flex-wrap flex-1 max-w-4xl"
            style={{ pointerEvents: isMapMoving ? 'none' : undefined }}
          >
            <StatCard icon={Activity} value="2,450 km" label="Distancia total" iconColor="text-[#34C759]" iconBg="bg-[#34C759]/10" delay={0.1} />
            <StatCard icon={Car} value="142" label="Viajes realizados" iconColor="text-blue-600" iconBg="bg-blue-600/10" delay={0.2} />
            <StatCard icon={Clock} value="42h 15m" label="Tiempo recorrido" iconColor="text-orange-500" iconBg="bg-orange-500/10" delay={0.3} />
            <StatCard icon={Star} value="4.92" label="Calificación" iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0.4} />
            <StatCard icon={CreditCard} value="S/ 485.50" label="Peajes y gastos" iconColor="text-purple-500" iconBg="bg-purple-500/10" delay={0.5} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toastMessage} isVisible={!!toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
