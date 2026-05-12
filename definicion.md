# Definición de Producto — CLocater

> Decisiones de UX, roles, perfiles y visibilidad de datos.
> Actualizado: 2026-05-09 (Sesión 5)

---

## 1. Perfiles de la Aplicación

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

La app tiene **3 roles de sistema** que determinan qué datos y acciones ve cada usuario:

| Rol (etiqueta UI) | ID interno | Descripción |
|-------------------|------------|-------------|
| **Administrador** | `admin` | Visión operativa y de gestión. Ve métricas de negocio y alertas |
| **Concesionaria** | `operator` | Visión técnica completa. Ve telemetría del vehículo |
| **Cliente Directo** | `client` | Visión reducida. Ve solo lo necesario para su operación |

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
| SVR Básico / SVR Plus / SVR X (resto) | Negro | `text-slate-800` |
| SVR Contingencia | Violeta | `text-violet-500` |

**Decisión de UX — violeta para SVR Contingencia:** Elegido sobre naranja (reservado para alarmas) y cian (cercano al brand). El color aplica al nombre del plan; los badges de jerarquía e ignición tienen su propio estilo.

**Arquitectura de información de la tarjeta de dispositivo (Sesión 5):**

Cada tarjeta de dispositivo GPS en el popover sigue este orden de información:

| Fila | Contenido | Visibilidad |
|------|-----------|-------------|
| 1 | Nombre del plan (`SVR Plus`) + badge estado de señal (`● Transmitiendo / Sin señal / …`) | Todos los roles |
| 2 | Fecha y hora del último reporte | `admin` / `esad` con segundos · `operator` sin segundos |
| 3 | Badge jerarquía (`Principal` / `Secundario` / `Respaldo`) + badge ignición `[⏻ ON/OFF]` | Jerarquía: todos · Ignición: solo `esad` |
| 4 | IMEI + LÍNEA en dos columnas | IMEI: todos · LÍNEA: solo `esad` |

**Decisión de UX — estado de señal al lado del nombre (Sesión 5):**
El badge de señal (Transmitiendo / Sin señal / Señal baja) va inmediatamente al lado del nombre del plan porque es el indicador más crítico para un operador de Central: saber si el GPS está vivo sin leer más abajo. La jerarquía (Principal/Secundario) e ignición son contexto secundario y van en la fila 3.

**Color ignición (Sesión 5):** ON → `text-emerald-600 bg-emerald-50` (verde, coherente con "Transmitiendo"). OFF → `text-slate-400 bg-slate-100` (gris neutro).

**IMEI + LÍNEA — layout dos columnas (Sesión 5):**
- Etiqueta: `9px uppercase tracking-wider text-slate-400`
- Valor: `11px font-mono font-medium text-slate-600`
- Hover: color brand + subrayado + ícono `Copy`
- LÍNEA con `whitespace-nowrap` para que el número no se parta

**Ícono `LocateFixed` eliminado (Sesión 5):** Removido de las tarjetas de dispositivo para ganar espacio horizontal. La jerarquía visual la dan el nombre en negrita y los badges.

Los identificadores (IMEI / LÍNEA) se muestran en la fila 4 de la tarjeta, en layout de dos columnas. En hover cambian a color brand, aparece subrayado y el ícono de copia; al hacer click copian al portapapeles con tooltip "Copiado ✓". LÍNEA usa `whitespace-nowrap` para evitar que el número se parta.

**Casuística clave — Conflicto de reporte y encendido:**

Un GPS puede estar `reporting` (transmitiendo activamente) mientras el motor del vehículo está `off`. Otro GPS del mismo vehículo puede estar `inactive` (sin transmitir). Estos son datos independientes y ambos deben ser visibles para el operador de Central.

Ejemplo real (ANA / MOT-101):

| | GPS Principal (falla) | GPS Respaldo (reportando) |
|-|----------------------|---------------------------|
| Tipo | SVR Plus · IMEI | SVR Contingencia · Línea |
| Estado reporte | 🔘 Inactivo | 🟢 Reportando |
| Ignición vehículo | OFF | OFF |
| Último reporte | 02/05/2026 10:00 AM | 05/05/2026 05:15 PM |
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

| Posición / Tipo | Badge jerarquía | Estilo |
|-----------------|----------------|--------|
| Índice 0 (cualquier tipo) | `Principal` | Azul brand, texto blanco |
| Índice ≥1, tipo ≠ contingencia | `Secundario` | Gris slate, borde |
| Índice ≥1, tipo = contingencia | `Respaldo` | Gris slate, borde |

**Distinción Secundario vs Respaldo:** "Secundario" indica un segundo servicio contratado que el usuario final debe visualizar (ej. SVR Básico + SVR Plus en la misma unidad). "Respaldo" indica un dispositivo de emergencia que no forma parte del contrato principal — no es un segundo servicio contratado. Esta distinción también aplica a la visibilidad hacia terceros (operadores, financieras, aseguradoras): datos de un "Secundario" son compartibles como segundo servicio; datos de un "Respaldo" son operativos internos.

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

Barra horizontal con 4 acciones. La cuarta varía según rol:

| Acción | Ícono | `admin` | `operator` | `client` |
|--------|-------|:-------:|:----------:|:--------:|
| Ubicación | `MapPin` | ✅ | ✅ | ✅ |
| Viajes | `Route` | ✅ | ✅ | ✅ |
| Parqueo | `Lock` | ✅ | ❌ | ✅ |
| Detalle del vehículo | `FileText` | ❌ | ✅ | ❌ |
| Conducción | `Navigation` | ❌ | ✅ | ❌ |
| Comando | `Zap` | ✅ | ❌ | ❌ |
| **Bloquear encendido** | `Power` | ❌ | ❌ | ✅ |

Las 4 posiciones siempre están ocupadas. Posiciones 1–2 fijas (Ubicación, Viajes). Posiciones 3–4 varían por rol:

| Rol | Posición 3 | Posición 4 |
|-----|-----------|-----------|
| `admin` | Parqueo | Comando |
| `operator` | Detalle del vehículo | Conducción |
| `client` | Parqueo | Bloquear encendido |

**Decisión de UX — operator:** No tiene acceso a Parqueo ni Comando (acciones de bloqueo/control reservadas para admin y emergencias de cliente). En cambio accede a información de detalle y conducción, que es la vista que necesita para su trabajo de monitoreo.

**Decisión de UX — client:** No tiene acceso a Comando genérico. Tiene "Bloquear encendido" como acción de seguridad directa. Hover rojo en ambas acciones de bloqueo (Parqueo y Bloquear) para comunicar que son acciones críticas.

**Implementación:** Condicionales en `VehicleAccordionItem` — solo aplica a C-Go. Íconos `FileText` y `Navigation` agregados a imports.

**Nota futura — GPS popover:** Si se habilita el panel GPS para `client`, la misma lógica aplica en el menú ⋮. El flag `isOperatorCGo` en `GpsActionMenu` deberá extenderse para `client`.

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

La segunda línea del acordeón colapsado varía según el rol:

| Rol | Segunda línea | Ejemplo |
|-----|--------------|---------|
| `admin` | Placa · fecha y hora corta (sin año) | `MOT-101 · Jue 13 mar · 10:08 PM` |
| `operator` / `client` | Placa · velocidad actual | `MOT-101 · 45 km/h` |

**Decisión de UX para `admin`:** El administrador necesita ver de inmediato cuándo fue el último reporte del vehículo (dato crítico para emergencias) sin tener que abrir el detalle.

Layout de la segunda línea en colapsado:
- Placa anclada a la izquierda (`shrink-0`) — siempre visible, nunca truncada
- Fecha alineada a la derecha con `justify-between` — trunca solo si el espacio es insuficiente
- Sin separador `·` entre placa y fecha (el `justify-between` los separa visualmente)

Formato de fecha: `DD mes · H:MM AM/PM` — sin año ni día de semana para máxima compacidad.
Ejemplos: `13 mar · 10:08 PM`, `5 may · 9:14 AM`

Funciones de formateo en `shared/lib/utils.ts`:
- `formatLastSeenMini()` → `13 mar · 10:08 PM` (colapsado admin)
- `formatLastSeenShort()` → `Jue 13 mar · 10:08 PM` (disponible, sin uso activo)
- `formatLastSeen()` → `Jue 13 mar 2026 • 9:14 AM` (card expandida en el mapa)

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

## 7. Batería — Representación Visual por Color

La batería se representa con colores en **todas las plataformas y roles**, tanto en el acordeón de vehículos como en la vista expandida de dispositivos GPS.

| Rango | Color | Clase Tailwind |
|-------|-------|---------------|
| 0 – 20 % | Rojo (crítico) | `text-red-500` |
| 21 – 60 % | Ámbar (medio) | `text-amber-500` |
| > 60 % | Verde (bueno) | `text-emerald-500` |

El color aplica tanto al ícono `Battery` como al texto del valor porcentual.

**Implementación:** función `getBatteryColor(fuel: string): string` en `FloatingStats.tsx`. Retorna la clase Tailwind y se aplica via `colorClass` en el array de métricas.

---

## 8. Decisiones Pendientes

| # | Tema | Estado |
|---|------|--------|
| 1 | Acciones del acordeón por rol | ⏳ Pendiente: ¿puede el `client` enviar comandos o solo `admin`/`operator`? |
| 2 | GPS Popover por rol | ✅ Resuelto en C-Go: solo `admin` ve badge, botón y panel. En C-Loc todos los roles ven el panel (sin diferenciación por rol aún). |
| 3 | StatCards por rol | ⏳ Pendiente: `operator` y `client` ven las tarjetas — ¿alguna diferencia entre ellos? |
| 4 | Visibilidad C-Loc por rol | ⏳ Pendiente: C-Loc no diferencia por rol todavía. |
| 5 | Panel de admin futuro | ⏳ Pendiente: gestión de usuarios y asignación de roles desde la UI. |
| 6 | `client` — vehículos filtrados | ⏳ Pendiente: ¿el cliente solo ve los vehículos asignados a su empresa? |
| 7 | Etiquetas estado en GPS Popover | ⏳ Pendiente: los estados por dispositivo (Encendido/Apagado) usan español en ambas plataformas — ¿cambiar en C-Go a inglés técnico? |

---

*Fin del documento definicion.md*
