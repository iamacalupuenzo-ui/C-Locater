import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, Plus, Building2, Route, Box, Save, Search, ChevronDown, Pencil, Copy, Download, Trash2, ChevronRight, Undo2, Redo2, Upload, FileText } from 'lucide-react';
import { FleetMap } from './FleetMap';

interface NuevoGrupoModuleProps {
  onBack: () => void;
}

export function NuevoGrupoModule({ onBack }: NuevoGrupoModuleProps) {
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [companiaAsignada, setCompaniaAsignada] = useState('');

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const COMPANIES = ["COMSATEL PERU SAC - FLOTA", "Logística Total SAC", "Transportes Especiales", "Rutas Nacionales SAC"];
  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [nombreTramo, setNombreTramo] = useState('');
  const [radioTramo, setRadioTramo] = useState('50');
  const [estadoTramo, setEstadoTramo] = useState('Activo');
  const [metodoTrazado, setMetodoTrazado] = useState('');
  const [rawCoordinates, setRawCoordinates] = useState('');

  const [groupRoutes, setGroupRoutes] = useState<any[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [redoStack, setRedoStack] = useState<[number, number][]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isFormValid = nombreGrupo.trim() !== '' && companiaAsignada.trim() !== '' && groupRoutes.length > 0;

  const parseCoordinates = (text: string): [number, number][] => {
    const lines = text.split('\n');
    const pts: [number, number][] = [];
    for (const line of lines) {
      const parts = line.split(/[,\t;|\s]+/).filter(Boolean);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          pts.push([lat, lng]);
        }
      }
    }
    return pts;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCoordinates(text);
      const pts = parseCoordinates(text);
      setDrawingPoints(pts);
    };
    reader.readAsText(file);
    
    // reset input
    if (e.target) e.target.value = '';
  };

  const handleStartDrawing = () => {
    setIsRouteModalOpen(false);
    
    if (metodoTrazado === 'Coordenadas' && rawCoordinates.trim()) {
      const pts = parseCoordinates(rawCoordinates);
      setDrawingPoints(pts);
    } else if (metodoTrazado !== 'Coordenadas') {
      setDrawingPoints([]);
      setRawCoordinates('');
    }
    
    setIsDrawingMode(true);
    setRedoStack([]);
  };

  const handleEditRoute = (e: React.MouseEvent, route: any) => {
    e.stopPropagation();
    setEditingRouteId(route.id);
    setDrawingPoints(route.coordinates || []);
    setRedoStack([]);
    if (route.metodo === 'Coordenadas' && route.coordinates) {
      setRawCoordinates(route.coordinates.map((p: any) => `${p[0]}, ${p[1]}`).join('\n'));
    } else {
      setRawCoordinates('');
    }
    setNombreTramo(route.name);
    setMetodoTrazado(route.metodo);
    setRadioTramo(route.radio || '50');
    setEstadoTramo(route.status || 'Activo');
    setIsDrawingMode(true);
    setSelectedRouteId(null);
  };

  const handleDeleteRoute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setGroupRoutes(prev => prev.filter(r => r.id !== id));
    if (selectedRouteId === id) setSelectedRouteId(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isDrawingMode) {
      setDrawingPoints(prev => [...prev, [lat, lng]]);
      setRedoStack([]);
    }
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (drawingPoints.length > 0) {
      const newPoints = [...drawingPoints];
      const lastPoint = newPoints.pop()!;
      setDrawingPoints(newPoints);
      setRedoStack(prev => [...prev, lastPoint]);
    }
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (redoStack.length > 0) {
      const newRedo = [...redoStack];
      const point = newRedo.pop()!;
      setRedoStack(newRedo);
      setDrawingPoints(prev => [...prev, point]);
    }
  };

  const handleFinishDrawing = () => {
    if (editingRouteId) {
      setGroupRoutes(prev => prev.map(r => r.id === editingRouteId ? {
        ...r,
        points: drawingPoints.length,
        coordinates: drawingPoints
      } : r));
    } else {
      setGroupRoutes(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name: nombreTramo,
        radio: radioTramo,
        status: estadoTramo,
        metodo: metodoTrazado,
        points: drawingPoints.length,
        coordinates: drawingPoints
      }]);
    }
    setIsDrawingMode(false);
    setNombreTramo('');
    setRadioTramo('50');
    setEstadoTramo('Activo');
    setMetodoTrazado('');
    setDrawingPoints([]);
    setRedoStack([]);
    setEditingRouteId(null);
  };

  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setDrawingPoints([]);
    setRedoStack([]);
    setEditingRouteId(null);
    setNombreTramo('');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-50 bg-white flex overflow-hidden">
        {/* Map Section */}
      <div 
        className={`flex-1 relative border-r border-gray-200 bg-gray-50 ${isDrawingMode ? 'cursor-crosshair' : ''}`}
      >
        <FleetMap 
          isDrawingMode={isDrawingMode} 
          drawingPoints={drawingPoints} 
          onMapClick={handleMapClick}
          groupRoutes={groupRoutes}
          selectedRouteId={selectedRouteId}
        />
        
        {/* State Banner */}
        <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200/50 flex items-center gap-3">
          {isDrawingMode ? (
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          ) : (
            <Route className="w-4 h-4 text-[#0052CC]" />
          )}
          <span className="text-[13px] font-bold text-gray-700">
            {isDrawingMode ? `Trazando: ${editingRouteId ? groupRoutes.find(r=>r.id===editingRouteId)?.name : nombreTramo}` : 'Modo de visualización'}
          </span>
          {isDrawingMode && (
            <>
              <div className="pl-3 border-l border-gray-200 flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#0052CC]">
                  {drawingPoints.length} puntos
                </span>
              </div>
              <div className="ml-1 flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={drawingPoints.length === 0}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Deshacer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Rehacer"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Drawing Overlay */}
        <AnimatePresence>
          {isDrawingMode && metodoTrazado === 'Coordenadas' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-24 left-6 z-20 w-[300px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-[13px] font-bold text-gray-900">Ingreso de Coordenadas</h3>
              </div>
              <div className="p-4 space-y-4">
                <label className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#0052CC] hover:text-[#0052CC] transition-all cursor-pointer">
                  <Upload className="w-4 h-4 mb-1 text-gray-400 group-hover:text-[#0052CC]" />
                  <span className="text-[11px] font-bold">Subir archivo CSV / Excel</span>
                  <input type="file" accept=".csv, .txt, .xlsx" className="hidden" onChange={handleFileUpload} />
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">o ingresar</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <textarea 
                  placeholder="-12.0453, -77.0311 (Centro Lim)&#10;-12.1219, -77.0298 (Miraflores, ~8km)"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[12px] font-mono text-gray-900 placeholder:text-gray-400 focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 transition-all outline-none min-h-[140px] resize-y leading-relaxed"
                  value={rawCoordinates}
                  onChange={(e) => {
                    setRawCoordinates(e.target.value);
                    const pts = parseCoordinates(e.target.value);
                    setDrawingPoints(pts);
                  }}
                />
              </div>
            </motion.div>
          )}

          {isDrawingMode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleCancelDrawing(); }}
                className="px-6 py-3.5 bg-white text-gray-700 hover:bg-gray-50 rounded-[20px] text-[14px] font-bold shadow-xl transition-all border border-gray-200"
              >
                Cancelar
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleFinishDrawing(); }}
                disabled={drawingPoints.length < 2}
                className={`px-6 py-3.5 rounded-[20px] text-[14px] font-bold shadow-xl transition-all flex items-center gap-2 ${
                  drawingPoints.length >= 2 
                    ? "bg-[#0052CC] hover:bg-[#0047b3] text-white" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              >
                <Save className="w-4 h-4" />
                {editingRouteId ? 'Guardar Cambios' : 'Seleccionar Trazo'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Configuration Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 420 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="relative flex flex-col bg-white shrink-0 shadow-[-8px_0_30px_rgba(0,0,0,0.06)] z-20 h-full border-l border-gray-200"
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -left-[20px] -mt-6 w-5 h-12 bg-white border border-gray-200 border-r-0 rounded-l-lg shadow-[-4px_0_8px_rgba(0,0,0,0.04)] flex items-center justify-center z-50 text-gray-400 hover:text-[#0052CC] cursor-pointer transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-[420px] h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 shrink-0 flex items-start gap-3 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1.5 flex items-center gap-2">
              Nuevo Grupo
            </h2>
            <p className="text-[13px] text-gray-500 font-medium">Configuración de parámetros y rutas</p>
          </div>
        </div>

        {/* Interaction Area - Scrollable Content */}
        <div className="px-6 flex-1 overflow-y-auto pt-6 pb-8 space-y-8">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Nombre del Grupo <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Ej: Rutas Zona Norte"
                value={nombreGrupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 transition-all outline-none"
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Compañía Asignada <span className="text-red-500">*</span></label>
              <button 
                type="button"
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="w-full pl-3 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-[14px] font-medium transition-all outline-none focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className={companiaAsignada ? 'text-gray-900' : 'text-gray-400'}>
                    {companiaAsignada || 'Seleccione una compañía'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCompanyDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
                  >
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Buscar compañía..." 
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCompaniaAsignada(c);
                              setIsCompanyDropdownOpen(false);
                              setCompanySearch('');
                            }}
                            className={`w-full text-left px-3 py-2.5 text-[13px] rounded-md transition-colors ${
                              companiaAsignada === c ? 'bg-blue-50 text-[#0052CC] font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
                            }`}
                          >
                            {c}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-[13px] text-gray-500 font-medium tracking-tight">
                          No se encontraron resultados
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Routes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-gray-900">Rutas Asignadas</h3>
              <div className="bg-blue-50 text-[#0052CC] text-[12px] font-bold px-2 py-0.5 rounded">
                {groupRoutes.length}
              </div>
            </div>

            {groupRoutes.length === 0 ? (
              <div className="w-full bg-gray-50/80 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <Route className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-1">Sin rutas aún</h4>
                <p className="text-[12px] text-gray-500 font-medium max-w-[200px] mb-4">
                  Traza nuevas rutas en el mapa o selecciona existentes
                </p>
                <button 
                  onClick={() => setIsRouteModalOpen(true)}
                  disabled={isDrawingMode}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Ruta
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {groupRoutes.map((route, i) => (
                  <div 
                    key={route.id} 
                    onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
                    className={`flex items-center justify-between p-3.5 bg-white border shadow-sm rounded-xl cursor-pointer transition-all ${selectedRouteId === route.id ? 'border-[#0052CC] ring-1 ring-[#0052CC]/20' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedRouteId === route.id ? 'bg-[#0052CC] text-white' : 'bg-blue-50 text-[#0052CC]'}`}>
                        <Route className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{route.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] font-medium text-gray-500">
                            Radio: {route.radio}m • {route.points} puntos
                          </p>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${route.status === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {route.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Acciones */}
                    <div className="flex items-center gap-0.5 ml-2">
                      <button 
                        onClick={(e) => handleEditRoute(e, route)} 
                        className="p-[6px] text-gray-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Trazo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()} 
                        className="p-[6px] text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copiar a"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()} 
                        className="p-[6px] text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Exportar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteRoute(e, route.id)} 
                        className="p-[6px] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setIsRouteModalOpen(true)}
                  disabled={isDrawingMode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed hover:bg-gray-100 text-gray-600 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Otra Ruta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-2.5 hover:bg-gray-100 text-gray-600 rounded-lg text-[13px] font-bold transition-all"
          >
            Cancelar
          </button>
          <button 
            disabled={!isFormValid}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047b3] text-white disabled:bg-[#0052CC]/50 disabled:cursor-not-allowed rounded-lg text-[13px] font-bold transition-all shadow-sm"
          >
            Guardar Grupo
          </button>
        </div>
        </div>
      </motion.div>
    </div>

      {/* Route Modal */}
      <AnimatePresence>
        {isRouteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsRouteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Route className="w-4 h-4 text-[#0052CC]" />
                  Agregar Ruta
                </h3>
                <button 
                  onClick={() => setIsRouteModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Nombre del Tramo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Tramo Urbano A"
                    value={nombreTramo}
                    onChange={(e) => setNombreTramo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Radio (m)</label>
                    <input 
                      type="number" 
                      placeholder="50"
                      value={radioTramo}
                      onChange={(e) => setRadioTramo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Estado</label>
                    <div className="relative">
                      <select 
                        value={estadoTramo}
                        onChange={(e) => setEstadoTramo(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 transition-all outline-none focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 appearance-none cursor-pointer"
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Tipo de Camino</label>
                  <div className="relative">
                    <select 
                      value={metodoTrazado}
                      onChange={(e) => {
                        setMetodoTrazado(e.target.value);
                        setRawCoordinates('');
                      }}
                      className={`w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium transition-all outline-none focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 appearance-none cursor-pointer ${metodoTrazado ? 'text-gray-900' : 'text-gray-400'}`}
                      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                    >
                      <option value="" disabled hidden>Seleccione</option>
                      <option value="Manual">Selección en el mapa (Manual)</option>
                      <option value="Coordenadas">Ingreso de coordenadas</option>
                      <option value="GoogleAPI">Con Google API</option>
                      <option value="Reporte">Con reporte de recorrido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleStartDrawing}
                  disabled={!nombreTramo || !metodoTrazado}
                  className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0047b3] disabled:bg-[#0052CC]/50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-bold transition-all shadow-sm"
                >
                  Confirmar y Trazar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
