# Contexto del Proyecto CLocater

> Documentación técnica completa para análisis y modificación del proyecto
> Actualizado: 2026-06-16 (Sesión 26 — **Eliminación completa de la plataforma C-Go**. Se borró `src/c-go/` y toda la lógica condicional `profile === 'c-go'` / `isCloc` / `AppProfile` en componentes shared: `VehicleAccordionItem`, `GpsBadgeTooltip`, `GpsPopover`, `GpsActionMenu`, `FleetMap`, `UserMenu`. El proyecto queda con una sola plataforma: **C-Loc**. Detalle completo en la sección 22. Cualquier mención a "C-Go", `profile` o `AppProfile` en secciones anteriores de este documento es **histórica** — se conserva como referencia de diseño pasado, pero ya no existe en el código)
> Actualizado: 2026-06-16 (Sesión 25 — Panel "Eventos del viaje" en VehicleTripView: el grid 2×2 de tags por tipo de evento fue reemplazado por filtros "Todos" / "Filtrar" (dropdown multi-selección checkbox), siguiendo el estándar de filtros Hoy/Todos/Fecha de TripPanel. Estado `activeEventType: TripEventType | null` → `activeEventTypes: Set<TripEventType>` (vacío = sin filtro = todos). Propagado a VehicleTrackingMap (prop `activeEventTypes`, `EventMarkers`). Botón "Filtrar" muestra contador en negrita cuando hay filtros activos, ej. "02 Filtrar")

---

## 0. Reglas de Trabajo — Leer Primero

Estas reglas fueron establecidas durante el desarrollo y deben respetarse en toda sesión:

1. ~~**Aislamiento por plataforma**~~ — **Obsoleto desde Sesión 26**: C-Go fue eliminado por completo. El proyecto es ahora mono-plataforma (C-Loc). Ya no existe `src/c-go/` ni la condicional `profile === 'c-go'`.
2. **Documentar siempre**: Cada cambio de comportamiento, UX o dato va documentado en `definicion.md`. Cada cambio estructural va en `contexto.md`.
3. **Preguntar antes de implementar UX**: Si el cambio involucra layout o decisión visual, validar con el usuario antes de ejecutar.
4. **`definicion.md` es la fuente de verdad de producto**: Contiene decisiones de roles, visibilidad, textos y comportamientos por plataforma/rol.

---

## 1. Visión General

**CLocater** es una plataforma de rastreo de flotas vehiculares con interfaz de mapa interactivo. Permite visualizar vehículos en tiempo real, gestionar rutas y agrupar unidades.

- **Estado**: En desarrollo activo (v0.0.0)
- **Tipo**: SPA (Single Page Application)
- **Puerto**: 3000 (vite.config.ts)

### Plataforma

Desde la Sesión 26 el proyecto tiene **una sola plataforma: C-Loc** (sidebar expandible con logo, sin header con logo). El concepto de perfil (`AppProfile` / `'c-go' | 'c-loc'`) fue eliminado del código — ver sección 22.

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
    │   ├── c-loc/                       # Componentes de la plataforma C-Loc (única plataforma)
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
    │   │   │   │   └── UserMenu.tsx     # Switcher de rol (switcher de perfil eliminado en Sesión 26)
    │   │   │   ├── fleet/               # Sub-componentes del monitor de flota
    │   │   │   │   ├── fleetUtils.ts        # getBatteryColor()
    │   │   │   │   ├── StatCard.tsx         # Tarjeta de métricas superiores
    │   │   │   │   ├── GpsBadgeTooltip.tsx  # Badge GPS sobre ícono vehículo
    │   │   │   │   ├── SharePopover.tsx     # Popover de compartir ubicación
    │   │   │   │   ├── GpsActionMenu.tsx    # Menú ⋮ de acciones GPS
    │   │   │   │   ├── GpsPopover.tsx       # Panel de dispositivos GPS
    │   │   │   │   └── VehicleAccordionItem.tsx  # Tarjeta acordeón de vehículo
    │   │   │   ├── FleetMap.tsx
    │   │   │   ├── FloatingMonitor.tsx  # Panel flotante draggable de búsqueda + lista (reemplazó a FloatingStats.tsx, eliminado en sesiones previas)
    │   │   │   ├── PeajesPanel.tsx      # Panel de peajes (rol client)
    │   │   │   ├── VehicleTabBar.tsx    # Barra de pestañas (vehículos capturados / en viaje)
    │   │   │   ├── vehicle-detail/      # VehicleCaptureView, VehicleTripView y sub-componentes
    │   │   │   ├── AIAssistant.tsx      # Asistente de voz IA (Groq Whisper + LLM)
    │   │   │   ├── CaminosModule.tsx
    │   │   │   └── NuevoGrupoModule.tsx
    │   │   └── lib/
    │   │       ├── data.ts              # Vehicle + GpsDevice types · FLEET_DATA · RUTAS_DATA
    │   │       ├── utils.ts             # cn(), UserRole (admin|esad|operator|client), formatLastSeen*
    │   │       ├── ThemeContext.tsx      # isDark context (useTheme)
    │   │       ├── VehicleContext.tsx    # Animación de vehículos en carretera (useVehicles)
    │   │       ├── paths.ts             # Waypoints por vehículo para animación
    │   │       ├── routeFetcher.ts      # Cliente OSRM para rutas reales por carretera
    │   │       ├── fleetAgent.ts        # Agente LLM con herramientas de flota
    │   │       └── fleetKnowledge.ts    # Base de conocimiento del dominio para el agente IA
    │   │
    │   ├── img/
    │   │   ├── logo2.png                # Logo C-Loc expandido (SidebarCLoc)
    │   │   └── clo-peque.png            # Logo C-Loc colapsado (SidebarCLoc)
    │   │
    │   ├── App.tsx                      # Orquestador: rol + vista activa (sin perfil desde Sesión 26)
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

**Estado actual (sin `profile` desde Sesión 26):**
```typescript
const [activeView, setActiveView]           = useState('explore');
const [userRole, setUserRole]               = useState<UserRole>('esad');
const [showMonitor, setShowMonitor]         = useState(false);
const [isDark, setIsDark]                   = useState(false);
const [monitorSide, setMonitorSide]         = useState<'left' | 'right'>('left');
const [monitorW, setMonitorW]               = useState(306);
const [showStats, setShowStats]             = useState(true);
const [showPeajesPanel, setShowPeajesPanel] = useState(false);
const [capturedVehicles, setCapturedVehicles] = useState<Vehicle[]>([]);
const [activeCaptureId, setActiveCaptureId] = useState<string | null>(null);
const [tripVehicles, setTripVehicles]       = useState<Vehicle[]>([]);
const [activeTripId, setActiveTripId]       = useState<string | null>(null);
const [mapMoving, setMapMoving]             = useState(false);
const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
// Tooltip del botón de métricas
const [showMetricsTooltip, setShowMetricsTooltip] = useState(false);
const metricsButtonRef                      = useRef<HTMLButtonElement>(null);
const [metricsTooltipPos, setMetricsTooltipPos] = useState<{ top: number; left: number } | null>(null);
```

**Métricas dinámicas (`clientMetrics`):**
- Escucha evento `vehicleSelected` → actualiza `selectedVehicleId`
- `useMemo` calcula métricas por vehículo (usando seed basado en `v.id`) o generales:
  - Generales: `148,000 km · 3,842 viajes · 2,640h · 4.87 · S/ 12,480.00`
  - Por vehículo: derivadas de `v.odometer` y `parseInt(id)`

**Atajos de teclado:**
- `Ctrl+B`: abre el monitor (`FloatingMonitor`); si ya está abierto, despacha `focusMonitorSearch` para re-enfocar el input
- `Ctrl+M`: toggle `showStats` (muestra/oculta las StatCards del rol `client`)

**Botón de métricas:**
- Posición: `right: 16` cuando el monitor está a la izquierda; `left: 16` cuando está a la derecha
- Se oculta al mover el mapa: `opacity: mapMoving ? 0 : 1` vía `mapMoving` state (escucha `mapMoveStart`/`mapMoveEnd`)

**StatCards + Panel Peajes (solo `userRole === 'client'`):**
- 5 `StatCard` (Distancia, Viajes, Tiempo, Calificación, Peajes) renderizadas directamente en `App.tsx`, alimentadas por `clientMetrics`
- Click en la StatCard "Peajes" → toggle de `<PeajesPanel>` (`peajes`, `viajes`, `mapMoving`, `onClose`)
- Misma lógica de ocultamiento por movimiento de mapa que el resto de overlays

**Vistas que reemplazan el mapa (`activeTripId` / `activeCaptureId`):**
- `activeTripId` tiene prioridad → renderiza `VehicleTripView` (vista de viaje, pantalla completa)
- si no, `activeCaptureId` → renderiza `VehicleCaptureView`
- si ninguno, se renderiza `activeView` normal (`explore` con `FleetMap` + `FloatingMonitor`, o `caminos` con `CaminosModule`)
- `VehicleTabBar` (×2: viajes y capturas) permite cambiar entre vehículos abiertos sin perder el resto de pestañas

**Props que pasa a hijos:**
- `FleetMap` → `monitorSide`, `monitorW`
- `FloatingMonitor` → `isOpen`, `onToggle`, `onClose`, `userRole`, `isDark`, `onSideChange`
- `SidebarCLoc` → `activeView`, `onViewChange`, `userRole`, `isDark`, `onToggleDark`, `user`, `onLogout`, `onRoleChange`

**Layout (única plataforma — sidebar izq + main, sin header propio):**
```tsx
<ThemeContext.Provider value={{ isDark }}>
  <VehicleProvider>
    <div className="flex w-full h-screen">
      <SidebarCLoc activeView={activeView} onViewChange={setActiveView} userRole={userRole} ... />
      <div className="flex flex-col flex-1">
        <main>
          {activeTripId ? <VehicleTripView ... />
            : activeCaptureId ? <VehicleCaptureView ... />
            : <>
                {activeView === 'explore' && (
                  <>
                    <FleetMap monitorSide={monitorSide} monitorW={monitorW} />
                    <FloatingMonitor isOpen={showMonitor} userRole={userRole} ... />
                    {userRole === 'client' && <>StatCards + botón toggle + tooltip + PeajesPanel</>}
                  </>
                )}
                {activeView === 'caminos' && <CaminosModule />}
              </>}
        </main>
        <VehicleTabBar tabs={tripVehicles} label="Viajes" ... />
        <VehicleTabBar tabs={capturedVehicles} label="Captura" ... />
      </div>
    </div>
  </VehicleProvider>
</ThemeContext.Provider>
```

---

### 4.2 Plataforma C-Loc (única)

#### `src/c-loc/components/Sidebar.tsx` — `SidebarCLoc`
- Ancho animado: `224px` ↔ `72px` (Framer Motion)
- Logo en header: `logo2.png` (expandido) / `clo-peque.png` (colapsado)
- `NAV_ITEMS`: Explorar, Flota (hijos), En vivo (badge), Informes (hijos)
- `MANAGEMENT_ITEMS`: Caminos, Geocercas
- Submenús: acordeón inline (expandido) / popover fixed (colapsado)
- Props: `activeView: string`, `onViewChange: (view: string) => void`

---

### 4.4 `UserMenu.tsx` — Switcher de Rol

> El switcher de plataforma (`AppProfile`, ícono `Monitor`) fue eliminado en la Sesión 26 junto con C-Go. `UserMenu` ahora solo maneja rol.

```typescript
interface UserMenuProps {
  user: UserMenuUser;           // { name, role (display), initials, isAdmin }
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
  onSettings?: () => void;
  onLogout?: () => void;
}
```

**Dropdown** (portal, solo visible con `isAdmin: true`):
- Sección **"Cuenta"** con un único acordeón:
  - **Rol** (ícono `ShieldCheck`): switcher Administrador / ESAD / Concesionaria / Cliente Directo / Desarrollador
- Configuración
- Cerrar sesión

El label debajo del nombre en el trigger muestra el rol activo dinámicamente.

---

### 4.5 `FloatingStats.tsx` — Panel de Monitoreo [HISTÓRICO — archivo eliminado]

> **`FloatingStats.tsx` ya no existe** (fue reemplazado por `FloatingMonitor.tsx` en una sesión anterior a la 26). Esta subsección se conserva como referencia histórica del diseño de roles/GPS, pero el `profile === 'c-go'` que aparece abajo nunca debe tomarse como código vigente. La lógica de GPS hoy vive sin prop `profile` en `GpsPopover.tsx`, `GpsActionMenu.tsx`, `GpsBadgeTooltip.tsx` y `VehicleAccordionItem.tsx` (ver sección 22).

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
| Ícono de vehículo (color) | GPS principal `reportStatus` | Verde (reporting) · Naranja (low/no-signal) · Rojo (disconnected) · Gris (sin GPS) |
| Badge de estado del vehículo | `profile === 'c-go'` | "Ignition ON / OFF / Disconnected" |
| Badge de estado del vehículo | `profile === 'c-loc'` | "Encendido / Apagado / Desconectado" |
| Badge GPS en ícono de vehículo | `profile === 'c-go' && userRole === 'client'` | Oculto para client. Operator ve badge con count sin contingencia |
| Botón "Ver dispositivos GPS" | `profile === 'c-go' && userRole === 'client'` | Oculto para client. Operator ve botón con devices sin contingencia |
| SVR Contingencia en GpsPopover | `profile === 'c-go' && userRole === 'operator'` | Filtrado — operator no ve dispositivos de tipo contingencia |
| Batería (ícono + valor) | siempre | Color dinámico: rojo ≤20% · ámbar ≤60% · verde >60% |
| Acciones Zona 3 (pos. 3–4) | `userRole` | Admin: Parqueo+Comando · Operator: Detalle+Conducción · Client: Parqueo+Bloquear · Esad: oculta (acciones en menú ⋮) |

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
- Ícono `LocateFixed` usado en badge de señal (fila 3) — reemplaza el dot circular para entrenar asociación visual con el indicador GPS de la tarjeta del vehículo
- **Arquitectura de información por tarjeta de dispositivo (Sesión 7 — final):**
  1. Nombre del plan (`SVR Plus` bold) + jerarquía inline tenue (`Principal` azul/70 · `Secundario` slate-400) — mismo row, sin pills
  2. Fecha y hora del último reporte `10px text-slate-400` (`formatLastSeenWithSecs` para admin/esad · `formatLastSeen` para operator)
  3. Badge señal: ícono `LocateFixed w-3.5 h-3.5` + label (`Transmitiendo / Sin señal / …`) coloreado por estado + `animate-ping` si `reporting` · Badge ignición `[⏻ ON/OFF]` solo esad
  4. IMEI + LÍNEA en dos columnas con etiqueta uppercase `9px` y valor monospace `11px` · hover: color brand + subrayado + ícono copia
  - Jerarquías: solo `Principal` (índice 0) y `Secundario` (índice ≥1) — eliminado "Respaldo"
  - SVR Contingencia: mismo color que resto de secundarios (`text-slate-800`) — eliminado color lila
- **Contenido expandido** (orden): Grupo/Subgrupo (esad, encima de dirección) → Dirección + Coords (`flex-col gap-1`, mismo que `VehicleAccordionItem`) → Métricas · posición de Grupo/Subgrupo pendiente de decisión con usuario
- Fecha `lastSeen` por dispositivo: `admin` + `esad` con segundos · `operator` sin segundos · `client` no ve fecha
- Tooltips en métricas al hover (igual que card de vehículo)
- **Variables de color dark mode (Sesión 20)**: por device, se calculan `clocDark = isCloc && isDark`, `labelCls`, `valueCls`, `dividerCls`. Aplicadas en IMEI label/valor, LÍNEA label/valor/borde, coords copy button, métricas (íconos `text-blue-400` + valores `text-zinc-300`), encabezados y filas de Grupo/Subgrupo, separador de grupos (`border-zinc-700`). Secondary device name: `text-zinc-100` (antes `text-slate-800`, invisible en dark).

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
- `admin` / C-Loc: Ubicación · Viajes · Parqueo · Comando · Copiar información · **Fijar arriba / Desanclar** (si `onTogglePin` está presente)
- `operator` C-Go: Ubicación · Viajes · Parqueo · **Fijar arriba / Desanclar**
- Copiar información: texto plano con `vehicle.owner`, `vehicle.plate`, `vehicle.name` (alias), coords, telemetría del `gpsDevice`
- `vehicle.name` es siempre el **Alias** — nunca se etiqueta como "Conductor"

**PIN / Anclar vehículo (`FloatingStats` + `VehicleAccordionItem`):**
- Estado: `pinnedVehicleIds: Set<string>` en `FloatingStats`
- `togglePin(id)`: toggle de presencia en el Set, nuevo objeto (inmutable)
- `visibleFleet` se ordena con `sort()`: vehículos fijados primero, luego el resto (orden original conservado)
- `VehicleAccordionItem` recibe `isPinned` y `onTogglePin` — pasa ambos al `GpsActionMenu`
- Cuando `isPinned`:
  - Borde de la tarjeta → `border-brand/30` con sombra sutil azul
  - Chip `Pin` (w-3 h-3) en color brand, aparece a la izquierda del chevron en la cabecera
- Opción del menú: `Pin` gris → "Fijar arriba" | `PinOff` brand → "Desanclar" (con fondo brand/5)
- `menuHeight` ajustado: isOperatorCGo 172px · otros 250px (con pin) vs 120/200 sin pin

---

### 4.6 `FleetMap.tsx`

- Props: `monitorSide?: 'left' | 'right'` (default `'left'`), `monitorW?: number` (default `306`)
- Props opcionales adicionales: `isDrawingMode`, `drawingPoints`, `onMapClick`, `groupRoutes`, `selectedRouteId`
- Función `formatLastSeen` migrada a `shared/lib/utils.ts` (ahora importada)
- Tile: CartoDB Voyager. Centro: Lima `[-12.0464, -77.0428]`, zoom 15
- Eventos window: `vehicleSelected`, `flyToVehicle`, `mapMoveStart`, `mapMoveEnd`
- **Ancho dinámico de pill markers** (Sesión 9): el pill del marcador de vehículo ya no tiene `width:160px` fijo. Se calcula con `inline-flex; white-space:nowrap` y la fórmula:
  ```js
  const maxChars = Math.max(vehicle.name.length * 7.5, vehicle.plate.length * 6.5);
  const pillW = Math.max(Math.ceil(26 + 7 + maxChars + 24), 90);
  // iconSize: [pillW, COLLAPSED_ANCHOR_Y + 6], iconAnchor: [pillW / 2, COLLAPSED_ANCHOR_Y]
  ```
- **Tarjeta de vehículo en mapa** (Sesión 13): estado `cardVehicleId` (separado de `highlightedId`)
  - Solo se activa desde click en marker del mapa (NO desde el monitor/buscador)
  - Tarjeta aparece en `bottom-4 left: 16` — `absolute z-[1000] w-[272px]`
  - Animación: `opacity/y/scale` con `[0.23, 1, 0.32, 1]`
  - Contenido: ícono vehículo + placa + chip alias + badge estado + propietario + botón X
  - Grid 2×2: Velocidad | Dirección / Odómetro | Batería (color-coded)
  - Footer: `MapPin` dirección + `Clock` lastSeen
  - `handleDeselect` limpia tanto `highlightedId` como `cardVehicleId`
  - **Ocultarse al mover el mapa**: `mapMoving` state escucha `mapMoveStart`/`mapMoveEnd`. Cuando `true`: `animate={{ opacity: 0 }}` + `pointerEvents: none` en la tarjeta (mismo patrón que `FloatingMonitor`)

---

## 5. `shared/lib/utils.ts` — Exports

```typescript
// Clases CSS
export function cn(...inputs: ClassValue[]): string

// Sistema de roles
export type UserRole = 'admin' | 'esad' | 'operator' | 'client' | 'developer';

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
**85 vehículos** (IDs 1–85). IDs 1–11 en Lima; IDs 12–69 en 13 departamentos peruanos; IDs 70–85 en carreteras/autopistas aisladas:
- Arequipa (8, IDs 12-19), Cusco (6, IDs 20-25), Trujillo (6, IDs 26-31), Piura (5, IDs 32-36)
- Chiclayo (5, IDs 37-41), Iquitos (4, IDs 42-45), Puno (4, IDs 46-49), Tacna (3, IDs 50-52)
- Ica (4, IDs 53-56), Huancayo (4, IDs 57-60), Cajamarca (3, IDs 61-63), Chimbote (3, IDs 64-66), Huánuco (3, IDs 67-69)
- **Aislados en carreteras** (16, IDs 70-85): Carretera Central (70-72), Panamericana Norte (73-74), Panamericana Sur (75-77), Interoceánica Sur (78-79), Fernando Belaúnde (80-81), Tingo María (82), Puno-Desaguadero (83), Arequipa-Moquegua (84), Ica-Nazca (85)

Vehículos con `gpsDevices`: ANA (2), JUAN (3), FLOTA-X (5). IDs 8–11: `no-signal` (ROSA), `low-signal` (DIEGO, 2 GPS), `disconnected` (ELENA), `reporting` (RUTA-7).

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

### 7.3 Condicionales por rol

> Hasta la Sesión 25 existía también una condicional por perfil (`profile === 'c-go' ? ... : ...`). Fue eliminada en la Sesión 26 — solo queda condicional por rol.

```typescript
// Por rol (visibilidad de elementos)
userRole === 'admin' && <ComponenteExclusivoAdmin />
userRole === 'client' && <StatCards />
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

> Desde la Sesión 26 el proyecto es mono-plataforma. Las guías "Cambio que afecta solo a C-Go" y "Agregar nuevo perfil" fueron eliminadas — ya no aplican.

### Cambio que afecta solo a un rol
- Usar condicional `userRole === 'admin'` (o el rol correspondiente)
- El prop `userRole` llega desde `App.tsx` → `SidebarCLoc` → `UserMenu` (para cambio) y `App.tsx` → componentes de flota (para renderizado)

### Agregar nuevo rol
1. Añadir a `UserRole` en `shared/lib/utils.ts`
2. Añadir a `ROLES` en `shared/components/ui/UserMenu.tsx`
3. Agregar lógica condicional en los componentes afectados
4. Documentar en `definicion.md`

### Agregar vista nueva
1. Crear en `src/shared/components/NuevaVista.tsx`
2. En `App.tsx`: `{activeView === 'nueva-vista' && <NuevaVista />}`
3. Agregar ítem al `SidebarCLoc`

### Modificar métricas de telemetría por rol
Editar el array condicional dentro de `VehicleAccordionItem.tsx` (`src/shared/components/fleet/`):
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

---

## 11. Referencias Rápidas

### Imports frecuentes
```typescript
// Tipos
import type { UserRole } from '../../shared/lib/utils';

// Utilidades
import { cn, formatLastSeenMini, formatLastSeen } from '../lib/utils';

// Datos
import { FLEET_DATA, RUTAS_DATA } from '../lib/data';

// UI
import { Button, Modal, Toast, UserMenu } from './ui';

// Logos
import logo2    from '../../img/logo2.png';
import logoPeque from '../../img/clo-peque.png';
```

### Archivos críticos por tarea

| Tarea | Archivo principal |
|-------|-------------------|
| Cambiar lógica de rol | `src/App.tsx` |
| Modificar switcher de rol | `src/shared/components/ui/UserMenu.tsx` |
| Sidebar C-Loc | `src/c-loc/components/Sidebar.tsx` |
| Panel de monitoreo / búsqueda | `src/shared/components/FloatingMonitor.tsx` |
| Tarjeta de vehículo (acordeón, métricas, GPS) | `src/shared/components/fleet/VehicleAccordionItem.tsx` |
| Mapa + marcadores + GPS multi-pos | `src/shared/components/FleetMap.tsx` |
| Tipos y utilidades | `src/shared/lib/utils.ts` |
| Datos de vehículos/rutas/GPS positions | `src/shared/lib/data.ts` |
| Tema visual | `src/index.css` |
| Decisiones de producto/UX | `definicion.md` |

---

## 12. Notas para IA y Colaboradores

- **Mono-plataforma desde Sesión 26**: ya no existe `AppProfile` ni `src/c-go/`. Todo el proyecto es C-Loc.
- **Validar UX antes de implementar**: Si el cambio involucra layout, posicionamiento o decisión visual, consultar antes de ejecutar.
- **Documentar en `definicion.md`**: Toda decisión de producto, rol o visibilidad queda registrada ahí.
- **Tipado estricto**: Sin `any`. Props bien tipadas. Condicionales sobre `UserRole` son la base del sistema.
- **Sin comentarios innecesarios**: Solo cuando el WHY no es obvio.
- **Portales**: Menús/modales/popovers siempre con `createPortal` + `position: fixed`.
- **Roles internos**: `userRole` viene de `useState` en `App.tsx` hoy. Cuando llegue backend, se reemplaza por el valor del token — la lógica condicional en componentes no cambia.

---

---

## 13. Capa GPS Multi-Posición en el Mapa (Sesión 6)

### Comportamiento (admin y operador)

Cuando el usuario selecciona un vehículo (click en marker del mapa o expand de tarjeta en panel monitor), si ese vehículo tiene **2 o más GPS con posición**, el mapa muestra:

1. **Polyline punteada azul** conectando todos los GPS en orden (trail de ubicaciones)
2. **Markers GPS individuales** para cada dispositivo con pill de nombre (SVR Plus, SVR Básico, etc.)
3. **Auto-fit de bounds** para centrar el mapa en todos los GPS del vehículo seleccionado

### Clustering de vehículos por zoom (rev 9)

Cuando el usuario aleja el mapa (zoom < `VEHICLE_CLUSTER_ZOOM = 14`), los vehículos cercanos se agrupan en badges azules con contador.

**Lógica:**
- `computeVehicleClusters(zoom)` → grupos usando `vehicleClusterThreshold(zoom) = 0.4 / 2^(zoom-10)`
- Zoom 13: umbral ~0.03°; zoom 12: ~0.06°; zoom 11: ~0.125°
- `VehicleCluster` type: `{ key, center, vehicles[] }`
- `createVehicleClusterIcon(count)` → badge azul (#0052CC) con número + "veh."
- Click en cluster badge → `fitBoundsToVehicleCluster` event → mapa hace zoom in hasta ver vehículos separados

**Cuando hay clustering activo (`vehiclesAreClustered = true`):**
- Capa GPS se oculta completamente (`showGpsLayer = false`)
- `expandedId`, `selectedGpsImei`, `expandedGpsImei`, `spiderfiedClusterKey` se resetean
- Se despacha `vehicleSelected` con `id: null` para limpiar el panel lateral

**Zoom adaptativo GPS markers (rev 8):**
- zoom ≥ 14: card completa (nombre + tiempo + badge estado)
- zoom < 14: `createGpsCompactLabel` — solo pill con nombre + dot

### Distribución de GPS (clustering GPS)

Se eliminó el sistema de clustering/spiderfication por badge. Todos los GPS se muestran **individualmente desde el primer momento**:
- `getGpsSpreadPositions(vehicle.position, count)` distribuye todos los GPS alrededor del vehículo
- 2 GPS → izquierda y derecha; 3+ GPS → círculo equidistante
- Radio: `GPS_SPREAD_RADIUS = 0.0018` grados (~200m)
- Cada GPS tiene su propia línea directa al dot del vehículo (`color="#6366F1"`, `weight:2.5`, `dashArray:"7,5"`)
- **Eliminado**: clustering badge, `computeClusters()`, `gpsDistance()`, `createClusterIcon()`, `GpsCluster`, `spiderfiedClusterKey` state, trail polyline azul

### GPS Highlight y Card — Estados separados (rev 4)

Existen dos estados independientes para el GPS en el mapa:

| Estado | Variable | Quién lo activa | Efecto visual |
|--------|----------|-----------------|---------------|
| `selectedGpsImei` | ping/highlight | `GpsPopover` (sidebar) o click en mapa | Animación pulsante `gps-ping-ring` en el dot del marker |
| `expandedGpsImei` | card abierta | click en marker GPS del mapa | Card expandida `createGpsExpandedIcon` sobre el marker |

- Cuando el usuario expande un GPS en `GpsPopover`, se despacha `gpsDeviceSelected` → solo activa `selectedGpsImei` (ping), **no** abre la card
- Cuando el usuario hace click en un GPS en el mapa → activa `expandedGpsImei` (card) **y** `selectedGpsImei` (ping en el dot de la card)
- `_closeGpsCard()` limpia solo `expandedGpsImei`, el ping se mantiene si el GPS sigue seleccionado en sidebar
- Animaciones CSS inyectadas: `@keyframes gps-ping` + `.gps-ping-ring` + `@keyframes gps-card-pop` + `.gps-card-anim`

### Supresión de card del vehículo cuando tiene multi-GPS (rev 5)

Cuando un vehículo tiene **2 o más GPS con posición** y el usuario lo selecciona:
- La card expandida del vehículo **se oculta** (no se elimina — la lógica sigue intacta en `createCustomIcon`)
- El marker del vehículo muestra el **pill destacado** (borde azul, `isHighlighted=true`) como indicador de selección
- La capa GPS multi-posición toma el rol informativo

**Implementación** en `FleetMap.tsx` — sección `Fleet vehicle markers`:
```ts
const vGpsCount = (vehicle.gpsDevices ?? []).filter(d => d.position != null).length;
const hasMultiGps = isExpanded && vGpsCount >= 2;
createCustomIcon(
  vehicle,
  isExpanded && !hasMultiGps,          // card: solo cuando GPS único o sin GPS
  highlightedId === vehicle.id || hasMultiGps  // pill highlight cuando multi-GPS
)
```

**Pendiente / Mejora futura**: Cuando se resuelva el diseño definitivo de cómo mostrar info del vehículo en el contexto multi-GPS (card diferente, panel integrado, etc.), la lógica de `createCustomIcon` está lista — solo cambiar la condición `isExpanded && !hasMultiGps`.


### Datos de posición GPS

`GpsDevice` ahora tiene `position?: [number, number]`. Vehículos con posiciones asignadas:
- **ANA** (id=1): GPS flotas en `[-12.0450, -77.0400]`, GPS contingencia en `[-12.0350, -77.0280]` (lejos)
- **JUAN** (id=3): 4 GPS distribuidos alrededor de `[-12.049, -77.048]`
- **FLOTA-X** (id=7): 5 GPS — los 2 primeros en `[-12.0460/-12.0461, -77.0460/-77.0461]` (cluster/spiderfy demo), 3 separados

### Nuevos eventos de window

| Evento | Payload | Quién despacha | Quién escucha |
|--------|---------|----------------|---------------|
| `gpsDeviceSelected` | `{ vehicleId, imei \| null }` | `GpsPopover` | `FleetMap` |

### Componentes clave agregados en FleetMap

- `GpsBoundsUpdater` — fitBounds al cambiar vehículo activo con 2+ GPS
- `computeClusters()` — agrupa GPS por proximidad (SPIDERFY_THRESHOLD)
- `getSpiderfyPositions()` — calcula posiciones spread para 2 ó N GPS
- `createGpsIcon()` — marker compacto con pill de tipo + dot coloreado + ping opcional
- `createClusterIcon()` — badge amarillo con count
- `createSpiderfyGpsIcon()` — marker con card extendida para estado spiderfied
- `GPS_LOCATE_SVG()` — SVG helper con el ícono `LocateFixed` de Lucide (círculo grande + 4 líneas externas), igual al que usa VehicleAccordionItem en el botón GPS
- `createGpsExpandedIcon()` — card expandida sobre el marker GPS: ícono GPS coloreado + nombre GPS + badge de estado + coordenadas + última actualización + botón ✕ + pulsing dot en el puntero inferior. Se activa cuando `expandedGpsImei === device.imei`. Llama `window._closeGpsCard()`.
- `createGpsCompactLabel(device)` — etiqueta compacta para zoom bajo (< 14): pill con ícono + nombre del tipo GPS + dot coloreado pequeño. Sin time/status.
- `createGpsMarkerIcon(device, isSelected)` — **estilo completo para zoom alto (≥ 14)** (single y spiderfied): card blanca con radio-10px + ícono LocateFixed + nombre del tipo GPS + tiempo última actualización + badge de estado con color. Dot coloreado en puntero inferior con opcional `gps-ping-ring`. Reemplaza `createGpsIcon` y `createSpiderfyGpsIcon` anteriores.
  - Status badge: fondo `sc.bg`, dot `sc.dot`, texto `sc.text` — colores definidos en `GPS_STATUS_STYLE_STR`
  - `iconSize: [160, 70]`, `iconAnchor: [80, 60]` (anclado en centro del dot inferior)
- No existe panel flotante derecho — toda la info GPS se muestra inline sobre el marker en el mapa.

---

## 14. C-Loc UI — Refinamientos (Sesión 9)

### Colores del layout C-Loc
- **Sidebar** (`SidebarCLoc`): `bg-white` — color neutro para diferenciarse del panel
- **Panel de monitoreo** (`FloatingStats` en modo sidebar): `bg-neutral-50` con `border-r border-neutral-200`
- El sidebar blanco da jerarquía visual: nav (blanco, limpio) vs contenido (neutral-50, sutil)

### Botón Monitor activo en sidebar
- Botón colapsado: `bg-gray-900/[0.06] text-gray-900` cuando `monitorOpen`
- Botón expandido: `bg-gray-900/[0.06] text-gray-900 font-semibold` cuando `monitorOpen`
- Se activa también cuando el buscador está en uso

### Botón colapsar panel
- Posición: `absolute -right-[30px] top-1/2 -translate-y-1/2` relativo al contenedor de búsqueda
- El `pr-[18px]` del header (vs `px-3`) requiere `-right-[30px]` (no `-right-6`)

### Filtros de búsqueda
- Tamaño: `text-[11px]` · Color: `text-neutral-400` (hover: `text-neutral-600`)
- Íconos: `w-3 h-3`, chevrons: `w-2.5 h-2.5`
- Alineados al inicio del ícono del buscador (`pl-3.5`)

### Tarjetas de vehículo C-Loc (VehicleAccordionItem)
- Borde `rounded-lg` (12px, no 18px), margen `mx-3 mb-2`
- Contraída: `border-neutral-200 hover:border-neutral-300 hover:shadow-sm`
- Expandida: `border-blue-200 shadow-[0_2px_12px_rgba(59,130,246,0.08)]`
- Padding ZONA 1: `py-3 px-3`; contenido expandido: `px-3 pt-0 pb-3`
- GPS button bottom: `pb-[2px]`

### Ícono PIN en tarjeta anclada
- `Pin` (Lucide) en `top-2 right-2` dentro de la tarjeta (no fuera — `overflow-y:auto` clipea overflow)
- `rotate-45`, `w-3.5 h-3.5`, `fill-neutral-900 text-neutral-900`, `z-10`
- Primera tarjeta anclada: el icono puede quedar detrás del sticky header — solución: icono dentro de la tarjeta (no en borde superior)

### Sección sticky de anclados
- `z-[60]` para superar GPS badges (`z-50`)
- `bg-neutral-50` (mismo color que panel) para opacar las tarjetas que pasan por debajo
- Separador inferior `border-b border-neutral-100` solo cuando hay ancladas

### Toggle claro/oscuro — arquitectura (Sesión 10; `FloatingStats` y `clocDark` son históricos, ver Sesión 26 abajo)
`isDark` vive en `App.tsx` y se pasa en cascada:
- `SidebarCLoc` recibe `isDark` + `onToggleDark` como props (no tiene estado propio)
- `FloatingMonitor` (sucesor de `FloatingStats`) lee `isDark` vía `ThemeContext`/`useTheme()` y aplica estilos al panel + pasa a `VehicleAccordionItem`
- `VehicleAccordionItem` recibe `isDark` y lo usa directo (antes calculaba `clocDark = isCloc && isDark`; desde la Sesión 26 `isCloc` ya no existe — siempre es C-Loc)

**Paleta oscura (c-loc)**:
- Panel: `bg-neutral-800 border-neutral-700`
- Search bar: `bg-neutral-700` · texto `text-neutral-100` · placeholder `text-neutral-500`
- Tarjetas: `bg-neutral-700 border-neutral-600`; expandida `border-blue-500/30`
- Texto primario: `text-neutral-50` · secundario: `text-neutral-400` · terciario: `text-neutral-500`
- Ignición activa: `bg-emerald-900/30 text-emerald-400` · inactiva: `bg-red-900/30 text-red-400`
- GPS button: `bg-neutral-800 border-neutral-600`
- Acciones zona 3: `text-neutral-400` · hover parqueo/bloquear: `text-red-400 bg-red-900/20`
- **Brand color en dark**: `text-brand` (#0052CC) tiene bajo contraste en fondos oscuros → se usa `text-blue-400` (#60A5FA) como variante accesible. Helpers en VehicleAccordionItem: `brandCls` y `brandHover`
- Borde tarjeta expandida dark: `border-blue-400/60` (más visible que blue-500/30)

### Estilo sidebar oscuro (guardado para versión futura)
Colores del sidebar en modo oscuro (disponible para implementar un toggle claro/oscuro):
- Sidebar: `bg-gray-900` | texto: `text-gray-100` | activo: `bg-white/10`
- Logo expandido: filter `brightness(0) invert(1)` | logo colapsado: igual
- Separadores: `border-gray-700`

---

## 15. Animación de Vehículos en Carreteras (Sesión 10)

### Comportamiento

Los vehículos posicionados en carreteras (IDs 70–85) se mueven automáticamente a lo largo de sus rutas definidas, actualizando posición cada **2 segundos**.

### Archivos

| Archivo | Propósito |
|---------|-----------|
| `src/shared/lib/paths.ts` | Definición de waypoints por vehículo + velocidad |
| `src/shared/lib/VehicleContext.tsx` | Contexto React + `setInterval` de animación |
| `src/App.tsx` | Envuelve `FleetMap` + `FloatingStats` con `VehicleProvider` |

### Cómo funciona

1. **`paths.ts`** exporta `VEHICLE_PATHS: Record<string, VehiclePath>` con arrays de `[lat, lng]` waypoints por vehículo.
2. **`VehicleContext.tsx`** provee un array `Vehicle[]` reactivo que:
   - Inicia clonando `FLEET_DATA` con posiciones interpoladas aleatoriamente en las rutas
   - Cada 2s avanza `segProgress` en 0.07 por segmento
   - Al completar un segmento (`progress >= 1`), pasa al siguiente (en bucle)
   - Interpola `[lat, lng]` linealmente entre waypoints
   - Actualiza `speed`, `direction`, `coords`, `lastSeen` y `status` en cada tick
3. **`FleetMap.tsx`** y **`FloatingStats.tsx`** consumen `useVehicles()` en lugar del `FLEET_DATA` estático.

### Vehículos animados (16)

| ID | Nombre | Ruta | Velocidad |
|----|--------|------|-----------|
| 70 | FERNANDO | Carretera Central (7 waypoints) | 5 seg/seg |
| 71 | SILVIA | Carretera Central (4 wp) | 4 |
| 72 | ELOY | Carretera Central (4 wp) | 6 |
| 73 | HUMBERTO | Panamericana Norte (5 wp) | 8 |
| 74 | ROXANA | Panamericana Norte (4 wp) | 10 |
| 75 | ELISA | Panamericana Sur (4 wp) | 7 |
| 76 | FAUSTO | Panamericana Sur (4 wp) | 8 |
| 77 | BETTY | Panamericana Sur (4 wp) | 6 |
| 78 | DANIEL | Interoceánica Sur (4 wp) | 4 |
| 79 | OLGA | Interoceánica Sur (4 wp) | 3 |
| 80 | ISRAEL | F. Belaúnde (4 wp) | 5 |
| 81 | GRACIELA | F. Belaúnde (4 wp) | 6 |
| 82 | ALFREDO | Tingo María (4 wp) | 4 |
| 83 | RAUL | Puno-Desaguadero (4 wp) | 7 |
| 84 | TANIA | Arequipa-Moquegua (4 wp) | 9 |
| 85 | ZULEMA | Ica-Nazca (4 wp) | 10 |

### Variables de estado (VehicleContext)

```typescript
type AnimState = {
  segIdx: Record<string, number>;     // índice del segmento actual por vehicle.id
  segProgress: Record<string, number>; // progreso 0–1 dentro del segmento
};
```

- `animRef` (useRef): mutable, evita stale closures
- `vehicles` (useState `Vehicle[]`): array reactivo que dispara re-renders
- `setInterval` cada 2000ms: avanza `segProgress += 0.07`, hace wrap al completar

### Funciones helper

- `bearing(lat1, lng1, lat2, lng2)`: calcula dirección cardinal (N, NE, E, SE, S, SO, O, NO)
- `interpolatePosition(vehicle, segIdx, segProgress)`: produce un Vehicle con posición interpolada + datos derivados
- `formatTime(d)`: `dd/Mon/yyyy hh:mm:ss am/pm`

---

## 16. Asistente de Voz IA (Sesión 16)

### Componente `AIAssistant.tsx`

Asistente conversacional integrado en el mapa de C-Loc. Combina reconocimiento de voz (Groq Whisper), LLM (Groq Llama), y TTS nativo del navegador.

**Archivo:** `src/shared/components/AIAssistant.tsx`

**Flujo:**
1. Usuario abre el asistente → `isActiveRef.current = true`
2. `startListening()` → graba audio con `MediaRecorder`
3. Al detectar silencio (`VAD`) → para grabación
4. `MediaRecorder.onstop` → envía audio a Groq Whisper (si `!skipTranscribe`)
5. Texto transcrito → `fleetAgent()` → respuesta del LLM
6. TTS: `speechSynthesis.speak()` con la respuesta
7. Al terminar TTS → vuelve a `startListening()` (si `isActiveRef.current`)

**Guards de seguridad:**
- `isActiveRef = useRef(false)` — previene que cualquier callback reinicie el mic después del cierre
- `blockedUntilRef = useRef(0)` — bloquea llamadas a Groq 60s después de un error 429
- `switchToTyping()` — para mic/TTS sin cerrar el asistente; habilita entrada de texto

**Detección de voz (VAD):**
- `THRESHOLD = 0.20`, `FRAMES_NEEDED = 12` — umbral alto para entornos ruidosos
- `AudioContext` con filtro high-pass a 120Hz
- `noiseSuppression: true`, `echoCancellation: true`, `autoGainControl: false`
- `skipTranscribe` flag — evita llamar a Whisper si no hay habla detectada
- Timeouts: `MAX_SESSION_MS = 15000` (sesión máx), `NO_SPEECH_MS = 8000` (sin voz)

**Rate limiting Groq:**
- Modelo: `meta-llama/llama-4-scout-17b-16e-instruct` (30K TPM)
- Error 429 → `blockedUntilRef = Date.now() + 60000`
- Si la segunda llamada LLM falla con 429 → retorna el resultado del tool directamente (la navegación ya ocurrió)
- Sin cooldown preventivo (fue eliminado por ser molesto)

**Interacción:**
- Click en contenedor de input → `switchToTyping()` → deshabilita mic, enfoca texto
- Botón X → `isActiveRef = false` → detiene todo
- `Ctrl+B` (solo c-loc) → abre asistente o re-enfoca búsqueda

### `src/shared/lib/fleetAgent.ts`

Agente LLM con herramientas de flota:
- `navigateToVehicle(id)` → despacha `vehicleSelected` + `flyToVehicle`
- Modelo comentado para referencia: `llama-3.3-70b-versatile` (12K TPM), `llama-3.1-8b-instant` (6K TPM)
- Modelo activo: `meta-llama/llama-4-scout-17b-16e-instruct` (30K TPM)

---

## 17. Dark Mode Completo — Paleta Zinc (Sesión 16)

### Arquitectura

`isDark` vive en `App.tsx`. Se distribuye de dos formas:
1. **Props** → `SidebarCLoc`, `FloatingMonitor` (prop directa)
2. **ThemeContext** → `FleetMap`, `StatCard`, `VehicleAccordionItem` (via `useTheme()`)

### `ThemeContext.tsx`

```typescript
// src/shared/lib/ThemeContext.tsx
import { createContext, useContext } from 'react';
interface ThemeContextValue { isDark: boolean; }
export const ThemeContext = createContext<ThemeContextValue>({ isDark: false });
export function useTheme() { return useContext(ThemeContext); }
```

`App.tsx` envuelve el perfil c-loc en `<ThemeContext.Provider value={{ isDark }}>`.

### Paleta oscura — zinc (no neutral)

La paleta `zinc` tiene un tono azul-gris sutil más cálido que `neutral`, consistente con los tiles de Stadia Maps.

| Token | zinc (usado) | neutral (descartado) | Color hex |
|-------|-------------|---------------------|-----------|
| Root bg | `zinc-950` | `neutral-950` | `#09090b` |
| Superficies | `zinc-900` | `neutral-900` | `#18181b` |
| Cards/paneles | `zinc-800` | `neutral-800` | `#27272a` |
| Bordes | `zinc-700` | `neutral-700` | `#3f3f46` |
| Texto primario | `zinc-100` | `neutral-100` | `#f4f4f5` |
| Texto secundario | `zinc-400` | `neutral-400` | `#a1a1aa` |
| Texto terciario | `zinc-500` | `neutral-500` | `#71717a` |

### Componentes con dark mode

| Componente | Implementación |
|-----------|---------------|
| `App.tsx` | Root div: `bg-zinc-950` en dark |
| `FloatingMonitor.tsx` | Prop `isDark`; pill, panel, search, filtros, lista — todo zinc |
| `FleetMap.tsx` | `useTheme()`; botones de zoom, card de vehículo, menú ⋮ — zinc |
| `StatCard.tsx` | `useTheme()`; `bg-zinc-900/85 border-zinc-700/60`, textos zinc |
| `VehicleAccordionItem.tsx` | usa `isDark` directo (antes `clocDark = isCloc && isDark`, simplificado en Sesión 26); todos `neutral-*` → `zinc-*` |
| `SidebarCLoc.tsx` | Props `isDark` + `onToggleDark`; toggle sol/luna |

### Mapa oscuro

- Estado local `mapDark` (independiente de `isDark` global)
- `useEffect` sincroniza `mapDark` con `isDark` cuando cambia el tema global
- El usuario puede cambiar el tile del mapa independientemente con el botón sol/luna
- **Dark**: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png` (Google Maps-like, grafito cálido)
- **Light**: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
- `key={mapDark ? 'dark' : 'light'}` en `TileLayer` fuerza remount al cambiar tema
- Botón sol/luna posicionado encima de los controles de zoom, con separador visual

---

## 18. `FloatingMonitor.tsx` — Panel Flotante de Búsqueda (Sesión 16+)

Panel draggable que reemplaza al `FloatingStats` como monitor de flota principal en C-Loc.

**Archivo:** `src/shared/components/FloatingMonitor.tsx`

### Props

```typescript
interface FloatingMonitorProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  userRole: UserRole;
  isDark?: boolean;       // prop ignorada — lee de ThemeContext vía useTheme()
  onSideChange?: (side: 'left' | 'right', width: number) => void;
}
```

### Comportamiento

**Dos estados visuales (Framer Motion `AnimatePresence`):**
- **Pill** (colapsado): barra de búsqueda inerte con hint `[Ctrl][B]`, ancho `panelW`
- **Panel** (expandido): búsqueda activa + filtros + lista de vehículos acordeón

**Posicionamiento draggable:**
- `absolute top-4 left-0 z-10` dentro del `<main>` del mapa
- Drag horizontal libre; al soltar (`handleDragEnd`) hace snap a izquierda o derecha según el punto medio
- `snapTo(side)` usa `snapControls` (Framer `useAnimationControls`) para animación spring
- `currentSideRef` persiste el lado activo; `onSideChange` notifica a `App.tsx` para ajustar `FleetMap`
- `ResizeObserver` sobre el parent recalcula `panelW` y reposiciona al cambiar tamaño de ventana
- `PANEL_W_MAX = 306`, `EDGE_GAP = 16`

**Filtros:**
- **Estado** (`StatusFilter`): Todos · En ruta · Detenido · Sin señal
- **Tipo** (`TypeFilter`): Todos · Moto · Auto · Camión · Bus
- Filtros activos muestran chips animados con botón ✕ individual
- Dropdown "Más" presente pero sin implementar aún

**Lista de vehículos:**
- Consume `useVehicles()` (animados) — no usa `FLEET_DATA` directo
- Filtra por `searchQuery` (placa o nombre), `statusFilter`, `typeFilter`
- Ordenada: anclados (sticky con `bg-zinc-900/95` o `bg-white/90`) → no anclados
- `pinnedVehicleIds: Set<string>` — inmutable por spread; separador `bg-brand/15` debajo de anclados
- `showScrollHint`: chevron animado bouncing cuando hay contenido fuera del viewport

**Teclado:**
| Atajo | Acción |
|-------|--------|
| `↑` / `↓` | Navega entre tarjetas (`highlightedIndex`) |
| `Enter` | Expande tarjeta + `flyToVehicle` |
| `Ctrl+F` | Enfoca input de búsqueda |
| `Ctrl+P` | Ancla/desancla el vehículo resaltado |
| `Escape` | Cierra el panel |
| `focusMonitorSearch` (evento) | Enfoca input (usado por Ctrl+B desde App.tsx) |

**Opacidad en movimiento del mapa:**
- `mapMoving` escucha `mapMoveStart` / `mapMoveEnd`
- Cuando `mapMoving === true`: `opacity: 0`, `pointerEvents: none` — panel se oculta para no obstruir

**Altura máxima adaptativa:**
- Card de vehículo abierta en mapa: `calc(100vh - 233px)`
- Sin card: `calc(100vh - 88px)`
- Detecta evento `vehicleSelected` con `source === 'marker'`

**Dark mode:** lee `isDark` de `ThemeContext` (`useTheme()`). Toda la paleta usa zinc (ver sección 17).

---

## 19. Módulos de Desarrollo (Sesión 3+)

Dos componentes visibles únicamente cuando `userRole === 'developer'`. Se acceden desde el Sidebar como vistas (`activeView`).

### `CardPreviewModule.tsx`

**Propósito:** Sandbox visual para iterar el diseño de `VehicleAccordionItem` sin necesidad de datos reales.

**Archivo:** `src/shared/components/CardPreviewModule.tsx`

**Contenido:**
- Selector de rol (`admin | esad | operator | client`) — cambia las props de todas las tarjetas simultáneamente
- Grid 2×2 con las 4 variantes de `reportStatus`: `reporting · low-signal · no-signal · disconnected`
- Cada celda genera un `Vehicle` demo via `makeVehicle(overrides)` con datos fijos (placa `ABC-123`, propietario `Empresa Demo SAC`)
- Instancia `VehicleAccordionItem` real — lo que se ve aquí es idéntico a producción
- Historial simplificado (sin tags de componente) de sesiones 4–7

**No tiene props** — es una vista autónoma.

---

### `HistorialModule.tsx`

**Propósito:** Changelog navegable de todas las sesiones de desarrollo, con filtro por componente.

**Archivo:** `src/shared/components/HistorialModule.tsx`

**Estructura de datos:**
```typescript
interface ChangeEntry {
  session: string;   // 'Sesión 7'
  date: string;      // '14 may 2026'
  changes: {
    text: string;
    component: string;   // 'FleetMap' | 'GpsPopover' | ...
    profile?: string;    // 'c-go' | 'c-loc'
    role?: string;       // 'esad' | 'developer' | ...
  }[];
}
```

**7 sesiones registradas** (Sesión 1–7) con **metadata por cambio**: componente afectado, perfil y rol opcionales.

**Filtro por componente:** chips de todos los componentes únicos (`ALL_COMPONENTS`), toggle individual — filtra en tiempo real sin perder el contexto de sesión.

**No tiene props** — es una vista autónoma.

---

## 20. Utilidades de IA y Rutas

### `fleetKnowledge.ts` — Base de Conocimiento del Agente

**Archivo:** `src/shared/lib/fleetKnowledge.ts`

Exporta la constante `FLEET_KNOWLEDGE: string` — un string markdown usado como **system prompt** del agente IA en `fleetAgent.ts`.

**Contenido del knowledge base:**
- Descripción de la plataforma CLocater (contexto de dominio peruano)
- Tabla de tipos de vehículo (`car | motorcycle | truck | bus | machinery`)
- Estados y su significado (`active | stopped | offline`)
- Campos disponibles por vehículo con ejemplos
- 6 tipos de alertas automáticas (geocerca, velocidad, horario, etc.)
- Reglas de parseo de placas peruanas desde voz (`"MOT guion novecientos uno" → MOT-901`)
- Operaciones disponibles para el asistente: `navigate_to_vehicle`, `get_vehicle_info`, `get_fleet_summary`, `list_vehicles_by_status`
- Contexto operativo: zona horaria UTC-5, idioma español peruano, intervalo de actualización

**Separación de responsabilidades:** este archivo solo contiene el conocimiento de dominio. La lógica del agente (tools, llamadas LLM, tool_use loop) vive en `fleetAgent.ts`.

---

### `routeFetcher.ts` — Cliente OSRM

**Archivo:** `src/shared/lib/routeFetcher.ts`

Cliente HTTP para calcular rutas reales por carretera usando la API pública de OSRM.

```typescript
// Base: https://router.project-osrm.org/route/v1/driving

export async function fetchRoute(
  waypoints: [number, number][]
): Promise<[number, number][] | null>
// Recibe array de [lat, lng], convierte a lng,lat para OSRM, retorna ruta decodificada [lat, lng][]

export async function fetchAllRoutes(
  paths: Record<string, [number, number][]>
): Promise<Record<string, [number, number][]>>
// Fetch paralelo (Promise.allSettled) para todos los vehículos animados
// Solo incluye en el resultado los vehículos con ruta exitosa
```

**Parámetros OSRM:** `geometries=geojson&overview=full&alternatives=false&steps=false`

**Uso:** `VehicleContext.tsx` llama `fetchAllRoutes(VEHICLE_PATHS)` al iniciar para reemplazar los waypoints rectos de `paths.ts` con geometrías que siguen las carreteras reales. Si la llamada falla (sin internet, OSRM caído), los vehículos animados siguen con las líneas rectas de `paths.ts` como fallback.

---

## 21. Panel "Eventos del viaje" — Filtros por tipo de evento (Sesión 25)

**Archivo:** `src/shared/components/vehicle-detail/VehicleTripView.tsx`

Al expandir un viaje en `TripPanel` y abrir sus eventos, el panel intermedio "Eventos del viaje" muestra un filtro por tipo de evento (`TripEventType`: `speeding | hard_braking | harsh_acceleration | sharp_turn`).

**Antes:** grid 2×2 fijo de tags, uno por tipo — se rompía visualmente si la cantidad de tipos cambiaba.

**Ahora:** dos pills, mismo estándar visual que los filtros Hoy/Todos/Fecha de `TripPanel`:
- **Todos**: limpia el filtro (`activeEventTypes` vacío → se listan todos los tipos).
- **Filtrar**: abre un dropdown (mismo patrón que el dropdown de Fecha) con checkboxes por tipo de evento — **multi-selección**. El texto del botón se mantiene fijo ("Filtrar"); cuando hay 1+ filtros activos, antepone el contador en negrita: `02 Filtrar`.

**Estado:** `activeEventTypes: Set<TripEventType>` (antes `activeEventType: TripEventType | null`). Conjunto vacío = sin filtro = se muestran todos los eventos.

**Propagación a mapa:** `VehicleTrackingMap` recibe la prop `activeEventTypes: Set<TripEventType>` (default `new Set()`) y la pasa a `EventMarkers`, que calcula `isActive = activeEventTypes.size === 0 || activeEventTypes.has(group.type)` para decidir el estilo (activo/dimido) de cada marcador en el mapa — los markers de tipos no incluidos en el filtro no se ocultan, se muestran atenuados.

**Click en marcador del mapa (`selectEventFromMap`):** al hacer click en un evento desde el mapa, el filtro se reemplaza por `new Set([type])` (el tipo de ese evento) para asegurar que la instancia clickeada sea visible en la lista del panel.

---

## 22. Eliminación de la plataforma C-Go (Sesión 26)

### Motivo
Decisión del usuario: dejar de mantener dos plataformas (C-Go y C-Loc) y consolidar el proyecto en una sola — C-Loc. Instrucción literal: *"vamos a eliminar todo lo relacionado a c-go sin tocar o afectar c-loc, para quedarnos con un solo proyecto"*.

### Alcance del cambio
1. **Borrado de `src/c-go/`** completo (`Header.tsx` / `HeaderCGo`, `Sidebar.tsx`) y de la rama de layout C-Go en `App.tsx`.
2. **Archivos huérfanos solo-C-Go eliminados** (componentes/recursos que solo existían para dar soporte a esa rama, incluido `src/img/logo.png`, sin más referencias en el código).
3. **Quitado el prop `profile` / `AppProfile` y toda condicional `profile === 'c-go'` / `isCloc` / `clocDark`** de los componentes shared:
   - `VehicleAccordionItem.tsx` — badge de ignición y visibilidad de telemetría simplificados a comportamiento único (antes condicionado a `profile`/`userRole`).
   - `GpsBadgeTooltip.tsx` — quitado el prop `profile` y el guard `profile === 'c-go' && userRole === 'client'`.
   - `GpsPopover.tsx` — quitado `profile`, `isCloc`, `clocDark`; colapsado el posicionamiento (`calcPos`) a la única lógica de anclaje a `[data-floating-monitor]`; eliminada la rama de telemetría exclusiva de operador C-Go y el filtrado de dispositivos `contingencia`.
   - `GpsActionMenu.tsx` — quitado `profile`, `isCloc`, `isOperatorCGo`; el filtro de la acción "Comando" y el ocultamiento de "Copiar información" se eliminaron (ahora siempre visibles).
   - `FleetMap.tsx` — `GpsBoundsUpdater` y `FleetMap` ya no reciben `profile`; el cálculo de bounds quedó con la única fórmula (la de C-Loc).
4. **`UserMenu.tsx` simplificado**: se eliminó `export type AppProfile`, el array `PROFILES`, el estado `profileExpanded` y todo el bloque JSX del switcher de plataforma (ícono `Monitor`). El componente ahora solo expone el switcher de **Rol**. `ui/index.ts` ya no reexporta `AppProfile`.
5. **`src/c-loc/components/Header.tsx` (`HeaderCLoc`)** — confirmado código muerto (no se importa desde ningún punto activo de la app; `App.tsx` solo usa `SidebarCLoc`). Se actualizó su firma para no romper el build (quitado `onProfileChange`/`AppProfile`), sin que esto afecte comportamiento ni apariencia de C-Loc en runtime.
6. **`App.tsx`** — se detectó y corrigió una regresión real no relacionada (import faltante de `StatCard`, usado en 5 lugares del JSX) durante la verificación de build.

### Verificación
- `npx tsc --noEmit`: solo quedan errores **pre-existentes y no relacionados** (confirmado comparando contra el baseline con `git stash`): módulos de imagen no tipados y namespace `React` faltante en `Sidebar.tsx`/`main.tsx`/`PeajesPanel.tsx`/`TripStatsRow.tsx`/`VehicleTabBar.tsx`, más 3 errores de tipo `key` en `Sidebar.tsx`.
- `npm run build` (vite): build exitoso, sin errores bloqueantes (solo el warning preexistente de tamaño de chunk).
- Grep global de `profile|isCloc|clocDark|AppProfile|c-go` en `src/`: cero coincidencias fuera de comentarios/strings ya removidos.

### Qué NO cambió
- Ningún comportamiento, layout ni estilo visible de **C-Loc** fue alterado — todas las ramas condicionales colapsaron a la rama que ya correspondía a C-Loc.
- `definicion.md` conserva sus secciones históricas sobre diferencias C-Go/C-Loc como registro de decisiones de producto pasadas; no se reescribió porque documenta decisiones ya tomadas, no el código vigente.

*Fin del documento contexto.md*
