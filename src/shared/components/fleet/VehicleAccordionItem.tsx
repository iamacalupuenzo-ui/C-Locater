import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Copy, ChevronRight, ChevronDown, Pencil, Share2, Power,
  Gauge, Compass, Activity, Battery, Bell, Lock, LocateFixed,
  Route, FileText, Navigation, Zap, X, Car, Bike, Truck, Bus,
  Terminal,
} from 'lucide-react';
import { cn, formatLastSeen, formatLastSeenMini, formatLastSeenMiniSecs, formatLastSeenWithSecs } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { Modal, Button } from '../ui';
import { GpsBadgeTooltip } from './GpsBadgeTooltip';
import { GpsPopover } from './GpsPopover';
import { SharePopover } from './SharePopover';
import { getBatteryColor } from './fleetUtils';

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'motorcycle') return <Bike className={className} />;
  if (type === 'truck')      return <Truck className={className} />;
  if (type === 'bus')        return <Bus className={className} />;
  return <Car className={className} />;
}

interface VehicleAccordionItemProps {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggle: () => void;
  onFlyTo: () => void;
  onShowToast: (msg: string) => void;
  userRole: UserRole;
  profile: 'c-go' | 'c-loc';
  key?: React.Key;
}

export function VehicleAccordionItem({
  vehicle, isExpanded, onToggle, onFlyTo, onShowToast, userRole, profile,
}: VehicleAccordionItemProps) {
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(vehicle.name);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showShareHistory, setShowShareHistory] = useState(false);
  const [showGpsPopover, setShowGpsPopover] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const gpsButtonRef   = useRef<HTMLButtonElement>(null);

  const isAdminOrEsad = userRole === 'admin' || userRole === 'esad';

  const visibleGpsCount = (profile === 'c-go' && userRole === 'operator')
    ? (vehicle.gpsDevices?.filter(d => d.type !== 'contingencia').length ?? 0)
    : (vehicle.gpsCount ?? 0);

  const showGpsButton = visibleGpsCount > 0
    && !(profile === 'c-go' && userRole === 'client')
    && (isAdminOrEsad || visibleGpsCount > 1);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  React.useEffect(() => {
    if (!isExpanded) setShowSharePopover(false);
  }, [isExpanded]);

  return (
    <div
      id={`vehicle-item-${vehicle.id}`}
      className={cn(
        'flex flex-col mb-2 bg-white/90 rounded-xl border transition-all',
        isExpanded
          ? 'shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-slate-200'
          : 'border-transparent hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
      )}
    >
      {/* ZONA 1 — IDENTIDAD */}
      <div
        className="flex flex-col p-3 cursor-pointer group"
        onClick={() => { if (!isEditingAlias) onToggle(); }}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
            {/* Ícono de vehículo */}
            <div className="w-[36px] h-[36px] bg-slate-50 rounded-[10px] border border-slate-200/80 flex items-center justify-center relative shrink-0 mt-0.5">
              <VehicleIcon type={vehicle.type} className="w-[18px] h-[18px] text-slate-600" />
              <GpsBadgeTooltip vehicle={vehicle} userRole={userRole} profile={profile} />
              <div className={cn(
                'absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-[1.5px] border-white flex items-center justify-center shadow-sm z-10',
                vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'stopped' ? 'bg-red-500' : 'bg-slate-400'
              )}>
                <Power className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Nombre + segunda línea */}
            <div className="flex flex-col flex-1 min-w-0">
              {isAdminOrEsad ? (
                <>
                  {/* admin/esad — Línea 1: placa */}
                  <div className="text-[14px] font-bold text-slate-900 tracking-tight leading-none truncate min-h-[24px]">
                    {vehicle.plate || vehicle.engineCode}
                  </div>
                  {/* admin/esad — Línea 2: código de motor + fecha mini con segundos (colapsado) */}
                  <div className="flex items-center justify-between mt-0.5 min-h-[14px] gap-2">
                    <span className="text-[11px] font-medium text-slate-500 leading-none min-w-0 truncate">
                      {vehicle.engineCode || vehicle.plate}
                    </span>
                    {!isExpanded && (
                      <span className="text-[11px] font-medium text-slate-400 leading-none shrink-0 whitespace-nowrap text-right">
                        {formatLastSeenMiniSecs(vehicle.lastSeen ?? '')}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* operator/client — Línea 1: alias editable */}
                  {isEditingAlias ? (
                    <div className="flex items-center gap-1.5 min-h-[24px]" onClick={(e) => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={aliasValue}
                        onChange={(e) => setAliasValue(e.target.value)}
                        onBlur={() => setIsEditingAlias(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingAlias(false)}
                        className="text-[14px] font-bold text-slate-900 tracking-tight leading-none bg-white border border-brand/50 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-brand/20 w-full max-w-[150px]"
                      />
                    </div>
                  ) : (
                    <div className="text-[14px] font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5 truncate min-h-[24px]">
                      <span className="truncate">{aliasValue}</span>
                      {isExpanded && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsEditingAlias(true); }}
                          className="text-slate-400 hover:text-brand transition-colors p-1 rounded hover:bg-slate-50 shrink-0"
                          title="Editar alias"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {/* operator/client — Línea 2: placa + velocidad */}
                  <div className="flex items-center justify-between mt-0.5 min-h-[14px] gap-2">
                    <span className="text-[11px] font-medium text-slate-500 leading-none shrink-0">
                      {vehicle.plate}
                    </span>
                    {!isExpanded && (
                      <span className="text-[11px] font-bold text-brand leading-none shrink-0">
                        {vehicle.speed}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botones derecha: compartir + chevron */}
          <div className="flex items-start gap-1.5 mt-0.5 shrink-0">
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={(e) => { e.stopPropagation(); setShowSharePopover(!showSharePopover); }}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-lg border transition-colors',
                  showSharePopover ? 'border-brand/30 bg-brand/5 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
                title="Compartir ubicación"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showSharePopover && (
                  <SharePopover
                    vehicle={vehicle}
                    triggerRef={shareButtonRef}
                    onClose={() => setShowSharePopover(false)}
                    onOpenHistory={() => setShowShareHistory(true)}
                    onShowToast={onShowToast}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Estado expandido: badge de ignición + fecha */}
        {isExpanded && (
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center justify-between w-full">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0',
                vehicle.status === 'active' ? 'bg-emerald-50 text-emerald-600' : vehicle.status === 'stopped' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'stopped' ? 'bg-red-500' : 'bg-slate-400')} />
                {profile === 'c-go'
                  ? vehicle.status === 'active' ? 'Ignition ON' : vehicle.status === 'stopped' ? 'Ignition OFF' : 'Disconnected'
                  : vehicle.status === 'active' ? 'Encendido'   : vehicle.status === 'stopped' ? 'Apagado'      : 'Desconectado'
                }
              </div>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                {isAdminOrEsad
                  ? formatLastSeenWithSecs(vehicle.lastSeen)
                  : formatLastSeen(vehicle.lastSeen)
                }
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ACORDEÓN EXPANDIDO */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-0 pb-3 flex flex-col gap-0 border-t border-slate-100">

              {/* ZONA 2 — UBICACIÓN */}
              <div className="flex flex-col gap-2 pt-3 pb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-semibold text-slate-800 leading-tight">{vehicle.address}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyText(`https://www.google.com/maps?q=${vehicle.coords}`, 'card-coords'); }}
                        className="group flex items-center gap-1 text-left text-[10.5px] font-medium text-slate-400 tracking-wide hover:text-brand transition-colors"
                      >
                        {vehicle.coords}
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </button>
                      {copiedKey === 'card-coords' && (
                        <span className="absolute -top-7 left-0 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50">Copiado ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONA 2.5 — TELEMETRÍA */}
              <div className="flex items-center pb-3">
                {(userRole === 'admin'
                  ? [
                      { icon: Gauge,   value: vehicle.speed,                  label: 'Velocidad', isAlarm: false, colorClass: null as string | null },
                      { icon: Battery, value: vehicle.fuel,                   label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                      { icon: Bell,    value: String(vehicle.alarmCount ?? 0), label: 'Alarmas',  isAlarm: true,  colorClass: null as string | null },
                    ]
                  : userRole === 'esad'
                  ? [
                      { icon: Activity, value: vehicle.odometer,                label: 'Odómetro',  isAlarm: false, colorClass: null as string | null },
                      { icon: Gauge,    value: vehicle.speed,                   label: 'Velocidad', isAlarm: false, colorClass: null as string | null },
                      { icon: Battery,  value: vehicle.fuel,                    label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                      { icon: Bell,     value: String(vehicle.alarmCount ?? 0), label: 'Alarmas',   isAlarm: true,  colorClass: null as string | null },
                    ]
                  : [
                      { icon: Activity, value: vehicle.odometer,  label: 'Odómetro',  isAlarm: false, colorClass: null as string | null },
                      { icon: Gauge,    value: vehicle.speed,     label: 'Velocidad', isAlarm: false, colorClass: null as string | null },
                      { icon: Compass,  value: vehicle.direction, label: 'Dirección', isAlarm: false, colorClass: null as string | null },
                      { icon: Battery,  value: vehicle.fuel,      label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                    ]
                ).map((stat, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1 flex-1 relative group cursor-default">
                      {stat.isAlarm ? (
                        <div className="relative">
                          <stat.icon className="w-3.5 h-3.5 text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
                          {Number(stat.value) > 0 && (
                            <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[8px] font-bold leading-none">
                              {Number(stat.value) > 99 ? '99+' : stat.value}
                            </span>
                          )}
                        </div>
                      ) : (
                        <stat.icon className={cn('w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity', stat.colorClass ?? 'text-brand')} strokeWidth={1.75} />
                      )}
                      <span className={cn('text-[11px] font-semibold tabular-nums',
                        stat.isAlarm && Number(stat.value) > 0 ? 'text-orange-500' : stat.colorClass ?? 'text-slate-700'
                      )}>
                        {stat.isAlarm ? (Number(stat.value) === 0 ? 'Sin eventos' : `${stat.value} eventos`) : stat.value}
                      </span>
                      <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                        <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{stat.label}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* GPS button */}
              {showGpsButton && (
                <div className="relative w-full border-t border-slate-100 pt-3 pb-3">
                  <button
                    ref={gpsButtonRef}
                    onClick={(e) => { e.stopPropagation(); setShowGpsPopover(!showGpsPopover); }}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 border rounded-lg transition-colors group',
                      showGpsPopover ? 'bg-brand/5 border-brand/30' : 'bg-slate-50 border-slate-200 hover:border-brand/30 hover:bg-brand/5'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-brand transition-colors">
                      <LocateFixed className="w-3.5 h-3.5 text-brand" />
                      <span className="text-[11px] font-semibold">Ver dispositivos GPS</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-brand transition-colors">
                      <span className="text-[11px] font-medium">
                        {visibleGpsCount === 1 ? '1 dispositivo' : `${visibleGpsCount} dispositivos`}
                      </span>
                      {showGpsPopover ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showGpsPopover && (
                      <GpsPopover
                        vehicle={vehicle}
                        triggerRef={gpsButtonRef}
                        onClose={() => setShowGpsPopover(false)}
                        userRole={userRole}
                        profile={profile}
                        onShowToast={onShowToast}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ZONA 3 — ACCIONES */}
              <div className="border-t border-slate-100 flex items-center justify-around pt-2 pb-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onFlyTo(); }}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/5 transition-colors group"
                >
                  <MapPin className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[10px] font-semibold">Ubicación</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/5 transition-colors"
                >
                  <Route className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[10px] font-semibold">Viajes</span>
                </button>
                {/* Posición 3 */}
                {userRole === 'operator' ? (
                  <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/5 transition-colors">
                    <FileText className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Detalle</span>
                  </button>
                ) : (
                  <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Lock className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Parqueo</span>
                  </button>
                )}
                {/* Posición 4 */}
                {userRole === 'operator' ? (
                  <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/5 transition-colors">
                    <Navigation className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Conducción</span>
                  </button>
                ) : userRole === 'client' ? (
                  <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Power className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Bloquear</span>
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setShowCommandModal(true); }} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/5 transition-colors">
                    <Zap className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Comando</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal historial de compartidos */}
      <Modal
        isOpen={showShareHistory}
        onClose={() => setShowShareHistory(false)}
        title={`Historial de compartidos - ${vehicle.plate}`}
        icon={Share2}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-gray-600">Gestiona los enlaces de rastreo activos e inactivos generados para esta unidad.</p>
          <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-gray-50 px-5 py-3 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div>Destinatario / Enlace</div>
              <div className="w-24 text-center">Estado</div>
              <div className="w-20 text-center">Acciones</div>
            </div>
            <div className="flex flex-col divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
              {[
                { name: 'Cliente Logística A', time: 'Creado hace 2 horas', status: 'Activo',    url: `https://c-locater.com/track/${vehicle.id}-A` },
                { name: 'Operaciones Centro', time: 'Venció ayer',          status: 'Expirado',  url: `https://c-locater.com/track/${vehicle.id}-B` },
                { name: 'Supervisor Ruta',    time: 'Cancelado hace 2 días', status: 'Cancelado', url: `https://c-locater.com/track/${vehicle.id}-C` },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-bold text-gray-900 truncate">{item.name}</span>
                    <span className="text-[11px] font-medium text-gray-400 mt-0.5">{item.time}</span>
                  </div>
                  <div className="w-24 flex justify-center">
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-md',
                      item.status === 'Activo' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      item.status === 'Expirado' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-20 flex justify-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-brand/10 hover:text-brand rounded-md transition-colors" title="Copiar enlace">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {item.status === 'Activo' && (
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" title="Cancelar compartido">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal comando */}
      <Modal
        isOpen={showCommandModal}
        onClose={() => setShowCommandModal(false)}
        title="Enviar comando"
        icon={Terminal}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCommandModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setShowCommandModal(false)}>Confirmar envío</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-gray-600">
            Estás a punto de enviar un comando operativo a la unidad <strong>{vehicle.plate} ({vehicle.name})</strong>.
            Asegúrate de que es la unidad correcta antes de proceder.
          </p>
        </div>
      </Modal>
    </div>
  );
}
