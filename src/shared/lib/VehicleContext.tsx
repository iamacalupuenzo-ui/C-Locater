import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FLEET_DATA } from './data';
import type { Vehicle } from './data';
import { VEHICLE_PATHS } from './paths';
import { fetchAllRoutes } from './routeFetcher';

const DIRECTIONS = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];

function bearing(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return DIRECTIONS[Math.round(brng / 45) % 8];
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  const h12 = String(h % 12 || 12).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${monthNum}/${yyyy} ${h12}:${mm}:${ss} ${ampm}`;
}

function buildAnimPath(vehicleId: string): [number, number][] | null {
  const path = VEHICLE_PATHS[vehicleId];
  if (!path || path.waypoints.length < 2) return null;
  return path.waypoints;
}

const VehicleContext = createContext<Vehicle[]>(FLEET_DATA);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const animPathRef = useRef<Record<string, [number, number][]>>({});
  const segIdxRef = useRef<Record<string, number>>({});
  const segProgressRef = useRef<Record<string, number>>({});
  const routeLoadedRef = useRef(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const init: Vehicle[] = [];
    for (const v of FLEET_DATA) {
      const animPath = buildAnimPath(v.id);
      if (animPath) {
        const progress = Math.random();
        segIdxRef.current[v.id] = 0;
        segProgressRef.current[v.id] = progress;
        animPathRef.current[v.id] = animPath;
      }
      init.push({ ...v });
    }
    return init;
  });

  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const animPaths: Record<string, [number, number][]> = {};
    Object.keys(VEHICLE_PATHS).forEach(id => {
      const p = buildAnimPath(id);
      if (p) animPaths[id] = p;
    });

    fetchAllRoutes(animPaths).then(resolvedRoutes => {
      let changed = false;
      Object.entries(resolvedRoutes).forEach(([id, route]) => {
        if (route.length >= 2) {
          animPathRef.current[id] = route;
          changed = true;
        }
      });
      if (changed) {
        routeLoadedRef.current = true;
        segIdxRef.current = {};
        segProgressRef.current = {};
        Object.keys(animPathRef.current).forEach(id => {
          segIdxRef.current[id] = 0;
          segProgressRef.current[id] = Math.random();
        });
        const now = new Date();
        setVehicles(prev =>
          prev.map(v => {
            const path = animPathRef.current[v.id];
            if (!path || path.length < 2) return v;
            const progress = Math.random();
            segIdxRef.current[v.id] = 0;
            segProgressRef.current[v.id] = progress;
            const p0 = path[0];
            const p1 = path[1];
            const lat = p0[0] + (p1[0] - p0[0]) * progress;
            const lng = p0[1] + (p1[1] - p0[1]) * progress;
            const dir = bearing(p0[0], p0[1], p1[0], p1[1]);
            const pathDef = VEHICLE_PATHS[v.id];
            const speedKmh = pathDef?.speed ?? 5;
            return {
              ...v,
              position: [lat, lng] as [number, number],
              speed: `${speedKmh} km/h`,
              direction: dir,
              coords: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              lastSeen: formatTime(now),
              status: 'active' as const,
            };
          })
        );
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setVehicles(prev =>
        prev.map(v => {
          const path = animPathRef.current[v.id];
          if (!path || path.length < 2) return v;
          const maxSegs = path.length - 1;
          let segIdx = segIdxRef.current[v.id] ?? 0;
          let segProgress = (segProgressRef.current[v.id] ?? 0) + 0.07;
          if (segProgress >= 1) {
            segProgress = 0;
            segIdx = (segIdx + 1) % maxSegs;
          }
          segIdxRef.current[v.id] = segIdx;
          segProgressRef.current[v.id] = segProgress;
          const p0 = path[segIdx];
          const p1 = path[segIdx + 1];
          const lat = p0[0] + (p1[0] - p0[0]) * segProgress;
          const lng = p0[1] + (p1[1] - p0[1]) * segProgress;
          const dir = bearing(p0[0], p0[1], p1[0], p1[1]);
          const pathDef = VEHICLE_PATHS[v.id];
          const speedKmh = pathDef?.speed ?? 5;
          return {
            ...v,
            position: [lat, lng] as [number, number],
            speed: `${speedKmh} km/h`,
            direction: dir,
            coords: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            lastSeen: formatTime(now),
            status: 'active' as const,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <VehicleContext.Provider value={vehicles}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles(): Vehicle[] {
  return useContext(VehicleContext);
}
