import React, { useState, useEffect } from 'react';
import { Download, Plus, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, PowerOff, Copy, Send, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { NuevoGrupoModule } from './NuevoGrupoModule';

const RUTAS_DATA = [
  {
    id: 'CMP-24-001',
    name: 'Carretera Néstor Gambeta 60 KM/H',
    group: 'LIMA - PASCO CENTRAL',
    company: 'Comsatel Perú SAC',
    config: { radio: '50m', alertas: 'Activo' },
    status: 'activo'
  },
  {
    id: 'CMP-24-002',
    name: 'Pasco - Desvío Huaral 80 KM/H',
    group: 'PASCO - HUARAL SUR',
    company: 'Logística Total SAC',
    config: { radio: '80m', alertas: 'Activo' },
    status: 'activo'
  },
  {
    id: 'CMP-24-003',
    name: 'Colegio Zona Urbana 30 KM/H',
    group: 'LIMA - PASCO NORTE',
    company: 'Comsatel Perú SAC',
    config: { radio: '30m', alertas: 'Activo' },
    status: 'activo'
  },
  {
    id: 'CMP-24-004',
    name: 'Zona de Mina Chungar 40 KM/H',
    group: 'HUARAL - PASCO ESTE',
    company: 'Volcan Minera',
    config: { radio: '40m', alertas: 'Activo' },
    status: 'activo'
  },
  {
    id: 'CMP-24-005',
    name: 'Chungar Sector Urbano 60 KM/H',
    group: 'PASCO CENTRAL',
    company: 'Volcan Minera',
    config: { radio: '60m', alertas: 'Inactivo' },
    status: 'inactivo'
  },
  {
    id: 'CMP-24-006',
    name: 'Av. Universitaria 40 KM/H',
    group: 'LIMA METROPOLITANA',
    company: 'Logística Total SAC',
    config: { radio: '40m', alertas: 'Activo' },
    status: 'activo'
  },
  {
    id: 'CMP-24-007',
    name: 'Panamericana Sur 90 KM/H',
    group: 'SUR CHICO',
    company: 'Transportes Rápidos',
    config: { radio: '100m', alertas: 'Inactivo' },
    status: 'inactivo'
  },
  {
    id: 'CMP-24-008',
    name: 'Ruta Industrial Callao 50 KM/H',
    group: 'CALLAO PUERTO',
    company: 'Comsatel Perú SAC',
    config: { radio: '55m', alertas: 'Activo' },
    status: 'activo'
  }
];

export function CaminosModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('Todas');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  type SortConfig = { key: string; direction: 'asc' | 'desc' | null };
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const companies = Array.from(new Set(RUTAS_DATA.map(r => r.company)));
  const groups = Array.from(new Set(RUTAS_DATA.map(r => r.group)));

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="w-3.5 h-3.5 text-[#0052CC]" />;
    return <ArrowDown className="w-3.5 h-3.5 text-[#0052CC]" />;
  };

  const filteredData = RUTAS_DATA.filter(ruta => {
    if (selectedStatus !== 'Todos' && ruta.status !== selectedStatus.toLowerCase()) return false;
    if (selectedCompany !== 'Todas' && ruta.company !== selectedCompany) return false;
    if (selectedGroup !== 'Todos' && ruta.group !== selectedGroup) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return ruta.name.toLowerCase().includes(q) || 
             ruta.group.toLowerCase().includes(q) || 
             ruta.company.toLowerCase().includes(q) ||
             ruta.id.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (!sortConfig.direction) return 0;
    
    let aValue: any = a[sortConfig.key as keyof typeof a];
    let bValue: any = b[sortConfig.key as keyof typeof b];

    // Handle nested objects if necessary (like config)
    if (sortConfig.key === 'config.radio') {
      aValue = parseInt(a.config.radio);
      bValue = parseInt(b.config.radio);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredCompanies = companies.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));
  const filteredGroups = groups.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase()));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedData.map(r => r.id);
      setSelectedIds(new Set([...selectedIds, ...allIds]));
    } else {
      const newSelectedIds = new Set(selectedIds);
      paginatedData.forEach(r => newSelectedIds.delete(r.id));
      setSelectedIds(newSelectedIds);
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const isAllPaginatedSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomePaginatedSelected = paginatedData.some(r => selectedIds.has(r.id));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompany, selectedGroup, selectedStatus]);

  return (
    <div className="w-full h-full bg-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Gestión de Caminos</h1>
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-widest shrink-0">
              Mantenimiento
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            Administración centralizada de caminos y trayectorias logísticas.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">Exportar</span>
          </button>
          <button 
            onClick={() => setIsCreatingGroup(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0052CC] hover:bg-[#0047b3] text-white rounded-lg text-sm font-semibold transition-colors shadow-[0_2px_8px_rgba(0,82,204,0.2)]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nuevo Grupo</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 md:px-8 py-4 flex flex-wrap items-end justify-between gap-4 shrink-0 z-20">
        <div className="w-full md:w-auto md:flex-1 max-w-md shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por placa, nombre o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Compañía Filter (Searchable Select) */}
          <div className="relative w-[240px]">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Compañía</label>
            <div 
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            >
              <span className="truncate">{selectedCompany}</span>
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" />
            </div>
            
            {isCompanyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCompanyOpen(false)}></div>
                <div className="absolute top-[calc(100%+4px)] left-0 w-[240px] bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Buscar empresa..."
                        value={companySearch}
                        onChange={e => setCompanySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-[13px] font-medium focus:ring-0 outline-none placeholder:text-gray-400"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1 bg-white">
                    <button 
                      onClick={() => { setSelectedCompany('Todas'); setIsCompanyOpen(false); setCompanySearch(''); }}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors", selectedCompany === 'Todas' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50")}
                    >
                      Todas
                    </button>
                    {filteredCompanies.map(c => (
                      <button 
                        key={c}
                        onClick={() => { setSelectedCompany(c); setIsCompanyOpen(false); setCompanySearch(''); }}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors truncate", selectedCompany === c ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50")}
                      >
                        {c}
                      </button>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <div className="px-3 py-4 text-center text-[13px] text-gray-500 font-medium">No hay resultados</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Grupo Logístico Filter (Searchable Select) */}
          <div className="relative w-[240px]">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Grupo Logístico</label>
            <div 
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              onClick={() => setIsGroupOpen(!isGroupOpen)}
            >
              <span className="truncate">{selectedGroup}</span>
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" />
            </div>
            
            {isGroupOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsGroupOpen(false)}></div>
                <div className="absolute top-[calc(100%+4px)] left-0 w-[240px] bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Buscar grupo..."
                        value={groupSearch}
                        onChange={e => setGroupSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-[13px] font-medium focus:ring-0 outline-none placeholder:text-gray-400"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1 bg-white">
                    <button 
                      onClick={() => { setSelectedGroup('Todos'); setIsGroupOpen(false); setGroupSearch(''); }}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors", selectedGroup === 'Todos' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50")}
                    >
                      Todos
                    </button>
                    {filteredGroups.map(g => (
                      <button 
                        key={g}
                        onClick={() => { setSelectedGroup(g); setIsGroupOpen(false); setGroupSearch(''); }}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors truncate", selectedGroup === g ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50")}
                      >
                        {g}
                      </button>
                    ))}
                    {filteredGroups.length === 0 && (
                      <div className="px-3 py-4 text-center text-[13px] text-gray-500 font-medium">No hay resultados</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Estado Filter */}
          <div className="w-[160px]">
             <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Estado</label>
             <select 
               value={selectedStatus}
               onChange={e => setSelectedStatus(e.target.value)}
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all cursor-pointer appearance-none"
               style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
             >
               <option value="Todos">Todos</option>
               <option value="Activo">Activo</option>
               <option value="Inactivo">Inactivo</option>
             </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-4 md:px-8 pb-8 flex flex-col z-10 w-full relative flex-1">
        
        <div className="w-full border border-gray-200 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden">
          <div className="overflow-x-auto rounded-t-xl">
            <table className="w-full text-left border-collapse min-w-full whitespace-nowrap">
              <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur shadow-[0_1px_0_0_#E5E7EB]">
                <tr>
                  <th className="py-4 pl-6 pr-4 w-12 border-b border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={isAllPaginatedSelected}
                      ref={input => {
                        if (input) {
                          input.indeterminate = isSomePaginatedSelected && !isAllPaginatedSelected;
                        }
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]/20 cursor-pointer" 
                    />
                  </th>
                  <th 
                    className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">Identificación y Nombre {getSortIcon('name')}</div>
                  </th>
                  <th 
                    className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                    onClick={() => handleSort('group')}
                  >
                    <div className="flex items-center gap-2">Grupo Logístico {getSortIcon('group')}</div>
                  </th>
                  <th 
                    className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center gap-2">Responsable / Empresa {getSortIcon('company')}</div>
                  </th>
                  <th 
                    className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                    onClick={() => handleSort('config.radio')}
                  >
                    <div className="flex items-center gap-2">Configuración {getSortIcon('config.radio')}</div>
                  </th>
                  <th 
                    className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">Estado {getSortIcon('status')}</div>
                  </th>
                  <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24 text-center border-b border-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedData.length > 0 ? (
                  paginatedData.map((ruta, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={ruta.id} 
                      className={cn("border-b border-gray-100 hover:bg-gray-50/50 transition-colors group", selectedIds.has(ruta.id) ? "bg-blue-50/30" : "")}
                    >
                      <td className="py-4 pl-6 pr-4 cursor-pointer" onClick={(e) => handleSelectOne(ruta.id, e)}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(ruta.id)}
                          onChange={() => {}} /* Controlled through the td element */
                          className="w-4 h-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]/20 cursor-pointer pointer-events-none" 
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{ruta.name}</span>
                          <span className="text-xs font-medium text-gray-500">ID: {ruta.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100/80 text-[11px] font-bold text-gray-600 uppercase tracking-wide border border-gray-200/50">
                          {ruta.group}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-700">{ruta.company}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Radio</span>
                            <span className="text-sm font-bold text-gray-900">{ruta.config.radio}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alertas</span>
                            <span className="text-sm font-bold text-gray-900">{ruta.config.alertas}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {ruta.status === 'activo' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] text-[11px] font-bold uppercase tracking-wide border border-[#ECFDF3]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wide border border-gray-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === ruta.id ? null : ruta.id);
                          }}
                          className={cn("p-1.5 rounded-lg transition-colors", activeDropdownId === ruta.id ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100")}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {activeDropdownId === ruta.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownId(null)} />
                            <div className={cn(
                              "absolute right-12 w-40 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[60] py-1.5 flex flex-col text-left",
                              i >= 2 ? "bottom-2" : "top-2"
                            )}>
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <Pencil className="w-3.5 h-3.5 text-gray-400" /> Editar
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <Copy className="w-3.5 h-3.5 text-gray-400" /> Copiar a
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <Download className="w-3.5 h-3.5 text-gray-400" /> Exportar
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <Send className="w-3.5 h-3.5 text-gray-400" /> Enviar
                              </button>
                              <div className="h-px bg-gray-100 my-1.5 mx-2" />
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <PowerOff className="w-3.5 h-3.5 text-gray-400" /> Inactivar
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm font-medium text-gray-500">
                      No se encontraron caminos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 rounded-b-xl overflow-x-auto">
            <div className="flex items-center gap-4">
              <span className="text-xs md:text-[13px] font-medium text-gray-500 whitespace-nowrap">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, Math.max(1, filteredData.length))} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-[13px] font-medium text-gray-500">Filas por página:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1 outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide py-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded text-xs md:text-[13px] font-semibold transition-colors shrink-0",
                      currentPage === p 
                        ? "bg-[#0052CC] text-white border border-[#0052CC]" 
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating Bulk Actions Bar - One UI Style */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] p-2.5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-50 w-max min-w-[540px]"
          >
            <div className="flex items-center gap-5 pl-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#0052CC] text-white rounded-full flex items-center justify-center text-[14px] font-bold shadow-inner">
                  {selectedIds.size}
                </div>
                <span className="text-[14px] font-semibold text-gray-200">seleccionados</span>
              </div>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center gap-1.5">
                <button className="px-4 py-2 text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all">Alternar Estado</button>
                <button className="px-4 py-2 text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all">Duplicar</button>
                <button className="px-4 py-2 text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all">Mover Grupo</button>
              </div>
            </div>
            <div className="flex items-center gap-2 pr-1 ml-6">
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 text-[13px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-2xl text-[13px] font-bold transition-all shadow-sm shadow-red-900/20">
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreatingGroup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-[60]"
          >
            <NuevoGrupoModule onBack={() => setIsCreatingGroup(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
