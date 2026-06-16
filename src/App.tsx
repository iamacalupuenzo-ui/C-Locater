import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Car, Clock, Star, CreditCard } from 'lucide-react';
import { FLEET_DATA } from './shared/lib/data';
import { SidebarCLoc } from './c-loc/components/Sidebar';
import { FleetMap } from './shared/components/FleetMap';
import { FloatingMonitor } from './shared/components/FloatingMonitor';
import { CaminosModule } from './shared/components/CaminosModule';
import { PeajesPanel } from './shared/components/PeajesPanel';
import { VehicleTabBar } from './shared/components/VehicleTabBar';
import { VehicleCaptureView, VehicleTripView } from './shared/components/vehicle-detail';
import { StatCard } from './shared/components/fleet/StatCard';
import type { Vehicle } from './shared/lib/data';
import type { UserRole } from './shared/lib/utils';
import { cn } from './shared/lib/utils';
import { VehicleProvider } from './shared/lib/VehicleContext';
import { ThemeContext } from './shared/lib/ThemeContext';

const CURRENT_USER = { name: 'Daniel Salas', initials: 'DS' };

export default function App() {
  const [activeView, setActiveView] = useState('explore');
  const [userRole, setUserRole] = useState<UserRole>('esad');
  const [showMonitor, setShowMonitor] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [monitorSide, setMonitorSide] = useState<'left' | 'right'>('left');
  const [monitorW, setMonitorW] = useState(306);
  const [showStats, setShowStats] = useState(true);
  const [showPeajesPanel, setShowPeajesPanel] = useState(false);
  const [capturedVehicles, setCapturedVehicles] = useState<Vehicle[]>([]);
  const [activeCaptureId, setActiveCaptureId] = useState<string | null>(null);
  const [tripVehicles, setTripVehicles] = useState<Vehicle[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [mapMoving, setMapMoving] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent<{ id: string | null }>).detail;
      setSelectedVehicleId(id ?? null);
    };
    window.addEventListener('vehicleSelected', handler);
    return () => window.removeEventListener('vehicleSelected', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const vehicle = (e as CustomEvent<Vehicle>).detail;
      if (!vehicle) return;
      setCapturedVehicles(prev =>
        prev.find(v => v.id === vehicle.id) ? prev : [...prev, vehicle]
      );
      setActiveCaptureId(vehicle.id);
    };
    window.addEventListener('captureVehicle', handler);
    return () => window.removeEventListener('captureVehicle', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const vehicle = (e as CustomEvent<Vehicle>).detail;
      if (!vehicle) return;
      setTripVehicles(prev =>
        prev.find(v => v.id === vehicle.id) ? prev : [...prev, vehicle]
      );
      setActiveTripId(vehicle.id);
    };
    window.addEventListener('tripVehicle', handler);
    return () => window.removeEventListener('tripVehicle', handler);
  }, []);

  const prevTripRef = useRef(activeTripId);
  useEffect(() => {
    if (activeTripId) {
      window.dispatchEvent(new CustomEvent('collapseSidebar'));
    } else if (prevTripRef.current) {
      window.dispatchEvent(new CustomEvent('restoreSidebar'));
    }
    prevTripRef.current = activeTripId;
  }, [activeTripId]);

  useEffect(() => {
    const onStart = () => setMapMoving(true);
    const onEnd   = () => setMapMoving(false);
    window.addEventListener('mapMoveStart', onStart);
    window.addEventListener('mapMoveEnd',   onEnd);
    return () => {
      window.removeEventListener('mapMoveStart', onStart);
      window.removeEventListener('mapMoveEnd',   onEnd);
    };
  }, []);
  const clientMetrics = useMemo(() => {
    if (!selectedVehicleId) return {
      distancia: '148,000 km', viajes: '3,842', tiempo: '2,640h', calificacion: '4.87', peajes: 'S/ 12,480.00',
    };
    const v = FLEET_DATA.find(x => x.id === selectedVehicleId);
    if (!v) return { distancia: '148,000 km', viajes: '3,842', tiempo: '2,640h', calificacion: '4.87', peajes: 'S/ 12,480.00' };
    const seed = parseInt(selectedVehicleId, 10) || 1;
    const odoNum = parseInt(v.odometer.replace(/[^0-9]/g, ''), 10) || seed * 300;
    return {
      distancia: v.odometer.replace(' KM', ' km').replace(' km', ' km'),
      viajes: String(seed * 7 + 23),
      tiempo: `${Math.floor(odoNum / 480)}h ${((odoNum % 480) / 8) | 0}m`,
      calificacion: (4.5 + (seed % 5) * 0.1).toFixed(2),
      peajes: `S/ ${(seed * 28.5 + 85).toFixed(2)}`,
    };
  }, [selectedVehicleId]);
  const [showMetricsTooltip, setShowMetricsTooltip] = useState(false);
  const metricsButtonRef = useRef<HTMLButtonElement>(null);
  const [metricsTooltipPos, setMetricsTooltipPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    if (showMetricsTooltip && metricsButtonRef.current) {
      const r = metricsButtonRef.current.getBoundingClientRect();
      setMetricsTooltipPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    } else {
      setMetricsTooltipPos(null);
    }
  }, [showMetricsTooltip]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setShowMonitor(prev => {
            if (!prev) {
              setTimeout(() => window.dispatchEvent(new CustomEvent('focusMonitorSearch')), 200);
              return true;
            }
            window.dispatchEvent(new CustomEvent('focusMonitorSearch'));
            return prev;
          });
        }
        if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setShowStats(v => !v); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleMonitorSide = useCallback((s: 'left' | 'right', w: number) => {
    setMonitorSide(s);
    setMonitorW(w);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <VehicleProvider>
        <div className={cn('flex w-full h-screen overflow-hidden font-sans', isDark ? 'bg-zinc-950' : 'bg-neutral-50')}>
          <SidebarCLoc
            activeView={activeView}
            onViewChange={setActiveView}
            userRole={userRole}
            isDark={isDark}
            onToggleDark={() => setIsDark(d => !d)}
            user={CURRENT_USER}
            onLogout={() => {}}
            onRoleChange={setUserRole}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 overflow-hidden min-h-0">
              {/* Vista de viajes — reemplaza todo */}
              {activeTripId ? (
                (() => {
                  const vehicle = tripVehicles.find(v => v.id === activeTripId);
                  return vehicle ? (
                    <VehicleTripView
                      vehicle={vehicle}
                      onBack={() => setActiveTripId(null)}
                      isDark={isDark}
                    />
                  ) : null;
                })()
              ) : activeCaptureId ? (
                (() => {
                  const vehicle = capturedVehicles.find(v => v.id === activeCaptureId);
                  return vehicle ? (
                    <VehicleCaptureView
                      vehicle={vehicle}
                      onBack={() => setActiveCaptureId(null)}
                      isDark={isDark}
                    />
                  ) : null;
                })()
              ) : (
                <>
                  {activeView === 'explore' && (
                    <div className="relative w-full h-full">
                      <FleetMap monitorSide={monitorSide} monitorW={monitorW} />
                      <FloatingMonitor
                        isOpen={showMonitor}
                        onToggle={() => setShowMonitor(v => !v)}
                        onClose={() => setShowMonitor(false)}
                        userRole={userRole}
                        isDark={isDark}
                        onSideChange={handleMonitorSide}
                      />
                      {userRole === 'client' && (
                        <>
                          <div
                            className="absolute top-4 z-10 flex items-center pointer-events-none"
                            style={{
                              ...(monitorSide === 'left'
                                ? { left: monitorW + 16 + 8, right: 56 }
                                : { left: 56, right: monitorW + 16 + 8 }),
                              opacity: mapMoving ? 0 : 1,
                              transition: 'opacity 0.15s ease',
                            }}
                          >
                            <AnimatePresence initial={false}>
                              {showStats && (
                                <motion.div
                                  initial={{ opacity: 0, x: monitorSide === 'left' ? -10 : 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: monitorSide === 'left' ? -10 : 10 }}
                                  transition={{ duration: 0.18, ease: 'easeOut' }}
                                  className="flex gap-1 flex-1 min-w-0"
                                >
                                  <StatCard icon={Activity}  value={clientMetrics.distancia}   label="Distancia"    iconColor="text-[#34C759]"  iconBg="bg-[#34C759]/10"  delay={0} compact />
                                  <StatCard icon={Car}        value={clientMetrics.viajes}       label="Viajes"       iconColor="text-blue-600"   iconBg="bg-blue-600/10"   delay={0} compact />
                                  <StatCard icon={Clock}      value={clientMetrics.tiempo}       label="Tiempo"       iconColor="text-orange-500" iconBg="bg-orange-500/10" delay={0} compact />
                                  <StatCard icon={Star}       value={clientMetrics.calificacion} label="Calificación" iconColor="text-amber-500"  iconBg="bg-amber-500/10"  delay={0} compact />
                                  <StatCard icon={CreditCard} value={clientMetrics.peajes}       label="Peajes"       iconColor="text-purple-500" iconBg="bg-purple-500/10" delay={0} compact onClick={() => setShowPeajesPanel(p => !p)} active={showPeajesPanel} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            ref={metricsButtonRef}
                            onClick={() => setShowStats(s => !s)}
                            onMouseEnter={() => setShowMetricsTooltip(true)}
                            onMouseLeave={() => setShowMetricsTooltip(false)}
                            className="absolute top-4 z-10 w-8 h-8 rounded-lg backdrop-blur-2xl shadow-[0_2px_10px_rgba(0,0,0,0.18)] flex items-center justify-center transition-colors hover:bg-gray-800"
                            style={{ ...(monitorSide === 'right' ? { left: 16 } : { right: 16 }), background: 'rgba(17,24,39,0.88)', border: '1px solid rgba(255,255,255,0.1)', opacity: mapMoving ? 0 : 1, transition: 'opacity 0.15s ease' }}
                          >
                            <div className="flex items-end gap-[2.5px] h-3.5 w-[13px]">
                              {[{ h: '55%', delay: 0 }, { h: '100%', delay: 0.16 }, { h: '72%', delay: 0.32 }].map((bar, i) => (
                                <motion.div
                                  key={i}
                                  className="flex-1 rounded-sm bg-white"
                                  animate={{ scaleY: [0.35, 1, 0.35] }}
                                  transition={{ repeat: Infinity, duration: 1.5, delay: bar.delay, ease: 'easeInOut' }}
                                  style={{ height: bar.h, originY: 1 }}
                                />
                              ))}
                            </div>
                          </button>

                          {metricsTooltipPos && createPortal(
                            <div style={{ top: metricsTooltipPos.top, left: metricsTooltipPos.left }} className="fixed -translate-x-1/2 pointer-events-none z-[10000]">
                              <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg relative">
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-[4px] border-transparent border-b-slate-800" />
                                {showStats ? 'Ocultar métricas' : 'Ver métricas'}
                                <span className="flex items-center gap-0.5 ml-1">
                                  {['Ctrl', 'M'].map(k => (
                                    <kbd key={k} className="inline-flex items-center justify-center min-w-[16px] h-[14px] px-1 rounded text-[8px] font-semibold font-mono leading-none border bg-white/10 border-white/20 text-white/60">{k}</kbd>
                                  ))}
                                </span>
                              </div>
                            </div>,
                            document.body
                          )}

                          <AnimatePresence>
                            {showPeajesPanel && (
                              <PeajesPanel
                                peajes={clientMetrics.peajes}
                                viajes={clientMetrics.viajes}
                                mapMoving={mapMoving}
                                onClose={() => setShowPeajesPanel(false)}
                              />
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  )}
                  {activeView === 'caminos' && <CaminosModule />}
                </>
              )}
            </main>
            <VehicleTabBar
              tabs={tripVehicles}
              activeId={activeTripId}
              onSelect={(id) => setActiveTripId(id)}
              onClose={(id) => {
                setTripVehicles(prev => {
                  const next = prev.filter(v => v.id !== id);
                  if (next.length === 0) setActiveTripId(null);
                  else if (activeTripId === id) setActiveTripId(next[next.length - 1].id);
                  return next;
                });
              }}
              isDark={isDark}
              label="Viajes"
            />
            <VehicleTabBar
              tabs={capturedVehicles}
              activeId={activeCaptureId}
              onSelect={(id) => setActiveCaptureId(id)}
              onClose={(id) => {
                setCapturedVehicles(prev => {
                  const next = prev.filter(v => v.id !== id);
                  if (next.length === 0) setActiveCaptureId(null);
                  else if (activeCaptureId === id) setActiveCaptureId(next[next.length - 1].id);
                  return next;
                });
              }}
              isDark={isDark}
              label="Captura"
            />
          </div>
        </div>
      </VehicleProvider>
    </ThemeContext.Provider>
  );
}
