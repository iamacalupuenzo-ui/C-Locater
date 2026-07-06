# Definición de Producto — CLocater

> Decisiones de UX, roles, perfiles y visibilidad de datos.
> **Nota histórica:** C-Go fue eliminado del código en la Sesión 26. Las secciones 3, 5, 6 y 7 de este documento se conservan como registro de decisiones de producto pasadas, pero ya no reflejan el código vigente — el proyecto es mono-plataforma (C-Loc).

---

## 1. Perfiles de la Aplicación 2ddadadadadad

La app tiene **2 perfiles** que determinan el layout y el tipo de herramienta:

| Perfil | ID | Para quién | Layout |
|--------|----|------------|--------|
| **C-Go** | `c-go` | Operaciones / Conductores | Header top con logo · Sidebar 72px fijo |
| **C-Loc** | `c-loc` | Monitoreo / Control | Sidebar expandible con logo · Header sin logo |

- El perfil activo se gestiona en `App.tsx` como estado `profile: AppProfile`.
- El cambio de perfil está disponible en el `UserMenu` **solo para usuarios con `isAdmin: true`**.
- Los perfiles comparten los mismos módulos funcionales (`FleetMap`, `FloatingStats`, `CaminosModule`) pero con distintos layouts y navegación.

---

## 2. Roles de Usuario

La app tiene **5 roles de sistema** que determinan qué datos y acciones ve cada usuario:

| Rol (etiqueta UI) | ID interno | Descripción |
|-------------------|------------|-------------|
| **Administrador** | `admin` | Visión operativa y de gestión. Ve métricas de negocio y alertas |
| **ESAD** | `esad` | Operador de Central de Monitoreo. Card compacta especializada, sin Zona 3, acciones en menú ⋮ |
| **Concesionaria** | `operator` | Visión técnica completa. Ve telemetría del vehículo |
| **Cliente Directo** | `client` | Visión reducida. Ve solo lo necesario para su operación |
| **Desarrollador** | `developer` | Acceso interno para testing — mismo acceso que admin |

> **Nota de nomenclatura (Sesión 4):** Las etiquetas visibles en la UI se alinearon con la terminología del negocio (Administrador / Concesionaria / Cliente Directo). Los IDs internos (`admin` / `operator` / `client`) se mantienen sin cambio para no afectar condicionales ni lógica de componentes. El mapeo se documenta en esta tabla.

### Definición de roles

- Los roles son **internos al sistema**: vienen asignados desde el backend en el login (token de sesión).
- No existe panel de administración de usuarios todavía — es una feature futura.
- En desarrollo, el rol se controla desde `App.tsx` (`useState<UserRole>`).
- El cambio de rol en la UI es solo para **testing/desarrollo**, disponible desde el `UserMenu`.

---

## 3. Visibilidad por Rol — Perfil C-Go

### 3.1 Métricas de telemetría en el acordeón de vehículos (`FloatingStats`)

Cada vehículo expandido muestra una barra de métricas. El contenido varía según el rol:

| Métrica | `admin` | `operator` | `client` |
|---------|:-------:|:----------:|:--------:|
| Velocidad | ✅ | ✅ | ✅ |
| Dirección | ❌ | ✅ | ✅ |
| Odómetro | ❌ | ✅ | ✅ |
| Batería | ✅ | ✅ | ✅ |
| **Conteo de alarmas** | ✅ | ❌ | ❌ |

**Notas de implementación:**
- `admin`: 3 métricas → Velocidad · Batería · Alarmas
- `operator` / `client`: 4 métricas → Velocidad · Dirección · Odómetro · Batería
- La métrica de alarmas usa ícono `Bell` en naranja con badge de conteo
- Si `alarmCount === 0` muestra "Sin eventos"; si `> 0` muestra "N eventos" en naranja
- `alarmCount` vive en `FLEET_DATA` (`shared/lib/data.ts`)
- La **Batería** se muestra siempre con color dinámico (ver sección 7)

**Nomenclatura fija:** `vehicle.name` es el **Alias** del conductor en todas las plataformas y roles. Nunca se etiqueta como "Conductor" en la UI ni en textos copiados. El campo `vehicle.owner` es el propietario del vehículo (empresa o persona).

### 3.2 Panel de GPS por vehículo

**Visibilidad del panel GPS por rol (C-Go):**

| Elemento | `admin` | `operator` | `client` |
|----------|:-------:|:----------:|:--------:|
| Badge GPS en ícono (contador) | ✅ todos | ✅ sin contingencia | ❌ |
| Botón "Ver dispositivos GPS" | ✅ todos | ✅ sin contingencia | ❌ |
| SVR Básico en GpsPopover | ✅ | ✅ | ❌ |
| SVR Plus en GpsPopover | ✅ | ✅ | ❌ |
| SVR X en GpsPopover | ✅ | ✅ | ❌ |
| **SVR Contingencia en GpsPopover** | ✅ | ❌ | ❌ |

**Motivo de la restricción:** SVR Contingencia es un servicio de respaldo operativo/de emergencia. El operador no necesita visibilidad directa de este dispositivo — su existencia es transparente para él. Solo el admin tiene visión completa de todos los receptores del vehículo.

**Implementación:** El badge y botón muestran `visibleGpsCount` (count de devices no-contingencia para operator). `GpsPopover` filtra `d.type !== 'contingencia'` cuando `profile === 'c-go' && userRole === 'operator'`.

**Diferencia por rol dentro de cada dispositivo GPS (C-Go — admin):**

| Elemento | Comportamiento |
|----------|---------------|
| Debajo del badge de estado | Fecha y hora completa → `Jue 5 may 2026 • 9:14 AM` (`mt-[2px]` de separación) |

**Métricas en vista expandida del dispositivo GPS:**

Varía según rol en C-Go. En C-Loc y admin C-Go: 3 métricas. En operator C-Go: 4 métricas (igual que su card de vehículo, sin eventos).

| Métrica | Ícono | `admin` / C-Loc | `operator` C-Go |
|---------|-------|:---------------:|:---------------:|
| Velocidad | `Gauge` | ✅ | ✅ |
| Dirección | `Compass` | ❌ | ✅ (`vehicle.direction`) |
| Odómetro | `Activity` | ❌ | ✅ (`vehicle.odometer`) |
| Batería | `Battery` | ✅ | ✅ |
| Eventos | `Bell` naranja | ✅ | ❌ |

**Nota:** Dirección y Odómetro del operator en el GPS popover usan `vehicle.direction` y `vehicle.odometer` (datos de nivel vehículo), no del dispositivo GPS individual.

**Menú de opciones GPS (ícono ⋮):**

| Opción | `admin` C-Go | `operator` C-Go | C-Loc |
|--------|:------------:|:---------------:|:-----:|
| Ubicación | ✅ | ✅ | ✅ |
| Viajes | ✅ | ✅ | ✅ |
| Parqueo | ✅ | ✅ | ✅ |
| Comando | ✅ | ❌ | ✅ |
| Copiar información | ✅ | ❌ | ✅ |

**Copiar información** genera texto plano al portapapeles. Identidad del vehículo + telemetría propia del GPS:

```
Propietario: Logística Express SAC
Placa: MOT-101
Alias: ANA
Código: 1

Ubicación: Av. Universitaria 3206 Urb, Los Olivos 15302
Coordenadas: -11.999089, -77.082595
Último reporte GPS: Jue 5 may 2026 • 9:14 AM

Velocidad: 45 km/h
Batería: 85%
Eventos: 3

Dispositivo: GPS-01
Estado GPS: Encendido
```

**Nota de nomenclatura:** `vehicle.name` es siempre el **Alias** del conductor en toda la plataforma. Nunca se etiqueta como "Conductor" en la UI ni en textos copiados. El campo `vehicle.owner` contiene al propietario del vehículo (empresa o persona).

**Implementación:** Cadena de datos `VehicleAccordionItem` → `GpsPopover` (+ `onShowToast`) → `GpsActionMenu` (vehicle + gpsName + gpsDevice + onShowToast). `GpsBadgeTooltip` y el botón GPS se ocultan con `profile === 'c-go' && userRole !== 'admin'`.

**Modelo de datos GPS:** El vehículo es el generador de información; los GPS son receptores independientes que guardan su propia copia. Si un GPS falla, sus datos pueden diferir del resto.

**Nomenclatura de dispositivos — Marca SVR:**

Los dispositivos se identifican por su **nivel de servicio**, no por modelo de hardware. El prefijo `SVR` ("Servicio de Rastreo Vehicular") es la denominación comercial unificada, decidida en Sesión 4 como más precisa que "GPS" (que describe la tecnología, no el servicio).

| Nombre en UI | ID interno | Identificador típico |
|--------------|------------|---------------------|
| **SVR Básico** | `basico` | OBC (computadora de a bordo) |
| **SVR Plus** | `flotas` | IMEI |
| **SVR Contingencia** | `contingencia` | Línea (número telefónico) |
| **SVR X** | `svr-x` | IMEI (servicio experimental — en prueba) |

**Color del nombre del plan en `GpsPopover`:**

| Plan | Color | Clase |
|------|-------|-------|
| Dispositivo índice 0 (Principal) | Azul brand | `text-brand` |
| Todos los demás (Secundario) | Negro | `text-slate-800` |

**Arquitectura de información de la tarjeta de dispositivo (Sesión 7 — final):**

Cada tarjeta de dispositivo GPS en el popover sigue este orden de información:

| Fila | Contenido | Visibilidad |
|------|-----------|-------------|
| 1 | Nombre del plan (`SVR Plus`) + jerarquía inline (`Principal` / `Secundario`) | Todos los roles |
| 2 | Fecha y hora del último reporte | `admin` / `esad` con segundos · `operator` sin segundos |
| 3 | Badge señal (`LocateFixed` + label) + badge ignición `[⏻ ON/OFF]` | Señal: todos · Ignición: solo `esad` |
| 4 | IMEI + LÍNEA en dos columnas | IMEI: todos · LÍNEA: solo `esad` |

**Decisión de UX — jerarquía como sufijo inline (Sesión 7):**
No se usan pills ni badges para la jerarquía. El nombre del plan va en bold y a su derecha, en texto más pequeño y tenue, la jerarquía. Esto mantiene la fila 1 limpia con solo dos elementos (identidad + contexto). Se evaluó poner señal en fila 1 junto al nombre pero se descartó porque agrupaba demasiada información en una sola línea.

Solo existen dos jerarquías: Principal (índice 0) y Secundario (índice ≥1). El badge "Respaldo" fue eliminado — no existe GPS de respaldo, solo principal y secundarios.

**Badge de señal (fila 3) — ícono `LocateFixed` (Sesión 7):**
El dot circular fue reemplazado por el ícono `LocateFixed` (`w-3.5 h-3.5`) dentro del badge de señal. Mismo ícono que aparece en el indicador GPS de la tarjeta del vehículo — entrena al usuario a asociar el símbolo con el estado de conectividad GPS. Cuando el GPS está en `reporting`, el fondo del ícono hace `animate-ping`.

**Color ignición (Sesión 5):** ON → `text-emerald-600 bg-emerald-50` (verde, coherente con "Transmitiendo"). OFF → `text-slate-400 bg-slate-100` (gris neutro).

**IMEI + LÍNEA — layout dos columnas (Sesión 5):**
- Etiqueta: `9px uppercase tracking-wider text-slate-400`
- Valor: `11px font-mono font-medium text-slate-600`
- Hover: color brand + subrayado + ícono `Copy`
- LÍNEA con `whitespace-nowrap` para que el número no se parta

Los identificadores (IMEI / LÍNEA) se muestran en la fila 4 de la tarjeta, en layout de dos columnas. En hover cambian a color brand, aparece subrayado y el ícono de copia; al hacer click copian al portapapeles con tooltip "Copiado ✓". LÍNEA usa `whitespace-nowrap` para evitar que el número se parta.

**Casuística clave — Conflicto de reporte y encendido:**

Un GPS puede estar `reporting` (transmitiendo activamente) mientras el motor del vehículo está `off`. Otro GPS del mismo vehículo puede estar `inactive` (sin transmitir). Estos son datos independientes y ambos deben ser visibles para el operador de Central.

Ejemplo real (ANA / MOT-101):

| | GPS Principal (falla) | GPS Secundario (reportando) |
|-|----------------------|-----------------------------|
| Tipo | SVR Plus · IMEI | SVR Contingencia · Línea |
| Estado reporte | 🔘 Inactivo | 🟢 Reportando |
| Ignición vehículo | OFF | OFF |
| Último reporte | 02/05/2026 10:00 | 05/05/2026 17:15 |
| Velocidad | 0 km/h | 0 km/h |

El operador ve que el GPS Secundario reporta hoy con ignición OFF → la posición es confiable y el vehículo está realmente apagado. El GPS Principal tiene fecha antigua → dato obsoleto.

**Estructura por dispositivo (`GpsDevice` en `shared/lib/data.ts`):**
```typescript
type GpsServiceType = 'basico' | 'flotas' | 'contingencia' | 'svr-x';
type GpsIdentifierLabel = 'OBC' | 'Línea' | 'IMEI';

type GpsDevice = {
  type: GpsServiceType;
  identifier: { label: GpsIdentifierLabel; value: string };
  reportStatus: 'reporting' | 'inactive'; // ¿El GPS está transmitiendo?
  ignition: 'on' | 'off';                 // Estado del motor leído por el GPS
  speed: string;
  fuel: string;
  alarmCount: number;
  lastSeen: string;
};
```

Los vehículos con `gpsCount > 1` tienen un array `gpsDevices[]`. La identidad del vehículo (placa, alias, propietario, coords) sigue siendo del vehículo.

**Display en `GpsPopover` — fila de badges por dispositivo:**

**Jerarquía como sufijo inline (Sesión 7):** No se usan pills/badges. El nombre del plan va en bold y a su derecha, en texto más pequeño y tenue, la jerarquía:

| Posición | Texto jerarquía | Color |
|----------|----------------|-------|
| Índice 0 | `Principal` | `text-brand/70` (azul tenue) |
| Índice ≥1 | `Secundario` | `text-slate-400` (gris) |

Ambos en `text-[10px] font-semibold`, alineados a la baseline del nombre del plan.

| Badge | Reporting | Inactivo |
|-------|-----------|---------|
| Estado GPS | 🟢 "Reportando" (emerald) | ⚫ "Inactivo" (slate) |

La ignición se muestra en la fila 3 de la tarjeta de dispositivo, junto al badge de jerarquía — **solo para el rol `esad`**. Se decidió incluirla aquí porque el esad necesita ver en un vistazo el estado del motor leído por cada GPS individualmente (útil cuando dos GPS reportan estados distintos). Para otros roles no es visible.

La fecha (`lastSeen`) del dispositivo es el dato clave: fecha antigua = dato obsoleto.

**Contenido expandido de la tarjeta (orden, Sesión 5):**

| Orden | Elemento | Visibilidad |
|-------|----------|-------------|
| 1 | Grupo / Subgrupo | Solo `esad` si `gpsDevice.group` existe |
| 2 | Dirección del vehículo | Todos |
| 3 | Coordenadas (copiable) | Todos |
| 4 | Métricas de telemetría | Varía por rol |

Dirección y coordenadas van en `flex-col gap-1` (4px) — mismo espaciado que `VehicleAccordionItem` para consistencia visual.

> **Pendiente de decisión con usuario:** posición de Grupo/Subgrupo — se probó al final (después de métricas) y se revirtió al inicio. A confirmar en próxima sesión.

**Texto copiado (Copiar información):**
```
Dispositivo: Servicio Flotas
IMEI: 354823091234567
Estado GPS: Inactivo
Ignición vehículo: OFF
```

### 3.3 Acciones del acordeón (Zona 3)

Barra horizontal con 4 acciones. **No visible para `esad`** — sus acciones están en el menú ⋮ de la card.

| Acción | Ícono | `admin` | `esad` | `operator` | `client` |
|--------|-------|:-------:|:------:|:----------:|:--------:|
| Ubicación | `MapPin` | ✅ | ⋮ menú | ✅ | ✅ |
| Viajes | `Route` | ✅ | ⋮ menú | ✅ | ✅ |
| Parqueo | `Lock` | ✅ | ⋮ menú | ❌ | ✅ |
| Detalle del vehículo | `FileText` | ❌ | ❌ | ✅ | ❌ |
| Conducción | `Navigation` | ❌ | ❌ | ✅ | ❌ |
| Comando | `Zap` | ✅ | ⋮ menú | ❌ | ❌ |
| **Bloquear encendido** | `Power` | ❌ | ❌ | ❌ | ✅ |

Las 4 posiciones siempre están ocupadas (para roles que muestran Zona 3). Posiciones 1–2 fijas (Ubicación, Viajes). Posiciones 3–4 varían por rol:

| Rol | Posición 3 | Posición 4 |
|-----|-----------|-----------|
| `admin` | Parqueo | Comando |
| `operator` | Detalle del vehículo | Conducción |
| `client` | Parqueo | Bloquear encendido |

**Decisión de UX — esad:** La Zona 3 se oculta. En su lugar, el botón `Share2` de la esquina superior derecha de la card se reemplaza por un menú ⋮ (`MoreVertical`) que contiene: Ubicación, Viajes, Parqueo, Comando. El menú es un popover portal con glassmorphism, alineado a la derecha del botón disparador.

**Decisión de UX — operator:** No tiene acceso a Parqueo ni Comando (acciones de bloqueo/control reservadas para admin y emergencias de cliente). En cambio accede a información de detalle y conducción, que es la vista que necesita para su trabajo de monitoreo.

**Decisión de UX — client:** No tiene acceso a Comando genérico. Tiene "Bloquear encendido" como acción de seguridad directa. Hover rojo en ambas acciones de bloqueo (Parqueo y Bloquear) para comunicar que son acciones críticas.

**Implementación:** Condicionales en `VehicleAccordionItem`. Componente `EsadActionMenu` definido en el mismo archivo — popover portal animado con `motion/react`. El menú se cierra al colapsar la card o al clickear fuera.

### 3.4 Flujo de compartir ubicación

El flujo de compartir permite generar un enlace de rastreo temporal para un vehículo específico.

**Trigger:** botón `Share2` en el header de cada vehículo expandido en el acordeón. Visible para todos los roles (pendiente definir restricción por rol).

**`SharePopover` — campos:**

| Campo | Descripción |
|-------|-------------|
| Placa + Alias | Identidad del vehículo — contexto visual antes de confirmar |
| URL de tracking | `https://c-locater.com/track/{id}` — read-only, copiable |
| Vigencia | 1 hora · 8 horas · 24 horas · Indefinida |
| Guardar compartido | Genera y activa el enlace |
| Ver historial | Abre modal con todos los compartidos del vehículo |

**Modal de historial:**

Tabla con los compartidos generados para el vehículo:

| Columna | Descripción |
|---------|-------------|
| Destinatario / Enlace | Nombre del receptor + URL |
| Estado | Activo · Expirado · Cancelado |
| Acciones | Copiar enlace · Cancelar (solo si Activo) |

**Decisiones de UX (Sesión 4):**
- El ícono de compartir no se repite dentro del popover — el contexto lo da el botón que lo abrió y el header de texto
- La fila de identidad (placa + alias) se añadió para dar contexto claro antes de confirmar la acción, especialmente útil cuando hay varios vehículos visibles
- El botón "Guardar compartido" sin ícono — dentro del popover el contexto ya está establecido

**Pendiente de definición:**
- ¿Qué roles pueden generar compartidos? ¿Solo admin?
- ¿El destinatario se registra con nombre o solo se copia el link?
- ¿La vigencia "Indefinida" requiere confirmación adicional?

### 3.5 StatCards superiores (Distancia, Viajes, Tiempo, Calificación, Peajes)

Las tarjetas flotantes sobre el mapa (Distancia total, Viajes realizados, Tiempo recorrido, Calificación, Peajes y gastos) **no son visibles para el rol `admin`**.

| Rol | Ve StatCards |
|-----|:------------:|
| `admin` | ❌ |
| `operator` | ✅ |
| `client` | ✅ |

### 3.5 Vista colapsada del vehículo en el acordeón

La identidad y segunda línea varían según el rol:

| Rol | Línea 1 | Línea 2 (colapsado) |
|-----|---------|---------------------|
| `esad` | Placa sin guiones (14px bold) + engineCode al lado (10px gris) | Fecha larga con segundos · `Jue 5 may 2026 • 09:14:31` (`text-slate-500`) |
| `admin` | Placa sin guiones | Código de motor + fecha mini con segundos |
| `operator` / `client` | Alias (editable) | Placa sin guiones · velocidad actual |

**Regla esad — sin placa:** Si `vehicle.plate` está vacío, se muestran los primeros **6 caracteres** del `engineCode` como identificador primario (en el lugar de la placa). El `engineCode` completo sigue apareciendo al lado como dato secundario. Esta regla garantiza un estándar visual fijo — misma posición y tamaño independientemente de si el vehículo tiene placa o no.

Ejemplo: `plate: ''`, `engineCode: 'D4D250A8F3'` → línea 1: `D4D250` (bold 14px) · `D4D250A8F3` (gris 10px)

**Layout línea 1 esad:**
- `flex items-baseline gap-1.5 min-w-0`
- Primario: `text-[14px] font-bold text-slate-900 tracking-tight leading-none shrink-0`
- Secundario: `text-[10px] font-medium text-slate-400 leading-none truncate`

**Layout línea 2 esad:**
- `gap-1.5` (6px) entre línea 1 y línea 2 — siempre visible, no solo al expandir
- Formato: `formatLastSeenWithSecs()` → `Jue 5 may 2026 • 09:14:31`
- Color: `text-slate-500` (mismo tono que la fecha en estado expandido para coherencia visual)

**Ignition badge:** Oculto para `esad`. El esad identifica el estado del motor por el color del ícono y el dot de ignición en la tarjeta — el badge redundaría. Para otros roles sigue visible al expandir.

**Decisión de UX para `admin`:** El administrador necesita ver de inmediato cuándo fue el último reporte del vehículo (dato crítico para emergencias) sin tener que abrir el detalle.

Layout de la segunda línea en colapsado (admin):
- Placa anclada a la izquierda (`shrink-0`) — siempre visible, nunca truncada
- Fecha alineada a la derecha con `justify-between` — trunca solo si el espacio es insuficiente
- Sin separador `·` entre placa y fecha (el `justify-between` los separa visualmente)

**Formato de hora — todos los roles:** 24 horas, sin AM/PM. Función `parseParts()` en `utils.ts` convierte el formato de entrada `'05/05/2026 09:14 a.m.'` a `h24Str` con cero de relleno. Todas las funciones de formateo usan `h24Str`.

Ejemplos: `13 mar · 22:08` (antes era `10:08 PM`), `5 may · 09:14` (antes era `9:14 AM`)

Funciones de formateo en `shared/lib/utils.ts`:
- `formatLastSeenMini()` → `13 mar · 22:08` (colapsado admin)
- `formatLastSeenMiniSecs()` → `5 may · 09:14:31` (colapsado esad línea 2, con segundos)
- `formatLastSeenShort()` → `Jue 13 mar · 22:08` (disponible, sin uso activo)
- `formatLastSeen()` → `Jue 13 mar 2026 • 22:08` (card expandida en el mapa)
- `formatLastSeenWithSecs()` → `Jue 5 may 2026 • 09:14:31` (esad línea 2 y GpsPopover admin/esad)

---

## 4. Visibilidad por Rol — Perfil C-Loc

> **Pendiente de definición**: C-Loc actualmente no diferencia por rol. A definir en siguiente iteración.

---

## 5. Cambio de Perfil y Rol desde el UserMenu

El `UserMenu` (componente en `shared/components/ui/UserMenu.tsx`) expone dos secciones de switching visibles **solo para `isAdmin: true`**:

| Sección | Qué cambia | Ícono |
|---------|-----------|-------|
| **Plataforma** | Perfil activo (`c-go` / `c-loc`) | `Monitor` |
| **Rol** | Rol de sistema (`admin` / `operator` / `client`) | `ShieldCheck` |

- Ambas secciones son acordeones expandibles dentro del dropdown del usuario.
- Al cambiar el rol, el label en el trigger del `UserMenu` se actualiza dinámicamente.
- El cambio de rol es inmediato y afecta toda la app (estado en `App.tsx`).

---

## 6. Etiquetas de Estado del Vehículo por Plataforma

El badge de estado principal (visible en el acordeón expandido) muestra texto distinto según la plataforma:

| Estado | C-Go | C-Loc |
|--------|------|-------|
| `active` | **Ignition ON** | Encendido |
| `stopped` | **Ignition OFF** | Apagado |
| `offline` | **Disconnected** | Desconectado |

**Nota de UX:** La recomendación inicial era mantener las etiquetas en español (Encendido / Apagado) por coherencia con el idioma de la interfaz. El cambio a inglés técnico (`Ignition ON/OFF`) fue solicitado explícitamente para C-Go por requerimiento del administrador del proyecto.

**Alcance:** Solo afecta el badge de estado principal en `VehicleAccordionItem` (componente expandido). Los estados dentro del `GpsPopover` (Encendido/Apagado por dispositivo) no se modificaron — usan español en ambas plataformas.

**Implementación:** Condicional `profile === 'c-go'` dentro de `FloatingStats.tsx`. No se modifica C-Loc.

---

## 7. Color del Ícono de Vehículo — Estado GPS Principal

El ícono del vehículo en la tarjeta cambia de color según el estado de reporte del **GPS principal** (primer dispositivo en `gpsDevices`). Este color es **independiente de la ignición** — un vehículo puede tener Ignition ON y GPS en rojo si el dispositivo dejó de transmitir.

| Estado GPS principal | Color ícono | Fondo | Cuándo ocurre |
|----------------------|-------------|-------|----------------|
| `reporting`    | Verde `text-emerald-600` | `bg-emerald-50` | GPS transmitiendo correctamente |
| `low-signal`   | Naranja `text-orange-500` | `bg-orange-50` | Señal débil — alerta temprana |
| `no-signal`    | Gris `text-slate-400`    | `bg-slate-50`  | Sin señal — dejó de reportar recientemente |
| `disconnected` | Rojo `text-red-500`      | `bg-red-50`    | Sin reporte por tiempo extendido |
| Sin GPS        | Gris `text-slate-400`    | `bg-slate-50`  | Vehículo sin `gpsDevices` o estado desconocido |

**Distinción `no-signal` vs `low-signal`:** `no-signal` es gris (igual que sin GPS) porque el dispositivo ya no está reportando nada — para el usuario es "como si no existiera en este momento". `low-signal` es naranja porque el dispositivo sigue activo pero con degradación — requiere atención. Esta distinción fue corregida en Sesión 7 (inicialmente ambos eran naranja).

**Indicador GPS para esad (Sesión 7):** El rol `esad` no ve el `GpsBadgeTooltip` (badge contador de GPS sobre el ícono). En cambio, muestra un dot de color `solid` del estado GPS con el ícono `LocateFixed` en blanco, posicionado en `-top-2 -left-2` sobre el ícono del vehículo. Cuando el GPS está en `reporting`, el dot tiene animación `animate-ping` (efecto de señal activa). Para estados sin señal, el dot es estático.

**Implementación:** `getVehicleGpsStyle(vehicle)` en `fleetUtils.ts` — retorna `{ bg, border, icon, solid, ping, isReporting }`. En `VehicleAccordionItem`: esad → dot con `LocateFixed`; otros roles → `GpsBadgeTooltip`. El dot de esad usa `gpsStyle.solid` (color de fondo) y `gpsStyle.ping` (color del ring pulsante).

---

## 8. Batería — Representación Visual por Color

La batería se representa con colores en **todas las plataformas y roles**, tanto en el acordeón de vehículos como en la vista expandida de dispositivos GPS.

| Rango | Color | Clase Tailwind |
|-------|-------|---------------|
| 0 – 20 % | Rojo (crítico) | `text-red-500` |
| 21 – 60 % | Ámbar (medio) | `text-amber-500` |
| > 60 % | Verde (bueno) | `text-emerald-500` |

El color aplica tanto al ícono `Battery` como al texto del valor porcentual.

**Implementación:** función `getBatteryColor(fuel: string): string` en `FloatingStats.tsx`. Retorna la clase Tailwind y se aplica via `colorClass` en el array de métricas.

---

## 8. Card del Vehículo en Contexto Multi-GPS

### Comportamiento actual (implementado, pendiente refinamiento)

Cuando un vehículo tiene **2 o más GPS con posición** y el usuario lo selecciona en el mapa:
- La **card expandida del vehículo se oculta** para evitar superposición visual con la capa GPS multi-posición
- El marker del vehículo muestra el **pill destacado** (borde azul) como indicador de selección activa
- La información detallada del vehículo queda disponible en el **panel lateral** (FloatingStats)

### Razón del cambio

Al seleccionar JUAN (multi-GPS), aparecían simultáneamente la card del vehículo con nombre/placa/estado Y los markers GPS individuales + polyline punteada, creando una superposición confusa en el mapa.

### Comportamiento futuro (decisión pendiente)

| Opción | Descripción |
|--------|-------------|
| A | Card del vehículo reemplazada por versión compacta (nombre + placa, sin detalles) |
| B | Card integrada: resumen del vehículo + conteo de GPS activos debajo |
| C | Mantener pill destacado definitivamente (comportamiento actual) |

La lógica de `createCustomIcon` está intacta — el cambio solo suprime `isSelected` cuando `hasMultiGps`. Revertir o modificar es trivial.

---

## 9. Decisiones Pendientes

| # | Tema | Estado |
|---|------|--------|
| 1 | Acciones del acordeón por rol | ⏳ Pendiente: ¿puede el `client` enviar comandos o solo `admin`/`operator`? |
| 2 | GPS Popover por rol | ✅ Resuelto en C-Go: solo `admin` ve badge, botón y panel. En C-Loc todos los roles ven el panel (sin diferenciación por rol aún). |
| 3 | StatCards por rol | ⏳ Pendiente: `operator` y `client` ven las tarjetas — ¿alguna diferencia entre ellos? |
| 4 | Visibilidad C-Loc por rol | ⏳ Pendiente: C-Loc no diferencia por rol todavía. |
| 5 | Panel de admin futuro | ⏳ Pendiente: gestión de usuarios y asignación de roles desde la UI. |
| 6 | `client` — vehículos filtrados | ⏳ Pendiente: ¿el cliente solo ve los vehículos asignados a su empresa? |
| 7 | Etiquetas estado en GPS Popover | ⏳ Pendiente: los estados por dispositivo (Encendido/Apagado) usan español en ambas plataformas — ¿cambiar en C-Go a inglés técnico? |
| 8 | Card del vehículo con multi-GPS | ⏳ Pendiente: definir si mostrar card compacta, card integrada con GPS, o mantener pill destacado (ver sección 8). |

---

## 10. CaminosModule — UX y diseño (Sesión 27)

### 10.1 Barra de acciones masivas

Cuando se seleccionan filas en la tabla aparece una barra flotante en la parte inferior.

| Propiedad | Decisión |
|---|---|
| Fondo | `bg-slate-50` con `border border-slate-200` — se diferencia del fondo blanco de la página sin ser oscura |
| Sombra | `shadow-[0_12px_44px_rgba(0,0,0,0.13)]` — elevación suficiente para flotar sobre la tabla |
| Radio | `rounded-xl` — consistente con el componente `Modal` |
| Botones | Usan el componente `<Button>` con `variant="ghost"` para acciones ligeras y `variant="danger"` para "Eliminar" |
| Iconos | Cada acción tiene su icono (`PowerOff`, `Copy`, `Send`, `Trash2`) |
| Padding interno | `py-2` en los contenedores internos para altura suficiente |

### 10.2 Orden de columnas

| Orden | Columna |
|:-----:|---------|
| 1 | Checkbox |
| 2 | Ruta |
| 3 | Empresa |
| 4 | Grupo |
| 5 | Configuración |
| 6 | Estado |
| 7 | Acciones |

### 10.3 Iconos de ordenamiento

Los iconos `ArrowUpDown` en las cabeceras de columna ordenables son **siempre visibles** (`opacity-40`) — no se ocultan al no hacer hover. El usuario debe poder identificar qué columnas son ordenables sin tener que interactuar con la tabla.

---

## 11. VehicleTripView — Dropdown de filtro de eventos

### 11.1 Consistencia con estilo FloatingMonitor

El dropdown de "Filtrar" en el panel de eventos del viaje sigue el mismo estilo que el dropdown de "Tipo" en FloatingMonitor:

| Propiedad | Valor |
|-----------|-------|
| Panel | `rounded-lg`, `shadow-[0_4px_20px_rgba(0,0,0,0.18)]` |
| Opciones | `rounded-md`, `px-3 py-2`, text-xs |
| Checkbox | `<Checkbox size="sm">` de la librería `ui/` |

Esto garantiza que ambos filtros (eventos del viaje y tipo en FloatingMonitor) compartan el mismo lenguaje visual aunque funcionen distinto (multi-select con checkbox vs single-select).

---

---

## 12. VehicleCaptureView — Módulo de Parqueo Seguro (Sesión 28)

### 12.1 Concepto y flujo

El módulo de **parqueo seguro** (captura) se activa desde el menú de acciones de un vehículo. Reemplaza la vista del mapa principal con una pantalla dedicada de tres columnas.

**Flujo de activación:**
1. Usuario abre acciones de un vehículo → selecciona "Parqueo" (ícono `ShieldAlert`)
2. `App.tsx` recibe el evento `captureVehicle` → agrega el vehículo a `capturedVehicles[]` y setea `activeCaptureId`
3. El sidebar de navegación se colapsa automáticamente (mismo comportamiento que viajes) vía `collapseSidebar`
4. Al cerrar la vista, `restoreSidebar` devuelve el sidebar a su estado previo

### 12.2 Layout de tres columnas

| Columna | Ancho | Contenido |
|---------|-------|-----------|
| Sidebar de vehículo | 322px fijo | `VehicleDetailPanel` con tabs Info / GPS / Posiciones |
| Panel de Posiciones | 260px fijo | Lista de coordenadas con timestamp y dirección |
| Mapa de tracking | `flex-1` | `VehicleTrackingMap` + barra de progreso de etapas |

### 12.3 Barra de progreso de captura

Overlay flotante sobre el mapa con tres etapas lineales:

| Etapa | Estado visual |
|-------|--------------|
| Inicio de captura | Círculo relleno verde + timestamp |
| En proceso | Círculo outline pulsante verde |
| Finalizado | Círculo gris (pendiente) |

### 12.4 Dock picker — Panel "Posiciones" reposicionable

El operador puede reubicar el panel de posiciones sin interrumpir el monitoreo. El handle es un ícono `GripVertical` en el header del panel → abre un popover con tres opciones:

| Opción | Posición resultante |
|--------|---------------------|
| **Izquierda** (default) | Entre sidebar y mapa |
| **Derecha** | A la derecha del mapa |
| **Abajo** | Bajo el contenido del sidebar, el mapa se expande |

Cada opción incluye un mini diagrama SVG del layout resultante para que el operador anticipe el resultado antes de seleccionar.

**Restricción automática:** si la altura del contenedor es menor a 480px, la opción "Abajo" se deshabilita visualmente (`opacity-35`) y muestra tooltip explicativo. Si el panel ya estaba en posición "Abajo" cuando la pantalla encoge por debajo del umbral, se resetea automáticamente a "Izquierda".

### 12.5 Comportamiento del dock "Abajo"

Cuando el panel de posiciones está docked abajo del sidebar:

- `VehicleDetailPanel` toma su altura natural de contenido (`grow-0 shrink`) — no se expande artificialmente
- El panel de posiciones ocupa todo el espacio restante (`flex-1 min-h-[160px]`)
- Si el operador colapsa secciones del VehicleDetailPanel (acordeones / tabs), el panel de posiciones sube automáticamente para llenar el espacio liberado

**Invariante clave:** `VehicleDetailPanel` siempre está en la misma posición del árbol React independientemente del dock activo. Solo el CSS wrapper cambia. Esto preserva el estado interno (qué tab está activo, qué acordeones están abiertos) al cambiar de dock.

### 12.6 Historial de posiciones

El panel lista las coordenadas GPS capturadas durante el recorrido:

- **Última posición**: destacada con fondo `bg-blue-50/70 border-blue-400/80` y badge "Última" en azul
- **Posiciones anteriores**: fondo blanco con `border-transparent hover:border-slate-200`
- **Click en ítem**: copia las coordenadas al portapapeles con feedback visual "Copiado ✓"
- **Scroll hint**: flecha `ChevronDown` animada aparece cuando hay más contenido por debajo del viewport visible. Se re-evalúa al cambiar el dock o el estado de visibilidad del panel (con 120ms de delay para esperar la animación de transición)

### 12.7 Modales de GPS

Al abrir la vista de captura se evalúa automáticamente el estado de los dispositivos GPS:

| Condición | Modal mostrado |
|-----------|---------------|
| GPS principal desconectado sin alternativas | "GPS no disponible" — muestra última posición conocida |
| GPS principal sin señal pero hay otro disponible | "GPS principal sin señal" — ofrece cambiar al disponible |
| GPS principal reportando correctamente | Sin modal |

---

---

## 13. Dashboard — Vista de resumen operativo (Sesión 29)

### Concepto

El Dashboard es la puerta de entrada al sistema: la primera opción de navegación visible en el sidebar, por encima de "Explorar". Ofrece un estado global de la flota en una sola pantalla, sin necesidad de abrir el mapa ni buscar vehículos individuales.

Responde a la pregunta: **"¿Cómo está mi flota ahora mismo?"**

### Posición en la navegación

- Nav item: `Dashboard`, icono `LayoutDashboard`, atajo de teclado `D`
- Ubicación: **primera posición** en `NAV_ITEMS`, sobre "Explorar"
- Comportamiento: no tiene hijos ni dropdown; navega directo a `activeView === 'dashboard'`

### Métricas en KPI cards (fila superior)

| Card | Métrica | Color | Icono |
|------|---------|-------|-------|
| Total unidades | `FLEET_DATA.length` | Azul | Truck |
| Activos | `status === 'active'` | Verde | Activity |
| Detenidos | `status === 'stopped'` | Ámbar | TrendingUp |
| Sin señal | `status === 'offline'` | Rojo | WifiOff |
| Con alarma | `alarmCount > 0` | Naranja | AlertTriangle |

Las métricas se computan con `useMemo` sobre `FLEET_DATA`. Son datos locales (mock); en producción se conectarían a una API de flota en tiempo real.

### Mapa mundial

- Propósito: visualizar la distribución geográfica de las unidades por país
- Implementación: Leaflet (`MapContainer`) con tiles CartoDB en modo claro (`light_nolabels`) u oscuro (`dark_nolabels`) según `isDark`
- Zoom inicial: 3 (nivel continental). El usuario puede hacer scroll para acercar
- Marcadores: burbujas circulares `L.divIcon` con el conteo de unidades centrado. Tamaño escala con el count (34/42/52px). Color distinto por país
- Tooltip al hover: nombre del país + conteo

### Panel lateral de países (220px)

- **Total km recorridos**: suma de odómetros de toda la flota, compactado como `Xk km`
- **Lista de países**: cada entrada muestra nombre, conteo numérico y barra de progreso horizontal relativa al país con más unidades
- Los datos de países son mock hasta integración real con la API

### Comportamiento de temas

El dashboard respeta `isDark` del contexto global (`ThemeContext`):
- Fondo: `zinc-950` (oscuro) / `neutral-50` (claro)
- Cards: `zinc-900` / `white`
- Mapa: `dark_nolabels` / `light_nolabels`

---

## 14. LiveTrackingView — Posiciones en el monitoreo en vivo (Sesión 31)

### Cambio en el header de la unidad

Las métricas de telemetría del header (Odómetro, Velocidad, Combustible, Alertas) **se eliminaron** de la vista de monitoreo en vivo. Esa información ya está disponible en otras vistas (acordeón de flota, GpsPopover, captura); en monitoreo el foco es video + ubicación.

En su lugar hay un único botón **"Posiciones"** (toggle Eye/EyeOff):

| Estado | Estilo |
|--------|--------|
| Inactivo | Pill con borde `slate-200`, ícono `EyeOff`, texto `slate-500` |
| Activo | Pill azul `bg-blue-50 text-blue-600 border-blue-200` (dark: `bg-blue-600/20 text-blue-400`), ícono `Eye` |

### Comportamiento al activar

1. **Panel de posiciones** (272px) aparece entre el panel de cámaras y el mapa, con la misma card del módulo de captura: header "POSICIONES n", lista de posiciones con timestamp + dirección + coords, ítem "Última" resaltado en azul, click copia coords, scroll hint animado.
2. **Recorrido en el mapa**: polyline punteada azul conectando el historial de posiciones + marcador "A" en el origen (mismos estilos que VehicleCaptureView). El mapa hace `fitBounds` al recorrido completo una sola vez al activar.
3. **Seguimiento en vivo pausado**: mientras el panel está abierto, el mapa no sigue al vehículo (`VehicleFollower` inactivo) para que el usuario pueda inspeccionar el recorrido. Al desactivar, el seguimiento se reanuda.

### Definición de "Posiciones"

**Una posición es un punto tomado por el dispositivo GPS cada X cantidad de segundos** (frecuencia de reporte del dispositivo; en el mock, 30 s). La lista de posiciones es, por tanto, el historial de reportes GPS del recorrido, ordenado del más reciente al más antiguo.

**Click en una posición → navegación precisa en el mapa**: al hacer click en un ítem de la lista, el mapa hace `flyTo` exactamente a ese punto (zoom mínimo 17 para precisión) y lo marca con un dot azul con anillo pulsante. El ítem se resalta en azul con un ring. Click de nuevo lo deselecciona (el marcador desaparece). Al cerrar el panel la selección se limpia.

El click de la card selecciona/navega; copiar coordenadas es una acción independiente que solo se dispara sobre las coordenadas (con `stopPropagation`).

### Datos del recorrido

Historial sintético (mock) de 20 puntos hacia atrás desde la posición actual, con intervalo de 30 s. Para vehículos animados (VehicleContext), cada movimiento real agrega un punto nuevo al recorrido en vivo. En producción, este historial vendrá del backend de posiciones GPS.

### Botón "Eventos" (Sesión 31b)

Junto a "Posiciones" hay un segundo toggle **"Eventos"** con el mismo estilo pill Eye/EyeOff. Los dos paneles son **excluyentes**: abrir uno cierra el otro (solo hay espacio para un panel lateral entre las cámaras y el mapa).

Comportamiento al activar:

1. **Panel "Eventos del recorrido"** (272px): mismo estándar que "Eventos del viaje" de la vista de viajes — filtros "Todos" / "Filtrar" (dropdown multi-selección con checkbox y contador por tipo), lista de eventos con dirección, hora e ícono + métrica coloreados por tipo (Exceso de velocidad rojo, Frenado ámbar, Aceleración naranja, Giro violeta), botón X de cierre.
2. **Mapa**: el recorrido punteado + marcador "A" se muestran igual que con Posiciones, y encima aparecen los **marcadores de evento** sobre los puntos del recorrido. Filtrar por tipo atenúa los demás marcadores. Click en un evento (lista o mapa) lo selecciona: la card se resalta en azul, el marcador crece con anillo pulsante y el mapa hace `flyTo` al punto. Click de nuevo lo deselecciona.

Datos: eventos mock (5–8 por unidad, seed por `vehicle.id`) anclados a puntos del recorrido inicial, con hora coherente con el historial de posiciones. En producción vendrán del backend de telemetría.

---

*Fin del documento definicion.md*
