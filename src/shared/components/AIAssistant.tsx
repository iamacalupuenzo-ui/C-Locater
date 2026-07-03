import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Activity, Car, AlertTriangle, Map,
  ChevronRight, ChevronDown, CornerDownRight, Navigation2,
  Bike, Truck, Bus, Settings2, Mic,
} from 'lucide-react';
import { useVehicles } from '../lib/VehicleContext';
import type { Vehicle } from '../lib/data';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Entry {
  id: string;
  query: string;
  response: React.ReactNode;
}

// ─── Suggestions ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: 'Resumen de flota', icon: Activity },
  { label: 'Vehículos activos', icon: Car },
  { label: 'Alertas', icon: AlertTriangle },
  { label: 'Cómo usar el mapa', icon: Map },
];

// ─── Vehicle result card ───────────────────────────────────────────────────

function VehicleResultCard({ vehicle }: { vehicle: Vehicle }) {
  const [navigated, setNavigated] = useState(false);

  const statusColor = vehicle.status === 'active' ? '#34C759' : vehicle.status === 'stopped' ? '#F59E0B' : '#94a3b8';
  const statusLabel = vehicle.status === 'active' ? 'Activo' : vehicle.status === 'stopped' ? 'Detenido' : 'Sin señal';
  const VehicleIcon =
    vehicle.type === 'motorcycle' ? Bike :
    vehicle.type === 'truck'      ? Truck :
    vehicle.type === 'bus'        ? Bus :
    vehicle.type === 'machinery'  ? Settings2 : Car;

  const handleFlyTo = () => {
    window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position: vehicle.position, offsetX: 0 } }));
    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: vehicle.id, source: 'monitor' } }));
    setNavigated(true);
  };

  return (
    <motion.button
      onClick={handleFlyTo}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-2 rounded-lg bg-white border px-2.5 py-1.5 text-left transition-all group"
      style={{
        borderColor: navigated ? 'rgba(0,82,204,0.25)' : '#e2e8f0',
        background: navigated ? 'rgba(0,82,204,0.04)' : 'white',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border" style={{ background: `${statusColor}12`, borderColor: `${statusColor}22`, color: statusColor }}>
        <VehicleIcon className="w-3 h-3" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-[12px] font-bold text-slate-800 shrink-0">{vehicle.plate}</span>
        <span className="text-[10.5px] text-slate-400 truncate">{vehicle.name}</span>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
          <span className="text-[9.5px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
        </div>
      </div>
      <Navigation2 className="w-3 h-3 shrink-0 transition-colors" style={{ color: navigated ? '#34C759' : '#cbd5e1' }} strokeWidth={navigated ? 2.5 : 1.75} />
    </motion.button>
  );
}

// ─── Expandable vehicle list ────────────────────────────────────────────────

function ExpandableVehicleList({ vehicles, label, initialCount = 5 }: { vehicles: Vehicle[]; label: string; initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? vehicles : vehicles.slice(0, initialCount);
  const remaining = vehicles.length - initialCount;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
      <AnimatePresence initial={false}>
        {shown.map(v => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <VehicleResultCard vehicle={v} />
          </motion.div>
        ))}
      </AnimatePresence>
      {!expanded && remaining > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-slate-200 py-1.5 text-[11px] font-medium text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          <ChevronDown className="w-3 h-3" strokeWidth={2} />
          +{remaining} vehículo{remaining > 1 ? 's' : ''} más
        </button>
      )}
    </div>
  );
}

// ─── Response builder ──────────────────────────────────────────────────────

function useResponseBuilder() {
  const vehicles = useVehicles();

  return (query: string): React.ReactNode => {
    const q = query.toLowerCase();

    const active  = vehicles.filter(v => v.status === 'active');
    const stopped = vehicles.filter(v => v.status === 'stopped');
    const offline = vehicles.filter(v => v.status === 'offline');
    const alarmed = vehicles.filter(v => (v.alarmCount ?? 0) > 0);

    // ── Resumen ──
    if (q.includes('resumen') || q.includes('estado general') || (q.includes('flota') && !q.includes('de'))) {
      return (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Activos',   count: active.length,  color: '#34C759', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'Detenidos', count: stopped.length, color: '#F59E0B', bg: '#fffbeb', border: '#fde68a' },
              { label: 'Sin señal', count: offline.length, color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-2 py-2.5 text-center border" style={{ background: item.bg, borderColor: item.border }}>
                <div className="text-[19px] font-bold leading-none" style={{ color: item.color }}>{item.count}</div>
                <div className="text-[9.5px] font-semibold text-slate-500 mt-1 leading-none">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <span className="text-[11px] font-medium text-slate-500">Total unidades</span>
            <span className="text-[13px] font-bold text-slate-800">{vehicles.length}</span>
          </div>
          {alarmed.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-red-600">{alarmed.length} vehículo{alarmed.length > 1 ? 's' : ''} con alertas activas</span>
            </div>
          )}
        </div>
      );
    }

    // ── Activos ──
    if (q.includes('activ') || q.includes('movimiento') || q.includes('circulando') || q.includes('en ruta')) {
      if (active.length === 0) {
        return <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5"><div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" /><span className="text-[12px] text-slate-500">No hay vehículos activos ahora.</span></div>;
      }
      return <ExpandableVehicleList vehicles={active} label={`${active.length} activo${active.length > 1 ? 's' : ''}`} initialCount={5} />;
    }

    // ── Alertas ──
    if (q.includes('alerta') || q.includes('alarma') || q.includes('problema') || q.includes('incidencia')) {
      if (alarmed.length === 0) {
        return (
          <div className="flex items-center gap-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2.5">
            <div className="w-6 h-6 rounded-full bg-[#34C759]/15 flex items-center justify-center shrink-0"><Activity className="w-3.5 h-3.5 text-[#16a34a]" strokeWidth={1.75} /></div>
            <span className="text-[12px] text-slate-700">Sin alertas activas. Todo opera con normalidad.</span>
          </div>
        );
      }
      return <ExpandableVehicleList vehicles={alarmed} label={`${alarmed.length} con alertas`} initialCount={5} />;
    }

    // ── Guía mapa ──
    if (q.includes('mapa') || q.includes('usar') || q.includes('cómo') || q.includes('como') || (q.includes('ayuda') && q.length < 15)) {
      return (
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Guía rápida</div>
          {[
            { icon: '📍', text: 'Haz clic en un marcador para ver detalles' },
            { icon: '🔍', text: 'Usa el panel lateral para buscar unidades' },
            { icon: '📡', text: 'El botón GPS muestra los dispositivos de rastreo' },
            { icon: '⌨️', text: 'Ctrl+B abre y cierra el monitor de flota' },
            { icon: '🗺️', text: 'Al alejar el zoom, los vehículos cercanos se agrupan' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white border border-slate-100 px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <span className="text-[13px] leading-none mt-0.5 shrink-0">{tip.icon}</span>
              <span className="text-[11.5px] text-slate-600 leading-snug">{tip.text}</span>
            </div>
          ))}
        </div>
      );
    }

    // ── Detenidos ──
    if (q.includes('detenido') || q.includes('parado')) {
      return <ExpandableVehicleList vehicles={stopped} label={`${stopped.length} detenido${stopped.length !== 1 ? 's' : ''}`} initialCount={5} />;
    }

    // ── Búsqueda por nombre, placa u owner ──
    const searchKeywords = ['buscar', 'busca', 'encontrar', 'dónde', 'donde', 'vehículo de', 'vehiculo de', 'vehículos de', 'vehiculos de', 'mostrar', 'ver'];
    let searchTerm = q;
    for (const kw of searchKeywords) {
      if (q.includes(kw)) {
        const after = q.split(kw)[1]?.trim();
        if (after && after.length > 1) { searchTerm = after; break; }
      }
    }

    const terms = searchTerm.split(/\s+/).filter(w => w.length >= 2);
    if (terms.length > 0) {
      const results = vehicles.filter(v =>
        terms.some(t =>
          v.name.toLowerCase().includes(t) ||
          v.owner.toLowerCase().includes(t) ||
          v.plate.toLowerCase().includes(t) ||
          v.plate.toLowerCase().replace(/-/g, '').includes(t.replace(/-/g, ''))
        )
      );

      if (results.length > 0) {
        return (
          <div className="flex flex-col gap-1.5">
            <ExpandableVehicleList vehicles={results} label={`${results.length} resultado${results.length > 1 ? 's' : ''}`} initialCount={3} />
            <p className="text-[10.5px] text-slate-400">Toca un vehículo para navegar en el mapa.</p>
          </div>
        );
      }
    }

    // ── Fallback ──
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-slate-500">No encontré información sobre eso. Puedes consultar:</p>
        <div className="flex flex-col gap-1">
          {['Resumen de flota', 'Vehículos activos', 'Alertas', 'Cómo usar el mapa'].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />{s}
            </div>
          ))}
        </div>
      </div>
    );
  };
}

// ─── Voice response builder ────────────────────────────────────────────────

function useVoiceResponseBuilder() {
  const vehicles = useVehicles();
  return useCallback((query: string): string => {
    const q = query.toLowerCase();
    const active  = vehicles.filter(v => v.status === 'active');
    const stopped = vehicles.filter(v => v.status === 'stopped');
    const offline = vehicles.filter(v => v.status === 'offline');
    const alarmed = vehicles.filter(v => (v.alarmCount ?? 0) > 0);

    if (q.includes('resumen') || (q.includes('flota') && !q.includes('de')))
      return `Tu flota tiene ${vehicles.length} vehículos. ${active.length} activos, ${stopped.length} detenidos y ${offline.length} sin señal.${alarmed.length > 0 ? ` Hay ${alarmed.length} con alertas.` : ''}`;
    if (q.includes('activ') || q.includes('movimiento'))
      return active.length === 0 ? 'No hay vehículos activos ahora.' :
        `Hay ${active.length} activos: ${active.slice(0, 3).map(v => v.plate).join(', ')}${active.length > 3 ? ' y más.' : '.'}`;
    if (q.includes('alerta') || q.includes('alarma'))
      return alarmed.length === 0 ? 'Sin alertas activas, todo opera con normalidad.' :
        `Hay ${alarmed.length} vehículo${alarmed.length > 1 ? 's' : ''} con alertas activas.`;
    if (q.includes('detenido') || q.includes('parado'))
      return stopped.length === 0 ? 'No hay vehículos detenidos.' :
        `${stopped.length} detenidos: ${stopped.slice(0, 3).map(v => v.plate).join(', ')}.`;

    const terms = q.split(/\s+/).filter(w => w.length >= 2);
    const results = vehicles.filter(v =>
      terms.some(t => v.name.toLowerCase().includes(t) || v.plate.toLowerCase().includes(t) || v.owner.toLowerCase().includes(t))
    );
    if (results.length > 0)
      return `Encontré ${results.length} vehículo${results.length > 1 ? 's' : ''}. ${results.slice(0, 2).map(v => `${v.plate} está ${v.status === 'active' ? 'activo' : v.status === 'stopped' ? 'detenido' : 'sin señal'}`).join('. ')}.`;

    return 'No encontré información sobre eso. Puedes preguntarme por el resumen de flota, vehículos activos o alertas.';
  }, [vehicles]);
}

// ─── Panel ─────────────────────────────────────────────────────────────────

export function AIAssistantPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const buildResponse = useResponseBuilder();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const hasSpeechSupport = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const handleSend = (text?: string) => {
    const query = (text ?? inputValue).trim();
    if (!query) return;
    setShowWelcome(false);
    setInputValue('');
    setEntries(prev => [...prev, { id: `e-${Date.now()}`, query, response: buildResponse(query) }]);
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'es-PE';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setInputValue(transcript);
      setIsRecording(false);
      // Auto-enviar si la transcripción es una consulta directa
      setTimeout(() => {
        setShowWelcome(false);
        setInputValue('');
        setEntries(prev => [...prev, { id: `e-${Date.now()}`, query: transcript, response: buildResponse(transcript) }]);
      }, 300);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend   = () => setIsRecording(false);

    setIsRecording(true);
    recognition.start();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="w-[296px] flex flex-col rounded-2xl overflow-hidden bg-white/97 backdrop-blur-2xl border border-slate-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-3.5 pt-3 pb-2.5 shrink-0 border-b border-slate-100">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-0.5">Flota · IA</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-slate-900 tracking-tight leading-none">Asistente</span>
            <div className="w-2 h-2 bg-[#34C759] rounded-full shadow-[0_0_6px_rgba(52,199,89,0.5)]" />
          </div>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0">
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-4 min-h-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {showWelcome && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Consulta el estado de tu flota, busca vehículos por nombre o placa, revisa alertas.
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sugerencias</div>
              {SUGGESTIONS.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => handleSend(label)} className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-left hover:bg-white hover:border-slate-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:border-[#0052CC]/30 transition-colors">
                    <Icon className="w-3 h-3 text-slate-500 group-hover:text-[#0052CC] transition-colors" strokeWidth={1.75} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex-1">{label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <CornerDownRight className="w-3 h-3 text-slate-300 shrink-0" strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-slate-400 italic truncate">{entry.query}</span>
            </div>
            {entry.response}
          </div>
        ))}

        {!showWelcome && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map(({ label }) => (
              <button key={label} onClick={() => handleSend(label)} className="rounded-full px-2.5 py-1 bg-white border border-slate-200 text-[10.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all">
                {label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3.5 py-2.5 border-t border-slate-100 bg-white/80 flex items-center gap-1.5 shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder={isRecording ? 'Escuchando...' : 'Ej: "buscar Ana", "alertas"...'}
            className="flex-1 bg-transparent outline-none text-[12px] font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Botón micrófono */}
        {hasSpeechSupport && (
          <button
            onClick={handleVoice}
            title={isRecording ? 'Detener grabación' : 'Dictar consulta'}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: isRecording ? 'rgba(239,68,68,0.08)' : '#f1f5f9',
              border: isRecording ? '1.5px solid rgba(239,68,68,0.25)' : '1px solid #e2e8f0',
            }}
          >
            {isRecording && (
              <motion.span
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
                style={{ background: 'rgba(239,68,68,0.15)' }}
              />
            )}
            <Mic
              className="w-3.5 h-3.5 relative z-10 transition-colors"
              style={{ color: isRecording ? '#ef4444' : '#94a3b8' }}
              strokeWidth={1.75}
            />
          </button>
        )}

        {/* Botón enviar */}
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim()}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Orbe (32 px) ──────────────────────────────────────────────────────────

const WAVE_BARS = [
  { h: '35%', delay: 0 },
  { h: '68%', delay: 0.12 },
  { h: '100%', delay: 0.24 },
  { h: '68%', delay: 0.36 },
  { h: '35%', delay: 0.48 },
];

type OrbVoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// Multiplicador de amplitud por posición de barra (para efecto visual variado)
const BAR_MULT = [0.55, 0.82, 1.0, 0.82, 0.55];

function AIAssistantOrb({ isOpen, isAttentive, voiceState = 'idle', audioLevel = 0, onClick }: {
  isOpen: boolean;
  isAttentive: boolean;
  voiceState?: OrbVoiceState;
  audioLevel?: number;   // 0–1, amplitud real del micrófono
  onClick: () => void;
}) {
  const listening   = voiceState === 'listening';
  const processing  = voiceState === 'processing';
  const speaking    = voiceState === 'speaking';
  const active      = listening || processing || speaking;

  const bg = listening
    ? 'linear-gradient(135deg, #b91c1c 0%, #ea580c 100%)'
    : speaking
      ? 'linear-gradient(135deg, #6d28d9 0%, #2563eb 50%, #0891b2 100%)'
      : processing
        ? 'linear-gradient(135deg, #78350f 0%, #b45309 100%)'
        : isOpen
          ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 55%, #0e7490 100%)';

  const shadow = listening
    ? '0 0 0 2px rgba(239,68,68,0.4), 0 4px 22px rgba(239,68,68,0.6)'
    : speaking
      ? '0 0 0 2px rgba(139,92,246,0.4), 0 4px 22px rgba(139,92,246,0.65)'
      : processing
        ? '0 0 0 2px rgba(245,158,11,0.35), 0 4px 20px rgba(245,158,11,0.5)'
        : isOpen
          ? '0 0 0 2px rgba(255,255,255,0.18), 0 4px 20px rgba(99,102,241,0.65)'
          : isAttentive
            ? '0 0 0 2px rgba(255,255,255,0.15), 0 4px 24px rgba(99,102,241,0.8)'
            : '0 0 0 2px rgba(255,255,255,0.12), 0 3px 12px rgba(0,0,0,0.45)';

  const ringColor1 = listening ? 'rgba(239,68,68,0.55)' : speaking ? 'rgba(139,92,246,0.5)' : 'rgba(99,102,241,0.5)';
  const ringColor2 = listening ? 'rgba(251,146,60,0.3)' : speaking ? 'rgba(59,130,246,0.3)'  : 'rgba(59,130,246,0.3)';

  const shimmerDuration = listening ? 1.2 : processing ? 0.8 : 4;
  const barDuration     = speaking ? 0.45 : processing ? 0.6 : isAttentive ? 0.7 : 1.2;

  // Para el estado listening, cada barra se escala con el nivel de audio real.
  // Para otros estados activos, sigue con keyframes.
  const getBarProps = (i: number) => {
    if (listening) {
      const hasSound = audioLevel > 0.04;
      const scale = hasSound
        ? Math.min(1, 0.15 + audioLevel * 1.3 * BAR_MULT[i])
        : 0.1;
      return {
        animate: { scaleY: scale },
        transition: { duration: 0.08, ease: 'easeOut' as const },
      };
    }
    if (speaking || processing) {
      return {
        animate: { scaleY: [0.2, 1, 0.3, 0.85, 0.2] as number[] },
        transition: { repeat: Infinity, duration: barDuration, delay: i * 0.06, ease: 'easeInOut' as const },
      };
    }
    if (isOpen) return { animate: { scaleY: 0.35 }, transition: { duration: 0.3 } };
    return {
      animate: { scaleY: [0.25, 1, 0.25] as number[] },
      transition: { repeat: Infinity, duration: 1.2, delay: i * 0.12, ease: 'easeInOut' as const },
    };
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Anillos de pulso */}
      {(!isOpen || active) && (
        <>
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: 0, background: `radial-gradient(circle, ${ringColor1}, transparent 70%)` }}
            animate={{ scale: [1, active ? 2.6 : isAttentive ? 3.2 : 2.1], opacity: [0.5, 0] }}
            transition={{ duration: active ? 0.75 : isAttentive ? 1.0 : 1.8, repeat: Infinity, ease: 'easeOut', repeatDelay: active ? 0.15 : isAttentive ? 0.25 : 1.3 }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: 0, background: `radial-gradient(circle, ${ringColor2}, transparent 70%)` }}
            animate={{ scale: [1, active ? 3.4 : isAttentive ? 4.2 : 2.9], opacity: [0.3, 0] }}
            transition={{ duration: active ? 0.75 : isAttentive ? 1.0 : 1.8, repeat: Infinity, ease: 'easeOut', repeatDelay: active ? 0.15 : isAttentive ? 0.25 : 1.3, delay: 0.4 }}
          />
        </>
      )}

      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.86 }}
        animate={isAttentive && !isOpen ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={isAttentive ? { duration: 0.65, ease: 'easeInOut' } : { duration: 0.25 }}
        className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: bg, boxShadow: shadow }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 28%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.1) 72%, transparent 100%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: shimmerDuration, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute top-0 left-0 right-0 h-[46%] rounded-t-full pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)' }} />

        {/* Barras de onda — reaccionan al audio real cuando escucha */}
        <div className="relative z-10 flex items-end gap-[2px] h-[11px] w-[13px]">
          {WAVE_BARS.map((bar, i) => {
            const { animate, transition } = getBarProps(i);
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-full bg-white/90"
                animate={animate}
                transition={transition}
                style={{ height: bar.h, originY: 1 }}
              />
            );
          })}
        </div>
      </motion.button>
    </div>
  );
}

// ─── Launcher (orbe + input Google-style) ──────────────────────────────────

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY as string | undefined;

export function AIAssistantLauncher() {
  const vehicles = useVehicles();

  const [isExpanded,   setIsExpanded]   = useState(false);
  const [isListening,  setIsListening]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAttentive,  setIsAttentive]  = useState(false);
  const [liveText,     setLiveText]     = useState('');
  const [inputValue,   setInputValue]   = useState('');
  const [aiResponse,   setAiResponse]   = useState('');
  // Nivel de audio simulado (0–1) — se anima mientras isListening es true
  const [audioLevel,   setAudioLevel]   = useState(0);

  const inputRef         = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef      = useRef<AudioContext>();
  const analyserRef      = useRef<AnalyserNode>();
  const streamRef        = useRef<MediaStream>();
  const animFrameRef     = useRef<number>();
  const responseTimer    = useRef<ReturnType<typeof setTimeout>>();
  const historyRef       = useRef<import('../lib/fleetAgent').ChatMessage[]>([]);
  const buildVoiceResp   = useVoiceResponseBuilder();
  // Guardia global: false → ningún callback reactiva el micrófono
  const isActiveRef      = useRef(false);
  const handleCloseRef   = useRef<() => void>(() => {});
  // Timestamp hasta el que están bloqueadas las llamadas (solo activo tras un 429 real)
  const blockedUntilRef  = useRef(0);
  // Historial de timestamps para calcular RPM real
  const callTimestamps   = useRef<number[]>([]);

  // ── Atención periódica ──
  useEffect(() => {
    if (isExpanded) { setIsAttentive(false); return; }
    let reset: ReturnType<typeof setTimeout>;
    const ref = { current: 0 as any };
    const schedule = () => {
      ref.current = setTimeout(() => {
        setIsAttentive(true);
        reset = setTimeout(() => { setIsAttentive(false); ref.current = schedule(); }, 2600);
      }, 9000);
      return ref.current;
    };
    schedule();
    return () => { clearTimeout(ref.current); clearTimeout(reset); };
  }, [isExpanded]);

  // ── Debug ──
  const [dbg, setDbg] = useState('');
  const log = useCallback((msg: string) => {
    console.log('[VOZ]', msg);
    setDbg(msg);
  }, []);

  // ── Liberar micrófono y AudioContext ──
  const stopMic = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = undefined;
    analyserRef.current  = undefined;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current  = undefined;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current    = undefined;
    setAudioLevel(0);
  }, []);

  // ── TTS ──
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u  = new SpeechSynthesisUtterance(text);
    u.lang   = 'es-ES';
    u.rate   = 0.9;
    u.pitch  = 1.05;
    u.onstart = () => setIsSpeaking(true);
    u.onend   = () => {
      setIsSpeaking(false);
      // Esperar 700ms para que el sonido de los altavoces se asiente
      // antes de activar el micrófono — evita el bucle IA→mic
      setTimeout(() => onEnd?.(), 700);
    };
    u.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, []);

  // ── Procesar texto con Groq ──
  const FAREWELL_WORDS = ['adiós', 'adios', 'hasta luego', 'chau', 'chao', 'bye', 'hasta pronto', 'hasta mañana', 'nos vemos', 'eso es todo', 'ya no necesito', 'ciérrate', 'cierra'];

  const handleQuery = useCallback(async (text: string) => {
    // Despedida — responder y cerrar
    if (FAREWELL_WORDS.some(w => text.toLowerCase().includes(w))) {
      isActiveRef.current = false;
      log('👋 Despedida detectada — cerrando');
      speak('¡Hasta luego! Estaré aquí cuando me necesites.', () => handleCloseRef.current());
      return;
    }

    const now = Date.now();
    // Solo bloquear si hay un 429 activo
    if (now < blockedUntilRef.current) {
      const secsLeft = Math.ceil((blockedUntilRef.current - now) / 1000);
      log(`🚦 Bloqueado — ${secsLeft}s restantes`);
      speak(`Aún en espera, ${secsLeft} segundos más.`);
      return;
    }
    // Registrar timestamp y purgar los que tienen más de 60s
    callTimestamps.current = [...callTimestamps.current.filter(t => now - t < 60_000), now];
    const rpm = callTimestamps.current.length * 2;
    log(`📊 Llamadas en el último minuto: ~${rpm}/30`);

    setLiveText('');
    setInputValue(text);
    setIsProcessing(true);
    try {
      let response: string;
      if (GROQ_API_KEY) {
        const { processVoiceQuery } = await import('../lib/fleetAgent');
        const result = await processVoiceQuery(text, vehicles, historyRef.current, GROQ_API_KEY);
        historyRef.current = result.updatedHistory.slice(-12);
        response = result.response;
      } else {
        response = buildVoiceResp(text);
      }
      setInputValue('');
      setAiResponse(response);
      clearTimeout(responseTimer.current);
      responseTimer.current = setTimeout(() => setAiResponse(''), 7000);
      speak(response, () => { if (isActiveRef.current) startListeningRef.current?.(); });
    } catch (err: any) {
      const isRateLimit = err?.message === 'RATE_LIMIT';
      if (isRateLimit) {
        blockedUntilRef.current = Date.now() + 60_000;
        const retryAt = new Date(blockedUntilRef.current).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        log(`🚦 Rate limit — reintenta después de ${retryAt}`);
        speak('Límite alcanzado. Vuelvo en un minuto.', () => {
          if (isActiveRef.current) startListeningRef.current?.();
        });
      } else {
        speak('Lo siento, tuve un problema. Haz clic para intentarlo de nuevo.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [vehicles, speak, buildVoiceResp, log]);

  // ── Transcribir audio con Groq Whisper ──
  const transcribeRef = useRef<(blob: Blob, mime: string) => Promise<void>>();
  transcribeRef.current = async (blob: Blob, mime: string) => {
    if (!GROQ_API_KEY) {
      const text = buildVoiceResp('resumen');
      handleQuery(text);
      return;
    }
    log('🔄 Transcribiendo con Whisper...');
    try {
      const ext  = mime.includes('ogg') ? 'ogg' : 'webm';
      const form = new FormData();
      form.append('file', blob, `audio.${ext}`);
      form.append('model', 'whisper-large-v3-turbo');
      form.append('language', 'es');
      form.append('response_format', 'json');
      form.append('prompt', 'Sistema de monitoreo de flota vehicular. El usuario pregunta sobre vehículos, ubicaciones, estado de unidades o conductores.');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        body: form,
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('RATE_LIMIT');
        throw new Error(`Whisper ${res.status}`);
      }
      const { text } = await res.json() as { text: string };

      if (text?.trim()) {
        const trimmed = text.trim();
        const words = trimmed.split(/\s+/);
        if (words.length < 3 || trimmed.length < 8) {
          log(`⚠ Descartado (muy corto): "${trimmed}"`);
          if (isActiveRef.current) startListeningRef.current?.();
        } else {
          log(`✔ "${trimmed}" — ejecutando`);
          setLiveText('');
          handleQuery(trimmed);
        }
      } else {
        log('🔇 Sin voz detectada — escuchando de nuevo');
        if (isActiveRef.current) startListeningRef.current?.();
      }
    } catch (err: any) {
      if (err?.message === 'RATE_LIMIT') {
        log('🚦 Whisper — límite de rate');
        speak('Demasiadas consultas. Espera unos segundos.');
      } else {
        log(`🚫 Whisper error: ${err?.message}`);
        if (isActiveRef.current) startListeningRef.current?.();
      }
    }
  };

  // ── Detener grabación y enviar a Whisper ──
  const submitVoice = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== 'recording') return;
    rec.stop(); // dispara onstop → transcribeRef.current()
  }, []);

  const submitVoiceRef = useRef(submitVoice);
  useEffect(() => { submitVoiceRef.current = submitVoice; }, [submitVoice]);

  // ── Iniciar grabación con MediaRecorder + AudioContext ──
  const startListening = useCallback(async () => {
    if (isProcessing || !isActiveRef.current) return;

    // Limpiar sesión anterior
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    stopMic();
    setLiveText('');

    log('🎙 Solicitando micrófono...');
    try {
      // Cancelación de ruido, eco y ganancia automática desactivada (control manual)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression:  true,
          echoCancellation:  true,
          autoGainControl:   false, // ganancia fija para umbral predecible
          channelCount:      1,
        },
        video: false,
      });
      streamRef.current = stream;

      // AudioContext para visualización real y detección de silencio
      const AC = (window.AudioContext ?? (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      // Filtro paso alto a 120 Hz — elimina ruido ambiente de baja frecuencia
      // (voces de personas al lado, ventiladores, AC de sala de monitoreo)
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 120;
      highPass.Q.value = 0.7;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      ctx.createMediaStreamSource(stream).connect(highPass);
      highPass.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);

      let hasSpeech      = false;
      let silenceStart   = 0;
      let submitted      = false;
      let skipTranscribe = false;
      let speechFrames   = 0;           // frames consecutivos por encima del umbral
      let totalSpeechMs  = 0;           // ms acumulados de voz real (para filtrar ruido continuo)
      let lastTick       = Date.now();
      const FRAMES_NEEDED   = 22;       // ~370ms sostenidos antes de marcar hasSpeech
      const THRESHOLD       = 0.27;     // más alto para ambientes ruidosos / central con gente
      const MIN_SPEECH_MS   = 600;      // mínimo 600ms de voz real antes de enviar a Whisper
      const sessionStart    = Date.now();
      const MAX_SESSION_MS  = 15000;
      const NO_SPEECH_MS    = 8000;

      const doSubmit = (skip = false) => {
        if (submitted) return;
        submitted = true;
        skipTranscribe = skip;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = undefined;
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      // Loop: visualización real + detección de silencio con histéresis
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length) / 128;
        setAudioLevel(rms);

        const elapsed = Date.now() - sessionStart;

        // Timeout de sesión máxima
        if (elapsed > MAX_SESSION_MS) {
          log('⏱ Tiempo máximo alcanzado — enviando');
          doSubmit();
          return;
        }

        // Timeout sin voz: si lleva 8s y nunca hubo voz real, reinicia
        if (!hasSpeech && elapsed > NO_SPEECH_MS) {
          log('🔇 Sin voz en 8s — reiniciando');
          doSubmit(true); // skip transcription
          return;
        }

        const now = Date.now();
        const dt  = now - lastTick;
        lastTick  = now;

        if (rms > THRESHOLD) {
          speechFrames++;
          silenceStart = 0;
          if (speechFrames >= FRAMES_NEEDED) {
            hasSpeech = true;
            totalSpeechMs += dt;
          }
        } else {
          speechFrames = Math.max(0, speechFrames - 2);
          if (hasSpeech) {
            if (!silenceStart) silenceStart = now;
            if (now - silenceStart > 1800) {
              if (totalSpeechMs >= MIN_SPEECH_MS) {
                log('🔕 Silencio detectado — enviando');
                doSubmit();
              } else {
                log('⚠ Ruido corto descartado — escuchando');
                hasSpeech  = false;
                silenceStart = 0;
                totalSpeechMs = 0;
              }
              return;
            }
          }
        }
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);

      // MediaRecorder para capturar audio
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const chunks: Blob[] = [];
      const recorder       = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        stopMic();
        setIsListening(false);
        if (!isActiveRef.current) return; // Orbe cerrado — cancelar todo
        if (skipTranscribe) {
          // Sin voz en el tiempo máximo — reiniciar escucha pasiva
          log('🔇 Sin voz — esperando...');
          startListeningRef.current?.();
          return;
        }
        if (chunks.length === 0) {
          log('🔇 Sin datos de audio — escuchando de nuevo');
          if (isActiveRef.current) startListeningRef.current?.();
          return;
        }
        const blob = new Blob(chunks, { type: mime });
        await transcribeRef.current?.(blob, mime);
      };

      recorder.start(200);
      setIsListening(true);
      log('✅ Grabando — habla, luego calla o haz clic en el orbe');

    } catch (err: any) {
      stopMic();
      setIsListening(false);
      log(`🚫 ${err?.name === 'NotAllowedError' ? 'Sin permiso de micrófono' : err?.message}`);
    }
  }, [isProcessing, stopMic, log]);

  const startListeningRef = useRef(startListening);
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  const handleOpen = useCallback(() => {
    isActiveRef.current = true;
    setIsExpanded(true);
    setInputValue('');
    setLiveText('');
    historyRef.current = [];
    speak('Bienvenido, ¿en qué te puedo ayudar?', () => { if (isActiveRef.current) startListeningRef.current?.(); });
  }, [speak]);

  // ── Ctrl+I para abrir el asistente ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        if (!isExpanded) handleOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded, handleOpen]);

  // Cambia a modo escritura: detiene mic/TTS sin cerrar el asistente
  const switchToTyping = useCallback(() => {
    if (!isListening && !isSpeaking && !isProcessing) return;
    isActiveRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    stopMic();
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setLiveText('');
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isListening, isSpeaking, isProcessing, stopMic]);

  const handleClose = useCallback(() => {
    // Desactivar guardia PRIMERO para que ningún callback pendiente relance el mic
    isActiveRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    stopMic();
    window.speechSynthesis?.cancel();
    clearTimeout(responseTimer.current);
    setIsExpanded(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setLiveText('');
    setInputValue('');
    setAiResponse('');
    setDbg('');
  }, [stopMic]);

  useEffect(() => { handleCloseRef.current = handleClose; }, [handleClose]);

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    stopMic();
    window.speechSynthesis?.cancel();
    clearTimeout(responseTimer.current);
  }, [stopMic]);

  const voiceBusy  = isListening || isSpeaking || isProcessing;
  const voiceState: OrbVoiceState = isListening ? 'listening' : isProcessing ? 'processing' : isSpeaking ? 'speaking' : 'idle';
  const inputDisplay = liveText || inputValue;

  // Orbe: si está escuchando → click envía; si está en otro estado activo → cierra; si inactivo → abre o reinicia escucha
  const handleOrbClick = !isExpanded
    ? handleOpen
    : isListening
      ? submitVoice
      : (isProcessing || isSpeaking)
        ? handleClose
        : () => startListening();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none">

      {/* Tooltip de atención */}
      <AnimatePresence>
        {isAttentive && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none"
          >
            <div className="bg-slate-900/92 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg border border-white/10 whitespace-nowrap">
              ¿En qué puedo ayudarte?
            </div>
            <div className="w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-900/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja de respuesta IA */}
      <AnimatePresence>
        {isExpanded && aiResponse && !voiceBusy && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none max-w-[280px] text-center"
          >
            <div className="bg-slate-900/90 backdrop-blur-md text-white/85 text-[11px] font-medium px-3.5 py-2 rounded-2xl shadow-lg border border-white/10 leading-relaxed">
              {aiResponse}
            </div>
            <div className="w-0 h-0 mx-auto mt-0.5 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-900/88" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fila principal: orbe (izquierda) + input (derecha) */}
      <div className="flex items-center gap-2 pointer-events-auto">

        <AIAssistantOrb
          isOpen={isExpanded}
          isAttentive={isAttentive}
          voiceState={voiceState}
          audioLevel={audioLevel}
          onClick={handleOrbClick}
        />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 232, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="w-[232px] flex items-center gap-2 rounded-full px-3.5 py-[7px]"
                onClick={switchToTyping}
                style={{
                  background: 'rgba(15,20,35,0.88)',
                  backdropFilter: 'blur(16px)',
                  cursor: voiceBusy ? 'text' : 'default',
                  border: isListening
                    ? '1.5px solid rgba(239,68,68,0.45)'
                    : isProcessing
                      ? '1.5px solid rgba(245,158,11,0.4)'
                      : isSpeaking
                        ? '1.5px solid rgba(139,92,246,0.45)'
                        : '1.5px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.3s',
                }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  animate={{ opacity: isListening ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
                  style={{
                    background: isListening ? '#ef4444' : isProcessing ? '#f59e0b' : isSpeaking ? '#a78bfa' : '#334155',
                  }}
                />

                <input
                  ref={inputRef}
                  value={inputDisplay}
                  onChange={e => { setInputValue(e.target.value); setLiveText(''); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && inputValue.trim()) handleQuery(inputValue.trim());
                    if (e.key === 'Escape') handleClose();
                  }}
                  onFocus={switchToTyping}
                  placeholder={
                    isListening  ? 'Toca para escribir...' :
                    isProcessing ? 'Procesando...'         :
                    isSpeaking   ? 'Respondiendo...'       :
                    'Habla o escribe algo...'
                  }
                  className="flex-1 min-w-0 bg-transparent outline-none text-[12px] font-medium text-white/88 placeholder:text-white/30"
                  style={{ textOverflow: 'ellipsis' }}
                  autoComplete="off"
                />

                <AnimatePresence>
                  {inputValue.trim() && !isProcessing && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={e => { e.stopPropagation(); handleQuery(inputValue.trim()); }}
                      className="shrink-0 w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    >
                      <Send className="w-2.5 h-2.5 text-white/70" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  onClick={e => { e.stopPropagation(); handleClose(); }}
                  className="shrink-0 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-white/40 hover:text-white/70" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Legacy export para compatibilidad
export function AIAssistantButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return <AIAssistantOrb isOpen={isOpen} isAttentive={false} onClick={onClick} />;
}
