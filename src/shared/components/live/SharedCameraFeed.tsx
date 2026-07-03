import { useEffect, useRef, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { CHANNEL_PREFIX } from '../../lib/cameraShare';

type FeedStatus = 'waiting' | 'active' | 'disconnected';

interface SharedCameraFeedProps {
  roomId: string;
  className?: string;
}

export function SharedCameraFeed({ roomId, className = '' }: SharedCameraFeedProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<FeedStatus>('waiting');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const channel = new BroadcastChannel(`${CHANNEL_PREFIX}${roomId}`);

    const resetTimeout = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStatus('disconnected'), 4000);
    };

    channel.onmessage = (e) => {
      const { type, bitmap } = e.data as { type: string; bitmap: ImageBitmap };
      if (type !== 'frame' || !bitmap) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      if (status !== 'active') setStatus('active');
      resetTimeout();
    };

    return () => {
      clearTimeout(timeoutRef.current);
      channel.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      {status === 'waiting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900">
          <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" strokeWidth={1.5} />
          <span className="text-[10px] text-zinc-500">Esperando conexión...</span>
        </div>
      )}

      {status === 'disconnected' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900">
          <WifiOff className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
          <span className="text-[10px] text-zinc-500">Cámara desconectada</span>
        </div>
      )}

      {status === 'active' && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
          </span>
          <span className="text-[10px] font-bold text-white">EN VIVO</span>
        </div>
      )}
    </div>
  );
}
