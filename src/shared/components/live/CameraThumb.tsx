import { VideoOff, Webcam, Link, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Camera } from '../../lib/cameraData';
import { getCameraScene } from './cameraScenes';
import { WebcamFeed } from './WebcamFeed';
import { SharedCameraFeed } from './SharedCameraFeed';

interface CameraThumbProps {
  camera: Camera;
  isPrimary: boolean;
  isDark?: boolean;
  onClick: () => void;
  shareRoomId?: string;
  onShareCopy?: (cameraId: string) => void;
  copied?: boolean;
}

export function CameraThumb({ camera, isPrimary, isDark = false, onClick, shareRoomId, onShareCopy, copied = false }: CameraThumbProps) {
  const scene = getCameraScene(camera.position);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={cn(
        'relative flex-1 min-w-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer group',
        isPrimary
          ? 'border-brand shadow-[0_0_0_2px_rgba(0,82,204,0.2)]'
          : isDark
            ? 'border-zinc-700 hover:border-zinc-500'
            : 'border-slate-300 hover:border-slate-400',
        isDark ? 'bg-zinc-900' : 'bg-slate-700',
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {shareRoomId ? (
        <SharedCameraFeed roomId={shareRoomId} className="absolute inset-0 w-full h-full" />
      ) : camera.isOnline ? (
        <>
          {camera.source === 'webcam' ? (
            <WebcamFeed className="absolute inset-0 w-full h-full" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: scene.background }} />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 4px)' }}
              />
              <div className="absolute inset-0" style={{ backgroundColor: scene.tint }} />
            </>
          )}

          {/* Live dot */}
          <div className="absolute top-1 left-1 flex items-center gap-1">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red-500" />
            </span>
          </div>
        </>
      ) : (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-1',
          isDark ? 'bg-zinc-900' : 'bg-slate-600',
        )}>
          <VideoOff className={cn('w-3.5 h-3.5', isDark ? 'text-zinc-600' : 'text-slate-400')} strokeWidth={1.5} />
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 flex items-center gap-1">
        {camera.source === 'webcam' && !shareRoomId && <Webcam className="w-2.5 h-2.5 text-white/70" strokeWidth={2} />}
        <span className="text-[9px] font-semibold text-white leading-none">{camera.label}</span>
      </div>

      {isPrimary && (
        <div className="absolute top-1 right-1 bg-brand/90 px-1 py-0.5 rounded text-[8px] font-bold text-white leading-none">
          PRINCIPAL
        </div>
      )}

      {/* Botón copiar URL — visible al hover */}
      {!isPrimary && onShareCopy && !shareRoomId && (
        <button
          onClick={(e) => { e.stopPropagation(); onShareCopy(camera.id); }}
          title="Copiar URL para compartir cámara"
          className={cn(
            'absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-md transition-all',
            'bg-black/60 backdrop-blur-sm border border-white/10',
            copied
              ? 'text-emerald-400 opacity-100'
              : 'text-white/80 opacity-0 group-hover:opacity-100',
          )}
        >
          {copied
            ? <Check className="w-3 h-3" strokeWidth={2.5} />
            : <Link className="w-3 h-3" strokeWidth={2} />
          }
        </button>
      )}

      {/* Indicador de sala activa (esperando conexión remota) */}
      {shareRoomId && (
        <div className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/80 backdrop-blur-sm">
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          <span className="text-[8px] font-bold text-white leading-none">REMOTA</span>
        </div>
      )}
    </div>
  );
}
