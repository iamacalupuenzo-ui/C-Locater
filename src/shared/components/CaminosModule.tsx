import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Pencil, Trash2, Copy, Send, PowerOff,
  ArrowUpDown, ArrowUp, ArrowDown, Search, X, Filter,
  SlidersHorizontal, GripVertical, RotateCcw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { StatusBadge, TagBadge } from './ui/Badge';
import { SearchInput } from './ui/SearchInput';
import { DropdownMenu } from './ui/DropdownMenu';
import { Checkbox } from './ui/Checkbox';
import { SegmentedControl } from './ui/SegmentedControl';
import { IconButton } from './ui/IconButton';
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
type ColDef = { key: string; label: string; visible: boolean };

const DEFAULT_COLS: ColDef[] = [
  { key: 'name',    label: 'Ruta',          visible: true },
  { key: 'company', label: 'Empresa',        visible: true },
  { key: 'group',   label: 'Grupo',          visible: true },
  { key: 'config',  label: 'Configuración',  visible: true },
  { key: 'status',  label: 'Estado',         visible: true },
];

// Searchable dropdown reutilizable para filtros
function FilterSelect({
  label, value, options, onSelect, allLabel = 'Todos',
}: {
  label: string; value: string; options: string[];
  onSelect: (v: string) => void; allLabel?: string;
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
            'flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-lg text-xs min-w-[160px] transition-colors',
            isActive ? 'border-gray-700 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <span className="truncate">{value}</span>
          <Filter className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-gray-700' : 'text-gray-400')} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(''); }} />
            <div className="absolute top-[calc(100%+6px)] left-0 w-max min-w-full max-w-[240px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-50">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    autoFocus type="text" value={query}
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
                  className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-colors', value === allLabel ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                >
                  {allLabel}
                </button>
                {filtered.map(o => (
                  <button key={o} onClick={() => { onSelect(o); setOpen(false); setQuery(''); }}
                    className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-colors', value === o ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                  >
                    {o}
                  </button>
                ))}
                {filtered.length === 0 && <p className="px-3 py-3 text-center text-xs text-gray-400">Sin resultados</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SortIcon({ colKey, config }: { colKey: string; config: SortConfig }) {
  if (config.key !== colKey || !config.direction) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  if (config.direction === 'asc') return <ArrowUp className="w-3 h-3" />;
  return <ArrowDown className="w-3 h-3" />;
}

function SortableTh({ colKey, label, sortConfig, onSort, className }: {
  colKey: string; label: string; sortConfig: SortConfig;
  onSort: (k: string) => void; className?: string; key?: React.Key;
}) {
  return (
    <th
      className={cn('py-3 px-4 text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none', className)}
      onClick={() => onSort(colKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon colKey={colKey} config={sortConfig} />
      </div>
    </th>
  );
}

// Panel de configuración de columnas
function ColumnConfigurator({
  columns, onToggle, onMove, onReset, anchorRef, onClose,
}: {
  columns: ColDef[];
  onToggle: (key: string) => void;
  onMove: (key: string, dir: -1 | 1) => void;
  onReset: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panelW = 248;
    const left = Math.min(rect.left, window.innerWidth - panelW - 8);
    setPos({ top: rect.bottom + 6, left });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  if (!pos) return null;

  const visibleCount = columns.filter(c => c.visible).length;

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      style={{ top: pos.top, left: pos.left, width: 248 }}
      className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-gray-900">Columnas</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {visibleCount} de {columns.length} visibles
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors py-1 px-1.5 rounded-md hover:bg-gray-50"
          title="Restaurar orden y visibilidad por defecto"
        >
          <RotateCcw className="w-3 h-3" />
          Restaurar
        </button>
      </div>

      {/* Lista de columnas */}
      <div className="p-2">
        {columns.map((col, i) => (
          <div
            key={col.key}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 group transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 cursor-grab" />

            <Checkbox
              size="sm"
              checked={col.visible}
              onChange={() => {
                if (!col.visible || visibleCount > 1) onToggle(col.key);
              }}
            />

            <span className={cn(
              'flex-1 text-[13px] select-none',
              col.visible ? 'text-gray-700' : 'text-gray-400 line-through'
            )}>
              {col.label}
            </span>

            {/* Controles de reorden */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                disabled={i === 0}
                onClick={() => onMove(col.key, -1)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Subir"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                disabled={i === columns.length - 1}
                onClick={() => onMove(col.key, 1)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Bajar"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50">
        <p className="text-[10px] text-gray-400 leading-tight">
          Las columnas fijas (Acciones) no son configurables.
        </p>
      </div>
    </motion.div>,
    document.body
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
  const [columns,         setColumns]         = useState<ColDef[]>(DEFAULT_COLS.map(c => ({ ...c })));
  const [colPanelOpen,    setColPanelOpen]    = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);

  const companies = Array.from(new Set(RUTAS_DATA.map(r => r.company)));
  const groups    = Array.from(new Set(RUTAS_DATA.map(r => r.group)));
  const hasFilters = selectedCompany !== 'Todas' || selectedGroup !== 'Todos' || selectedStatus !== 'Todos' || searchQuery !== '';
  const visibleCols = columns.filter(c => c.visible);

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

  const toggleCol = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };

  const moveCol = (key: string, dir: -1 | 1) => {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.key === key);
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const resetCols = () => setColumns(DEFAULT_COLS.map(c => ({ ...c })));

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

  const totalPages    = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = paginatedData.some(r => selectedIds.has(r.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) paginatedData.forEach(r => next.add(r.id));
    else paginatedData.forEach(r => next.delete(r.id));
    setSelectedIds(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCompany, selectedGroup, selectedStatus]);

  // Render de celdas por columna
  const renderHeaderCell = (col: ColDef) => {
    const sortableCols = ['name', 'company', 'group'];
    if (sortableCols.includes(col.key)) {
      return (
        <SortableTh
          key={col.key}
          colKey={col.key}
          label={col.label}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      );
    }
    return (
      <th key={col.key} className="py-3 px-4 text-xs font-medium text-gray-400">
        {col.label}
      </th>
    );
  };

  const renderBodyCell = (col: ColDef, ruta: Ruta) => {
    switch (col.key) {
      case 'name':
        return (
          <td key="name" className="py-4 px-4">
            <p className="text-xs font-medium text-gray-900">{ruta.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{ruta.id}</p>
          </td>
        );
      case 'company':
        return (
          <td key="company" className="py-4 px-4">
            <span className="text-xs text-gray-600">{ruta.company}</span>
          </td>
        );
      case 'group':
        return (
          <td key="group" className="py-4 px-4">
            <TagBadge className="text-[11px]">{ruta.group}</TagBadge>
          </td>
        );
      case 'config':
        return (
          <td key="config" className="py-4 px-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                Radio: <span className="font-medium text-gray-700">{ruta.config.radio}</span>
              </span>
              <span className={cn(
                'text-xs font-medium flex items-center gap-1',
                ruta.config.alertas === 'Activo' ? 'text-emerald-600' : 'text-gray-400'
              )}>
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  ruta.config.alertas === 'Activo' ? 'bg-emerald-400' : 'bg-gray-300'
                )} />
                Alertas {ruta.config.alertas === 'Activo' ? 'activas' : 'inactivas'}
              </span>
            </div>
          </td>
        );
      case 'status':
        return (
          <td key="status" className="py-4 px-4">
            <StatusBadge status={ruta.status} />
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-[#FAFAF8] overflow-y-auto">
      <div className="px-8 pt-6 pb-8 flex flex-col gap-6">

        {/* Cabecera de página */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1 tracking-wide">Gestión</p>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Caminos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Trayectorias y configuración de zonas logísticas.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" className="py-2">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </Button>
            <Button variant="primary" size="sm" className="py-2" onClick={() => setIsCreatingGroup(true)}>
              <Plus className="w-3.5 h-3.5" />
              Nuevo grupo
            </Button>
          </div>
        </div>

        {/* Barra de filtros + control de columnas */}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Estado</label>
            <SegmentedControl
              options={[
                { value: 'Todos',    label: 'Todos'    },
                { value: 'Activo',   label: 'Activo'   },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              size="sm"
            />
          </div>

          {/* Botón configurar columnas — extremo derecho */}
          <div className="flex flex-col gap-1.5 self-end ml-auto">
            <button
              ref={colBtnRef}
              onClick={() => setColPanelOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors',
                colPanelOpen
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Columnas
              {visibleCols.length < columns.length && (
                <span className={cn(
                  'text-[10px] font-semibold px-1 rounded',
                  colPanelOpen ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {visibleCols.length}/{columns.length}
                </span>
              )}
            </button>
          </div>

          {hasFilters && (
            <div className="self-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
                {/* Checkbox — fijo */}
                <th className="py-3 pl-5 pr-3 w-10">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      size="sm"
                      checked={isAllSelected}
                      indeterminate={isSomeSelected && !isAllSelected}
                      onChange={toggleAll}
                    />
                  </div>
                </th>

                {/* Columnas configurables */}
                {visibleCols.map(col => renderHeaderCell(col))}

                {/* Acciones — fijo */}
                <th className="py-3 px-4 text-xs font-medium text-gray-400 w-20">Acciones</th>
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
                        'border-b border-gray-50 group',
                        isSelected ? 'bg-gray-50' : 'hover:bg-[#FAFAF8]'
                      )}
                    >
                      <td className="py-4 pl-5 pr-3">
                        <div className="flex items-center justify-center">
                          <Checkbox size="sm" checked={isSelected} onChange={() => toggleOne(ruta.id)} />
                        </div>
                      </td>

                      {visibleCols.map(col => renderBodyCell(col, ruta))}

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <IconButton icon={Pencil} aria-label="Editar" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900" onClick={e => e.stopPropagation()} />
                          <IconButton icon={Trash2} aria-label="Eliminar" variant="ghost" size="sm" className="text-gray-400 hover:text-red-500" onClick={e => e.stopPropagation()} />
                          <DropdownMenu
                            items={[
                              { icon: Copy,     label: 'Copiar'    },
                              { icon: Download, label: 'Exportar'  },
                              { icon: Send,     label: 'Enviar'    },
                              { icon: PowerOff, label: 'Inactivar', dividerBefore: true },
                            ]}
                          >
                            {({ open, ref }) => (
                              <IconButton
                                ref={ref}
                                icon={MoreHorizontal}
                                aria-label="Más opciones"
                                variant="ghost"
                                size="sm"
                                className="text-gray-400"
                                onClick={e => { e.stopPropagation(); open(); }}
                              />
                            )}
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2 + visibleCols.length} className="py-16 text-center">
                    <p className="text-sm text-gray-400">Sin resultados para los filtros aplicados.</p>
                    <Button variant="link" size="sm" onClick={clearFilters} className="mt-2 mx-auto">
                      Limpiar filtros
                    </Button>
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
              <IconButton
                icon={ChevronLeft} aria-label="Página anterior" variant="outline" size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
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
              <IconButton
                icon={ChevronRight} aria-label="Página siguiente" variant="outline" size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-50 rounded-xl shadow-[0_12px_44px_rgba(0,0,0,0.13)] border border-slate-200 flex items-center gap-1 z-50 w-max"
          >
            <div className="flex items-center gap-2 pl-4 pr-2.5 py-2">
              <span className="text-[13px] font-semibold text-slate-600">
                <span className="text-slate-900">{selectedIds.size}</span> seleccionadas
              </span>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="sm"><PowerOff className="w-3.5 h-3.5" />Alternar estado</Button>
                <Button variant="ghost" size="sm"><Copy className="w-3.5 h-3.5" />Duplicar</Button>
                <Button variant="ghost" size="sm"><Send className="w-3.5 h-3.5" />Mover grupo</Button>
              </div>
            </div>
            <div className="flex items-center gap-1 pr-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Cancelar</Button>
              <Button variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" />Eliminar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de configuración de columnas */}
      <AnimatePresence>
        {colPanelOpen && (
          <ColumnConfigurator
            columns={columns}
            onToggle={toggleCol}
            onMove={moveCol}
            onReset={resetCols}
            anchorRef={colBtnRef}
            onClose={() => setColPanelOpen(false)}
          />
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
