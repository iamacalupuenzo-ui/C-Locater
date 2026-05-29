import { useCallback, useState, type RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Image as ImageIcon, Map, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import type { Trip } from './TripPanel';
import type { TripEventGroup } from './TripPanel';

interface TripDownloadModalProps {
  vehicle: Vehicle;
  trip: Trip | null;
  eventGroups: TripEventGroup[] | undefined;
  mapRef: RefObject<HTMLDivElement | null>;
  isDark?: boolean;
  onClose: () => void;
}

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Leve', medium: 'Moderado', high: 'Alto',
};
const TYPE_LABEL: Record<string, string> = {
  speeding: 'Exceso de velocidad',
  hard_braking: 'Frenado brusco',
  harsh_acceleration: 'Aceleración brusca',
  sharp_turn: 'Giro brusco',
};

function buildPdfHtml(vehicle: Vehicle, trip: Trip | null, eventGroups: TripEventGroup[] | undefined): string {
  const allEvents = eventGroups?.flatMap(g =>
    g.instances.map(i => ({ ...i, typeLabel: TYPE_LABEL[g.type] ?? g.type }))
  ).sort((a, b) => a.time.localeCompare(b.time)) ?? [];

  const statusLabel = trip?.status === 'in-progress'
    ? (trip.roaming ? 'En curso · Rastreo libre' : 'En curso')
    : trip?.status === 'cancelled' ? 'Cancelado' : 'Completado';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Reporte de viaje — ${vehicle.plate}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; padding: 40px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .sub { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { }
  .field label { font-size: 10px; color: #9ca3af; font-weight: 600; display: block; margin-bottom: 2px; }
  .field span { font-size: 13px; font-weight: 600; color: #111827; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
  .badge-low { background: #eff6ff; color: #3b82f6; }
  .badge-medium { background: #fffbeb; color: #f59e0b; }
  .badge-high { background: #fef2f2; color: #ef4444; }
  .footer { margin-top: 40px; font-size: 10px; color: #d1d5db; text-align: right; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>${vehicle.name} · <span style="color:#6b7280;font-weight:600">${vehicle.plate}</span></h1>
<p class="sub">Reporte de viaje generado el ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

<div class="section">
  <div class="section-title">Información del viaje</div>
  <div class="grid">
    <div class="field"><label>Fecha</label><span>${trip?.dateLabel ?? '—'}</span></div>
    <div class="field"><label>Estado</label><span>${statusLabel}</span></div>
    <div class="field"><label>Inicio</label><span>${trip?.time ?? '—'}</span></div>
    <div class="field"><label>Fin</label><span>${trip?.endTime ?? '—'}</span></div>
    <div class="field"><label>Distancia</label><span>${trip?.distance ?? '—'}</span></div>
    <div class="field"><label>Duración</label><span>${trip?.duration ?? '—'}</span></div>
    <div class="field"><label>Origen</label><span>${trip?.origin ?? '—'}</span></div>
    <div class="field"><label>Destino</label><span>${trip?.roaming ? 'Rastreo en tiempo real' : (trip?.destination ?? '—')}</span></div>
    <div class="field"><label>Eventos registrados</label><span>${allEvents.length}</span></div>
    <div class="field"><label>Tipo de vehículo</label><span style="text-transform:capitalize">${vehicle.type}</span></div>
  </div>
</div>

${allEvents.length > 0 ? `
<div class="section">
  <div class="section-title">Eventos del viaje (${allEvents.length})</div>
  <table>
    <thead>
      <tr>
        <th>Hora</th>
        <th>Tipo</th>
        <th>Detalle</th>
        <th>Severidad</th>
        <th>Ubicación</th>
      </tr>
    </thead>
    <tbody>
      ${allEvents.map(ev => `
      <tr>
        <td style="white-space:nowrap">${ev.time}</td>
        <td style="white-space:nowrap">${ev.typeLabel}</td>
        <td>${ev.detail}</td>
        <td><span class="badge badge-${ev.severity}">${SEVERITY_LABEL[ev.severity]}</span></td>
        <td>${ev.address}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>
` : ''}

<div class="footer">CLocater · ${vehicle.plate} · ${trip?.dateLabel ?? ''}</div>
</body>
</html>`;
}

function buildInfoHtml(vehicle: Vehicle, trip: Trip | null, eventGroups: TripEventGroup[] | undefined): string {
  return buildPdfHtml(vehicle, trip, eventGroups);
}

function downloadGeojson(vehicle: Vehicle, trip: Trip | null) {
  const coords = trip?.routeCoords ?? trip?.traveledCoords ?? trip?.remainingCoords;
  const geojson = {
    type: 'FeatureCollection',
    features: coords ? [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords.map(([lat, lng]: [number, number]) => [lng, lat]) },
      properties: { vehicle: vehicle.plate, name: vehicle.name, date: trip?.dateLabel, status: trip?.status },
    }] : [],
  };
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ruta-${vehicle.plate}${trip ? '-' + trip.dateLabel : ''}.geojson`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function TripDownloadModal({ vehicle, trip, eventGroups, mapRef, isDark = false, onClose }: TripDownloadModalProps) {
  const [done, setDone] = useState<string | null>(null);

  const flash = useCallback((key: string) => {
    setDone(key);
    setTimeout(() => { setDone(null); onClose(); }, 1400);
  }, [onClose]);

  const handlePdf = useCallback(() => {
    const html = buildPdfHtml(vehicle, trip, eventGroups);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
    flash('pdf');
  }, [vehicle, trip, eventGroups, flash]);

  const handleImage = useCallback(async () => {
    // Map screenshot
    if (mapRef.current) {
      try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(mapRef.current, { useCORS: true, allowTaint: true, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `mapa-${vehicle.plate}${trip ? '-' + trip.dateLabel : ''}.png`;
        a.click();
      } catch (e) {
        console.error('html2canvas error', e);
      }
    }
    // Info document
    const html = buildInfoHtml(vehicle, trip, eventGroups);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `info-viaje-${vehicle.plate}${trip ? '-' + trip.dateLabel : ''}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('image');
  }, [vehicle, trip, eventGroups, mapRef, flash]);

  const handleGeoJson = useCallback(() => {
    downloadGeojson(vehicle, trip);
    flash('geo');
  }, [vehicle, trip, flash]);

  const options = [
    {
      key: 'pdf',
      Icon: FileText,
      title: 'PDF',
      desc: 'Reporte completo con datos del viaje y listado de eventos, listo para imprimir.',
      action: handlePdf,
      accent: '#3b82f6',
    },
    {
      key: 'image',
      Icon: ImageIcon,
      title: 'Imagen',
      desc: 'Captura del mapa en PNG + documento HTML con características y eventos del viaje.',
      action: handleImage,
      accent: '#8b5cf6',
    },
    {
      key: 'geo',
      Icon: Map,
      title: 'Formato de mapa',
      desc: 'Ruta exportada como GeoJSON, compatible con QGIS, Google Maps y otras herramientas GIS.',
      action: handleGeoJson,
      accent: '#10b981',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 z-[2000] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 4 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          onClick={e => e.stopPropagation()}
          className={cn(
            'w-[460px] rounded-xl border shadow-2xl overflow-hidden',
            isDark ? 'bg-zinc-900 border-zinc-700/60' : 'bg-white border-neutral-200',
          )}
        >
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-5 py-4 border-b',
            isDark ? 'border-zinc-800' : 'border-neutral-100',
          )}>
            <div>
              <p className={cn('text-[13px] font-semibold', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                Descargar viaje
              </p>
              <p className={cn('text-[11px] mt-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                {vehicle.name} · {vehicle.plate}{trip ? ` · ${trip.dateLabel}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                isDark ? 'hover:bg-zinc-700/70 text-zinc-500' : 'hover:bg-neutral-100 text-slate-400',
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="p-4 flex flex-col gap-2.5">
            {options.map(opt => {
              const isDone = done === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={opt.action}
                  disabled={done !== null}
                  className={cn(
                    'w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150',
                    isDone
                      ? (isDark ? 'border-emerald-600/50 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50')
                      : (isDark
                        ? 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700'
                        : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-200'),
                  )}
                >
                  {/* Icon circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
                    style={{ background: isDone ? '#10b981' + '22' : opt.accent + '18' }}
                  >
                    {isDone
                      ? <Check className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                      : <opt.Icon className="w-5 h-5" strokeWidth={1.75} style={{ color: opt.accent }} />
                    }
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-semibold leading-snug', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                      {isDone ? 'Descargando…' : opt.title}
                    </p>
                    <p className={cn('text-[11px] leading-snug mt-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
