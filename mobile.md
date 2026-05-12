# Módulo Mobile — C-Locater

> Análisis del prototipo CO-Producto-01 (GPS Flota) y plan de integración como perfil mobile dentro de C-Locater.
> Actualizado: 2026-05-08 (Sesión 4)

---

## 1. Visión General

El prototipo **CO-Producto-01 (GPS Flota)** es una PWA mobile-first que simula un iPhone (393×852px) con monitoreo de flota en tiempo real. Está construido en Vanilla JavaScript + Leaflet + Vite 5.

El objetivo es **reconstruir toda su funcionalidad dentro de C-Locater** como un nuevo perfil `'mobile'`, reutilizando `shared/` y siguiendo la misma arquitectura de componentes React + TypeScript + TailwindCSS.

---

## 2. Comparativa de Modelos de Datos

### Vehicle

| Campo | CO-Producto-01 | C-Locater (FLEET_DATA) | ¿Unificar? |
|-------|----------------|------------------------|------------|
| `id` | `string` | `string` | ✅ Compatible |
| `name` / `alias` | `alias: string` | `name: string` (alias) | ✅ Son lo mismo |
| `plate` | `plate: string` | `plate: string` | ✅ Compatible |
| `type` | — (sedan, suv, pickup, hatchback) | `type: string` (motorcycle, car, truck, bus, machinery) | ⚠️ Categorías distintas |
| `status` | `on` / `idle` / `off` | `active` / `stopped` / `offline` | 🔴 Mapear |
| `speed` | `speed: string` (`'45 km/h'`) | `speed: string` | ✅ Compatible |
| `lat` / `lng` / `position` | `lat, lng` separados | `position: [number, number]` | ✅ Compatible |
| `address` | `address: string` | `address: string` | ✅ Compatible |
| `updatedAt` | `updatedAt: string` (relativo) | `lastSeen: string` (absoluto) | ⚠️ Formato distinto |
| `area` | `area: string` (San Isidro, etc.) | ❌ No existe | ➕ Agregar |
| `heading` | `heading: number` (rumbo grados) | ❌ No existe | ➕ Agregar |
| `trips` | `trips: number` | ❌ No existe | ➕ Agregar |
| `bat` | `bat: string` (`'100%'`) | `fuel: string` | ⚠️ Estandarizar |
| `direction` | ❌ No | ✅ `direction: string` | Solo mobile? |
| `odometer` | ❌ No | ✅ `odometer: string` | Solo mobile? |
| `owner` | ❌ No | ✅ `owner: string` | Solo mobile? |
| `alarmCount` | ❌ No | ✅ `alarmCount?: number` | Solo mobile? |
| `gpsCount` | ❌ (derivado de `gpsDevices.length`) | ✅ `gpsCount?: number` | ✅ Derivar siempre |

### GpsDevice

| Campo | CO-Producto-01 | C-Locater | ¿Unificar? |
|-------|----------------|-----------|------------|
| `id` | `id: string` | — (cada device en array) | ✅ Compatible |
| `name` | `name: string` (`'GPS-001'`) | — (tipo + identifier) | ⚠️ Distinto |
| `type` | `'OBD'` / `'Satelital'` | `'basico'` / `'flotas'` / `'contingencia'` | 🔴 Mapear |
| `isPrimary` | `isPrimary: boolean` | ❌ No existe | ➕ Agregar |
| `status` | `on` / `off` | `reporting` / `inactive` | 🔴 Mapear |
| `signal` | `signal: number` (0-100) | ❌ No existe | ➕ Agregar |
| `speed` | `speed: string` | `speed: string` | ✅ Compatible |
| `bat` | `bat: string` | `fuel: string` | ⚠️ Estandarizar |
| `updatedAt` | `updatedAt: string` (relativo) | `lastSeen: string` (absoluto) | ⚠️ Formato |
| `lat` / `lng` | `lat, lng` separados | ❌ No existe en GPS | ➕ Agregar |
| `address` | `address: string` | ❌ No existe en GPS | ➕ Agregar |

### Estados de vehículo — Mapeo

| CO-Producto-01 | C-Locater (interno) | C-Go label | Mobile label propuesto |
|----------------|---------------------|------------|----------------------|
| `on` (Encendido) | `active` | Ignition ON | Encendido |
| `idle` (Detenido) | `stopped` | Ignition OFF | Detenido |
| `off` (Apagado) | `offline` | Disconnected | Apagado |

---

## 3. Funcionalidades del Prototipo Mobile

### 3.1 Mapa (map.js)
- Leaflet con CartoDB Voyager, centro Lima `[-12.06, -77.05]`, zoom 12
- Marcadores personalizados SVG inline con ícono de vehículo + indicador de dirección (heading)
- Marcador seleccionado con estilo highlight
- **Clustering**: Agrupa marcadores cercanos en pantalla (< 64px), al hacer click hace zoom+2
- **Off-screen indicators**: Flechas en bordes del mapa que apuntan a vehículos fuera del viewport
- **Círculo de parqueo seguro**: Preview al configurar, persistente al activar
- Badge "P" en marcador cuando parqueo seguro está activo
- Eventos: `vehicle:selected`, `vehicle:navigate`, `park:preview`, `park:activated`

**En C-Locater:** FleetMap.js ya tiene Leaflet + CartoDB + marcadores. Faltan clustering, off-screen indicators, y círculos de parqueo. Todo esto puede agregarse en un FleetMapMobile mejorado o como extensiones condicionales.

### 3.2 Bottom Sheet (bottom-sheet.js)
- 3 estados: **mini** (176px), **half** (320px), **expanded** (full screen)
- Drag gesture para transicionar entre estados + tap en handle para avanzar
- Estados: mini = resumen vehículo, half = lista vehículos, expanded = detalle completo
- CSS nativo: `transition: transform 0.3s cubic-bezier(...)`

**En C-Locater:** No existe patrón bottom sheet. Habrá que crearlo como componente React con Framer Motion (`motion.div` con `drag="y"` y `dragConstraints`).

### 3.3 Vehicle Cards (vehicle-card.js)
- Tarjeta compacta con: ícono SVG por tipo vehículo + badge de estado (encendido/detenido/apagado)
- Placa (o alias si existe), última actualización, área/ubicación
- Badge de conteo GPS si tiene 2+ dispositivos
- Botón de parqueo seguro (escudo) si el vehículo está detenido o apagado
- Click en card → selecciona vehículo

**En C-Locater:** El `VehicleAccordionItem` es más complejo (expandible con métricas). Para mobile se necesita una versión compacta tipo card list.

### 3.4 Vehicle Detail (vehicle-detail.js)
- Header con: ícono, alias + placa, botón editar alias
- Status pill (Encendido/Detenido/Apagado)
- Info strip: tiempo real, velocidad, batería
- Dirección/ubicación con botón "Guardar"
- **Acciones rápidas**: Parqueo seguro, Compartir, Viajes, Conducción, Alertas (botones circulares)
- **Sección GPS**: Lista de dispositivos con estrella (principal/secundario), métricas inline, botón "Hacer principal"
- **Swipe horizontal** entre vehículos (touch + mouse)
- **Flechas de navegación** laterales (prev/next vehículo)
- **Edición de alias**: Modal deslizante con teclado simulado
- **Parqueo seguro**: Configuración con pickers (duración, radio), preview en mapa, activación/desactivación con overlay de éxito
- Validación: batería ≥ 20% para activar parqueo

**En C-Locater:** Equivalente parcial a `FloatingStats` expandido + `GpsPopover`. Falta: acciones rápidas, parqueo seguro, edición alias, swipe.

### 3.5 Bottom Navigation (bottom-nav.js)
- 4 tabs: Mapa, Indicadores, Viajes, Perfil
- Solo Mapa funcional — otros muestran toast "próximamente"
- Iconos SVG inline, active state con scale(1.1)

**En C-Locater:** No existe navegación inferior. Se puede mapear a vistas del sidebar o crear bottom nav específica para mobile.

### 3.6 Search (search.js)
- Búsqueda por placa, área, label
- Filtrado en tiempo real sobre la lista
- Al abrir, expande sheet a half

**En C-Locater:** `SearchInput.tsx` existe en shared. Reutilizable.

### 3.7 Toast (toast.js)
- Notificaciones top-center, auto-dismiss (2600ms)
- Slide down animation

**En C-Locater:** `Toast.tsx` existe en shared. Compatible.

### 3.8 Clock (clock.js)
- Reloj en status bar, formato HH:MM, actualiza cada 15s

**En C-Locater:** No existe — agregar para mobile.

### 3.9 Device Shell (device.css + zoom.js)
- Simulación de iPhone: Dynamic Island, status bar, botones físicos
- Controles de zoom (+/−) con presets de dispositivos (SE, 14, Pro, Max)
- Toggle responsive: vista dispositivo ↔ pantalla completa

**En C-Locater:** Para desarrollo, se puede usar un wrapper `DeviceShell` que simule el iPhone. En producción real, se despliega como PWA nativa sin shell.

### 3.10 Parqueo Seguro — Flujo Completo

```
1. Usuario toca botón escudo en card o detalle
2. Sheet se expande con panel de configuración:
   - Picker de duración (horas: 0-23, minutos: 0-55 step 5)
   - Toggle "Sin límite"
   - Picker de radio (100m - 2000m)
3. Mapa muestra círculo de preview con radio seleccionado
4. Al cambiar radio, zoom se ajusta para ver círculo completo
5. Usuario toca "Activar parqueo seguro"
6. Validación: batería ≥ 20%
7. Overlay de éxito con candado animado
8. Marcador del vehículo muestra badge "P"
9. En detalle: sección "Parqueo seguro activo" con rango, duración, tiempo restante
10. Botones: Editar configuración, Eliminar (con confirmación)
```

---

## 4. Propuesta de Arquitectura en C-Locater

### 4.1 Nuevo perfil `'mobile'`

```
src/
├── mobile/                              # Nuevo — componentes exclusivos mobile
│   └── components/
│       ├── MobileLayout.tsx              # Layout: mapa full + bottom sheet + bottom nav
│       ├── BottomSheet.tsx               # Sheet deslizable 3 estados (Framer Motion)
│       ├── BottomNav.tsx                 # Navegación inferior estilo iOS
│       ├── VehicleCardList.tsx           # Lista de tarjetas compactas
│       ├── VehicleCard.tsx              # Tarjeta individual
│       ├── VehicleDetailSheet.tsx        # Detalle expandido con acciones
│       ├── DeviceShell.tsx              # Wrapper iPhone simulado (dev only)
│       └── ...
├── shared/
│   ├── components/
│   │   ├── FleetMap.tsx                  # Mejorar: agregar clustering, offscreen, park circles
│   │   ├── FloatingStats.tsx             # No tocar — desktop only
│   │   ├── ParkingModule.tsx            # ✨ Nuevo — lógica de parqueo seguro
│   │   └── ui/
│   │       ├── Toast.tsx                # Ya existe
│   │       └── SearchInput.tsx          # Ya existe
│   └── lib/
│       ├── data.ts                      # Mejorar: normalizar modelo vehículo + GPS
│       └── utils.ts                     # Agregar: formateo relativo (updatedAt), batteryColor
```

### 4.2 App.tsx — Nueva rama mobile

```typescript
const [profile, setProfile] = useState<AppProfile>('c-go');
// AppProfile se extiende: 'c-go' | 'c-loc' | 'mobile'

// En el render:
{profile === 'mobile' && <MobileLayout ... />}
```

### 4.3 UserMenu — Nueva opción mobile

```typescript
const PROFILES = [
  { id: 'c-go',    label: 'C-Go'    },
  { id: 'c-loc',   label: 'C-Loc'   },
  { id: 'mobile',  label: 'Mobile'  },  // ✨ Nueva
];
```

---

## 5. Funcionalidades Mobile vs Desktop

| Funcionalidad | Mobile (nuevo) | C-Go | C-Loc | ¿Comparten? |
|---------------|----------------|------|-------|-------------|
| Mapa Leaflet | ✅ FleetMap mejorado | ✅ FleetMap | ✅ FleetMap | 🔄 Misma base + extensiones mobile |
| Marcadores personalizados | ✅ Por tipo + heading | ✅ Por tipo | ✅ Por tipo | 🔄 Misma base |
| Clustering | ✅ | ❌ | ❌ | ✨ Nuevo en FleetMap |
| Off-screen indicators | ✅ | ❌ | ❌ | ✨ Nuevo |
| Bottom sheet (3 estados) | ✅ | ❌ | ❌ | ✨ Nuevo |
| Vehicle card compacta | ✅ | ❌ (accordion) | ❌ (accordion) | ✨ Nuevo |
| Vehicle detail expandido | ✅ | ✅ FloatingStats | ✅ FloatingStats | 🔄 Distinto layout |
| Acciones rápidas (parqueo, etc.) | ✅ | ❌ | ❌ | ✨ Nuevo |
| Parqueo seguro completo | ✅ | ❌ | ❌ | ✨ Nuevo |
| Swipe entre vehículos | ✅ | ❌ | ❌ | ✨ Nuevo |
| Edición de alias | ✅ | ❌ | ❌ | ✨ Nuevo |
| Búsqueda en lista | ✅ | ✅ SearchInput | ✅ SearchInput | ✅ Mismo componente |
| Multicheck GPS / Hacer principal | ✅ | ❌ | ❌ | ✨ Nuevo |
| Bottom navigation | ✅ | ❌ (sidebar) | ❌ (sidebar) | ✨ Nuevo |
| Toast notifications | ✅ | ✅ Toast | ✅ Toast | ✅ Mismo componente |
| Roles (admin/concesionaria/cliente) | ❌ (sin roles) | ✅ | ✅ | ❌ Sin roles en mobile |
| StatCards | ❌ | ✅ | ✅ | Solo desktop |
| Alarmas (admin) | ❌ | ✅ | ✅ | Solo desktop |
| Odómetro / Dirección | ❌ | ✅ | ✅ | Solo desktop |
| GPS Popover con acciones | ❌ (integrado en detalle) | ✅ | ✅ | Mobile lo integra en detail sheet |
| Device shell (simulador iPhone) | ✅ (dev) | ❌ | ❌ | Solo dev mobile |

---

## 6. Flujo de Pantallas Mobile

```
┌──────────────────────────────────────────────┐
│  Status Bar (reloj, batería, señal)          │
├──────────────────────────────────────────────┤
│                                              │
│              MAPA (Leaflet)                   │
│  · Marcadores con heading + estado           │
│  · Clustering automático                     │
│  · Off-screen indicators (flechas)           │
│  · Círculo de parqueo (si activo)            │
│  · Herramientas: Street View, Centrar        │
│                                              │
├──────────────────────────────────────────────┤
│  ┌──────── BOTTOM SHEET ────────┐            │
│  │                               │            │
│  │  [handle ≡]                   │            │
│  │                               │            │
│  │  MINI (176px):                │            │
│  │  Vehículo seleccionado        │            │
│  │  · Icono + alias + placa      │            │
│  │  · Velocidad · Batería        │            │
│  │  · Última actualización       │            │
│  │                               │            │
│  │  ─ o ─                        │            │
│  │                               │            │
│  │  HALF (320px):                │            │
│  │  Lista de vehículos           │            │
│  │  · Search bar                 │            │
│  │  · Vehicle cards (scroll)     │            │
│  │                               │            │
│  │  ─ o ─                        │            │
│  │                               │            │
│  │  EXPANDED (full):             │            │
│  │  Detalle vehículo completo    │            │
│  │  · Header + info strip        │            │
│  │  · Acciones rápidas           │            │
│  │  · Parqueo seguro             │            │
│  │  · Dispositivos GPS           │            │
│  │                               │            │
│  └───────────────────────────────┘            │
│                                              │
├──────────────────────────────────────────────┤
│  [Mapa] [Indicadores] [Viajes] [Perfil]      │  ← Bottom Nav
└──────────────────────────────────────────────┘
```

---

## 7. Modelo de Datos Unificado Propuesto

### Vehicle (extensión de FLEET_DATA)

```typescript
type VehicleStatus = 'active' | 'stopped' | 'offline';
// Mapeo mobile: active → 'Encendido', stopped → 'Detenido', offline → 'Apagado'

type Vehicle = {
  id: string;
  name: string;           // Alias del conductor
  plate: string;
  type: VehicleType;      // 'motorcycle' | 'car' | 'truck' | 'bus' | 'machinery'
  status: VehicleStatus;
  position: [number, number];
  speed: string;
  address: string;
  coords: string;
  fuel: string;           // Batería / combustible (%)
  lastSeen: string;       // Fecha absoluta

  // Exclusivo mobile (agregar a FLEET_DATA)
  heading?: number;       // Rumbo en grados
  trips?: number;         // Conteo de viajes
  area?: string;          // Grupo/área geográfica

  // Ya existe en C-Locater
  direction?: string;
  odometer?: string;
  owner?: string;
  alarmCount?: number;
  gpsCount?: number;
  gpsDevices?: GpsDevice[];
};
```

### GpsDevice (unificado)

```typescript
type GpsDevice = {
  id: string;
  name: string;           // 'GPS-001'
  type: GpsServiceType;   // 'basico' | 'flotas' | 'contingencia' (C-Locater)
  isPrimary: boolean;     // ✨ Nuevo
  reportStatus: 'reporting' | 'inactive' | 'off';  // Extendido
  signal: number;         // ✨ Nuevo (0-100)
  ignition: 'on' | 'off';
  speed: string;
  fuel: string;
  alarmCount: number;
  lastSeen: string;
  lat?: number;           // ✨ Nuevo (posición propia del GPS)
  lng?: number;           // ✨ Nuevo
  address?: string;       // ✨ Nuevo
};
```

---

## 8. Componentes a Crear / Modificar

### 8.1 Nuevos componentes en `src/mobile/components/`

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `MobileLayout` | `MobileLayout.tsx` | Layout principal: mapa full + bottom sheet + bottom nav |
| `BottomSheet` | `BottomSheet.tsx` | Panel deslizable 3 estados con Framer Motion drag |
| `BottomNav` | `BottomNav.tsx` | Navegación inferior 4 tabs (Mapa, Indicadores, Viajes, Perfil) |
| `VehicleCard` | `VehicleCard.tsx` | Tarjeta compacta de vehículo |
| `VehicleCardList` | `VehicleCardList.tsx` | Lista scrollable de tarjetas + search |
| `VehicleDetailSheet` | `VehicleDetailSheet.tsx` | Detalle expandido con acciones rápidas |
| `VehicleDetailHeader` | `VehicleDetailHeader.tsx` | Header: icono, alias, placa, edit, status pill |
| `QuickActions` | `QuickActions.tsx` | Botones circulares: Parqueo, Compartir, Viajes, Conducción, Alertas |
| `ParkingConfig` | `ParkingConfig.tsx` | Panel de configuración de parqueo seguro |
| `ParkingStatus` | `ParkingStatus.tsx` | Estado de parqueo activo (rango, duración, tiempo restante) |
| `GpsDeviceList` | `GpsDeviceList.tsx` | Lista de dispositivos GPS con estrella principal |
| `GpsDeviceRow` | `GpsDeviceRow.tsx` | Fila de GPS: nombre, estado, métricas, promover |
| `AliasEditor` | `AliasEditor.tsx` | Modal deslizante para editar alias |
| `DeviceShell` | `DeviceShell.tsx` | Wrapper iPhone simulado (solo dev) |
| `OffscreenIndicator` | `OffscreenIndicator.tsx` | Flecha en borde del mapa apuntando a vehículo fuera de pantalla |
| `StatusBar` | `StatusBar.tsx` | Reloj + íconos de sistema (solo dev) |
| `MapTools` | `MapTools.tsx` | Botones Street View, Centrar mapa |
| `ParkSuccessOverlay` | `ParkSuccessOverlay.tsx` | Overlay animado de éxito al activar parqueo |
| `ParkDeleteConfirm` | `ParkDeleteConfirm.tsx` | Confirmación de desactivar parqueo |
| `NavigationArrows` | `NavigationArrows.tsx` | Flechas prev/next en detalle vehículo |

### 8.2 Modificaciones en `src/shared/components/`

| Componente | Cambio |
|-----------|--------|
| `FleetMap.tsx` | Agregar: clustering, off-screen indicators, park circles (condicional `profile === 'mobile'`) |
| `FleetMap.tsx` | Exportar tipos de marcador con heading/rotación |
| `Toast.tsx` | Ya compatible — sin cambios |
| `SearchInput.tsx` | Ya compatible — sin cambios |

### 8.3 Nuevo componente en `src/shared/components/`

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `ParkingModule.tsx` | `ParkingModule.tsx` | Estado de parqueo + círculo en mapa + lógica de alertas. Reutilizable para desktop en futuro. |

### 8.4 Modificaciones en `src/shared/lib/`

| Archivo | Cambio |
|---------|--------|
| `data.ts` | Extender `Vehicle` y `GpsDevice` con campos mobile (heading, trips, area, signal, isPrimary, lat/lng, address) |
| `utils.ts` | Agregar: `formatRelativeTime()` (updatedAt → "hace 5 minutos"), `parseBattery()`, `batteryColor()`, `rangeToZoom()` |

### 8.5 Modificaciones en `src/`

| Archivo | Cambio |
|---------|--------|
| `App.tsx` | Agregar rama `profile === 'mobile'` con `MobileLayout` |
| `main.tsx` | Sin cambios |

---

## 9. Dependencias Externas Nuevas

| Librería | Para qué |
|----------|----------|
| ❌ Ninguna | Leaflet, Lucide, Framer Motion ya están en C-Locater |

Todo el clustering, off-screen indicators y lógica de parqueo se implementa con código propio (como ya lo hizo CO-Producto-01 en Vanilla JS).

---

## 10. Estado del Mobile vs Roadmap

| Funcionalidad | Prioridad | Estado |
|---------------|-----------|--------|
| Layout + Bottom Sheet 3 estados | P0 | ⏳ Pendiente |
| Vehicle Card List + Search | P0 | ⏳ Pendiente |
| Vehicle Detail (header, info strip, quick actions) | P0 | ⏳ Pendiente |
| Mapa con clustering | P0 | ⏳ Pendiente |
| Off-screen indicators | P1 | ⏳ Pendiente |
| Parqueo seguro (config + activación) | P1 | ⏳ Pendiente |
| Edición de alias | P1 | ⏳ Pendiente |
| Swipe entre vehículos | P1 | ⏳ Pendiente |
| GPS multi-device + Hacer principal | P1 | ⏳ Pendiente |
| Bottom nav tabs (Indicadores, Viajes, Perfil) | P2 | ⏳ Pendiente |
| Device shell + responsive toggle | P2 | ⏳ Pendiente |
| PWA (manifest + service worker) | P2 | ⏳ Pendiente |

---

*Fin del documento mobile.md*
