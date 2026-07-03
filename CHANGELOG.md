# CHANGELOG

Todos los cambios notables en el proyecto C-Locater serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — 2026-06-19 (Sesión 29)

#### Dashboard — Nueva vista de resumen operativo
- **Vista Dashboard** (`src/shared/components/DashboardView.tsx`): primera vista de la navegación. Header con badge "En tiempo real", 5 KPI cards en fila, mapa mundial Leaflet con burbujas de conteo por país, y panel lateral con total km y distribución de unidades por país
- **5 KPI cards**: Total unidades · Activos · Detenidos · Sin señal · Con alarma — calculadas con `useMemo` sobre `FLEET_DATA`
- **Mapa mundial**: `MapContainer` react-leaflet, zoom=3, tiles CartoDB `light_nolabels`/`dark_nolabels` según `isDark`. Burbujas `L.divIcon` escaladas por magnitud (34/42/52px), colores únicos por país, `Tooltip` en hover
- **Nav item**: `LayoutDashboard` de lucide-react, label "Dashboard", shortcut `D`, posición 0 en `NAV_ITEMS` (sobre "Explorar")
- **Shortcut D**: handler de teclado `'d'/'D'` → `onViewChange('dashboard')` en `Sidebar.tsx`

### Added — 2026-06-19 (Sesión 28)

#### VehicleCaptureView — Módulo de Parqueo Seguro
- **Dock picker del panel "Posiciones"**: handle `GripVertical` en el header abre un popover con tres opciones de posición — Izquierda (default), Derecha, Abajo del panel de info. Cada opción muestra un mini diagrama SVG del layout resultante
- **Colapso automático del sidebar** al abrir la vista de captura (mismo comportamiento que viajes). `App.tsx` despacha `collapseSidebar`/`restoreSidebar` vía `prevCaptureRef` al cambiar `activeCaptureId`
- **Restricción de altura** para la opción "Abajo": `ResizeObserver` sobre el contenedor detecta altura < 480px y deshabilita la opción con `opacity-35` y tooltip. Si el dock activo era "Abajo" al encogerse, se resetea automáticamente a "Izquierda"
- **Scroll hint reactivo al dock**: la flecha `ChevronDown` de scroll se re-evalúa con 120ms de delay al cambiar de posición del dock, para adaptarse a la nueva altura disponible del panel

### Changed — 2026-06-19 (Sesión 28)

#### VehicleCaptureView — Layout y comportamiento
- **Layout unificado**: se eliminaron los dos bloques responsivos (`2xl:hidden` / `hidden 2xl:grid`) y se reemplazaron por un único layout flex de tres columnas que siempre usa tres columnas (sidebar 322px | posiciones 260px | mapa flex-1), controlado por el estado `positionsDock`
- **Ancho del panel de posiciones**: estandarizado a 260px en ambas posiciones (izquierda y derecha) para consistencia visual
- **Dock "Abajo"**: el panel de posiciones usa `flex-1 min-h-[160px]` para adaptarse al espacio disponible. El `VehicleDetailPanel` usa `grow-0 shrink` para tomar solo su altura de contenido natural, sin dejar espacios vacíos. Cuando el operador colapsa secciones del sidebar, el panel de posiciones sube automáticamente
- **Preservación de estado interno de `VehicleDetailPanel`**: se eliminó el ternario que creaba dos ramas del árbol React. Ahora `VehicleDetailPanel` siempre está en el mismo nodo; solo el wrapper CSS cambia según el dock. Esto preserva el estado de tabs y acordeones al cambiar de posición del panel

### Fixed — 2026-06-19 (Sesión 28)

#### VehicleCaptureView
- **Panel "Posiciones" aparecía debajo del mapa** en pantallas <2xl: el bloque `<2xl` usaba `flex-col` con posiciones al fondo. Restructurado a tres columnas en fila
- **Duplicación del contenido al alejar el zoom**: `style={{ display: 'flex' }}` en el div `<2xl` sobreescribía `2xl:hidden` causando que ambos bloques (`<2xl` y `2xl+`) renderizaran simultáneamente. Eliminado el inline style
- **Estado de acordeones/tabs reseteado al cambiar dock**: el ternario `positionsDock === 'below-sidebar' ? ... : ...` desmontaba y remontaba `VehicleDetailPanel`. Eliminado el ternario; el componente ya no se desmonta al cambiar de dock

### Added — Sesiones anteriores
- CHANGELOG.md para trackear cambios del proyecto a partir de ahora
- STATUS.md para documentar el estado actual del proyecto

### Changed — Sesiones anteriores
- CaminosModule: rediseño completo de la barra de acciones masivas para alinearla con el design system de shadcn (fondo slate-50, bordes slate-200, sombra elevada, uso de Button component con iconos, más altura)
- CaminosModule: iconos de ordenamiento de columnas ahora siempre visibles (opacity-40) en vez de solo al hover
- CaminosModule: reorden de columnas a Ruta → Empresa → Grupo
- CaminosModule: reducción de tamaños de texto en headers, celdas, badges y botones para consistencia tipográfica
- CaminosModule: botones de acción con size="icon" para más padding
- CaminosModule: botón "Limpiar" en variante danger (rojo)
- VehicleTripView: dropdown de filtro de eventos rediseñado — checkbox hand-made reemplazado por `<Checkbox size="sm">` de la librería, panel alineado al estilo FloatingMonitor (rounded-lg, shadow-[0_4px_20px_rgba(0,0,0,0.18)], rounded-md en opciones)

### Fixed — Sesiones anteriores
- CaminosModule: checkbox del header ya no se desplaza al cambiar de estado (wrapper flex items-center justify-center dentro de th/td)
- CaminosModule: estilo del checkbox indeterminate corregido
- CaminosModule: eliminado transition-colors de rows y checkbox que causaba micro-movimientos

### Removed — Sesiones anteriores
- CaminosModule: sombras del SegmentedControl

## [0.0.0] - 2026-05-05
### Added
- Configuración inicial del proyecto con React 19, TypeScript, Vite 6
- Componentes core: App.tsx, Sidebar, Header, FleetMap, FloatingStats, CaminosModule, NuevoGrupoModule
- Biblioteca de componentes UI (Badge, Button, Checkbox, etc.)
- Integración de TailwindCSS v4, Leaflet, React-Leaflet
- Estructura básica del proyecto y README con roadmap

> Nota: Los cambios anteriores al 2026-05-05 no están registrados en este changelog.
