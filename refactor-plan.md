# Plan de Refactorización — Optimización de Performance

> **Proyecto:** C-Locater
> **Objetivo:** Eliminar lag causado por re-renders masivos en el ciclo de animación de vehículos
> **Causa raíz:** Cada 2 segundos se recrean 85 objetos `Vehicle`, se re-evalúan ~69,000 líneas de JSX y se destruyen/recrean 85 marcadores Leaflet
> **Estrategia:** React.memo + useCallback + useMemo sin cambiar lógica de negocio

---

## Arquitectura Actual (Componentes involucrados)

```
VehicleContext (useVehicles)
  │ cada 2s: nuevo array con 85 objetos nuevos
  │
  ├── FleetMap
  │   ├── MapInstanceCapture (linea 337)
  │   ├── BoundsUpdater     (linea 343)
  │   ├── GpsBoundsUpdater  (linea 357)
  │   └── MapEvents         (linea 1069)
  │   └── 85 markers Leaflet (linea 846-900)
  │
  ├── FloatingMonitor (C-Loc)
  │   └── VehicleAccordionItem × N (lineas 541, 565)
  │       ├── GpsBadgeTooltip
  │       ├── GpsPopover → GpsActionMenu
  │       └── SharePopover
  │
  └── FloatingStats (C-Go)
      └── VehicleAccordionItem × N (lineas 268, 286, 541, 563)
```

---

## Paso 1 — VehicleContext: evitar clonar vehículos estáticos

### Archivo: `src/shared/lib/VehicleContext.tsx`

### Ubicación exacta:
- Líneas 118–148: `setVehicles(prev => prev.map(v => { ... }))` en el `setInterval` cada 2s
- Líneas 86–110: mismo patrón en el bloque `fetchAllRoutes().then(...)`

### Cambio:
En el `.map()` del intervalo (línea 119), retornar `v` (misma referencia) para vehículos cuyo `animPathRef.current[v.id]` es `null` o tiene menos de 2 waypoints:

```typescript
// ANTES (linea 119-147):
prev.map(v => {
  const path = animPathRef.current[v.id];
  if (!path || path.length < 2) return v;        // ← YA ESTA BIEN
  ...
  return { ...v, position, speed, ... };           // ← SOLO ANIMADOS
})

// DESPUES: NO HAY CAMBIO — ya retorna v para no-animados
// SOLO HAY QUE VERIFICAR QUE LAS LINEAS 86-110 TAMBIEN LO HAGAN
```

Espera — leyendo el código actual, **ya retorna `v`** para no-animados en la línea 121 (`if (!path || path.length < 2) return v;`). El problema real es que **el estado `vehicles` cambia de referencia** (nuevo array cada vez), causando que **todo consumidor** de `useVehicles()` se re-renderice aunque los vehículos individuales tengan la misma referencia.

### Cambio real:
Agregar `React.memo` en los consumidores + estabilizar callbacks es la solución. Pero además, en el `fetchAllRoutes` callback (líneas 86–110) hay un `setVehicles` que **SÍ clona todos**:

```typescript
// LINEAS 86-110 — fetchAllRoutes callback
setVehicles(prev =>
  prev.map(v => {
    const path = animPathRef.current[v.id];
    if (!path || path.length < 2) return v;       // ← OK: misma ref
    // ... crea objeto nuevo SOLO para animados
    return { ...v, position, speed, direction, coords, lastSeen, status: 'active' };
  })
);
```

→ **OK**, ya está correcto. Solo 16 objetos nuevos.

### Riesgo: Mínimo (solo referencias, no lógica)

---

## Paso 2 — React.memo en VehicleAccordionItem

### Archivo: `src/shared/components/fleet/VehicleAccordionItem.tsx`

### Líneas: 1–813 (todo el archivo)

El componente exportado actualmente es `export function VehicleAccordionItem(...)`. Cambiar a:

```typescript
// Al final del archivo, convertir el export:
const VehicleAccordionItem = React.memo(function VehicleAccordionItem({ ... }: Props) {
  // ... todo el contenido existente ...
}, areVehiclePropsEqual);

function areVehiclePropsEqual(prev: Props, next: Props): boolean {
  // Comparación superficial de props simples
  if (prev.isExpanded !== next.isExpanded) return false;
  if (prev.isPinned !== next.isPinned) return false;
  if (prev.highlighted !== next.highlighted) return false;
  if (prev.userRole !== next.userRole) return false;
  if (prev.profile !== next.profile) return false;
  if (prev.isDark !== next.isDark) return false;

  // Comparación manual del vehicle (evita deep compare del objeto completo)
  const a = prev.vehicle;
  const b = next.vehicle;
  if (a.id !== b.id) return false;
  if (a.position[0] !== b.position[0] || a.position[1] !== b.position[1]) return false;
  if (a.speed !== b.speed) return false;
  if (a.status !== b.status) return false;
  if (a.lastSeen !== b.lastSeen) return false;

  // Campos que cambian con poca frecuencia
  if (a.alarmCount !== b.alarmCount) return false;
  if (a.odometer !== b.odometer) return false;

  return true;
}

export { VehicleAccordionItem };
```

### Props entrantes (confirmar desde FloatingMonitor líneas 541–553, 565–577):
```typescript
interface Props {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggle: () => void;
  onFlyTo: () => void;
  onShowToast: (msg: string) => void;
  userRole: UserRole;
  profile: 'c-go' | 'c-loc';
  isPinned?: boolean;
  onTogglePin?: () => void;
  isDark?: boolean;
  highlighted?: boolean;
}
```

### Riesgo: Bajo. `areVehiclePropsEqual` debe considerar TODOS los campos que afectan el render, pero no más.

---

## Paso 3 — useCallback en FloatingMonitor

### Archivo: `src/shared/components/FloatingMonitor.tsx`

### Callbacks a estabilizar (se pasan como props a VehicleAccordionItem):

| Callback | Línea actual | Dependencias |
|----------|-------------|--------------|
| `flyTo` | 111–112 | `[]` (usa window.dispatchEvent, no depende de props) |
| `handleToggleVehicle` | 126–134 | `[selectedVehicleId]` |
| `togglePin` | 136–142 | `[]` (usa setter funcional) |
| `setToastMessage` | (inline) | `[]` (es setState, React lo estabiliza) |

### Cambio:

```typescript
// LINEA 111-112 — flyTo no cambia nunca
const flyTo = useCallback((position: [number, number]) => {
  window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position } }));
}, []);

// LINEA 126-134 — handleToggleVehicle cambia solo cuando cambia selectedVehicleId
const handleToggleVehicle = useCallback((id: string) => {
  const expanding = selectedVehicleId !== id;
  setSelectedVehicleId(expanding ? id : null);
  if (expanding) {
    setTimeout(() => {
      document.getElementById(`vehicle-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }
}, [selectedVehicleId]);

// LINEA 136-142 — togglePin no depende de nada externo
const togglePin = useCallback((id: string) => {
  setPinnedVehicleIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}, []);
```

### Líneas donde se instancia VehicleAccordionItem (cambiar referencias):
- **Línea 544**: `onToggle={() => handleToggleVehicle(vehicle.id)}` → `onToggle={handleToggleVehicle}`
  - Requiere: cambiar firma de `handleToggleVehicle` o usar wrapper en el map.

  **Problema**: `handleToggleVehicle(vehicle.id)` necesita el `vehicle.id`, pero `VehicleAccordionItem.onToggle` es `() => void`.
  **Solución**: Dejar el wrapper inline `() => handleToggleVehicle(vehicle.id)`. React.memo igual funciona porque el wrapper se recrea en cada render... PERO eso rompe el memo.

  **Mejor solución**: Cambiar `onToggle` en `VehicleAccordionItem` para recibir `vehicleId?: string` y que el item mismo sepa su ID. O usar `data-vehicle-id` + event delegation.

  **Solución práctica**: El wrapper inline está bien porque `handleToggleVehicle` es estable gracias a `useCallback`. El wrapper `() => handleToggleVehicle(vehicle.id)` se recrea cada render pero React.memo solo compara `onToggle` referencialmente... 

  **Corrección**: Necesitamos que `onToggle` (que se pasa como prop) SEA estable. La forma es:
  ```typescript
  // FloatingMonitor: NO wrapper inline
  <VehicleAccordionItem
    vehicle={vehicle}
    onToggle={handleToggleVehicle}  // ← useCallback estable
    ...
  />
  ```
  Y en `VehicleAccordionItem`, `onToggle` recibe void y el componente determina qué vehículo es. Pero necesita saber su ID. Opciones:
  
  a) Pasar `vehicleId` como prop separada (además de `vehicle`)
  b) Hacer `onToggle` recibir `(vehicleId: string)` y que FloatingMonitor pase el ID

  **Opción recomendada (b)**: Cambiar `onToggle` en VehicleAccordionItem a `onToggle?: (vehicleId: string) => void`, y en el item: `onToggle?.(vehicle.id)`. En FloatingMonitor: `onToggle={handleToggleVehicle}`.

  **Misma lógica aplica para `onFlyTo`, `onTogglePin`**.

### Flujo completo de props estables:
```
FloatingMonitor
  onToggle={handleToggleVehicle}   ← useCallback([selectedVehicleId])
  onFlyTo={flyTo}                  ← useCallback([])
  onShowToast={setToastMessage}    ← estable por naturaleza (setState)
  onTogglePin={togglePin}          ← useCallback([])

  ↓
VehicleAccordionItem (React.memo, compara props)
  → onToggle cambia SOLO cuando cambia selectedVehicleId
  → onFlyTo NUNCA cambia
  → onShowToast NUNCA cambia
  → onTogglePin NUNCA cambia
  → vehicle cambia SOLO para los 16 animados (Paso 1)
  → resultado: 69 vehículos estáticos NO re-renderizan
```

### Riesgo: Medio. Hay que modificar la firma de `onToggle`/`onFlyTo`/`onTogglePin` en `VehicleAccordionItem` y en todas sus instancias (FloatingMonitor + FloatingStats + CardPreviewModule).

---

## Paso 4 — useMemo para listas filtradas en FloatingMonitor

### Archivo: `src/shared/components/FloatingMonitor.tsx`

### Ubicación exacta:
- Líneas 114–124: `filtered`, `pinned`, `unpinned`, `results`

### Cambio:

```typescript
// LINEAS 114-124 — reemplazar computaciones directas con useMemo
const filtered = useMemo(() => {
  return vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType   = typeFilter === 'all' || v.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
}, [vehicles, searchQuery, statusFilter, typeFilter]);

const pinned = useMemo(() => filtered.filter(v => pinnedVehicleIds.has(v.id)), [filtered, pinnedVehicleIds]);
const unpinned = useMemo(() => filtered.filter(v => !pinnedVehicleIds.has(v.id)), [filtered, pinnedVehicleIds]);
const results = useMemo(() => [...pinned, ...unpinned], [pinned, unpinned]);
```

### Dependencias:
- `filtered` depende de: `[vehicles, searchQuery, statusFilter, typeFilter]`
- `pinned`/`unpinned` dependen de: `[filtered, pinnedVehicleIds]`
- `results` depende de: `[pinned, unpinned]`

Gracias al Paso 1, `vehicles` cambia de referencia cada 2s pero solo 16 vehículos tienen datos distintos. `filtered` se recalcula pero el resultado es el mismo array de referencias (para los 69 estáticos). `pinned`/`unpinned` producen nuevas referencias de array pero `React.memo` en `VehicleAccordionItem` evita el re-render de items individuales.

### Riesgo: Bajo.

---

## Paso 5 — useMemo para clusters en FleetMap

### Archivo: `src/shared/components/FleetMap.tsx`

### Ubicación exacta:
- Línea 526–528: `gpsClusters` → `computeClusters(...)` en render body
- Línea 531: `vehicleClusters` → `computeVehicleClusters(...)` en render body
- Función `computeClusters`: líneas 108–136 (O(n²), ~3,600 cálculos con 85 vehículos)
- Función `computeVehicleClusters`: líneas 76–106 (O(n²))

### Cambio:

```typescript
// LINEA 526-528 — antes:
const gpsClusters: GpsCluster[] = activeGpsDevices.length >= 2
  ? computeClusters(gpsLayerVehicle?.gpsDevices ?? [])
  : [];

// despues:
const gpsClusters = useMemo(() => {
  return activeGpsDevices.length >= 2
    ? computeClusters(gpsLayerVehicle?.gpsDevices ?? [])
    : [];
}, [activeGpsDevices, gpsLayerVehicle?.gpsDevices]);
// Nota: gpsLayerVehicle?.gpsDevices también cambia de referencia cada tick...

// Mejor aún — depender solo de activeGpsDevices serializado:
const gpsClusters = useMemo(() => {
  if (activeGpsDevices.length < 2) return [];
  return computeClusters(gpsLayerVehicle?.gpsDevices ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [gpsLayerVehicleId, activeGpsDevices.length]);
// Cuando cambia el vehículo seleccionado, o cambia la cantidad de dispositivos
```

```typescript
// LINEA 531 — antes:
const vehicleClusters = computeVehicleClusters(mapZoom, vehicles);

// despues:
const vehicleClusters = useMemo(() => {
  return computeVehicleClusters(mapZoom, vehicles);
}, [mapZoom, vehicles]);
// vehicles cambia cada 2s... pero vehicleClusters es O(n²) igual...
// Para optimizar: si mapZoom >= VEHICLE_CLUSTER_ZOOM, siempre son clusters individuales
// y no hace falta el O(n²):
```

```typescript
const vehicleClusters = useMemo(() => {
  if (mapZoom >= VEHICLE_CLUSTER_ZOOM) {
    return vehicles.map(v => ({
      key: `vc-${v.id}`, center: v.position, vehicles: [v]
    }));
  }
  return computeVehicleClusters(mapZoom, vehicles);
}, [mapZoom, vehicles]);
```

Esto elimina el loop O(n²) cuando `mapZoom >= 14` (que es el caso más común en la vista de flota).

### Riesgo: Bajo. No cambia resultado, solo cachea.

---

## Paso 6 — React.memo en subcomponentes internos de FleetMap

### Archivo: `src/shared/components/FleetMap.tsx`

### Subcomponentes a envolver:

| Componente | Línea | Props | ¿Cambian? |
|-----------|-------|-------|-----------|
| `MapInstanceCapture` | 337 | `{ mapRef }` | mapRef es ref estable |
| `BoundsUpdater` | 343 | `{ points }` | Rara vez |
| `GpsBoundsUpdater` | 357 | `{ vehicleId, positions, profile, monitorW }` | Solo al seleccionar vehículo |
| `MapEvents` | 1069 | `{ onMapClick, isDrawingMode, onDeselect, onZoomChange }` | Rara vez |

### Cambio:

```typescript
// LINEA 337
const MapInstanceCapture = React.memo(function MapInstanceCapture({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  // ... contenido existente ...
});

// LINEA 343
const BoundsUpdater = React.memo(function BoundsUpdater({ points }: { points?: [number, number][] }) {
  // ... contenido existente ...
});

// LINEA 357
const GpsBoundsUpdater = React.memo(function GpsBoundsUpdater({ vehicleId, positions, profile = 'c-go', monitorW = 306 }: { ... }) {
  // ... contenido existente ...
});

// LINEA 1069
const MapEvents = React.memo(function MapEvents({ onMapClick, isDrawingMode, onDeselect, onZoomChange }: { ... }) {
  // ... contenido existente ...
});
```

Además, los `onDeselect`, `onZoomChange` que se pasan a `MapEvents` deben estar memoizados con `useCallback` en el padre (dentro de `FleetMap`). Localizar en FleetMap dónde se definen y agregar `useCallback`.

### Riesgo: Bajo.

---

## Paso 7 (Opcional) — React.memo en FloatingStats (C-Go)

### Archivo: `src/shared/components/FloatingStats.tsx`

### Ubicación:
- Líneas 268–280: `VehicleAccordionItem` en sección pinned
- Líneas 285–298: `VehicleAccordionItem` en sección unpinned

Mismo patrón que FloatingMonitor. Aplica `React.memo` y `useCallback` para `handleToggleVehicle`, `togglePin`, `flyTo`.

### Riesgo: Bajo.

---

## Resumen de Archivos a Modificar

| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| 1 | `src/shared/components/fleet/VehicleAccordionItem.tsx` | React.memo + comparador | 1, final archivo |
| 2 | `src/shared/components/FloatingMonitor.tsx` | useCallback callbacks + useMemo listas + firma onToggle/onFlyTo | 111–142, 541–577 |
| 3 | `src/shared/components/FleetMap.tsx` | useMemo clusters + React.memo subcomponentes + useCallback | 526–531, 337, 343, 357, 1069 |
| 4 | `src/shared/components/FloatingStats.tsx` | React.memo + useCallback | 268–298 |

## Archivos que NO se modifican

| Archivo | Razón |
|---------|-------|
| `src/shared/lib/VehicleContext.tsx` | Ya retorna misma referencia para vehículos no-animados |
| `src/App.tsx` | No es causa del problema |
| `src/c-go/` | No afecta performance |
| `src/c-loc/` | No afecta performance |
| `src/shared/components/vehicle-detail/` | No afecta performance |
| `src/shared/components/AIAssistant.tsx` | No afecta performance |
| `src/shared/components/fleet/GpsPopover.tsx` | Solo se renderiza al abrir |
| `src/shared/components/fleet/GpsActionMenu.tsx` | Solo se renderiza al abrir |
| `src/shared/components/fleet/GpsBadgeTooltip.tsx` | Liviano |
| `src/shared/components/fleet/SharePopover.tsx` | Solo se renderiza al abrir |
| `definicion.md` | No tocar lógica de UX |

## Orden de Implementación

```
Paso 3 (useCallback callbacks) ──────────┐
                                         │ ← Necesario ANTES del React.memo
Paso 2 (React.memo VehicleAccordionItem)─┘

Paso 4 (useMemo listas FloatingMonitor)

Paso 5 (useMemo clusters FleetMap)

Paso 6 (React.memo subcomponentes FleetMap)

Paso 7 (React.memo + useCallback FloatingStats) — opcional
```

El orden importa: **Paso 3 antes que Paso 2** porque si ponemos `React.memo` sin `useCallback`, los callbacks inline rompen el memo.
