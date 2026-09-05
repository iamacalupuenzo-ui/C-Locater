import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CameraShareJoin } from './CameraShareJoin';
import type { ShareParams } from '../../lib/cameraShare';
import logo2 from '../../../img/logo2.png';

interface CameraSharePageProps {
  params: ShareParams;
}

/**
 * Página standalone para quien abre un enlace de cámara compartida.
 * No monta la plataforma completa: solo un fondo en blanco con el logo
 * y la modal CameraShareJoin encima.
 */
export function CameraSharePage({ params }: CameraSharePageProps) {
  const [finished, setFinished] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-6">
      <img src={logo2} alt="C-Loc" className="h-9 w-auto object-contain" />

      {finished ? (
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">Transmisión finalizada</p>
            <p className="text-[12px] text-slate-500 mt-1">Ya puedes cerrar esta pestaña.</p>
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-slate-400">Cámara compartida · {params.vehicle}</p>
      )}

      {!finished && (
        <CameraShareJoin params={params} onClose={() => setFinished(true)} />
      )}
    </div>
  );
}
