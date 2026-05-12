# Informe de Mejoras Implementadas — CLocater
> Registro técnico de cambios aplicados dentro del requerimiento funcional.
> Fecha: 2026-05-08 · Sesión 4

---

## Alcance

Este informe cubre exclusivamente las mejoras implementadas y validadas dentro del requerimiento funcional activo. Los ítems marcados como "Fuera de alcance" no se documentan aquí — para esos ver `presentacion.md` sección F1/F2/F3.

---

## 1. Sistema de nomenclatura SVR para dispositivos GPS

**Archivo:** `src/shared/lib/data.ts`, `src/shared/components/FloatingStats.tsx`

Se reemplazó el sistema de tipos internos por la nomenclatura de marca SVR visible al usuario:

| Tipo interno | Nombre visible | Color del nombre |
|---|---|---|
| `flotas` | SVR Plus | Brand (azul) si Principal, Slate si Secundario |
| `basico` | SVR Básico | Brand (azul) si Principal, Slate si Secundario |
| `contingencia` | SVR Contingencia | Violeta (`text-violet-500`) siempre |
| `svr-x` | SVR X | Brand (azul) si Principal, Slate si Secundario |

El color violeta distingue visualmente el SVR Contingencia como dispositivo de naturaleza diferente (respaldo de emergencia, no un servicio contratado adicional).

Se incorporó `svr-x` como cuarto tipo al union type `GpsServiceType` y a los datos de prueba del vehículo JUAN (4 dispositivos GPS).

---

## 2. Etiquetas de jerarquía de dispositivos GPS

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsPopover`

Cada dispositivo GPS muestra una etiqueta de posición según su rol dentro de la unidad:

| Etiqueta | Condición | Descripción |
|---|---|---|
| **Principal** | Primer dispositivo (índice 0) | Fuente principal de datos para usuario y terceros (financieras, aseguradoras) |
| **Secundario** | Cualquier dispositivo no-contingencia a partir del índice 1 | Segundo servicio contratado en la misma unidad |
| **Respaldo** | `type === 'contingencia'` | Dispositivo de emergencia interno — no es un segundo contrato |

La etiqueta **Respaldo** reemplaza a **Secundario** exclusivamente para el SVR Contingencia, diferenciando semánticamente un dispositivo de emergencia de un servicio adicional contratado.

---

## 3. Visibilidad del panel GPS por rol

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsBadgeTooltip`, `VehicleAccordionItem`, `GpsPopover`

| Elemento | Administrador | Concesionaria (Operador C-Go) | Cliente |
|---|:---:|:---:|:---:|
| Badge contador GPS en ícono del vehículo | ✅ (todos los GPS) | ✅ (sin contingencia) | ❌ |
| Botón "Ver dispositivos GPS" | ✅ (si gpsCount > 1) | ✅ (si visibleCount > 1) | ❌ |
| SVR Básico en panel | ✅ | ✅ | ❌ |
| SVR Plus en panel | ✅ | ✅ | ❌ |
| SVR X en panel | ✅ | ✅ | ❌ |
| SVR Contingencia en panel | ✅ | ❌ | ❌ |

**Lógica de `visibleCount` para operador:** Se filtra `d.type !== 'contingencia'` para calcular el conteo visible. El badge y el botón usan este conteo, no `gpsCount`. Si el resultado es ≤ 1 dispositivo visible, el badge y el botón no se muestran.

**Corrección incluida:** El badge antes aparecía cuando `gpsCount === 1`. Se corrigió la condición a `gpsCount <= 1 → return null` para vehículos con un solo dispositivo GPS.

---

## 4. Métricas de telemetría en el panel GPS por rol

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsPopover`

| Métrica | Administrador | Concesionaria (Operador C-Go) |
|---|:---:|:---:|
| Velocidad | ✅ | ✅ |
| Batería | ✅ | ✅ |
| Alarmas / Eventos | ✅ | ❌ |
| Dirección | ❌ | ✅ |
| Odómetro | ❌ | ✅ |

El operador ve las 4 métricas de su tarjeta de detalle (Velocidad, Dirección, Odómetro, Batería). El administrador ve Velocidad, Batería y Eventos (indicador de alarmas).

Se añadieron tooltips a cada métrica del panel GPS, usando el mismo patrón `relative group cursor-default` aplicado en la tarjeta de detalle del vehículo.

---

## 5. Menú de acciones del dispositivo GPS por rol

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsActionMenu`

| Acción | Administrador | Concesionaria (Operador C-Go) |
|---|:---:|:---:|
| Ubicación | ✅ | ✅ |
| Viajes | ✅ | ✅ |
| Parqueo | ✅ | ❌ |
| Comando | ✅ | ❌ |
| Copiar información | ✅ | ❌ |

El operador no tiene acceso a Parqueo, Comando ni Copiar información desde el menú del dispositivo GPS.

---

## 6. Estado del GPS: Reportando / Inactivo

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsPopover`

Cada dispositivo GPS muestra su estado de transmisión de forma independiente al estado del vehículo:

| Estado | Visual | Significado |
|---|---|---|
| Reportando | Punto verde | El dispositivo está transmitiendo datos activamente |
| Inactivo | Punto slate | El dispositivo no está enviando datos |

El estado del vehículo (`Ignition ON / Ignition OFF`) no se repite dentro del panel GPS porque ya es visible en el badge principal del acordeón.

---

## 7. Fecha de último reporte por dispositivo GPS (Administrador)

**Archivo:** `src/shared/components/FloatingStats.tsx` — `GpsPopover`

El Administrador ve la fecha y hora del último reporte individual (`lastSeen`) de cada dispositivo GPS. Esta fecha es clave para evaluar si el dato es confiable o está desactualizado.

Solo visible para el Administrador — la Concesionaria ve las métricas sin la fecha del GPS.

---

## 8. Métricas de telemetría diferenciadas por rol en la tarjeta de vehículo

**Archivo:** `src/shared/components/FloatingStats.tsx` — `VehicleAccordionItem`

La barra de métricas dentro de la tarjeta expandida varía según el rol:

| Métrica | Administrador | Concesionaria | Cliente |
|---|:---:|:---:|:---:|
| Velocidad | ✅ | ✅ | ✅ |
| Dirección | ❌ | ✅ | ✅ |
| Odómetro | ❌ | ✅ | ✅ |
| Batería | ✅ | ✅ | ✅ |
| Alarmas | ✅ | ❌ | ❌ |

El indicador de alarmas usa ícono campana en naranja. Si hay 0 eventos muestra "Sin eventos". Si hay eventos muestra el conteo en naranja.

La batería tiene color dinámico en todos los roles: rojo ≤20% · amarillo ≤60% · verde >60%.

---

## 9. Vista colapsada del Administrador: fecha de último reporte

**Archivo:** `src/shared/components/FloatingStats.tsx` — `VehicleAccordionItem`

Cuando el Administrador visualiza la lista sin expandir tarjetas, la segunda línea muestra la fecha abreviada del último reporte en lugar de la velocidad:

| Rol | Segunda línea colapsada |
|---|---|
| Administrador | `MOT-101 · 5 may · 9:14 AM` |
| Concesionaria / Cliente | `MOT-101 · 45 km/h` |

Al expandir, el Administrador ve la fecha completa: `Jue 5 may 2026 • 9:14 AM`.

---

## 10. Acciones de Zona 3 diferenciadas por rol

**Archivo:** `src/shared/components/FloatingStats.tsx` — `VehicleAccordionItem`

La barra de acciones (Zona 3) de cada vehículo adapta sus opciones según el rol:

| Acción | Administrador | Concesionaria | Cliente |
|---|:---:|:---:|:---:|
| Ubicación | ✅ | ✅ | ✅ |
| Viajes | ✅ | ✅ | ✅ |
| Parqueo | ✅ | ❌ | ✅ |
| Detalle del vehículo | ❌ | ✅ | ❌ |
| Conducción | ❌ | ✅ | ❌ |
| Comando | ✅ | ❌ | ❌ |
| Bloquear encendido | ❌ | ❌ | ✅ |

---

## 11. Etiqueta de estado del vehículo en C-Go

**Archivo:** `src/shared/components/FloatingStats.tsx`

El badge de estado del vehículo en el perfil C-Go usa terminología técnica en inglés, a solicitud explícita:

| Estado | C-Go | C-Loc |
|---|---|---|
| Encendido | Ignition ON | Encendido |
| Apagado | Ignition OFF | Apagado |
| Sin señal | Disconnected | Desconectado |

---

## 12. Rediseño del popover "Compartir ubicación"

**Archivo:** `src/shared/components/FloatingStats.tsx` — `SharePopover`

El popover fue rediseñado para alinearse al estándar visual de la aplicación (glassmorphism):

- `bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]`
- Ancho fijo: 264px · Padding compacto: `p-3` · Gap: `gap-2`
- Sin ícono redundante en el header — solo texto `"Compartir ubicación"`
- Fila de identidad del vehículo: placa + alias en fondo slate-50
- URL de tracking copiable con botón de copia compacto
- Selector de vigencia: 1h · 8h · 24h · Indefinida
- Botón "Guardar compartido" a ancho completo
- Acceso al historial de compartidos

---

## Correcciones de bugs incluidas

| Bug | Causa | Solución |
|---|---|---|
| Badge GPS "1" visible en vehículos con un solo GPS | Condición `!gpsCount` no detectaba `gpsCount === 1` | Cambiado a `gpsCount <= 1 → return null` |
| Tooltips de métricas GPS no aparecían | Faltaban clases `relative group cursor-default` y markup de tooltip | Agregados siguiendo el patrón de la tarjeta de detalle |

---

*Informe generado — CLocater v0.0.0 · 2026-05-08*
