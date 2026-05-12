# Contexto del Proyecto CLocater

> Documentación técnica completa para análisis y modificación del proyecto
> Actualizado: 2026-05-09 (Sesión 5)

---

## 0. Reglas de Trabajo — Leer Primero

Estas reglas fueron establecidas durante el desarrollo y deben respetarse en toda sesión:

1. **Aislamiento por plataforma**: Cuando el usuario indica un cambio para C-Go, solo se toca `src/c-go/` y la lógica condicional `profile === 'c-go'` en shared. **Nunca modificar C-Loc por error de alcance**, y viceversa.
2. **Documentar siempre**: Cada cambio de comportamiento, UX o dato va documentado en `definicion.md`. Cada cambio estructural va en `contexto.md`.
3. **Preguntar antes de implementar UX**: Si el cambio involucra layout o decisión visual, validar con el usuario antes de ejecutar.
4. **`definicion.md` es la fuente de verdad de producto**: Contiene decisiones de roles, visibilidad, textos y comportamientos por plataforma/rol.

---

## 1. Visión General

**CLocater** es una plataforma de rastreo de flotas vehiculares con interfaz de mapa interactivo. Permite visualizar vehículos en tiempo real, gestionar rutas y agrupar unidades.

- **Estado**: En desarrollo activo (v0.0.0)
- **Tipo**: SPA (Single Page Application)
- **Puerto**: 3000 (vite.config.ts)

### Perfiles de la aplicación

| Perfil | Tipo | Para quién | Layout |
|--------|------|------------|--------|
| **C-Go** | `'c-go'` | Operaciones / Conductores | Header top con logo · Sidebar 72px fijo |
| **C-Loc** | `'c-loc'` | Monitoreo / Control | Sidebar expandible con logo · Header sin logo |

### Roles de usuario

| Rol | Tipo | Descripción |
|-----|------|-------------|
| **Administrador** | `'admin'` | Visión operativa y de alertas. Métricas reducidas + alarmas |
| **Concesionaria** | `'operator'` | Visión técnica completa. Telemetría del vehículo |
| **Cliente Directo** | `'client'` | Visión reducida. Solo lo necesario para su operación |

Los roles son **internos al sistema**: en producción vendrán del token de sesión del backend. En desarrollo se controlan desde `App.tsx` con `useState<UserRole>`.

> Ver `definicion.md` para la matriz completa de visibilidad por rol y plataforma.

---

## 2. Estructura de Directorios

```
C:\Users\emacalupu\Documents\Proyectos\CLocater\
└── C-Locater/
    ├── src/
    │   ├── c-go/                        # Componentes exclusivos del perfil C-Go
    │   │   └── components/
    │   │       ├── Header.tsx           # HeaderCGo: logo + campana + UserMenu
    │   │       └── Sidebar.tsx          # Sidebar: 72px fijo, íconos+label, submenú hover
    │   │
    │   ├── c-loc/                       # Componentes exclusivos del perfil C-Loc
    │   │   └── components/
    │   │       ├── Header.tsx           # HeaderCLoc: solo campana + UserMenu
    │   │       └── Sidebar.tsx          # SidebarCLoc: expandible 224px↔72px, logo propio
    │   │
    │   ├── shared/                      # Componentes y utilidades compartidos
    │   │   ├── components/
    │   │   │   ├── ui/
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── Button.tsx
    │   │   │   │   ├── Modal.tsx
    │   │   │   │   ├── Badge.tsx
    │   │   │   │   ├── DropdownMenu.tsx
    │   │   │   │   ├── Input.tsx
    │   │   │   │   ├── Select.tsx
    │   │   │   │   ├── SearchInput.tsx
    │   │   │   │   ├── SearchableSelect.tsx
    │   │   │   │   ├── Textarea.tsx
    │   │   │   │   ├── Label.tsx
    │   │   │   │   ├── Checkbox.tsx
    │   │   │   │   ├── IconButton.tsx
    │   │   │   │   ├── SegmentedControl.tsx
    │   │   │   │   ├── Toast.tsx
    │   │   │   │   └── UserMenu.tsx     # Switcher de perfil + rol
    │   │   │   ├── fleet/               # Sub-componentes del monitor de flota
    │   │   │   │   ├── fleetUtils.ts        # getBatteryColor()
    │   │   │   │   ├── StatCard.tsx         # Tarjeta de métricas superiores
    │   │   │   │   ├── GpsBadgeTooltip.tsx  # Badge GPS sobre ícono vehículo
    │   │   │   │   ├── SharePopover.tsx     # Popover de compartir ubicación
    │   │   │   │   ├── GpsActionMenu.tsx    # Menú ⋮ de acciones GPS
    │   │   │   │   ├── GpsPopover.tsx       # Panel de dispositivos GPS
    │   │   │   │   └── VehicleAccordionItem.tsx  # Tarjeta acordeón de vehículo
    │   │   │   ├── FleetMap.tsx
    │   │   │   ├── FloatingStats.tsx    # Orquestador: estado, filtros, lista
    │   │   │   ├── CaminosModule.tsx
    │   │   │   └── NuevoGrupoModule.tsx
    │   │   └── lib/
    │   │       ├── data.ts              # Vehicle + GpsDevice types · FLEET_DATA · RUTAS_DATA
    │   │       └── utils.ts             # cn(), UserRole (admin|esad|operator|client), formatLastSeen*
    │   │
    │   ├── img/
    │   │   ├── logo.png                 # Logo C-Go (HeaderCGo)
    │   │   ├── logo2.png                # Logo C-Loc expandido (SidebarCLoc)
    │   │   └── clo-peque.png            # Logo C-Loc colapsado (SidebarCLoc)
    │   │
    │   ├── App.tsx                      # Orquestador: perfil + rol + vista activa
    │   ├── main.tsx
    │   └── index.css
    │
    ├── definicion.md                    # Decisiones de UX, roles y visibilidad ← LEER
    ├── contexto.md                      # Este archivo — arquitectura técnica
    ├── STATUS.md
    ├── CHANGELOG.md
    └── style.md
```

---

## 3. Tecnologías y Versiones

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | React | 19.0.0 |
| Lenguaje | TypeScript | ~5.8.2 |
| Bundler | Vite | 6.2.0 |
| Estilos | TailwindCSS | 4.1.14 |
| Mapas | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Iconos | Lucide React | 0.546.0 |
| Animaciones | Framer Motion (`motion/react`) | 12.23.24 |
| UI Utils | clsx + tailwind-merge | 2.1.1 / 3.5.0 |

---

## 4. Componentes Principales

### 4.1 Orquestador — `App.tsx`

**Estado actual:**
```typescript
const [activeView, setActiveView] = useState('explore');       // 'explore' | 'caminos'
const [profile, setProfile]       = useState<AppProfile>('c-go');
const [userRole, setUserRole]     = useState<UserRole>('admin'); // mutable, vendrá del backend
```

**Props que pasa a hijos:**
- `HeaderCGo` / `HeaderCLoc` → `onProfileChange`, `userRole`, `onRoleChange`
- `FloatingStats` → `profile`, `userRole`

**Layouts:**
```tsx
// C-Loc: sidebar izq + (header + main)
<div className="flex w-full h-screen">
  <SidebarCLoc ... />
  <div className="flex flex-col flex-1">
    <HeaderCLoc onProfileChange={setProfile} userRole={userRole} onRoleChange={setUserRole} />
    <main>...</main>
  </div>
</div>

// C-Go: (header) + (sidebar + main)
<div className="flex flex-col w-full h-screen">
  <HeaderCGo onProfileChange={setProfile} userRole={userRole} onRoleChange={setUserRole} />
  <div className="flex flex-1">
    <Sidebar ... />
    <main>...</main>
  </div>
</div>
```

---

### 4.2 Perfil C-Go

#### `src/c-go/components/Header.tsx` — `HeaderCGo`
```typescript
interface HeaderCGoProps {
  onProfileChange: (p: AppProfile) => void;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
}
```
- Logo `src/img/logo.png` a la izquierda
- Campana + `UserMenu` a la derecha

#### `src/c-go/components/Sidebar.tsx` — `Sidebar`
- Ancho fijo `72px`
- Ítems: Explorar, Flota, Gestión, En vivo, Informes, Perfil
- Submenú "Gestión" en hover (popover lateral): Caminos, Geocercas, Conductores, Vehículos
- Props: `activeView: string`, `onViewChange: (view: string) => void`

---

### 4.3 Perfil C-Loc

#### `src/c-loc/components/Header.tsx` — `HeaderCLoc`
```typescript
interface HeaderCLocProps {
  onProfileChange: (p: AppProfile) => void;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
}
```
- Sin logo (el logo está en el sidebar)
- Campana + `UserMenu` alineados a la derecha

#### `src/c-loc/components/Sidebar.tsx` — `SidebarCLoc`
- Ancho animado: `224px` ↔ `72px` (Framer Motion)
- Logo en header: `logo2.png` (expandido) / `clo-peque.png` (colapsado)
- `NAV_ITEMS`: Explorar, Flota (hijos), En vivo (badge), Informes (hijos)
- `MANAGEMENT_ITEMS`: Caminos, Geocercas
- Submenús: acordeón inline (expandido) / popover fixed (colapsado)
- Props: `activeView: string`, `onViewChange: (view: string) => void`

---

### 4.4 `UserMenu.tsx` — Switcher de Perfil y Rol

```typescript
export type AppProfile = 'c-go' | 'c-loc';

interface UserMenuProps {
  user: UserMenuUser;           // { name, role (display), initials, isAdmin }
  profile: AppProfile;
  onProfileChange: (p: AppProfile) => void;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
  onSettings?: () => void;
  onLogout?: () => void;
}
```

**Dropdown** (portal, solo visible con `isAdmin: true`):
- Sección **"Cuenta"** con dos acordeones mutuamente excluyentes:
  - **Plataforma** (ícono `Monitor`): switcher C-Go / C-Loc
  - **Rol** (ícono `ShieldCheck`): switcher Administrador / Operador / Cliente
- Configuración
- Cerrar sesión

El label debajo del nombre en el trigger muestra el rol activo dinámicamente.

---

### 4.5 `FloatingStats.tsx` — Panel de Monitoreo

```typescript
export function FloatingStats({
  profile = 'c-go',
  userRole = 'operator'
}: {
  profile?: 'c-go' | 'c-loc';
  userRole?: UserRole;
})
```

**Comportamiento condicional por perfil y rol:**

| Elemento | Condición | Comportamiento |
|----------|-----------|----------------|
| StatCards (Distancia, Viajes, etc.) | `profile === 'c-go' && userRole !== 'admin'` | Solo visible para operator/client en C-Go |
| Métricas de telemetría (acordeón) | `userRole === 'admin'` | Admin: Velocidad + Batería + Alarmas |
| Métricas de telemetría (acordeón) | `userRole !== 'admin'` | Otros: Velocidad + Dirección + Odómetro + Batería |
| Vista colapsada — segunda línea | `userRole === 'admin'` | `[placa]` · `[DD mes · H:MM AM/PM]` |
| Vista colapsada — segunda línea | `userRole !== 'admin'` | `[placa]` · `[velocidad]` |
| Badge de estado del vehículo | `profile === 'c-go'` | "Ignition ON / OFF / Disconnected" |
| Badge de estado del vehículo | `profile === 'c-loc'` | "Encendido / Apagado / Desconectado" |
| Badge GPS en ícono de vehículo | `profile === 'c-go' && userRole === 'client'` | Oculto para client. Operator ve badge con count sin contingencia |
| Botón "Ver dispositivos GPS" | `profile === 'c-go' && userRole === 'client'` | Oculto para client. Operator ve botón con devices sin contingencia |
| SVR Contingencia en GpsPopover | `profile === 'c-go' && userRole === 'operator'` | Filtrado — operator no ve dispositivos de tipo contingencia |
| Batería (ícono + valor) | siempre | Color dinámico: rojo ≤20% · ámbar ≤60% · verde >60% |
| Acciones Zona 3 (pos. 3–4) | `userRole` | Admin: Parqueo+Comando · Operator: Detalle+Conducción · Client: Parqueo+Bloquear |

**Sub-componente `VehicleAccordionItem`:**
```typescript
{ userRole: UserRole; profile: 'c-go' | 'c-loc'; ... }
```

**Métrica de alarmas (solo admin):**
- Ícono `Bell` naranja con badge de conteo superpuesto
- Valor `0` → texto "Sin eventos" · Valor `> 0` → "N eventos" en naranja
- Dato: `vehicle.alarmCount` de `FLEET_DATA`

**Color de batería — `getBatteryColor(fuel: string)`:**
```typescript
// Función local en FloatingStats.tsx
// ≤ 20% → 'text-red-500' | ≤ 60% → 'text-amber-500' | > 60% → 'text-emerald-500'
// Aplica a: ícono Battery + texto del valor, en acordeón y GPS popover
```

**GPS Popover (`GpsPopover`):**
- Props: `vehicle`, `userRole`, `profile` — filtra y adapta contenido según ambos
- Badge GPS en ícono de vehículo solo aparece cuando `gpsCount > 1`
- En C-Go `operator`: filtra dispositivos `contingencia` del listado
- Nombres SVR por tipo: `'flotas'` → SVR Plus · `'basico'` → SVR Básico · `'contingencia'` → SVR Contingencia · `'svr-x'` → SVR X
- Sin ícono `LocateFixed` en la tarjeta — eliminado para ganar espacio horizontal
- **Arquitectura de información por tarjeta de dispositivo (Sesión 5):**
  1. Nombre del plan (`SVR Plus`) + badge estado de señal (`● Transmitiendo / Sin señal / …`) — misma fila
  2. Fecha y hora del último reporte (`formatLastSeenWithSecs` para admin/esad · `formatLastSeen` para operator)
  3. Badge jerarquía (`Principal` / `Secundario` / `Respaldo`) + badge ignición `[⏻ ON/OFF]` (solo esad, **ON en verde** `text-emerald-600`)
  4. IMEI + LÍNEA en dos columnas con etiqueta uppercase `9px` y valor monospace `11px` · hover: color brand + subrayado + ícono copia
- **Contenido expandido** (orden): Grupo/Subgrupo (esad, encima de dirección) → Dirección + Coords (`flex-col gap-1`, mismo que `VehicleAccordionItem`) → Métricas · posición de Grupo/Subgrupo pendiente de decisión con usuario
- Fecha `lastSeen` por dispositivo: `admin` + `esad` con segundos · `operator` sin segundos · `client` no ve fecha
- Tooltips en métricas al hover (igual que card de vehículo)

**Métricas expandidas por rol (C-Go):**
- `esad`: Velocidad · Odómetro · Batería · Eventos (4 métricas)
- `admin` / C-Loc: Velocidad · Batería · Eventos (3 métricas)
- `operator` C-Go: Velocidad · Dirección · Odómetro · Batería (4 métricas — `vehicle.direction` / `vehicle.odometer`)

**Share Popover (`SharePopover`):**
- Trigger: botón `Share2` en el header de cada `VehicleAccordionItem`
- Estilo: `bg-white/90 backdrop-blur-2xl` · `w-[264px]` · `rounded-xl` · `p-3 gap-2` — mismo estándar glassmorphism del resto de paneles
- Estructura:
  - Header: texto "Compartir ubicación" (`text-[12px] font-bold`) + botón cierre
  - Fila identidad: placa + alias del vehículo (`bg-slate-50 rounded-lg`)
  - URL read-only + botón copiar (`w-7 h-7`)
  - Select de vigencia: 1h · 8h · 24h · Indefinida
  - Botón "Guardar compartido" (`py-1.5`, sin ícono)
  - Separador + link "Ver historial de compartidos"
- Posición: portal `fixed`, a la derecha del panel (o a la izquierda si no hay espacio)
- Modal de historial (`showShareHistory`): tabla con Destinatario · Estado · Acciones (copiar/cancelar)

**Menú ⋮ (`GpsActionMenu`) — props: `userRole`, `profile`:**
- `admin` / C-Loc: Ubicación · Viajes · Parqueo · Comando · Copiar información
- `operator` C-Go: Ubicación · Viajes · Parqueo (sin Comando, sin Copiar información)
- Copiar información: texto plano con `vehicle.owner`, `vehicle.plate`, `vehicle.name` (alias), coords, telemetría del `gpsDevice`
- `vehicle.name` es siempre el **Alias** — nunca se etiqueta como "Conductor"

---

### 4.6 `FleetMap.tsx`

- Props opcionales: `isDrawingMode`, `drawingPoints`, `onMapClick`, `groupRoutes`, `selectedRouteId`
- Función `formatLastSeen` migrada a `shared/lib/utils.ts` (ahora importada)
- Tile: CartoDB Voyager. Centro: Lima `[-12.0464, -77.0428]`, zoom 15
- Eventos window: `vehicleSelected`, `flyToVehicle`, `mapMoveStart`, `mapMoveEnd`

---

## 5. `shared/lib/utils.ts` — Exports

```typescript
// Clases CSS
export function cn(...inputs: ClassValue[]): string

// Sistema de roles
export type UserRole = 'admin' | 'operator' | 'client';

// Formateo de fechas (input: '05/05/2026 09:14 a.m.')
export function formatLastSeenMini(lastSeen: string): string
// → '5 may · 9:14 AM'  (sin uso activo como formatLastSeenMiniSecs reemplaza)

export function formatLastSeenShort(lastSeen: string): string
// → 'Jue 5 may · 9:14 AM'  (disponible, sin uso activo aún)

export function formatLastSeen(lastSeen: string): string
// → 'Jue 5 may 2026 • 9:14 AM'  (card expandida en FleetMap)

export function formatLastSeenMiniSecs(lastSeen: string): string
// → '5 may · 14:08:14'  (24h, con segundos — VehicleAccordionItem colapsado, admin/esad)

export function formatLastSeenWithSecs(lastSeen: string): string
// → 'Jue 5 may 2026 • 9:14:28 AM'  (expandido GpsPopover, admin/esad)
```

---

## 6. `shared/lib/data.ts` — Estructuras

### FLEET_DATA
```typescript
// Tipos exportados
type GpsServiceType = 'basico' | 'flotas' | 'contingencia' | 'svr-x';
type GpsIdentifierLabel = 'OBC' | 'Línea' | 'IMEI';

type GpsDevice = {
  type: GpsServiceType;                             // SVR Básico / SVR Plus / SVR Contingencia / SVR X
  identifier: { label: GpsIdentifierLabel; value: string }; // OBC, IMEI o Línea
  reportStatus: 'reporting' | 'inactive'; // ¿el GPS está transmitiendo?
  ignition: 'on' | 'off';                // estado del motor leído por este GPS
  speed: string;
  fuel: string;
  alarmCount: number;
  lastSeen: string;       // fecha/hora de último reporte, propia del GPS
};

// Estructura de cada vehículo
{
  id: string;
  name: string;           // Alias del conductor ('ANA', 'MARCO')
  plate: string;          // 'MOT-101'
  type: string;           // 'motorcycle' | 'car' | 'truck' | 'bus' | 'machinery'
  status: string;         // 'active' | 'stopped' | 'offline'
  position: [number, number];
  speed: string;          // '45 km/h'  ← dato del vehículo (para acordeón principal)
  address: string;
  coords: string;         // '-11.999089, -77.082595'
  direction: string;
  odometer: string;
  fuel: string;
  owner: string;          // Propietario del vehículo (empresa o persona)
  gpsCount?: number;      // Total de dispositivos GPS (para badge y botón)
  alarmCount?: number;    // Eventos de alarma nivel vehículo (para métrica admin)
  lastSeen: string;       // '05/05/2026 09:14 a.m.'  ← fecha del vehículo
  gpsDevices?: GpsDevice[]; // Datos propios por GPS (ANA: 2, JUAN: 3, FLOTA-X: 5)
}
```
**7 vehículos**, posiciones en Lima, Perú. Vehículos con `gpsDevices`: ANA (2), JUAN (3), FLOTA-X (5).

**Modelo**: el vehículo es el generador de información; cada GPS es un receptor independiente. Un GPS fallido puede tener datos distintos al resto.

### RUTAS_DATA
```typescript
{ id, name, status, group, company, date, stops, distance }
```
**8 rutas** con empresas peruanas.

---

## 7. Patrones de Código

### 7.1 Utilidades CSS
```typescript
import { cn } from '../lib/utils'
cn("base-class", isActive && "active-class", className)
```

### 7.2 Comunicación entre componentes
- **Navegación de vistas**: props callbacks (`onViewChange`) — no CustomEvents
- **FleetMap ↔ FloatingStats**: CustomEvents en `window`

| Evento | Origen | Destino | Detalle |
|--------|--------|---------|---------|
| `vehicleSelected` | FloatingStats / FleetMap | ambos | `{ id, source: 'monitor'|'marker'|'map' }` |
| `flyToVehicle` | FloatingStats | FleetMap | `{ position: [lat, lng] }` |
| `mapMoveStart` / `mapMoveEnd` | FleetMap | FloatingStats | — |

### 7.3 Condicionales por perfil/rol
```typescript
// Por perfil (layout y textos)
profile === 'c-go' ? 'Ignition ON' : 'Encendido'

// Por rol (visibilidad de elementos)
userRole === 'admin' && <ComponenteExclusivoAdmin />
profile === 'c-go' && userRole !== 'admin' && <StatCards />
```

### 7.4 Portales
```typescript
import { createPortal } from 'react-dom'
// Posición calculada desde getBoundingClientRect()
createPortal(<Panel style={{ position: 'fixed', top, left }} />, document.body)
```

### 7.5 Glassmorphism
```
bg-white/85 backdrop-blur-2xl
border border-white/70 | border-slate-200/50
shadow-[0_2px_10px_rgba(0,0,0,0.05)]
text-brand / bg-brand  →  var(--brand: #0052CC)
```

---

## 8. Guía para Modificaciones

### Cambio que afecta solo a C-Go
- Si es de layout: editar `src/c-go/components/`
- Si es en componente shared: usar condicional `profile === 'c-go'`
- **Nunca tocar** `src/c-loc/` ni el layout del perfil opuesto

### Cambio que afecta solo a un rol
- Usar condicional `userRole === 'admin'` (o el rol correspondiente)
- El prop `userRole` llega desde `App.tsx` → Header → UserMenu (para cambio) y App → FloatingStats → VehicleAccordionItem (para renderizado)

### Agregar nuevo rol
1. Añadir a `UserRole` en `shared/lib/utils.ts`
2. Añadir a `ROLES` en `shared/components/ui/UserMenu.tsx`
3. Agregar lógica condicional en los componentes afectados
4. Documentar en `definicion.md`

### Agregar nuevo perfil
1. Añadir a `AppProfile` en `UserMenu.tsx`
2. Crear `src/nuevo-perfil/components/Header.tsx` y `Sidebar.tsx`
3. Añadir rama en `App.tsx`
4. Añadir a `PROFILES` en `UserMenu.tsx`

### Agregar vista nueva
1. Crear en `src/shared/components/NuevaVista.tsx`
2. En `App.tsx`: `{activeView === 'nueva-vista' && <NuevaVista />}` en ambos layouts
3. Agregar ítem al Sidebar del perfil correspondiente

### Modificar métricas de telemetría por rol
Editar el array condicional en `VehicleAccordionItem` dentro de `FloatingStats.tsx`:
```typescript
userRole === 'admin'
  ? [ Velocidad, Batería, Alarmas ]
  : [ Velocidad, Dirección, Odómetro, Batería ]
```

---

## 9. Scripts

| Script | Comando |
|--------|---------|
| Dev | `npm run dev` (puerto 3000) |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Type check | `npx tsc --noEmit` |

> **Errores pre-existentes en tsc**: `SidebarCLoc` tiene 3 errores de tipo `key` en props de componentes internos. No son bloqueantes y no son de nuestra autoría.

---

## 10. Problemas Conocidos

1. `package.json` tiene `"name": "react-example"` (debería ser `"c-locater"`)
2. `@google/genai` incluida pero no implementada
3. Alias `@/` configurado en tsconfig pero imports usan rutas relativas
4. Sin diseño responsive para móviles
5. Estado global con `useState` + CustomEvents (sin Zustand/Context)
6. Datos mock estáticos — sin backend real
7. Vistas pendientes en C-Loc: Flota, En vivo, Informes, Geocercas, Conductores
8. GPS Popover: etiquetas "Encendido/Apagado" no actualizadas para C-Go aún

---

## 11. Referencias Rápidas

### Imports frecuentes
```typescript
// Tipos
import type { AppProfile } from '../../shared/components/ui/UserMenu';
import type { UserRole } from '../../shared/lib/utils';

// Utilidades
import { cn, formatLastSeenMini, formatLastSeen } from '../lib/utils';

// Datos
import { FLEET_DATA, RUTAS_DATA } from '../lib/data';

// UI
import { Button, Modal, Toast, UserMenu } from './ui';

// Logos
import logo     from '../../img/logo.png';
import logo2    from '../../img/logo2.png';
import logoPeque from '../../img/clo-peque.png';
```

### Archivos críticos por tarea

| Tarea | Archivo principal |
|-------|-------------------|
| Cambiar lógica de perfil/rol | `src/App.tsx` |
| Modificar switcher perfil/rol | `src/shared/components/ui/UserMenu.tsx` |
| Header C-Go | `src/c-go/components/Header.tsx` |
| Header C-Loc | `src/c-loc/components/Header.tsx` |
| Sidebar C-Go | `src/c-go/components/Sidebar.tsx` |
| Sidebar C-Loc | `src/c-loc/components/Sidebar.tsx` |
| Panel de monitoreo (roles, métricas) | `src/shared/components/FloatingStats.tsx` |
| Mapa + marcadores | `src/shared/components/FleetMap.tsx` |
| Tipos y utilidades | `src/shared/lib/utils.ts` |
| Datos de vehículos/rutas | `src/shared/lib/data.ts` |
| Tema visual | `src/index.css` |
| Decisiones de producto/UX | `definicion.md` |

---

## 12. Notas para IA y Colaboradores

- **Aislamiento de plataforma**: Un cambio pedido para C-Go no toca C-Loc, y viceversa. Usar condicionales `profile === 'c-go'` en shared, o tocar solo `src/c-go/`.
- **Validar UX antes de implementar**: Si el cambio involucra layout, posicionamiento o decisión visual, consultar antes de ejecutar.
- **Documentar en `definicion.md`**: Toda decisión de producto, rol o visibilidad queda registrada ahí.
- **Tipado estricto**: Sin `any`. Props bien tipadas. Condicionales sobre `UserRole` y `AppProfile` son la base del sistema.
- **Sin comentarios innecesarios**: Solo cuando el WHY no es obvio.
- **Portales**: Menús/modales/popovers siempre con `createPortal` + `position: fixed`.
- **Roles internos**: `userRole` viene de `useState` en `App.tsx` hoy. Cuando llegue backend, se reemplaza por el valor del token — la lógica condicional en componentes no cambia.

---

*Fin del documento contexto.md*
