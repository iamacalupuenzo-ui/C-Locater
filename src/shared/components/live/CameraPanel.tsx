import { useState, useRef } from 'react';
import { Video, VideoOff, ChevronRight, ChevronLeft, Webcam, Link, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Camera } from '../../lib/cameraData';
import { CameraThumb } from './CameraThumb';
import { getCameraScene } from './cameraScenes';
import { WebcamFeed } from './WebcamFeed';
import { SharedCameraFeed } from './SharedCameraFeed';
import { generateRoomId, buildShareUrl } from '../../lib/cameraShare';

// ─── Tipos de layout ────────────────────────────────────────────────────────
type LayoutMode = 'main+thumbs' | 'grid' | 'main+side' | 'single';

// ─── SVGs de layout (mismo estilo que DockPicker en VehicleCaptureView) ────
function LayoutMainThumbsSvg() {
  return (
    <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
      <rect x="0.5" y="0.5" width="41" height="29" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="38" height="18" rx="2" fill="currentColor" fillOpacity="0.55" />
      <rect x="2"  y="22" width="11" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="15" y="22" width="11" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="29" y="22" width="11" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function LayoutGridSvg() {
  return (
    <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
      <rect x="0.5" y="0.5" width="41" height="29" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2"  y="2"  width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.45" />
      <rect x="22" y="2"  width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.45" />
      <rect x="2"  y="16" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.45" />
      <rect x="22" y="16" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

function LayoutMainSideSvg() {
  return (
    <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
      <rect x="0.5" y="0.5" width="41" height="29" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2"  y="2"  width="26" height="26" rx="2" fill="currentColor" fillOpacity="0.55" />
      <rect x="30" y="2"  width="10" height="8"  rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="30" y="12" width="10" height="8"  rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="30" y="22" width="10" height="6"  rx="1.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function LayoutSingleSvg() {
  return (
    <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
      <rect x="0.5" y="0.5" width="41" height="29" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="38" height="26" rx="2" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

const LAYOUTS: { id: LayoutMode; label: string; Svg: () => JSX.Element }[] = [
  { id: 'main+thumbs', label: 'Principal',  Svg: LayoutMainThumbsSvg },
  { id: 'grid',        label: 'Grilla',     Svg: LayoutGridSvg       },
  { id: 'main+side',   label: 'Lateral',    Svg: LayoutMainSideSvg   },
  { id: 'single',      label: 'Única',      Svg: LayoutSingleSvg     },
];

// ─── Render de una cámara individual ────────────────────────────────────────
function CameraView({
  camera,
  className,
  onClick,
  isDark,
  shareRoomId,
  vehiclePlate,
  onShareCopy,
  copied,
}: {
  camera: Camera;
  className?: string;
  onClick?: () => void;
  isDark: boolean;
  shareRoomId?: string;
  vehiclePlate?: string;
  onShareCopy: (cameraId: string) => void;
  copied: boolean;
}) {
  const scene = getCameraScene(camera.position);

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl group', isDark ? 'bg-zinc-900' : 'bg-slate-800', className)}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {/* Contenido de la cámara */}
      {shareRoomId ? (
        <SharedCameraFeed roomId={shareRoomId} className="absolute inset-0 w-full h-full" />
      ) : camera.isOnline ? (
        camera.source === 'webcam' ? (
          <>
            <WebcamFeed className="absolute inset-0 w-full h-full" />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
              </span>
              <Webcam className="w-3 h-3 text-white/80" strokeWidth={2} />
              <span className="text-[10px] font-bold text-white">EN VIVO</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: scene.background }} />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)' }} />
            <div className="absolute inset-0" style={{ backgroundColor: scene.tint }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-bold text-white">EN VIVO</span>
            </div>
          </>
        )
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <VideoOff className={cn('w-5 h-5', isDark ? 'text-zinc-600' : 'text-slate-500')} strokeWidth={1.5} />
          <span className={cn('text-[10px] font-medium', isDark ? 'text-zinc-600' : 'text-slate-400')}>{camera.label}</span>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 flex items-center gap-1.5">
        {camera.source === 'webcam' && !shareRoomId && <Webcam className="w-3 h-3 text-white/70" strokeWidth={2} />}
        <span className="text-[11px] font-semibold text-white flex-1 truncate">{camera.label}</span>
      </div>

      {/* Botón copiar URL — visible al hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onShareCopy(camera.id); }}
        title="Copiar URL para compartir cámara"
        className={cn(
          'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all',
          'bg-black/60 backdrop-blur-sm border border-white/10',
          copied
            ? 'text-emerald-400 opacity-100'
            : 'text-white/80 opacity-0 group-hover:opacity-100',
        )}
      >
        {copied
          ? <><Check className="w-3 h-3" strokeWidth={2.5} /> Copiado</>
          : <><Link className="w-3 h-3" strokeWidth={2} /> Compartir</>
        }
      </button>

      {/* Indicador de sala activa (esperando conexión remota) */}
      {shareRoomId && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-brand/80 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-bold text-white">REMOTA</span>
        </div>
      )}
    </div>
  );
}

// ─── CameraPanel ─────────────────────────────────────────────────────────────
interface CameraPanelProps {
  cameras: Camera[];
  vehiclePlate?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showCollapseBtn?: boolean;
  isDark?: boolean;
}

export function CameraPanel({
  cameras,
  vehiclePlate = '',
  collapsed = false,
  onToggleCollapse,
  showCollapseBtn = true,
  isDark = false,
}: CameraPanelProps) {
  const [primaryId, setPrimaryId]       = useState<string>(cameras.find(c => c.isOnline)?.id ?? cameras[0]?.id ?? '');
  const [layout, setLayout]             = useState<LayoutMode>('main+thumbs');
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [shareRooms, setShareRooms]     = useState<Record<string, string>>({}); // cameraId → roomId
  const [copiedId, setCopiedId]         = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleShareCopy = (cameraId: string) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    const roomId = shareRooms[cameraId] ?? generateRoomId();
    if (!shareRooms[cameraId]) setShareRooms(prev => ({ ...prev, [cameraId]: roomId }));
    const url = buildShareUrl(roomId, vehiclePlate, camera.label);
    navigator.clipboard.writeText(url);
    setCopiedId(cameraId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const primary     = cameras.find(c => c.id === primaryId) ?? cameras[0];
  const thumbnails  = cameras.filter(c => c.id !== primary?.id);
  const onlineCount = cameras.filter(c => c.isOnline).length;

  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full w-10 border-l gap-4', isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200')}>
        <button
          onClick={onToggleCollapse}
          className={cn('w-7 h-7 flex items-center justify-center rounded-lg transition-colors', isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700' : 'bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-200')}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <Video className={cn('w-4 h-4', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.5} />
          <span className={cn('text-[9px] font-bold [writing-mode:vertical-rl] rotate-180', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            {cameras.length} cám.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full relative', isDark ? 'bg-zinc-950' : 'bg-slate-50')}>

      {/* Collapse handle */}
      {showCollapseBtn && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn('absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-10 flex items-center justify-center rounded-lg border transition-colors shadow-lg', isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50')}
        >
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}

      {/* Header */}
      <div className={cn('flex items-center justify-between px-3 py-2 border-b shrink-0', isDark ? 'border-zinc-800' : 'border-slate-200')}>
        <div className="flex items-center gap-2">
          <span className={cn('text-[11px] font-bold', isDark ? 'text-zinc-200' : 'text-slate-700')}>Cámaras</span>
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', onlineCount > 0 ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-slate-100 text-slate-500'))}>
            {onlineCount}/{cameras.length} en línea
          </span>
        </div>

        {/* Layout picker trigger */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowLayoutPicker(p => !p)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showLayoutPicker
                ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'),
            )}
            title="Distribución de cámaras"
          >
            {/* Icono de grilla 2x2 inline */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="0" y="8" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor" />
            </svg>
          </button>

          <AnimatePresence>
            {showLayoutPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                className={cn(
                  'absolute top-full right-0 mt-1 z-50 rounded-lg border p-2.5 shadow-lg',
                  isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200',
                )}
              >
                <p className={cn('text-[9px] font-semibold uppercase tracking-wider mb-2 px-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  Distribución
                </p>
                <div className="flex gap-1.5">
                  {LAYOUTS.map(({ id, label, Svg }) => (
                    <button
                      key={id}
                      onClick={() => { setLayout(id); setShowLayoutPicker(false); }}
                      className={cn(
                        'flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors border text-[10px] font-medium whitespace-nowrap',
                        layout === id
                          ? (isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-blue-50 text-blue-600 border-blue-200')
                          : (isDark ? 'text-zinc-400 border-transparent hover:bg-zinc-800' : 'text-slate-500 border-transparent hover:bg-slate-100'),
                      )}
                    >
                      <Svg />
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Contenido según layout ── */}

      {/* main+thumbs: principal grande + thumbnails en fila inferior */}
      {layout === 'main+thumbs' && (
        <>
          {!primary ? (
            <div className="flex-1 min-h-0 p-2">
              <div className={cn('flex items-center justify-center h-full text-[12px]', isDark ? 'text-zinc-600' : 'text-slate-400')}>Sin cámaras disponibles</div>
            </div>
          ) : (
            <>
              {/* Principal: siempre grande y arriba, sin importar cuántas secundarias haya */}
              <div className="flex-1 min-h-0 p-2">
                <CameraView camera={primary} className="w-full h-full" isDark={isDark} shareRoomId={shareRooms[primary.id]} vehiclePlate={vehiclePlate} onShareCopy={handleShareCopy} copied={copiedId === primary.id} />
              </div>
              {thumbnails.length > 0 && (
                // Ancho máximo por thumbnail (minmax) para que nunca ocupen todo el espacio
                // disponible: con pocas secundarias quedan celdas de tamaño acotado en vez
                // de estirarse a columnas gigantes; con muchas, se envuelven en más filas.
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,180px))] gap-2 px-2 pb-2 shrink-0 justify-center">
                  {thumbnails.map(cam => (
                    <CameraThumb key={cam.id} camera={cam} isPrimary={false} isDark={isDark} onClick={() => setPrimaryId(cam.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* grid: todas las cámaras en grilla 2 columnas */}
      {layout === 'grid' && (
        <div className="flex-1 min-h-0 p-2 grid grid-cols-2 gap-2">
          {cameras.map(cam => (
            <CameraView
              key={cam.id}
              camera={cam}
              className={cn('w-full h-full', cam.id === primaryId && 'ring-2 ring-blue-500')}
              isDark={isDark}
              onClick={() => setPrimaryId(cam.id)}
              shareRoomId={shareRooms[cam.id]}
              vehiclePlate={vehiclePlate}
              onShareCopy={handleShareCopy}
              copied={copiedId === cam.id}
            />
          ))}
        </div>
      )}

      {/* main+side: principal a la izquierda, resto apiladas a la derecha */}
      {layout === 'main+side' && (
        <div className="flex-1 min-h-0 p-2 flex gap-2">
          <div className="flex-1 min-w-0">
            {primary && <CameraView camera={primary} className="w-full h-full" isDark={isDark} shareRoomId={shareRooms[primary.id]} vehiclePlate={vehiclePlate} onShareCopy={handleShareCopy} copied={copiedId === primary.id} />}
          </div>
          {thumbnails.length > 0 && (
            <div className="w-[28%] flex flex-col gap-2">
              {thumbnails.map(cam => (
                <div key={cam.id} className="flex-1 min-h-0">
                  <CameraView camera={cam} className="w-full h-full" isDark={isDark} onClick={() => setPrimaryId(cam.id)} shareRoomId={shareRooms[cam.id]} vehiclePlate={vehiclePlate} onShareCopy={handleShareCopy} copied={copiedId === cam.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* single: solo la cámara principal, sin thumbnails */}
      {layout === 'single' && (
        <div className="flex-1 min-h-0 p-2">
          {primary
            ? <CameraView camera={primary} className="w-full h-full" isDark={isDark} shareRoomId={shareRooms[primary.id]} vehiclePlate={vehiclePlate} onShareCopy={handleShareCopy} copied={copiedId === primary.id} />
            : <div className={cn('flex items-center justify-center h-full text-[12px]', isDark ? 'text-zinc-600' : 'text-slate-400')}>Sin cámaras disponibles</div>
          }
        </div>
      )}
    </div>
  );
}
