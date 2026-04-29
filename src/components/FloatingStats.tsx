import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, Car, Clock, Star, CreditCard, Route, Lock, Pencil, ChevronDown, ChevronUp, MapPin, Gauge, Compass, Battery, Target, Filter, Search, Calendar, Check, X } from 'lucide-react';
import { FLEET_DATA } from '../lib/data';

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  iconColor, 
  iconBg,
  delay = 0 
}: { 
  icon: React.ElementType, 
  value: string, 
  label: string,
  iconColor: string,
  iconBg: string,
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2, shadow: "0 8px 24px rgba(0,0,0,0.06)" }}
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

function VehicleAccordionItem({ vehicle, isExpanded, onToggle }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#34C759]';
      case 'stopped': return 'bg-[#FF3B30]';
      case 'offline': return 'bg-[#8E8E93]';
      default: return 'bg-[#34C759]';
    }
  };

  return (
    <div className="bg-white/80 rounded-2xl border border-gray-100/80 mb-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between p-3 cursor-pointer" onClick={onToggle}>
         <div className="flex items-center gap-3">
           <div className="w-[34px] h-[34px] bg-gray-50 rounded-[10px] border border-gray-200/80 flex items-center justify-center relative shrink-0">
              <Car className="w-[18px] h-[18px] text-gray-600" />
              <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", getStatusColor(vehicle.status))} />
           </div>
           <div className="flex flex-col">
             <div className="flex items-center gap-1.5">
               <span className="text-[13px] font-bold text-gray-900 tracking-tight">{vehicle.plate}</span>
               <span className="text-[11px] font-medium text-gray-400">• {vehicle.name}</span>
             </div>
             {!isExpanded && (
               <span className="text-[11px] font-semibold text-gray-500 mt-0.5">{vehicle.speed}</span>
             )}
           </div>
         </div>
         
         <div className="flex items-center gap-2">
           <button 
             className="px-[10px] py-[5px] bg-[#007AFF]/10 hover:bg-[#007AFF]/15 text-[#007AFF] rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 border border-[#007AFF]/5"
             onClick={(e) => { e.stopPropagation(); /* handle edit */ }}
           >
              <span>Editar</span>
              <Pencil className="w-[10px] h-[10px]" />
           </button>
           {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" strokeWidth={2.5} /> : <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2.5}/>}
         </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 pt-0"
          >
            <div className="pt-2 border-t border-gray-100/80">
              {/* Location strings */}
              <div className="flex items-start gap-2 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#007AFF] mt-0.5 shrink-0" />
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">{vehicle.address}</span>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px] font-medium text-gray-400 tracking-wide">{vehicle.coords}</span>
              </div>

              {/* Micro stats grid */}
              <div className="flex items-center justify-between py-2.5 border-y border-gray-100/80 mb-3">
                <div className="flex flex-col items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#007AFF]"/>
                  <span className="text-[10px] font-semibold text-gray-600">{vehicle.speed}</span>
                </div>
                <div className="w-px h-6 bg-gray-200/60"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#007AFF]"/>
                  <span className="text-[10px] font-semibold text-gray-600">{vehicle.direction}</span>
                </div>
                <div className="w-px h-6 bg-gray-200/60"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#007AFF]"/>
                  <span className="text-[10px] font-semibold text-gray-600">{vehicle.odometer}</span>
                </div>
                <div className="w-px h-6 bg-gray-200/60"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-[#007AFF]"/>
                  <span className="text-[10px] font-semibold text-gray-600">{vehicle.fuel}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 bg-[#34C759]/10 text-[#34C759] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#34C759]/20 transition-all border border-[#34C759]/5">
                  <MapPin className="w-3.5 h-3.5" /> Ubicación
                </button>
                <button className="flex-1 py-1.5 bg-[#007AFF]/10 text-[#007AFF] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#007AFF]/20 transition-all border border-[#007AFF]/5">
                  <Route className="w-3.5 h-3.5" /> Viajes
                </button>
                <button className="flex-1 py-1.5 bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF3B30]/20 transition-all border border-[#FF3B30]/5">
                  <Lock className="w-3.5 h-3.5" /> Estacionar
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FloatingStats() {
  const [activeTab, setActiveTab] = useState<string | null>('ubicaciones');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('Día');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(FLEET_DATA.map(v => v.id));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const isFilterActive = selectedVehicles.length !== FLEET_DATA.length || searchQuery !== '' || dateFilter !== 'Día' || customStartDate !== '' || customEndDate !== '';

  const clearFilters = () => {
    setSearchQuery('');
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

  const filteredFleet = FLEET_DATA.filter(v => 
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="absolute top-5 left-5 right-5 z-10 flex gap-4 items-start pointer-events-none">
      
      {/* Main Activity Monitor Column */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
              <MapPin className="w-3.5 h-3.5" />
              Ubicaciones
            </button>
            <button 
              onClick={() => toggleTab('viajes')}
              className={cn("flex-1 py-2 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-none", activeTab === 'viajes' ? "bg-gray-900 text-white shadow-md border border-transparent" : "bg-white border border-gray-200/80 text-gray-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50")}
            >
              <Route className="w-3.5 h-3.5" />
              Viajes
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
                   <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{showFilters ? 'Filtros' : 'Filtro de flota'}</span>
                     <div className="flex items-center gap-2">
                       {isFilterActive && !showFilters && (
                         <button 
                           onClick={clearFilters}
                           className="flex items-center justify-center w-7 h-7 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                           title="Limpiar filtros"
                         >
                           <X className="w-3.5 h-3.5" />
                         </button>
                       )}
                       <button 
                         onClick={() => setShowFilters(!showFilters)}
                         className={cn("flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors", showFilters || (isFilterActive && !showFilters) ? "bg-gray-900 text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")}
                       >
                         <Filter className="w-3 h-3" />
                         {showFilters ? 'VOLVER' : (isFilterActive ? 'FILTRADO' : 'FILTROS')}
                       </button>
                     </div>
                   </div>
                   
                   <div className={cn("flex flex-col px-0.5 pb-2 transition-all", showFilters ? "h-[calc(100vh-280px)]" : "max-h-[calc(100vh-280px)]")}>
                     <AnimatePresence mode="wait">
                       {showFilters ? (
                         <motion.div 
                           key="filters"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="flex flex-col h-full overflow-hidden"
                         >
                           <div className="shrink-0 mb-2 px-1 mt-1">
                             <div className="flex flex-wrap gap-1.5 mb-3">
                               {['Día', 'Semana', 'Mes'].map(d => (
                                 <button 
                                   key={d}
                                   onClick={() => setDateFilter(d)}
                                   className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border", dateFilter === d ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                                 >
                                   {d}
                                 </button>
                               ))}
                               <button 
                                 onClick={() => setDateFilter('Personalizado')}
                                 className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] border", dateFilter === 'Personalizado' ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                               >
                                 <Calendar className="w-3.5 h-3.5" />
                                 Personalizado
                               </button>
                             </div>

                             <AnimatePresence>
                               {dateFilter === 'Personalizado' && (
                                 <motion.div 
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="flex items-center gap-2 mb-3 overflow-hidden"
                                 >
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

                             <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                               <Search className="w-4 h-4 text-gray-400" />
                               <input 
                                 type="text"
                                 placeholder="Buscar por placa o conductor..." 
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="bg-transparent outline-none text-[12px] font-medium text-gray-900 w-full placeholder:text-gray-400" 
                               />
                             </div>

                             <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100/80 px-1 mt-3">
                               <button 
                                 onClick={toggleAll} 
                                 className={cn("w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm", selectedVehicles.length === FLEET_DATA.length ? "bg-[#007AFF] border-[#007AFF]" : "bg-white border-gray-300 hover:border-gray-400")}
                               >
                                 {selectedVehicles.length === FLEET_DATA.length ? (
                                   <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                 ) : selectedVehicles.length > 0 ? (
                                   <div className="w-2.5 h-0.5 bg-[#007AFF] rounded-full" />
                                 ) : null}
                               </button>
                               <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{selectedVehicles.length} de {FLEET_DATA.length} seleccionados</span>
                             </div>
                           </div>

                           <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
                             <div className="flex flex-col gap-0.5">
                               {filteredFleet.map(vehicle => (
                                 <div 
                                   key={vehicle.id} 
                                   className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" 
                                   onClick={() => toggleVehicle(vehicle.id)}
                                 >
                                   <div className={cn("w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border transition-colors shadow-sm shrink-0", selectedVehicles.includes(vehicle.id) ? "bg-[#007AFF] border-[#007AFF]" : "bg-white border-gray-300")}>
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
                             <button 
                               onClick={() => {
                                 clearFilters();
                                 setShowFilters(false);
                               }} 
                               className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors"
                             >
                               Limpiar
                             </button>
                             <button 
                               onClick={() => setShowFilters(false)} 
                               className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white bg-gray-900 hover:bg-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors"
                             >
                               Aplicar
                             </button>
                           </div>
                         </motion.div>
                       ) : (
                         <motion.div 
                           key="list"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="flex flex-col overflow-y-auto scrollbar-hide flex-1 px-1 h-full"
                         >
                           <div className="pb-2">
                           {FLEET_DATA.filter(v => selectedVehicles.includes(v.id)).map(vehicle => (
                             <VehicleAccordionItem 
                               key={vehicle.id} 
                               vehicle={vehicle} 
                               isExpanded={expandedId === vehicle.id} 
                               onToggle={() => setExpandedId(expandedId === vehicle.id ? null : vehicle.id)} 
                             />
                           ))}
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
        <StatCard 
          icon={Activity} 
          value="2,450 km" 
          label="Distancia total" 
          iconColor="text-[#34C759]" 
          iconBg="bg-[#34C759]/10"
          delay={0.1}
        />
        <StatCard 
          icon={Car} 
          value="142" 
          label="Viajes realizados" 
          iconColor="text-blue-600" 
          iconBg="bg-blue-600/10"
          delay={0.2}
        />
        <StatCard 
          icon={Clock} 
          value="42h 15m" 
          label="Tiempo recorrido" 
          iconColor="text-orange-500" 
          iconBg="bg-orange-500/10"
          delay={0.3}
        />
        <StatCard 
          icon={Star} 
          value="4.92" 
          label="Calificación" 
          iconColor="text-amber-500" 
          iconBg="bg-amber-500/10"
          delay={0.4}
        />
        <StatCard 
          icon={CreditCard} 
          value="S/. 2,840.00" 
          label="Costo estimado" 
          iconColor="text-[#FF3B30]" 
          iconBg="bg-[#FF3B30]/10"
          delay={0.5}
        />
      </div>

    </div>
  );
}
