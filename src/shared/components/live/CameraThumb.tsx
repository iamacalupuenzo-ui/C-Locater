import { VideoOff, Webcam } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Camera } from '../../lib/cameraData';
import { getCameraScene } from './cameraScenes';
import { WebcamFeed } from './WebcamFeed';

interface CameraThumbProps {
  camera: Camera;
  isPrimary: boolean;
  isDark?: boolean;
  onClick: () => void;
}

export function CameraThumb({ camera, isPrimary, isDark = false, onClick }: CameraThumbProps) {
  const scene = getCameraScene(camera.position);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-1 min-w-0 rounded-lg overflow-hidden border-2 transition-all',
        isPrimary
          ? 'border-brand shadow-[0_0_0_2px_rgba(0,82,204,0.2)]'
          : isDark
            ? 'border-zinc-700 hover:border-zinc-500'
            : 'border-slate-300 hover:border-slate-400',
        isDark ? 'bg-zinc-900' : 'bg-slate-700',
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {camera.isOnline ? (
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
        {camera.source === 'webcam' && <Webcam className="w-2.5 h-2.5 text-white/70" strokeWidth={2} />}
        <span className="text-[9px] font-semibold text-white leading-none">{camera.label}</span>
      </div>

      {isPrimary && (
        <div className="absolute top-1 right-1 bg-brand/90 px-1 py-0.5 rounded text-[8px] font-bold text-white leading-none">
          PRINCIPAL
        </div>
      )}
    </button>
  );
}
