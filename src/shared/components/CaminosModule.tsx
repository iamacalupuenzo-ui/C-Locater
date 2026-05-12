import React, { useState, useEffect } from 'react';
import {
  Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Pencil, Trash2, PowerOff, Copy, Send,
  ArrowUpDown, ArrowUp, ArrowDown, Search, X, Filter,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { StatusBadge, TagBadge } from './ui/Badge';
import { SearchInput } from './ui/SearchInput';
import { DropdownMenu } from './ui/DropdownMenu';
import { NuevoGrupoModule } from './NuevoGrupoModule';

const RUTAS_DATA = [
  { id: 'CMP-24-001', name: 'Carretera Néstor Gambeta', group: 'LIMA - PASCO CENTRAL', company: 'Comsatel Perú SAC',  config: { radio: '50m', alertas: 'Activo'   }, status: 'activo'   },
  { id: 'CMP-24-002', name: 'Pasco - Desvío Huaral',    group: 'PASCO - HUARAL SUR',  company: 'Logística Total SAC', config: { radio: '80m', alertas: 'Activo'   }, status: 'activo'   },
  { id: 'CMP-24-003', name: 'Colegio Zona Urbana',      group: 'LIMA - PASCO NORTE',  company: 'Comsatel Perú SAC',  config: { radio: '30m', alertas: 'Activo'   }, status: 'activo'   },
  { id: 'CMP-24-004', name: 'Zona de Mina Chungar',     group: 'HUARAL - PASCO ESTE', company: 'Volcan Minera',       config: { radio: '40m', alertas: 'Activo'   }, status: 'activo'   },
  { id: 'CMP-24-005', name: 'Chungar Sector Urbano',    group: 'PASCO CENTRAL',       company: 'Volcan Minera',       config: { radio: '60m', alertas: 'Inactivo' }, status: 'inactivo' },
  { id: 'CMP-24-006', name: 'Av. Universitaria',        group: 'LIMA METROPOLITANA',  company: 'Logística Total SAC', config: { radio: '40m', alertas: 'Activo'   }, status: 'activo'   },
  { id: 'CMP-24-007', name: 'Panamericana Sur',         group: 'SUR CHICO',           company: 'Transportes Rápidos', config: { radio: '100m', alertas: 'Inactivo'}, status: 'inactivo' },
  { id: 'CMP-24-008', name: 'Ruta Industrial Callao',   group: 'CALLAO PUERTO',       company: 'Comsatel Perú SAC',  config: { radio: '55m', alertas: 'Activo'   }, status: 'activo'   },
];

type Ruta = typeof RUTAS_DATA[0];
type SortConfig = { key: string; direction: 'asc' | 'desc' | null };

// Searchable dropdown reutilizable para filtros
function FilterSelect({
  label,
  value,
  options,
  onSelect,
  allLabel = 'Todos',
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const isActive = value !== allLabel;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-lg text-sm min-w-[160px] transition-colors',
            isActive ? 'border-gray-700 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <span className="truncate">{value}</span>
          <Filter className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-gray-700' : 'text-gray-300')} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(''); }} />
            <div className="absolute top-[calc(100%+6px)] left-0 w-max min-w-full max-w-[240px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-50">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Buscar..."
                    className="bg-transparent outline-none text-xs w-full text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                <button
                  onClick={() => { onSelect(allLabel); setOpen(false); setQuery(''); }}
                  className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', value === allLabel ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                >
                  {allLabel}
                </button>
                {filtered.map(o => (
                  <button
                    key={o}
                    onClick={() => { onSelect(o); setOpen(false); setQuery(''); }}
                    className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', value === o ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                  >
                    {o}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-3 text-center text-xs text-gray-400">Sin resultados</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Ícono de ordenamiento reutilizable
function SortIcon({ colKey, config }: { colKey: string; config: SortConfig }) {
  if (config.key !== colKey || !config.direction)
    return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />;
  if (config.direction === 'asc') return <ArrowUp className="w-3 h-3" />;
  return <ArrowDown className="w-3 h-3" />;
}

// Cabecera de columna ordenable
function SortableTh({ colKey, label, sortConfig, onSort, className }: {
  colKey: string; label: string; sortConfig: SortConfig;
  onSort: (k: string) => void; className?: string;
}) {
  return (
    <th
      className={cn('py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-600 group transition-colors select-none', className)}
      onClick={() => onSort(colKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon colKey={colKey} config={sortConfig} />
      </div>
    </th>
  );
}

export function CaminosModule() {
  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedCompany, setSelectedCompany] = useState('Todas');
  const [selectedGroup,   setSelectedGroup]   = useState('Todos');
  const [selectedStatus,  setSelectedStatus]  = useState('Todos');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [itemsPerPage,    setItemsPerPage]    = useState(5);
  const [sortConfig,      setSortConfig]      = useState<SortConfig>({ key: '', direction: null });
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const companies = Array.from(new Set(RUTAS_DATA.map(r => r.company)));
  const groups    = Array.from(new Set(RUTAS_DATA.map(r => r.group)));
  const hasFilters = selectedCompany !== 'Todas' || selectedGroup !== 'Todos' || selectedStatus !== 'Todos' || searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCompany('Todas');
    setSelectedGroup('Todos'); setSelectedStatus('Todos');
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'asc',
    }));
  };

  const filteredData = RUTAS_DATA
    .filter(r => {
      if (selectedStatus !== 'Todos' && r.status !== selectedStatus.toLowerCase()) return false;
      if (selectedCompany !== 'Todas' && r.company !== selectedCompany) return false;
      if (selectedGroup !== 'Todos' && r.group !== selectedGroup) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig.direction) return 0;
      const av = a[sortConfig.key as keyof Ruta] as string;
      const bv = b[sortConfig.key as keyof Ruta] as string;
      return sortConfig.direction === 'asc' ? av < bv ? -1 : 1 : av > bv ? -1 : 1;
    });

  const totalPages   = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = paginatedData.some(r => selectedIds.has(r.id));

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedIds);
    if (e.target.checked) paginatedData.forEach(r => next.add(r.id));
    else paginatedData.forEach(r => next.delete(r.id));
    setSelectedIds(next);
  };

  const toggleOne = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCompany, selectedGroup, selectedStatus]);

  return (
    <div className="w-full h-full bg-[#FAFAF8] overflow-y-auto">
      <div className="max-w-screen-xl mx-auto px-8 py-8 flex flex-col gap-6">

        {/* Cabecera de página */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1 tracking-wide">Gestión</p>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Caminos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Trayectorias y configuración de zonas logísticas.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="md">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsCreatingGroup(true)}>
              <Plus className="w-4 h-4" />
              Nuevo grupo
            </Button>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            placeholder="Buscar por nombre, empresa o ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            containerClassName="flex-1 min-w-[200px] max-w-xs"
          />

          <FilterSelect
            label="Empresa"
            value={selectedCompany}
            options={companies}
            onSelect={setSelectedCompany}
            allLabel="Todas"
          />

          <FilterSelect
            label="Grupo logístico"
            value={selectedGroup}
            options={groups}
            onSelect={setSelectedGroup}
            allLabel="Todos"
          />

          {/* Estado — segmented control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Estado</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-[3px] gap-[2px]">
              {['Todos', 'Activo', 'Inactivo'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    selectedStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <div className="self-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-3.5 h-3.5" /> Limpiar
              </Button>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 pl-5 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isSomeSelected && !isAllSelected; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-gray-900"
                  />
                </th>
                <SortableTh colKey="name"    label="Ruta"          sortConfig={sortConfig} onSort={handleSort} className="w-[30%]" />
                <SortableTh colKey="group"   label="Grupo"         sortConfig={sortConfig} onSort={handleSort} className="w-[22%]" />
                <SortableTh colKey="company" label="Empresa"       sortConfig={sortConfig} onSort={handleSort} className="w-[20%]" />
                <th className="py-3 px-4 text-sm font-medium text-gray-400 w-[16%]">Configuración</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400 w-[10%]">Estado</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((ruta, i) => {
                  const isSelected = selectedIds.has(ruta.id);
                  return (
                    <motion.tr
                      key={ruta.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'border-b border-gray-50 transition-colors group',
                        isSelected ? 'bg-gray-50' : 'hover:bg-[#FAFAF8]'
                      )}
                    >
                      <td className="py-4 pl-5 pr-3 cursor-pointer" onClick={e => toggleOne(ruta.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer pointer-events-none accent-gray-900"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">{ruta.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{ruta.id}</p>
                      </td>

                      <td className="py-4 px-4">
                        <TagBadge>{ruta.group}</TagBadge>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{ruta.company}</span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">
                            Radio: <span className="font-medium text-gray-700">{ruta.config.radio}</span>
                          </span>
                          <span className={cn(
                            'text-xs font-medium flex items-center gap-1',
                            ruta.config.alertas === 'Activo' ? 'text-emerald-600' : 'text-gray-400'
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', ruta.config.alertas === 'Activo' ? 'bg-emerald-400' : 'bg-gray-300')} />
                            Alertas {ruta.config.alertas === 'Activo' ? 'activas' : 'inactivas'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={ruta.status} />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <DropdownMenu
                          items={[
                            { icon: Pencil,   label: 'Editar'    },
                            { icon: Copy,     label: 'Copiar'    },
                            { icon: Download, label: 'Exportar'  },
                            { icon: Send,     label: 'Enviar'    },
                            { icon: PowerOff, label: 'Inactivar', dividerBefore: true },
                            { icon: Trash2,   label: 'Eliminar',  danger: true },
                          ]}
                        >
                          {({ open, ref }) => (
                            <button
                              ref={ref}
                              onClick={e => { e.stopPropagation(); open(); }}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          )}
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-sm text-gray-400">Sin resultados para los filtros aplicados.</p>
                    <button onClick={clearFilters} className="mt-2 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors">
                      Limpiar filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                {Math.min((currentPage - 1) * itemsPerPage + 1, Math.max(1, filteredData.length))}–{Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Filas:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    currentPage === p ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones masivas */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] p-2 flex items-center gap-2 shadow-[0_16px_48px_rgba(0,0,0,0.22)] z-50 w-max"
          >
            <div className="flex items-center gap-3 pl-3">
              <span className="text-sm font-semibold text-gray-200">
                <span className="text-white font-bold">{selectedIds.size}</span> seleccionadas
              </span>
              <div className="w-px h-5 bg-gray-700" />
              <div className="flex items-center gap-0.5">
                {['Alternar estado', 'Duplicar', 'Mover grupo'].map(label => (
                  <button key={label} className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 pr-1 ml-2">
              <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                Cancelar
              </button>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-bold transition-all">
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Nuevo Grupo */}
      <AnimatePresence>
        {isCreatingGroup && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute inset-0 z-[60]"
          >
            <NuevoGrupoModule onBack={() => setIsCreatingGroup(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
