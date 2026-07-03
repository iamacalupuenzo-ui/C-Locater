import { useEffect, useRef, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';

type Status = 'requesting' | 'active' | 'denied' | 'unavailable';

interface WebcamFeedProps {
  className?: string;
}

export function WebcamFeed({ className }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('requesting');

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('active');
      })
      .catch(() => setStatus('denied'));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (status === 'requesting') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-zinc-900 ${className ?? ''}`}>
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" strokeWidth={1.5} />
        <span className="text-[10px] text-zinc-500">Solicitando acceso a cámara…</span>
      </div>
    );
  }

  if (status === 'denied' || status === 'unavailable') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-zinc-900 ${className ?? ''}`}>
        <CameraOff className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
        <span className="text-[10px] text-zinc-500 text-center px-4">
          {status === 'denied' ? 'Acceso a cámara denegado' : 'Cámara no disponible'}
        </span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`object-cover ${className ?? ''}`}
      style={{ transform: 'scaleX(-1)' }} // mirror for selfie view
    />
  );
}
