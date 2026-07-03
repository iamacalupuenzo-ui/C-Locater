import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CameraOff, Loader2, X, Radio } from 'lucide-react';
import { CHANNEL_PREFIX, clearShareParams } from '../../lib/cameraShare';
import type { ShareParams } from '../../lib/cameraShare';

type SenderStatus = 'idle' | 'requesting' | 'streaming' | 'denied';

interface CameraShareJoinProps {
  params: ShareParams;
  onClose: () => void;
}

export function CameraShareJoin({ params, onClose }: CameraShareJoinProps) {
  const [status, setStatus]   = useState<SenderStatus>('idle');
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const rafRef     = useRef<number>();

  const startStreaming = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const channel = new BroadcastChannel(`${CHANNEL_PREFIX}${params.roomId}`);
      channelRef.current = channel;

      const sendFrame = async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(sendFrame); return; }
        try {
          const bitmap = await createImageBitmap(video);
          channel.postMessage({ type: 'frame', bitmap }, [bitmap]);
        } catch {
          // frame dropped — ignore
        }
        rafRef.current = requestAnimationFrame(sendFrame);
      };

      rafRef.current = requestAnimationFrame(sendFrame);
      setStatus('streaming');
    } catch {
      setStatus('denied');
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current!);
    streamRef.current?.getTracks().forEach(t => t.stop());
    channelRef.current?.close();
    clearShareParams();
    onClose();
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current!);
    streamRef.current?.getTracks().forEach(t => t.stop());
    channelRef.current?.close();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', bounce: 0.12, duration: 0.3 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-brand" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 leading-none">Cámara compartida</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{params.vehicle} · {params.label}</p>
              </div>
            </div>
            {status !== 'streaming' && (
              <button onClick={stop} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-zinc-900" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {status !== 'streaming' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {status === 'requesting' ? (
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" strokeWidth={1.5} />
                  ) : status === 'denied' ? (
                    <CameraOff className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
                  ) : (
                    <Camera className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
                  )}
                  <span className="text-[10px] text-zinc-500 text-center px-4">
                    {status === 'requesting' ? 'Solicitando acceso...' :
                     status === 'denied'     ? 'Acceso denegado. Revisa los permisos del navegador.' :
                                              'Vista previa de tu cámara'}
                  </span>
                </div>
              )}

              {status === 'streaming' && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-white">TRANSMITIENDO</span>
                </div>
              )}
            </div>

            <p className="text-[12px] text-slate-500 text-center leading-relaxed">
              {status === 'streaming'
                ? `Tu cámara está siendo transmitida en tiempo real a la unidad ${params.vehicle}.`
                : `Tu cámara se mostrará en vivo en el slot "${params.label}" de la unidad ${params.vehicle}.`
              }
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-2.5">
            {status === 'streaming' ? (
              <button
                onClick={stop}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Detener transmisión
              </button>
            ) : (
              <>
                <button
                  onClick={stop}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={startStreaming}
                  disabled={status === 'requesting' || status === 'denied'}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-brand text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'requesting' ? 'Conectando...' : 'Activar mi cámara'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
