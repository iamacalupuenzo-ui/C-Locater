# Validación de Mejoras — CLocater
> Documento de presentación para revisión y validación con el equipo.
> Fecha: 2026-05-08

---

## Instrucciones de uso

Este documento reúne cada mejora implementada con su decisión de UX, las preguntas que requieren validación del usuario/área y la captura de pantalla sugerida para ilustrar cada punto. Las preguntas marcadas con 🔴 son bloqueantes para avanzar. Las marcadas con 🟡 son de refinamiento.

---

## MEJORA 1 — Vista colapsada del Administrador: fecha de último reporte

> **Diapositiva:** Vista colapsada

### Qué se implementó
Cuando el Administrador visualiza la lista de vehículos sin expandir ninguno, la segunda línea de cada tarjeta muestra la **fecha y hora del último reporte** en formato abreviado, en lugar de la velocidad.

| Rol | Segunda línea colapsada | Ejemplo |
|-----|------------------------|---------|
| Administrador | Placa + fecha abreviada | `MOT-101` · `5 may · 9:14 AM` |
| Concesionaria / Cliente | Placa + velocidad | `MOT-101` · `45 km/h` |

Al expandir el vehículo, el Administrador ve la fecha completa: `Jue 5 may 2026 • 9:14 AM`.

**Decisión de UX:** El formato completo no cabe en el espacio colapsado sin truncar la placa. La abreviatura `DD mes · H:MM AM/PM` mantiene la información crítica (día, mes, hora) eliminando el año y el día de la semana, que son menos urgentes para una lectura rápida.

### 📸 Captura sugerida
Vista de la lista con varios vehículos colapsados en rol Administrador, mostrando las fechas abreviadas en la segunda línea.

### Preguntas de validación

🟡 **P1.1** — ¿El formato `5 may · 9:14 AM` es suficientemente claro para identificar cuándo fue el último reporte, o se necesita incluir el día de la semana (`Jue 5 may · 9:14 AM`)?

🟡 **P1.2** — Cuando el vehículo se expande y muestra la fecha completa, ¿el nivel de detalle `Jue 5 may 2026 • 9:14 AM` es el esperado o se requiere otro formato?

---

## MEJORA 2 — Métricas de telemetría diferenciadas por rol

> **Diapositiva:** Métricas por rol

### Qué se implementó
La barra de métricas dentro de cada tarjeta de vehículo varía según el rol activo:

| Métrica | Administrador | Concesionaria | Cliente |
|---------|:---:|:---:|:---:|
| Velocidad | ✅ | ✅ | ✅ |
| Dirección | ❌ | ✅ | ✅ |
| Odómetro | ❌ | ✅ | ✅ |
| Batería | ✅ | ✅ | ✅ |
| Alarmas | ✅ | ❌ | ❌ |

**Decisión de UX — Administrador:** El Administrador indicó que Dirección y Odómetro no son relevantes para su gestión. En su lugar, necesita visibilidad inmediata de los eventos de alarma, representados con ícono naranja y contador.

**Indicador de alarmas:** ícono campana (🔔) en naranja. Si hay 0 eventos muestra "Sin eventos". Si hay eventos muestra el conteo en naranja. El naranja fue elegido para diferenciarlo del verde (activo), rojo (crítico) y azul (brand).

**Batería** incluye color dinámico en todos los roles: 🔴 ≤20% · 🟡 ≤60% · 🟢 >60%.

### 📸 Capturas sugeridas
- Tarjeta expandida con rol Administrador (3 métricas, alarma con badge)
- Tarjeta expandida con rol Concesionaria (4 métricas, sin alarmas)
- Comparación lado a lado de ambos estados

### Preguntas de validación

🟡 **P2.1** — ¿El indicador de alarmas en naranja con contador es suficiente para el Administrador, o necesita acceso directo al detalle de los eventos desde esta vista?

🟡 **P2.2** — ¿El Cliente necesita ver alguna métrica diferente a las de la Concesionaria, o la misma vista es válida para ambos?

---

## MEJORA 3 — Panel de dispositivos GPS por vehículo

> **Diapositiva:** Panel de dispositivos GPS

### Qué se implementó
Para el Administrador, cada vehículo con más de un dispositivo GPS muestra un panel expandible con el detalle de cada dispositivo.

**Visibilidad por rol en C-Go:**

| Elemento | Administrador | Concesionaria | Cliente |
|----------|:---:|:---:|:---:|
| Badge contador GPS en ícono | ✅ (todos) | ✅ (sin Contingencia) | ❌ |
| Botón "Ver dispositivos GPS" | ✅ (todos) | ✅ (sin Contingencia) | ❌ |
| SVR Básico | ✅ | ✅ | ❌ |
| SVR Plus | ✅ | ✅ | ❌ |
| SVR X | ✅ | ✅ | ❌ |
| SVR Contingencia | ✅ | ❌ | ❌ |

**Motivo restricción Concesionaria/Contingencia:** SVR Contingencia es un servicio de respaldo de emergencia interno. La Concesionaria no necesita visibilidad de este dispositivo — su existencia es transparente para ella.

### 📸 Capturas sugeridas
- Panel GPS abierto desde rol Administrador mostrando todos los dispositivos (incluyendo Contingencia)
- Mismo vehículo desde rol Concesionaria (sin Contingencia visible)
- Badge numérico en el ícono del vehículo

### Preguntas de validación

🔴 **P3.1 — Nombre del dispositivo:** Actualmente se muestra el nombre del plan (`SVR Plus`, `SVR Básico`). ¿Este es el dato correcto para identificar el dispositivo, o se prefiere otro nombre (ej. alias del dispositivo, número de serie, modelo)?

🔴 **P3.2 — Identificador secundario:** Debajo del nombre del plan se muestra el identificador técnico (OBC, IMEI o Línea). ¿Es este el dato que el equipo necesita ver en esa posición, o se prefiere otro dato de referencia?

🔴 **P3.3 — Etiquetas de jerarquía (Principal / Secundario / Respaldo):** Según el requerimiento funcional, la lógica implementada es:

| Etiqueta | Cuándo aplica | Flujo de datos |
|----------|--------------|----------------|
| **Principal** | Primer dispositivo del vehículo (cualquier tipo) | Usuario final + terceros (Financieras, Aseguradoras) |
| **Secundario** | Segundo servicio contratado (ej. SVR + SVR Plus en la misma unidad) | Usuario final + terceros |
| **Respaldo** | SVR Contingencia — dispositivo de emergencia, no es un segundo contrato | Solo consola interna Comsatel |

¿Esta definición es correcta? ¿Puede haber más de un dispositivo etiquetado como Secundario en la misma unidad?

🟡 **P3.4 — Color violeta para SVR Contingencia:** El nombre del dispositivo SVR Contingencia se muestra en violeta para diferenciarlo visualmente de los otros tipos. ¿Este color comunica bien la naturaleza diferente de este dispositivo, o se prefiere otro tratamiento visual?

---

## MEJORA 4 — Fecha del dispositivo GPS (Administrador)

> **Diapositiva:** Fecha del dispositivo

### Qué se implementó
A solicitud del Administrador, cada dispositivo GPS dentro del panel muestra la fecha y hora de su **último reporte individual** (`lastSeen`). Esta fecha es exclusiva de cada dispositivo y es el indicador clave para saber si un dato es confiable o está desactualizado.

**Solo visible para el Administrador** — la Concesionaria ve las métricas sin la fecha del GPS.

**Ejemplo de caso real:**

| Dispositivo | Último reporte | Interpretación |
|-------------|---------------|----------------|
| SVR Plus (Principal) | 02/05/2026 10:00 AM | Dato de hace 3 días → obsoleto |
| SVR Contingencia (Respaldo) | 05/05/2026 05:15 PM | Dato de hoy → confiable |

### 📸 Captura sugerida
Panel GPS expandido desde rol Administrador mostrando la fecha debajo del badge de estado de cada dispositivo.

### Preguntas de validación

🟡 **P4.1** — ¿El formato de fecha `Jue 5 may 2026 • 9:14 AM` es adecuado para esta vista, o se prefiere un formato más corto dado el espacio disponible?

---

## MEJORA 5 — Estado del GPS: Reportando / Inactivo

> **Diapositiva:** Estado del GPS

### Qué se implementó
Cada dispositivo GPS muestra su estado de transmisión independientemente del estado del vehículo:

| Estado GPS | Visual | Significado |
|------------|--------|-------------|
| 🟢 Reportando | Verde | El dispositivo está transmitiendo datos activamente |
| ⚫ Inactivo | Slate | El dispositivo no está enviando datos |

**Decisión de UX:** El estado del GPS (`Reportando/Inactivo`) y el estado del vehículo (`Ignition ON/OFF`) son datos independientes. Un GPS puede estar `Inactivo` mientras el vehículo está encendido (falla del dispositivo), o `Reportando` con el vehículo apagado (posición estacionada confiable). Mostrar ambos es técnicamente preciso pero puede saturar la vista.

El estado del vehículo ya es visible en el badge principal del acordeón (`Ignition ON / Ignition OFF`), por lo que no se repite dentro del panel GPS.

### 📸 Captura sugerida
Panel GPS con dos dispositivos: uno Reportando y uno Inactivo, junto al badge de estado del vehículo en el acordeón principal.

### Preguntas de validación

🔴 **P5.1** — ¿Es suficiente mostrar solo el estado del GPS (`Reportando / Inactivo`) dentro del panel de dispositivos, o es necesario mostrar también el estado del vehículo (`Encendido / Apagado`) por dispositivo?

Nuestra recomendación UX: **solo el estado del GPS**, porque:
- El estado del vehículo ya está visible en el acordeón principal
- Repetirlo dentro del panel de cada dispositivo GPS generaría redundancia
- Cuando un GPS está inactivo, su dato de ignición puede ser obsoleto (stale), lo que podría confundir al operador

🟡 **P5.2** — ¿Los términos "Reportando" e "Inactivo" son los correctos para el equipo, o se prefieren otros como "Activo / Desconectado" o "En línea / Sin señal"?

---

## MEJORA 6 — Acciones del acordeón diferenciadas por rol

> **Diapositiva:** Acciones por rol

### Qué se implementó
La barra de acciones de cada vehículo (Zona 3) adapta sus opciones según el rol:

| Acción | Administrador | Concesionaria | Cliente |
|--------|:---:|:---:|:---:|
| Ubicación | ✅ | ✅ | ✅ |
| Viajes | ✅ | ✅ | ✅ |
| Parqueo | ✅ | ❌ | ✅ |
| Detalle del vehículo | ❌ | ✅ | ❌ |
| Conducción | ❌ | ✅ | ❌ |
| Comando | ✅ | ❌ | ❌ |
| Bloquear encendido | ❌ | ❌ | ✅ |

### 📸 Capturas sugeridas
- Zona 3 con rol Administrador
- Zona 3 con rol Concesionaria
- Zona 3 con rol Cliente

### Preguntas de validación

🟡 **P6.1** — ¿Las opciones "Detalle del vehículo" y "Conducción" para la Concesionaria corresponden a las vistas funcionales esperadas, o se requieren otras acciones en esas posiciones?

🟡 **P6.2** — ¿El Cliente debe poder usar "Parqueo" o esta acción debería quedar solo para el Administrador?

---

## MEJORA 7 — Etiqueta de estado del vehículo en C-Go

> **Diapositiva:** Etiquetas de estado

### Qué se implementó
A solicitud explícita, el badge de estado del vehículo en C-Go usa terminología técnica en inglés:

| Estado | C-Go | C-Loc |
|--------|------|-------|
| Encendido | **Ignition ON** | Encendido |
| Apagado | **Ignition OFF** | Apagado |
| Sin señal | **Disconnected** | Desconectado |

### Preguntas de validación

🟡 **P7.1** — ¿Los términos `Ignition ON / OFF / Disconnected` son los términos correctos para el contexto operativo de C-Go, o se prefiere otra terminología técnica?

---

## MEJORA 8 — Flujo de compartir ubicación (rediseño)

> **Diapositiva:** Compartir ubicación

### Qué se implementó
El popover de "Compartir ubicación" fue rediseñado para alinearse al estándar visual de la aplicación (glassmorphism, tipografía compacta, espaciado reducido).

**Elementos del popover:**
- Título sin ícono redundante
- Fila de identidad: placa + alias del vehículo
- URL de tracking copiable
- Selector de vigencia: 1h · 8h · 24h · Indefinida
- Botón "Guardar compartido"
- Acceso al historial de compartidos

### 📸 Captura sugerida
Popover de compartir abierto sobre un vehículo con el historial de compartidos expandido.

### Preguntas de validación

🔴 **P8.1** — ¿Qué roles pueden generar compartidos? ¿Solo el Administrador, o también la Concesionaria y el Cliente?

🟡 **P8.2** — ¿El destinatario del compartido debe registrarse con un nombre/etiqueta, o es suficiente con copiar el enlace directamente?

🟡 **P8.3** — ¿La vigencia "Indefinida" requiere alguna confirmación adicional o restricción de permisos?

---

## FUERA DEL ALCANCE — Validación con ESAB

Los siguientes ítems no están dentro del alcance funcional actual pero se identificaron durante el desarrollo como candidatos a validar con el equipo técnico y de negocio.

### F1 — Funcionalidad "Copiar información" del dispositivo GPS

**Descripción:** Un toque copia al portapapeles toda la información del dispositivo GPS: propietario, placa, alias, coordenadas, telemetría del GPS específico.

**A validar:**
- ¿Es factible para desarrollo extraer esta información de manera inmediata desde el backend?
- ¿El formato de texto plano es suficiente o se requiere otro formato (JSON, PDF)?
- ¿Esta función es necesaria para el flujo operativo diario?

### F2 — Contador de eventos por tipo de dispositivo GPS

**Descripción:** Actualmente se muestra un contador total de eventos por dispositivo. Se evaluó si es posible desglosar por tipo de evento.

**A validar:**
- ¿Es posible calcular el conteo de eventos diferenciando por tipo desde el backend?
- ¿El equipo de administración (ESAB) requiere el mismo nivel de detalle de eventos que el Administrador del cliente?
- ¿Es suficiente el indicador de cantidad como contexto, o se requiere acceso al listado?

### F3 — Menú de opciones del dispositivo GPS (⋮)

**Descripción:** El menú de opciones de cada GPS actualmente incluye: Ubicación · Viajes · Parqueo · Comando · Copiar información.

**A validar:**
- ¿Las opciones actuales cubren las necesidades operativas del equipo?
- ¿Se requiere alguna opción adicional no contemplada?
- ¿Alguna opción debe eliminarse o renombrarse?

---

*Documento generado para revisión — CLocater v0.0.0 · 2026-05-08*
