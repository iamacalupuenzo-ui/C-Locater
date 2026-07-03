import { useEffect, useRef, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import Peer from 'peerjs';

type FeedStatus = 'waiting' | 'active' | 'disconnected';

export const PEER_PREFIX = 'clocater-cam-';

interface SharedCameraFeedProps {
  roomId: string;
  className?: string;
}

export function SharedCameraFeed({ roomId, className = '' }: SharedCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef  = useRef<Peer | null>(null);
  const [status, setStatus] = useState<FeedStatus>('waiting');

  useEffect(() => {
    const peerId = `${PEER_PREFIX}${roomId}`;
    const peer   = new Peer(peerId);
    peerRef.current = peer;

    peer.on('call', (call) => {
      call.answer();
      call.on('stream', (remoteStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current.play().catch(() => {});
        }
        setStatus('active');
      });
      call.on('close', () => setStatus('disconnected'));
      call.on('error', () => setStatus('disconnected'));
    });

    peer.on('error', (err) => {
      // unavailable-id = otra instancia ya registró este peer, la ignoro
      if ((err as any).type !== 'unavailable-id') setStatus('disconnected');
    });

    return () => { peer.destroy(); };
  }, [roomId]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: status === 'active' ? 'block' : 'none' }}
      />

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
