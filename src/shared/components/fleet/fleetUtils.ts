import type { Vehicle } from '../../lib/data';

export function getBatteryColor(fuel: string): string {
  const pct = parseInt(fuel) || 0;
  if (pct <= 20) return 'text-red-500';
  if (pct <= 60) return 'text-amber-500';
  return 'text-emerald-500';
}

// Color del ícono de vehículo según estado de reporte del GPS principal.
// Independiente de ignición — un vehículo puede tener Ignition ON pero GPS sin señal.
export function getVehicleGpsStyle(vehicle: Vehicle, isDark = false) {
  const status = vehicle.gpsDevices?.[0]?.reportStatus;
  if (isDark) {
    switch (status) {
      case 'reporting':    return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: 'text-emerald-400', solid: 'bg-emerald-500', ping: 'bg-emerald-400', isReporting: true  };
      case 'low-signal':   return { bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  icon: 'text-orange-400', solid: 'bg-orange-500',  ping: '',              isReporting: false };
      case 'no-signal':    return { bg: 'bg-slate-500/15',   border: 'border-slate-500/30',   icon: 'text-slate-400',  solid: 'bg-slate-500',   ping: '',              isReporting: false };
      case 'disconnected': return { bg: 'bg-red-500/15',     border: 'border-red-500/30',     icon: 'text-red-400',    solid: 'bg-red-500',     ping: '',              isReporting: false };
      default:             return { bg: 'bg-slate-500/15',   border: 'border-slate-500/30',   icon: 'text-slate-400',  solid: 'bg-slate-500',   ping: '',              isReporting: false };
    }
  }
  switch (status) {
    case 'reporting':    return { bg: 'bg-emerald-50', border: 'border-emerald-200/80', icon: 'text-emerald-600', solid: 'bg-emerald-500', ping: 'bg-emerald-400', isReporting: true  };
    case 'low-signal':   return { bg: 'bg-orange-50',  border: 'border-orange-200/80',  icon: 'text-orange-500', solid: 'bg-orange-500',  ping: '',              isReporting: false };
    case 'no-signal':    return { bg: 'bg-slate-50',   border: 'border-slate-200/80',   icon: 'text-slate-400',  solid: 'bg-slate-400',   ping: '',              isReporting: false };
    case 'disconnected': return { bg: 'bg-red-50',     border: 'border-red-200/80',     icon: 'text-red-500',    solid: 'bg-red-500',     ping: '',              isReporting: false };
    default:             return { bg: 'bg-slate-50',   border: 'border-slate-200/80',   icon: 'text-slate-400',  solid: 'bg-slate-400',   ping: '',              isReporting: false };
  }
}
