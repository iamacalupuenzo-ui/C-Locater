import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, Car, Clock, Star, CreditCard, Route, Lock, MapPin, Gauge, Compass, Battery, Target, Filter, Search, Calendar, Check, X, ChevronRight, ChevronLeft, MoreVertical, Pencil, Share2, Terminal } from 'lucide-react';
import { DropdownMenu, Modal, Button } from './ui';
import { FLEET_DATA } from '../lib/data';

export function StatCard({ icon: Icon, value, label, iconColor, iconBg, delay = 0 }: { icon: React.ElementType, value: string, label: string, iconColor: string, iconBg: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      className="bg-white/80 backdrop-blur-2xl rounded-[18px] p-2.5 pr-4 flex items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-white/60 flex-1 min-w-[140px] pointer-events-auto cursor-default transition-shadow"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-[18px] h-[18px]", iconColor)} strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <div className="text-[14px] font-semibold text-gray-900 tracking-tight leading-none mb-1">{value}</div>
        <div className="text-[11px] font-medium text-gray-500 leading-none">{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Simple vehicle row (no accordion, no edit button) ── */
function VehicleListItem({ vehicle, onSelect }: { vehicle: typeof FLEET_DATA[0]; onSelect: () => void; key?: string }) {
  const statusColor = vehicle.status === 'active' ? 'bg-[#34C759]' : vehicle.status === 'stopped' ? 'bg-[#FF3B30]' : 'bg-[#8E8E93]';

  return (
    <div
      onClick={onSelect}
      className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/90 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] group"
    >
      <div className="flex items-center gap-3">
        <div className="w-[34px] h-[34px] bg-gray-50 rounded-[10px] border border-gray-200/80 flex items-center justify-center relative shrink-0">
          <Car className="w-[18px] h-[18px] text-gray-600" />
          <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", statusColor)} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-gray-900 tracking-tight">{vehicle.plate}</span>
            <span className="text-[11px] font-medium text-gray-400">• {vehicle.name}</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 mt-0.5">{vehicle.speed}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
  );
}

/* ── Vehicle detail sheet (replaces accordion) ── */
function VehicleDetailSheet({ vehicle, onBack }: { vehicle: typeof FLEET_DATA[0]; onBack: () => void }) {
  const [showCommandModal, setShowCommandModal] = useState(false);

  return (
    <>
      <motion.div
        key="detail"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col h-full"
      >
        {/* Back header */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalle del vehículo</span>
        </div>

        {/* ZONA 1 — IDENTIDAD */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-center relative shrink-0">
              <Car className="w-5 h-5 text-gray-600" />
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                vehicle.status === 'active' ? 'bg-[#34C759]' : vehicle.status === 'stopped' ? 'bg-[#FF3B30]' : 'bg-[#8E8E93]'
              )} />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">{vehicle.plate}</span>
              <span className="text-[12px] font-medium text-gray-400">{vehicle.name}</span>
            </div>
          </div>
          
          <DropdownMenu items={[
            { icon: Pencil, label: 'Editar alias', onClick: () => {} },
            { icon: Share2, label: 'Compartir', onClick: () => {} }
          ]}>
            {({ open, ref }) => (
              <button ref={ref} onClick={open} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
          </DropdownMenu>
        </div>

        {/* ZONA 2 — ESTADO Y TELEMETRÍA */}
        <div className="bg-white/60 rounded-xl border border-gray-100/80 p-3 mb-3">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700 leading-tight">{vehicle.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] font-medium text-gray-400 tracking-wide">{vehicle.coords}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex items-center justify-between py-3 px-2 bg-white/60 rounded-xl border border-gray-100/80 mb-3">
          {[
            { icon: Gauge, value: vehicle.speed, label: 'Velocidad' },
            { icon: Compass, value: vehicle.direction, label: 'Dirección' },
            { icon: Activity, value: vehicle.odometer, label: 'Odómetro' },
            { icon: Battery, value: vehicle.fuel, label: 'Batería' },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px h-8 bg-gray-200/60" />}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <stat.icon className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] font-bold text-gray-700">{stat.value}</span>
                <span className="text-[8px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ZONA 3 — ACCIONES OPERATIVAS */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-2">
          <button className="py-2 bg-brand/10 text-brand rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-brand/20 transition-all border border-brand/10">
            <Route className="w-3.5 h-3.5" /> Viajes
          </button>
          <button className="py-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF3B30]/20 transition-all border border-[#FF3B30]/10">
            <Lock className="w-3.5 h-3.5" /> Estacionar
          </button>
          <button 
            onClick={() => setShowCommandModal(true)}
            className="py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          >
            <Terminal className="w-3.5 h-3.5" /> Comando
          </button>
        </div>
      </motion.div>

      <Modal 
        isOpen={showCommandModal} 
        onClose={() => setShowCommandModal(false)} 
        title="Enviar comando" 
        icon={Terminal}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCommandModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setShowCommandModal(false)}>Confirmar envío</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-gray-600">
            Estás a punto de enviar un comando operativo a la unidad <strong>{vehicle.plate} ({vehicle.name})</strong>. 
            Asegúrate de que es la unidad correcta antes de proceder.
          </p>
        </div>
      </Modal>
    </>
  );
}

export function FloatingStats() {
  const [activeTab, setActiveTab] = useState<string | null>('ubicaciones');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('Día');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(FLEET_DATA.map(v => v.id));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const isFilterActive = selectedVehicles.length !== FLEET_DATA.length || dateFilter !== 'Día' || customStartDate !== '' || customEndDate !== '';

  const clearFilters = () => {
    setDateFilter('Día');
    setSelectedVehicles(FLEET_DATA.map(v => v.id));
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedVehicles.length === FLEET_DATA.length) setSelectedVehicles([]);
    else setSelectedVehicles(FLEET_DATA.map(v => v.id));
  };

  // Search applies to the visible list (always)
  const visibleFleet = FLEET_DATA
    .filter(v => selectedVehicles.includes(v.id))
    .filter(v =>
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredFleetForCheckboxes = FLEET_DATA.filter(v =>
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedVehicle = FLEET_DATA.find(v => v.id === selectedVehicleId);

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
    setSelectedVehicleId(null);
  };

  return (
    <div className="absolute top-5 left-5 right-5 z-10 flex gap-4 items-start pointer-events-none">

      {/* Main Activity Monitor Column */}
      <div className="flex flex-col gap-4 pointer-events-auto">

        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white/80 backdrop-blur-2xl rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-white/60 min-w-[340px] w-[340px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="text-[10px] font-medium text-gray-400 mb-0.5 tracking-wide uppercase">Monitor general</div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">Actividad de hoy</h2>
                <div className="w-2 h-2 bg-[#34C759] rounded-full shadow-[0_0_8px_rgba(52,199,89,0.5)]"></div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Unidades</span>
              <span className="text-[13px] font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-black/5">6</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleTab('ubicaciones')}
              className={cn("flex-1 py-2 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none", activeTab === 'ubicaciones' ? "bg-gray-900 text-white shadow-md border border-transparent" : "bg-white border border-gray-200/80 text-gray-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50")}
            >
              <MapPin className="w-3.5 h-3.5" /> Ubicaciones
            </button>
            <button
              onClick={() => toggleTab('viajes')}
              className={cn("flex-1 py-2 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none", activeTab === 'viajes' ? "bg-gray-900 text-white shadow-md border border-transparent" : "bg-white border border-gray-200/80 text-gray-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50")}
            >
              <Route className="w-3.5 h-3.5" /> Viajes
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

                  {/* ─── Always-visible search bar ─── */}
                  {!selectedVehicle && (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Buscar por placa o conductor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-[12px] font-medium text-gray-900 w-full placeholder:text-gray-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* ─── Filter bar (compact) ─── */}
                  {!selectedVehicle && (
                    <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {showFilters ? 'Filtros' : `${visibleFleet.length} vehículos`}
                      </span>
                      <div className="flex items-center gap-2">
                        {isFilterActive && !showFilters && (
                          <button onClick={clearFilters} className="flex items-center justify-center w-7 h-7 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100" title="Limpiar filtros">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={cn("flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors", showFilters || isFilterActive ? "bg-gray-900 text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")}
                        >
                          <Filter className="w-3 h-3" />
                          {showFilters ? 'VOLVER' : (isFilterActive ? 'FILTRADO' : 'FILTROS')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Content area: filters | list | detail ─── */}
                  <div className={cn("flex flex-col px-0.5 pb-2 transition-all", showFilters ? "h-[calc(100vh-320px)]" : "max-h-[calc(100vh-320px)]")}>
                    <AnimatePresence mode="wait">
                      {selectedVehicle ? (
                        /* ─── Detail Sheet ─── */
                        <VehicleDetailSheet
                          vehicle={selectedVehicle}
                          onBack={() => setSelectedVehicleId(null)}
                        />
                      ) : showFilters ? (
                        /* ─── Filters Panel ─── */
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
                                  className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border", dateFilter === d ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                                >{d}</button>
                              ))}
                              <button onClick={() => setDateFilter('Personalizado')}
                                className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border", dateFilter === 'Personalizado' ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
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
                              <button onClick={toggleAll} className={cn("w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm", selectedVehicles.length === FLEET_DATA.length ? "bg-brand border-brand" : "bg-white border-gray-300 hover:border-gray-400")}>
                                {selectedVehicles.length === FLEET_DATA.length ? (
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                ) : selectedVehicles.length > 0 ? (
                                  <div className="w-2.5 h-0.5 bg-brand rounded-full" />
                                ) : null}
                              </button>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{selectedVehicles.length} de {FLEET_DATA.length} seleccionados</span>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
                            <div className="flex flex-col gap-0.5">
                              {filteredFleetForCheckboxes.map(vehicle => (
                                <div key={vehicle.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={() => toggleVehicle(vehicle.id)}>
                                  <div className={cn("w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm shrink-0", selectedVehicles.includes(vehicle.id) ? "bg-brand border-brand" : "bg-white border-gray-300")}>
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
                        /* ─── Vehicle List (simple rows with chevron) ─── */
                        <motion.div
                          key="list"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col overflow-y-auto scrollbar-hide flex-1 px-0.5 h-full"
                        >
                          <div className="pb-2 flex flex-col gap-0.5">
                            {visibleFleet.map(vehicle => (
                              <VehicleListItem
                                key={vehicle.id}
                                vehicle={vehicle}
                                onSelect={() => {
                                  setSelectedVehicleId(vehicle.id);
                                  window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: vehicle.position }));
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
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Row of Stat Cards */}
      <div className="flex gap-2 flex-wrap flex-1 max-w-4xl">
        <StatCard icon={Activity} value="2,450 km" label="Distancia total" iconColor="text-[#34C759]" iconBg="bg-[#34C759]/10" delay={0.1} />
        <StatCard icon={Car} value="142" label="Viajes realizados" iconColor="text-blue-600" iconBg="bg-blue-600/10" delay={0.2} />
        <StatCard icon={Clock} value="42h 15m" label="Tiempo recorrido" iconColor="text-orange-500" iconBg="bg-orange-500/10" delay={0.3} />
        <StatCard icon={Star} value="4.92" label="Calificación" iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0.4} />
        <StatCard icon={CreditCard} value="S/. 2,840.00" label="Costo estimado" iconColor="text-[#FF3B30]" iconBg="bg-[#FF3B30]/10" delay={0.5} />
      </div>
    </div>
  );
}
