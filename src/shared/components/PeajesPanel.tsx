import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CreditCard, Fuel, Wrench, Car, ParkingCircle, Waves, ShieldCheck, Info, X } from 'lucide-react';

interface PeajesPanelProps {
  peajes: string;
  viajes: string;
  mapMoving: boolean;
  onClose: () => void;
}

function formatSoles(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const COST_ITEMS = [
  { id: 'combustible',     label: 'Combustible',        tooltip: 'Costo por la distancia recorrida',         icon: Fuel,          iconColor: 'text-amber-500',  ratePerTrip: 50 },
  { id: 'mantenimiento',   label: 'Mantenimiento',       tooltip: 'Costo del desgaste normal del vehículo',   icon: Wrench,        iconColor: 'text-blue-400',   ratePerTrip: 40 },
  { id: 'soat',            label: 'SOAT',                tooltip: 'Requisito legal para conducir',             icon: ShieldCheck,   iconColor: 'text-green-500',  ratePerTrip: 38 },
  { id: 'estacionamiento', label: 'Estacionamiento',     tooltip: 'Costo por estacionar en lugares de pago',  icon: ParkingCircle, iconColor: 'text-sky-500',    ratePerTrip: 24 },
  { id: 'peaje',           label: 'Peaje',               tooltip: 'Costo de derecho de tránsito',             icon: Car,           iconColor: 'text-violet-400', ratePerTrip: 18 },
  { id: 'seguro',          label: 'Seguro',              tooltip: 'Costo de protección del vehículo',         icon: ShieldCheck,   iconColor: 'text-rose-400',   ratePerTrip: 38 },
  { id: 'lavado',          label: 'Lavado del vehículo', tooltip: 'Costo de limpieza del vehículo',           icon: Waves,         iconColor: 'text-cyan-500',   ratePerTrip: 18 },
] as const;

interface TooltipPos { top: number; left: number; }

interface CostRowProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  tooltip: string;
  amount: string;
  onTooltipShow: (pos: TooltipPos, text: string) => void;
  onTooltipHide: () => void;
}

function CostRow({ icon: Icon, iconColor, label, tooltip, amount, onTooltipShow, onTooltipHide }: CostRowProps) {
  const infoRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!infoRef.current) return;
    const rect = infoRef.current.getBoundingClientRect();
    onTooltipShow({ top: rect.top - 8, left: rect.left + rect.width / 2 }, tooltip);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} strokeWidth={1.75} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-slate-500 leading-tight">{amount}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10.5px] text-slate-400 leading-tight">{label}</span>
          <div ref={infoRef} onMouseEnter={handleEnter} onMouseLeave={onTooltipHide}>
            <Info className="w-3 h-3 text-slate-300 hover:text-slate-400 cursor-default transition-colors" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PeajesPanel({ viajes, mapMoving, onClose }: PeajesPanelProps) {
  const [tooltip, setTooltip] = useState<{ pos: TooltipPos; text: string } | null>(null);

  const viajesNum = parseInt(viajes.replace(/,/g, ''), 10) || 0;
  const total     = COST_ITEMS.reduce((sum, item) => sum + item.ratePerTrip * viajesNum, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: mapMoving ? 0 : 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: mapMoving ? 0.15 : 0.18, ease: [0.23, 1, 0.32, 1] }}
        style={{ pointerEvents: mapMoving ? 'none' : undefined, right: 52 }}
        className="absolute top-[76px] z-[1000] w-[224px] bg-white/97 backdrop-blur-2xl rounded-md border border-slate-200/70 shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <span className="text-[13px] font-semibold text-slate-800 leading-none">Costos por viaje</span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
        <span className="text-[10px] text-slate-400 px-4 pb-2.5 shrink-0 block">Período: últimos 30 días</span>

        <div className="h-px bg-slate-100 shrink-0" />

        {/* Monto total */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0">
          <CreditCard className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-800 leading-tight">{formatSoles(total)}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Monto total</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 shrink-0" />

        {/* Cost rows */}
        <div className="py-1">
          {COST_ITEMS.map((item, i) => (
            <div key={item.id}>
              <CostRow
                icon={item.icon}
                iconColor={item.iconColor}
                label={item.label}
                tooltip={item.tooltip}
                amount={formatSoles(item.ratePerTrip * viajesNum)}
                onTooltipShow={(pos, text) => setTooltip({ pos, text })}
                onTooltipHide={() => setTooltip(null)}
              />
              {i < COST_ITEMS.length - 1 && <div className="h-px bg-slate-100 mx-4" />}
            </div>
          ))}
        </div>

        <div className="h-px bg-slate-100 shrink-0" />
        <div className="px-4 py-2.5 flex justify-center shrink-0">
          <span className="text-[11px] font-semibold text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">Ver detalle</span>
        </div>
      </motion.div>

      {/* Tooltip via portal — fuera del overflow:hidden */}
      {tooltip && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ top: tooltip.pos.top, left: tooltip.pos.left }}
        >
          <div className="bg-slate-800 text-white text-[10.5px] leading-snug px-2.5 py-2 rounded-lg shadow-lg w-[148px]">
            {tooltip.text}
          </div>
          <div className="mx-auto w-0 border-4 border-transparent border-t-slate-800" style={{ width: 0 }} />
        </div>,
        document.body
      )}
    </>
  );
}
