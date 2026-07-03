# Presentación Ejecutiva — Decisiones de UX: Navegación Principal (Sidebar)

> Documento de sustentación de diseño basado en investigación de benchmarking competitivo y principios de experiencia de usuario aplicados a plataformas de rastreo de flotas vehiculares.
>
> **Decisiones documentadas:**
> 1. Estructura de navegación y jerarquía de información
> 2. Atajos de teclado como mecanismo de velocidad de acceso
> 3. Panel flotante de monitoreo vs. tabla de datos
> 4. Revelación progresiva en la card de vehículo y modelo multi-GPS
> 5. Sistema de acciones contextuales con múltiples puntos de entrada
> 6. Modelo de pestañas por unidad y resiliencia ante fallo de GPS
> 7. Control de layout y visibilidad por el usuario
> 8. Asistente inteligente como reductor de carga cognitiva y ejecutor de acciones

---

## 1. Contexto del análisis

La navegación lateral (sidebar) es el elemento de mayor impacto en la curva de aprendizaje de una plataforma B2B compleja. En plataformas de gestión de flotas, el usuario opera en contextos de alta carga cognitiva: monitorea múltiples vehículos, responde a alertas en tiempo real y consulta reportes bajo presión operativa. Una navegación mal estructurada aumenta el tiempo de tarea, eleva la tasa de error y genera abandono temprano.

El benchmark realizado cubre seis plataformas activas en el mercado latinoamericano y global: **myGEOTAB, Webtrack, Motive, TRACKLOG, Mapon** y una plataforma en evaluación adicional. A partir de este análisis se tomaron las decisiones estructurales de la navegación de CLocater.

---

## 2. Benchmark competitivo — Hallazgos por plataforma

### 2.1 myGEOTAB
**Fortalezas:** Buscador integrado en el sidebar. Agrupación en categorías con expansión por "+". Diferenciación entre funciones primarias y secundarias.

**Debilidades identificadas:** Saturación visual por exceso de niveles. La distinción entre ítems principales y secundarios no tiene jerarquía tipográfica clara. El usuario con menos de 3 meses de uso tiene dificultad para recordar en qué grupo vive cada función (heurística de recuerdo vs. reconocimiento). El sidebar no colapsa, ocupando espacio permanente en pantallas de baja resolución.

### 2.2 Webtrack
**Fortalezas:** Uso de etiquetas de sección en mayúsculas (GENERAL / APPS / LOGÍSTICA / ADMINISTRACIÓN). Indicadores de estado de funciones futuras ("Próximamente") y de plan ("Premium"). Buena diferenciación de contextos funcionales.

**Debilidades identificadas:** Las secciones no tienen una lógica de modelo mental del usuario; responden más a la arquitectura del producto que a las tareas del usuario. El ítem "Dashboard" marcado como próximo genera frustración por expectativa no cumplida. La sección LOGÍSTICA tiene profundidad excesiva de subítems expandibles en cascada.

### 2.3 Motive
**Fortalezas:** Sidebar oscuro con buen contraste. Buscador en posición prominente (primer elemento visible). ítems planos sin submenús innecesarios. Indicadores de novedad ("NUEVO") contextualmente ubicados.

**Debilidades identificadas:** Sin agrupación semántica entre ítems; el listado plano de 13 ítems supera el límite de retención inmediata (7 ± 2, Miller's Law). Sin soporte de teclado visible. Sin indicador de ítem activo de alto contraste en el tema oscuro.

### 2.4 TRACKLOG
**Fortalezas:** Nombres propios de producto como ítems de navegación (DashTrack, MapTrack, ReporTrack). Identidad de marca integrada en la navegación.

**Debilidades identificadas:** Nombres propietarios sin referente semántico inmediato generan confusión en usuarios nuevos. El usuario no puede inferir qué hace "QRTrack" o "ProTrack" sin exploración previa. Viola el principio de visibilidad del sistema (Nielsen). Sin categorización, sin atajos, sin modo colapsado.

### 2.5 Mapon
**Fortalezas:** Lista limpia y ordenada. Ítem "Plegar Menú" visible y consistente. Centro de ayuda anclado al fondo. Contraste adecuado en tema oscuro.

**Debilidades identificadas:** Sin agrupación de ítems relacionados. Mezcla funciones operativas (Mapa, Conductores) con funciones de cuenta (Tienda, Mensajería) sin separación visual. Sin atajos de teclado. Sin buscador integrado. Menú siempre en máximo ancho, consumiendo espacio de mapa permanentemente.

---

## 3. Hallazgos transversales del benchmark

| Atributo analizado | Estado en competencia | Implicancia |
|---|---|---|
| Agrupación semántica por modelo mental del usuario | Parcial (Webtrack, myGEOTAB) | Necesaria para reducir carga cognitiva |
| Colapso del sidebar con persistencia de icono | Ausente (mayoría) | Crítico en pantallas < 1440px |
| Buscador integrado cuando ítems > 7 | Solo myGEOTAB y Motive | Necesario al crecer el catálogo |
| Atajos de teclado visibles | Ninguno | Ventaja diferencial para usuarios expertos |
| Tooltips en modo colapsado | Ninguno evaluado | Resuelve el riesgo de pérdida de contexto al colapsar |
| Soporte light/dark mode en el sidebar | Algunos (Motive, TRACKLOG) | Estándar moderno de interfaz |
| Indicador de estado activo de alto contraste | Inconsistente | Fundamental para orientación en la sesión |
| Usuario y rol visible en el sidebar | Ninguno en posición inferior | Necesario en sistemas multi-rol |

---

## 4. Decisiones de diseño de CLocater — Sustentación

### 4.1 Estructura de dos grupos: Navegación + Gestión

**Decisión:** Los ítems del sidebar se organizan en dos grupos diferenciados visualmente mediante una etiqueta de sección: un grupo de navegación principal (Dashboard, Explorar, Flota, En vivo, Informes) y un grupo de gestión operativa (Caminos, Geocercas).

**Justificación UX:** La separación responde al modelo mental del usuario de flota, que distingue entre *ver qué está pasando ahora* (navegación: mapa, alertas, dashboard) y *configurar cómo operar* (gestión: definición de rutas, zonas). Mezclar ambas categorías en una lista plana —como ocurre en Mapon y TRACKLOG— obliga al usuario a escanear toda la lista para encontrar una función. La etiqueta "Gestión" en mayúsculas y menor escala actúa como separador semántico sin añadir un ítem adicional (patrón validado en Webtrack).

**Referente:** Webtrack utiliza headers de sección; myGEOTAB usa grupos expandibles. CLocater adopta el header de sección simple sin necesidad de colapso por grupo, dado que el volumen de ítems no lo requiere en el estado actual.

---

### 4.2 Etiquetas de ítem: palabras del vocabulario del usuario

**Decisión:** Cada ítem usa una palabra que el usuario ya tiene en su vocabulario operativo: Explorar, Flota, En vivo, Informes, Caminos, Geocercas. No se usan nombres propietarios de producto.

**Justificación UX:** El error de TRACKLOG (DashTrack, MapTrack, QRTrack) ilustra el costo de romper el vocabulario del usuario. Los usuarios de flotas vehiculares operan con términos de su dominio; la interfaz debe mapear sobre ese vocabulario, no imponer el propio. La heurística de Nielsen de "correspondencia entre el sistema y el mundo real" establece que el lenguaje de la interfaz debe ser el del usuario, no el del desarrollador.

---

### 4.3 Subítems por acordeón inline (no subniveles expandibles en cascada)

**Decisión:** Los ítems con hijos (Flota, Informes) expanden un acordeón inline de nivel único. No existe un tercer nivel de navegación.

**Justificación UX:** El sidebar de Webtrack ejemplifica el problema del submenú en cascada: el usuario debe mantener abiertos múltiples acordeones para tener visibilidad del árbol completo, generando desorientación. El modelo de acordeón de nivel único mantiene toda la arquitectura de información en un único panel, respetando el principio de visibilidad del sistema. La animación de apertura (Framer Motion) proporciona feedback visual del cambio de estado.

---

### 4.4 Sidebar colapsable (224px ↔ 72px) con íconos persistentes

**Decisión:** El sidebar colapsa a una versión de solo íconos (72px) con animación. En modo colapsado, cada ítem muestra un tooltip en hover con el nombre del ítem y el atajo de teclado correspondiente. Los ítems con hijos muestran un popover flotante con el submenú completo.

**Justificación UX:** Ninguna de las plataformas evaluadas en el benchmark implementa un sidebar colapsable. El impacto en usabilidad es directo: el sidebar de ancho fijo consume entre 160px y 240px de espacio horizontal en todo momento, recortando el viewport del mapa —el elemento central de la aplicación—. En pantallas de 1366px (resolución mayoritaria en entornos corporativos peruanos), un sidebar fijo de 224px consume el 16% del ancho total. El modo colapsado a 72px recupera 152px para el mapa sin perder acceso a la navegación.

El tooltip en hover resuelve el riesgo de desorientación al colapsar: el usuario que olvidó la posición de un ítem puede reconocerlo por ícono + tooltip sin necesidad de expandir el sidebar. Esto aplica el principio de reconocimiento sobre recuerdo.

---

### 4.5 Atajos de teclado visibles con badge de tecla

**Decisión:** Cada ítem de navegación primaria muestra su atajo de teclado como un badge de `<kbd>` al costado del label. Los atajos también funcionan globalmente (D=Dashboard, 1=Explorar, 2=Flota, 3=En vivo, 4=Informes, C=Caminos, G=Geocercas, \=colapsar sidebar).

**Justificación UX:** Ninguna plataforma del benchmark expone atajos de teclado. Para usuarios de alto volumen (operadores que trabajan 8+ horas diarias en la plataforma), los atajos de teclado son la diferencia entre eficiencia y fatiga de interacción. La visibilidad del atajo en la UI permite el aprendizaje progresivo: el usuario no necesita memorizar los atajos de antemano; los descubre en contexto y los internaliza naturalmente. Los badges `<kbd>` son el patrón estándar de exposición de atajos (Figma, Linear, Notion).

---

### 4.6 Buscador: condicional por volumen, no siempre presente

**Decisión:** El sidebar actual no incluye buscador. La arquitectura contempla su adición cuando el número de ítems de navegación supere el umbral de carga cognitiva (~7 ítems directamente visibles).

**Justificación UX:** myGEOTAB y Motive incluyen buscador porque su catálogo supera los 15 ítems de navegación. CLocater en su estado actual tiene 7 ítems principales (5 en navegación + 2 en gestión), dentro del límite de Miller (7 ± 2). Agregar un buscador con menos de 9 ítems añade complejidad de interfaz sin reducir carga cognitiva real; el usuario puede localizar cualquier ítem por escaneo visual directo. La arquitectura del sidebar está preparada para integrar el buscador cuando el producto escale (SearchInput ya existe en el sistema de componentes).

---

### 4.7 Indicador de estado activo: contraste diferenciado por tema

**Decisión:** El ítem activo usa un fondo con contraste perceptual controlado: `bg-gray-900/6` en light mode, `bg-white/12` en dark mode. El texto activo es `font-semibold` vs. `font-medium` en inactivo. El ícono activo tiene `strokeWidth: 2` vs. `1.75` en inactivo.

**Justificación UX:** El estado activo debe comunicarse con al menos dos señales visuales independientes (color + tipografía, o color + forma) para ser accesible a usuarios con deficiencias de percepción cromática. En el benchmark, TRACKLOG usa solo color de fondo; Mapon usa solo peso de fuente. CLocater combina tres señales: fondo, tipografía y grosor de ícono, garantizando orientación en la sesión bajo cualquier condición de percepción o iluminación ambiental.

---

### 4.8 Zona de usuario y rol en el footer del sidebar

**Decisión:** El footer del sidebar muestra el avatar del usuario, nombre y rol activo en modo expandido. En modo colapsado, muestra solo el avatar. El cierre de sesión está en el footer, junto a las utilidades auxiliares (ayuda, configuración, feedback).

**Justificación UX:** En un sistema multi-rol (Administrador, ESAD, Concesionaria, Cliente Directo), el usuario necesita saber en qué rol está operando en todo momento. Ninguna plataforma del benchmark expone el rol activo en el sidebar. La consecuencia es que un usuario que cambia de rol por error opera con permisos incorrectos sin saberlo. Anclar el rol al footer del sidebar crea un punto de referencia permanente, sin ocupar espacio de la zona de navegación.

La posición en el footer sigue el patrón de las aplicaciones de productividad moderna (Slack, Linear, Figma): usuario + rol en el extremo inferior izquierdo, separado de los ítems de navegación por una línea divisoria.

---

### 4.9 Soporte de tema claro y oscuro

**Decisión:** El sidebar tiene dos paletas de color definidas explícitamente (`LIGHT_THEME` / `DARK_THEME`), aplicadas sin condicionales de clase en línea. El toggle está en el footer del sidebar (ícono sol/luna con animación de rotación).

**Justificación UX:** El dark mode no es una tendencia estética sino una necesidad operativa para entornos de monitoreo 24/7. Los centros de control de flota operan frecuentemente en condiciones de baja iluminación (salas de despacho con luz tenue, vehículos de supervisión de noche). Una interfaz exclusivamente clara genera fatiga visual y dificulta la lectura de alertas. La paleta oscura de CLocater usa zinc (tono azul-gris) en lugar de neutral puro, con mayor coherencia visual con los tiles del mapa en modo oscuro (Stadia Alidade Smooth Dark).

---

## 5. Resumen comparativo de posicionamiento

| Atributo | myGEOTAB | Webtrack | Motive | TRACKLOG | Mapon | **CLocater** |
|---|---|---|---|---|---|---|
| Agrupación semántica | Parcial | Sí | No | No | No | **Sí** |
| Sidebar colapsable | No | No | No | No | Sí (parcial) | **Sí (72↔224px)** |
| Atajos de teclado | No | No | No | No | No | **Sí (7 atajos)** |
| Tooltips en modo colapsado | No | No | No | No | No | **Sí** |
| Rol del usuario visible | No | No | No | No | No | **Sí (footer)** |
| Light + Dark mode | No | No | Oscuro | Oscuro | Oscuro | **Ambos** |
| Vocabulario del usuario | Sí | Parcial | Sí | No | Sí | **Sí** |
| Buscador integrado | Sí | No | Sí | No | No | **Condicional (pendiente escala)** |
| Indicador activo multi-señal | No | No | No | No | No | **Sí (fondo+tipografía+ícono)** |

---

---

## 6. Decisión 2 — Atajos de teclado como mecanismo de velocidad de acceso

### 6.1 El problema que resuelven los atajos

En plataformas de gestión de flotas, el perfil de usuario más frecuente es el **operador de alta frecuencia**: una persona que trabaja 6 a 10 horas diarias en la misma herramienta, ejecutando las mismas tareas en ciclos repetitivos. Para este usuario, el costo acumulado de interacción no se mide en segundos por tarea sino en **horas por mes**.

Un operador que navega al mapa 40 veces al día usando el mouse recorre el mismo camino visual 40 veces: buscar el sidebar, identificar el ítem, mover el cursor, hacer clic. Con un atajo de teclado, ese mismo recorrido se reduce a una tecla. La diferencia por tarea es de 2 a 4 segundos. Multiplicada por 40 acciones diarias y 22 días laborales, equivale a entre 30 y 60 minutos de tiempo recuperado por mes por operador.

**La velocidad de decisión no es un detalle de refinamiento; es un requisito operativo.**

---

### 6.2 Por qué ningún competidor lo implementa — y qué oportunidad abre

El benchmark de las seis plataformas evaluadas (myGEOTAB, Webtrack, Motive, TRACKLOG, Mapon y FleetView) confirma que **ninguna expone atajos de teclado** en su navegación principal. Las razones probables son:

- Estas plataformas fueron diseñadas originalmente para mouse, y el teclado se trató como accesibilidad básica (Tab + Enter), no como optimización de velocidad.
- En mercados donde el producto llegó primero y sin competencia directa, la velocidad de acceso no era una palanca diferencial.
- La exposición visible de atajos (badges `<kbd>`) requiere un sistema de diseño maduro; sin él, los atajos existen ocultos o no existen.

La ausencia en la competencia no invalida la decisión: la confirma como **ventaja diferencial**. El usuario que hoy usa myGEOTAB o Motive nunca ha experimentado navegación con teclado en una plataforma de flota. Cuando lo experimente en CLocater, la diferencia percibida en eficiencia se convierte en argumento de retención.

---

### 6.3 Principio de diseño: usuario novato vs. usuario experto

Los atajos de teclado son el mecanismo estándar de la curva de pericia en interfaces de productividad. El modelo de Nielsen y Molich sobre **aceleradores de uso** establece que una buena interfaz debe servir simultáneamente a dos perfiles:

| Perfil | Necesidad | Mecanismo |
|---|---|---|
| **Usuario novato** | Descubrir qué puede hacer | Ítems visibles, etiquetas claras, íconos reconocibles |
| **Usuario experto** | Ejecutar rápido lo que ya sabe | Atajos de teclado, gestos, comandos |

El error de diseño más común es optimizar solo para el novato: interfaces de descubrimiento que penalizan al usuario que ya aprendió. CLocater resuelve ambos perfiles en simultáneo: el sidebar con labels e íconos sirve al novato; los atajos sirven al experto. **El mismo diseño, dos velocidades de uso.**

---

### 6.4 Atajos implementados y su lógica de asignación

Los atajos no se asignaron arbitrariamente. Responden a dos criterios: **mnemonicidad** (la tecla se puede inferir del nombre) y **posición física en el teclado** (teclas de fácil acceso sin mover la mano izquierda del home row).

| Atajo | Vista / Acción | Criterio de asignación |
|---|---|---|
| `D` | Dashboard | Inicial del nombre |
| `1` | Explorar (Mapa) | Primera vista operativa; número natural de orden |
| `2` | Flota | Segunda vista en jerarquía |
| `3` | En vivo | Tercera vista; urgencia operativa en el tercer nivel |
| `4` | Informes | Cuarta vista |
| `C` | Caminos | Inicial del nombre |
| `G` | Geocercas | Inicial del nombre |
| `\` | Colapsar / expandir sidebar | Tecla disponible entre zona de letras y Enter; sin colisión con atajos de sistema |
| `Ctrl + B` | Abrir buscador de flota (FloatingMonitor) | Patrón estándar en herramientas de productividad (B de "Buscar") |

**Regla de seguridad:** Ningún atajo se activa cuando el foco está en un campo de texto (`INPUT`, `TEXTAREA`). Esto evita que el usuario que está escribiendo una búsqueda o un formulario dispare navegación accidental.

---

### 6.5 Visibilidad progresiva: el badge `<kbd>` como mecanismo de aprendizaje

La decisión de mostrar los atajos visualmente en el sidebar —no en un modal de ayuda separado— responde al principio de **aprendizaje en contexto**. Un usuario que visita el ítem "Explorar" 20 veces con el mouse eventualmente nota el badge `1` a su derecha. Lo prueba. Lo adopta. Sin necesidad de documentación.

Este patrón es el mismo que usan Figma, Linear, Notion y GitHub: los atajos se muestran en los tooltips y menús contextuales, donde el usuario ya está mirando. No se presentan como una lista de comandos que el usuario debe estudiar.

**La exposición pasiva del atajo es la mejor estrategia de adopción.**

En modo colapsado, el tooltip que aparece al hover sobre cada ícono también muestra el atajo, garantizando que el usuario que colapsa el sidebar no pierde el acceso al aprendizaje de atajos.

---

### 6.6 Extensibilidad: atajos como sistema, no como función aislada

Los atajos de navegación son la primera capa de un sistema que puede escalar hacia funcionalidades más profundas:

- **Capa 1 (implementada):** Navegación entre vistas (`D`, `1–4`, `C`, `G`).
- **Capa 2 (proyectada):** Acciones sobre el elemento activo. Ejemplo: cuando un vehículo está seleccionado en el mapa, `V` abre su vista de viaje, `E` expande su detalle, `Esc` lo deselecciona.
- **Capa 3 (futura):** Paleta de comandos (`Ctrl+K`) — patrón de acceso universal a cualquier función por nombre, sin necesidad de conocer la ubicación en el sidebar. Referente: Linear, Vercel, Raycast.

El sistema de atajos actual no es un añadido cosmético; es la base sobre la que se construirá la velocidad de acceso a medida que el producto escala en funcionalidades.

---

---

## 7. Decisión 3 — Panel flotante de monitoreo vs. tabla de datos

### 7.1 El estado anterior: la tabla como paradigma heredado

La interfaz original del sistema (CLocater v2.36, Comsatel) presenta la lista de vehículos como una **tabla de datos tabulares** anclada en la parte inferior de la pantalla. El esquema reproduce el modelo de las primeras generaciones de software B2B de rastreo: una grilla con columnas para Placa, Código Externo, Rumbo, Fecha de Última Localización, Tiempo de Parada, Dirección, Referencia, Velocidad, Estado de Ignición, Estado del Vehículo y Posición.

Este modelo es funcionalmente completo pero tiene costos de usabilidad significativos:

- **Fragmentación del espacio visual:** la tabla ocupa el tercio inferior de la pantalla de forma fija, reduciendo el mapa a aproximadamente el 60% del viewport. El mapa es el artefacto principal de la tarea; la tabla lo subordina.
- **Carga cognitiva por densidad:** 11 columnas visibles en simultáneo. El usuario debe escanear horizontalmente para encontrar el dato relevante, y el dato más urgente (estado del vehículo, posición) queda al extremo derecho de la tabla.
- **Desconexión entre lista y mapa:** la tabla y el mapa son dos superficies independientes. Seleccionar un vehículo en la tabla no centra el mapa en ese vehículo de forma fluida; el usuario debe ejecutar una acción adicional.
- **Sin capacidad de filtrado contextual rápido:** el único mecanismo de búsqueda es un campo "Por: Placa" con un buscador explícito. No hay filtros de estado o tipo de vehículo accesibles en un solo clic.

---

### 7.2 Benchmark: cómo lo resuelven otras plataformas

**Motive — Fleet View (panel lateral fijo):**
Motive presenta la lista de vehículos como un panel lateral izquierdo de cards. Cada card muestra: nombre del vehículo, marca, conductor asignado, asset secundario, dirección y velocidad. El panel convive con el mapa a pantalla completa a su derecha.

*Ventajas observadas:* Las cards concentran la información más relevante en un formato escaneable verticalmente. El mapa ocupa el espacio real de trabajo. La velocidad aparece en cada card como dato inmediato.

*Limitaciones:* El panel es fijo en posición y ancho; no puede ocultarse para maximizar el mapa. Los filtros (Vehicles, Status, Duty Status, Dispatch) están en una barra sobre el panel, bien ejecutados pero separados de la lista. No hay colapsado de panel.

---

### 7.3 La solución adoptada: panel flotante draggable

CLocater reemplaza la tabla por un **panel flotante de posición variable** (`FloatingMonitor`) que convive sobre el mapa sin dividir el viewport. Las decisiones específicas de diseño y su justificación:

**a) Flotante sobre el mapa, no lateral fijo**

El panel no reserva espacio del layout; flota sobre el mapa con fondo glassmorphism semitransparente (`bg-white/85 backdrop-blur-2xl`). El mapa ocupa el 100% de la pantalla en todo momento. El usuario ve el contexto geográfico completo mientras consulta la lista.

*Justificación:* En tareas de monitoreo activo, el usuario necesita correlacionar la lista con la posición en el mapa simultáneamente. Con el panel lateral fijo de Motive, el usuario pierde de vista la mitad del mapa. Con el panel flotante, el fondo geográfico permanece legible incluso debajo del panel.

**b) Draggable con snap a izquierda o derecha**

El usuario puede arrastrar el panel horizontalmente. Al soltar, hace snap al lado más cercano (izquierda o derecha), y el mapa ajusta su padding para no quedar cubierto en la zona de interés. El sistema recuerda el lado activo durante la sesión.

*Justificación:* Distintos roles tienen distintos hábitos de uso de pantalla. Un operador zurdo o uno con múltiples monitores puede necesitar el panel al lado derecho. El snap evita posiciones intermedias que obstaculizarían el mapa sin ventaja visual.

**c) Cards con información priorizada (no columnas)**

Cada vehículo se presenta como una **card vertical** con:
- Ícono de tipo de vehículo + color de estado (verde activo / naranja sin señal / rojo desconectado)
- Placa en tipografía prominente + código GPS en secundario
- Estado de ignición (ícono de encendido coloreado)
- Fecha y hora del último reporte

La información se lee de arriba hacia abajo en un solo vistazo; no requiere desplazamiento horizontal.

*Justificación:* En la tabla original, el estado del vehículo (el dato más urgente para el operador) está en la penúltima columna. El usuario debe recorrer toda la fila para llegar a él. En la card, el estado se comunica visualmente en el primer elemento (color del ícono), antes de leer cualquier texto.

**d) Buscador integrado como elemento principal**

El buscador es el elemento superior del panel, siempre visible, con el hint del atajo de teclado (`Ctrl+B`). Busca en tiempo real sobre placa y nombre (alias del conductor).

*Justificación:* En una flota de 85+ vehículos, el operador raramente necesita ver todos los vehículos al mismo tiempo; necesita encontrar uno específico en el menor tiempo posible. El buscador como primer elemento visual prioriza ese flujo.

**e) Filtros contextuales de primer nivel: Estado y Tipo**

El panel expone dos filtros en la barra inmediatamente debajo del buscador: **Estado** (Todos / En ruta / Detenido / Sin señal) y **Tipo** (Todos / Moto / Auto / Camión / Bus). Un tercer botón **Más** está disponible para filtros adicionales.

*Justificación:* Las preguntas más frecuentes de un operador de flota son del tipo "¿cuáles están detenidos?" o "¿cuántas motos están activas?". Filtros de un solo clic responden esas preguntas sin necesidad de búsqueda por nombre. La estructura actual de dos filtros principales responde al 80% de los casos de uso identificados; el botón "Más" preserva la extensibilidad sin saturar la interfaz en el estado actual.

**f) Se oculta al mover el mapa**

Cuando el usuario interactúa con el mapa (pan o zoom), el panel se oculta con transición de opacidad y se deshabilita el pointer events. Al soltar el mapa, reaparece.

*Justificación:* El usuario que mueve el mapa está en modo de exploración geográfica; el panel es ruido visual en ese momento. La ocultación automática amplía el campo de visión exactamente cuando se necesita, sin requerir una acción explícita de cierre.

---

### 7.4 Decisiones pendientes de validación

El diseño actual del panel está funcionalmente completo pero tiene dos decisiones abiertas que requieren validación con usuarios reales antes de cerrar:

**1. ¿Cuántos filtros son necesarios?**

Los filtros actuales (Estado + Tipo) cubren los casos de uso hipotéticos más frecuentes. Sin embargo, dependiendo de la realidad operativa de los clientes, podrían necesitarse filtros adicionales: por grupo/subgrupo de flota, por conductor asignado, por zona geográfica (geocerca), por tiempo de parada. Si el número de filtros supera 4 o 5, la estructura de la barra de filtros debe revisarse para no saturar el ancho del panel.

**Método de validación propuesto:** Entrevista contextual con operadores activos — "¿Cuándo abres la lista de vehículos, qué es lo primero que quieres ver? ¿Cuándo necesitas acotar la lista, qué criterio usas?" (ver documento de metodologías de validación).

**2. ¿Qué información debe mostrar cada card en estado colapsado?**

La card actual muestra placa, código GPS, tipo, estado de ignición y última actualización. Es posible que distintos roles necesiten datos distintos en la vista colapsada: el administrador puede necesitar ver el conteo de alarmas; el operador puede necesitar ver la velocidad en tiempo real.

**Método de validación propuesto:** Card sorting sobre los campos disponibles, preguntando a cada rol qué 3 o 4 datos son indispensables en la vista rápida.

---

---

## 8. Decisión 4 — Revelación progresiva en la card de vehículo y modelo multi-GPS

### 8.1 El problema de mostrar todo al mismo tiempo

Una unidad vehicular en una plataforma de rastreo no es un objeto simple. Tiene posición, estado operativo, telemetría, historial, conductor asignado, y puede estar vinculada a uno o más dispositivos GPS que reportan de forma independiente, con frecuencias distintas y desde posiciones distintas.

El enfoque tradicional —la tabla del sistema anterior— resolvía este problema exponiendo todos los campos en columnas simultáneas. El costo es la saturación: el operador que solo quiere saber si un vehículo está activo debe escanear una fila completa de 11 columnas para obtener una respuesta binaria.

La pregunta de diseño no es *cuánta información mostrar* sino *en qué orden revelarla*, en función del flujo de decisión real del operador.

---

### 8.2 El modelo de revelación progresiva

La card de vehículo se diseñó como una estructura de **tres capas de información**, cada una accesible a demanda, sin que las capas inferiores contaminen visualmente las superiores.

**Capa 1 — Identidad y estado (siempre visible, card colapsada)**

Lo mínimo que el operador necesita para identificar la unidad y tomar una primera decisión sobre si requiere atención:

- Ícono de tipo de vehículo con color de estado (verde / naranja / rojo / gris) — responde "¿está operando bien?" sin leer texto
- Placa en tipografía principal — identificador único de la unidad
- Código GPS en tipografía secundaria — referencia técnica para el operador o soporte
- Estado de ignición (ícono de encendido coloreado) — responde "¿el motor está encendido?"
- Fecha y hora del último reporte — responde "¿cuándo fue la última vez que supe de este vehículo?"

Con estos cinco elementos el operador puede tomar la decisión de ignorar la unidad o expandirla para saber más. No necesita leer nada adicional.

**Capa 2 — Contexto operativo (visible al expandir la card)**

Cuando el operador decide que necesita más información sobre esa unidad específica, expande la card y accede a:

- Dirección legible (nombre de calle) + coordenadas — responde "¿dónde está exactamente?"
- Grid de métricas clave: Odómetro (KM acumulados), Velocidad actual, Batería (%), Eventos de alarma — responde "¿cómo está funcionando la unidad en este momento?"
- Botón de acceso a dispositivos GPS — responde "¿cuántos GPS tiene esta unidad y qué reporta cada uno?"

La selección de estas cuatro métricas en el grid no es arbitraria. Responde a las preguntas más frecuentes del operador en una revisión rápida: *¿cuánto ha recorrido? / ¿está en movimiento? / ¿tiene energía? / ¿hay algo que atender?* Cuatro métricas es el límite de escaneo visual sin contar; con cinco o más el usuario debe detenerse a leer, perdiendo la velocidad del vistazo.

**Capa 3 — Dispositivos GPS (acceso desde botón, panel lateral)**

Esta capa existe porque el modelo de datos del negocio lo requiere: **una unidad puede tener múltiples dispositivos GPS** con roles distintos (Principal, Secundario, Contingencia) que reportan de forma independiente.

---

### 8.3 El modelo multi-GPS y por qué importa en la UX

Un vehículo con un GPS de flota (SVR Plus, reporte cada 30 segundos) y un GPS de contingencia (reporte cada 1 hora) puede mostrar dos posiciones distintas en el mapa al mismo tiempo. Esta es una realidad operativa, no un error del sistema.

Si la interfaz no lo explica, el operador interpreta la discrepancia como un fallo: "el sistema me está mostrando dos ubicaciones distintas para el mismo vehículo". La confusión genera llamadas de soporte, desconfianza en la plataforma y eventualmente abandono.

La decisión de diseño es hacer esta diferencia **explícita y comprensible**, no ocultarla:

**a) El panel "Dispositivos GPS" como superficie de información técnica**

Al presionar el botón "Ver N dispositivo(s) GPS", se abre un panel superpuesto que lista cada dispositivo por separado. Cada dispositivo muestra:

- Nombre del plan (SVR Plus, SVR Básico, SVR Contingencia, SVR X) + jerarquía (Principal / Secundario)
- Fecha y hora de su propio último reporte — no del vehículo; cada GPS tiene su propio timestamp
- Estado de transmisión (Transmitiendo / Sin señal) con badge coloreado
- Estado de ignición leído por ese GPS
- IMEI y número de línea — datos técnicos de identificación del dispositivo
- Posición propia del GPS: dirección + coordenadas
- Métricas propias: odómetro, velocidad, batería, eventos leídos por ese GPS
- Grupo y subgrupo de la flota a la que pertenece (visible para roles con acceso administrativo)

**b) La posición en el mapa corresponde al GPS, no al vehículo**

Esta es la regla que define toda la lógica de visualización: cuando hay múltiples GPS, el mapa muestra **un marcador por GPS**, no un marcador por vehículo. Cada marcador está anclado a la posición reportada por ese dispositivo.

El usuario que comprende esta regla entiende inmediatamente por qué el GPS de contingencia puede aparecer en una posición diferente: su último reporte fue hace 55 minutos, cuando el vehículo estaba en otro punto de la ruta. No es un error; es información sobre la frecuencia de reporte del dispositivo.

**c) La jerarquía Principal / Secundario orienta al usuario hacia el dato más confiable**

El diseño distingue visualmente el dispositivo Principal (tipografía prominente, etiqueta de color azul) del Secundario (mismo formato, etiqueta gris). El operador entiende que la posición más actualizada y confiable es la del Principal. Si el Principal no está transmitiendo, el Secundario es el mejor dato disponible. El de contingencia es el último recurso.

Esta jerarquía transforma un problema de datos confusos en un sistema de redundancia comprensible.

---

### 8.4 Por qué esta arquitectura es superior al modelo de columna única

| Atributo | Tabla tradicional (sistema anterior) | Card con revelación progresiva (CLocater) |
|---|---|---|
| Tiempo para saber si un vehículo está activo | Escaneo de fila completa (~3s) | Lectura del ícono de color (~0.3s) |
| Visibilidad de múltiples GPS | Una fila por GPS (genera filas duplicadas por vehículo) | Panel dedicado, estructurado por jerarquía |
| Claridad sobre posiciones distintas por GPS | No existe explicación visual | Posición propia por dispositivo con timestamp individual |
| Densidad de información visible sin acción | Alta (todas las columnas siempre) | Baja en capa 1; controlada en capa 2 y 3 |
| Capacidad de escaneo rápido de toda la flota | Lento por densidad horizontal | Rápido: ícono de color resuelve el 80% de los casos |

---

### 8.5 La capa de visualización en el mapa: cada GPS como marcador independiente

Cuando el usuario abre el panel de Dispositivos GPS de una unidad, el mapa entra en un modo de contexto específico para esa unidad: **cada dispositivo GPS activo obtiene su propio marcador en el mapa**, posicionado en las coordenadas que ese dispositivo reportó en su última transmisión.

**Qué muestra cada marcador:**
- Ícono con color propio por dispositivo (azul para SVR Plus, verde para SVR Básico, naranja para SVR X, morado para SVR Contingencia)
- Nombre del plan del dispositivo
- Hora del último reporte de ese GPS
- Badge de estado: Online (punto verde) / Desconectado (texto gris)

**La polyline punteada como conector de posiciones:**
Todos los marcadores GPS activos se conectan entre sí mediante una línea punteada azul. Esta línea no es una ruta recorrida; es un conector visual que comunica al usuario que todos esos puntos pertenecen al mismo vehículo. Sin la línea, cuatro marcadores dispersos en el mapa se percibirían como cuatro vehículos distintos.

**Por qué la polyline es punteada y no continua:**
Una línea continua sugiere trayectoria o movimiento secuencial. Los GPS no necesariamente reportaron en ese orden ni desde posiciones consecutivas; un GPS de contingencia que reportó a las 11:22 p.m. del día anterior puede aparecer a varios kilómetros del GPS principal que reportó a las 07:30 a.m. La línea punteada comunica *asociación* sin implicar *ruta*.

**La lectura que hace el operador al ver la pantalla:**
El operador que abre los dispositivos GPS de un vehículo con 4 dispositivos ve en el mapa cuatro marcadores en distintas posiciones, conectados por líneas punteadas. La diferencia de timestamps en cada marcador (07:30 / 07:28 / 06:45 / 11:22 p.m.) explica visualmente por qué están en posiciones distintas: cada uno reportó desde donde el vehículo estaba en ese momento. El GPS desconectado (SVR Contingencia, 11:22 p.m.) queda en el extremo superior izquierdo del mapa, visualmente más alejado, reflejando que su dato es el más antiguo.

Esta visualización convierte un dato potencialmente confuso —múltiples posiciones para un mismo vehículo— en un argumento claro sobre **la salud del sistema de rastreo de esa unidad**: cuántos GPS están transmitiendo activamente, cuál tiene el dato más reciente, y si algún dispositivo requiere atención técnica.

---

### 8.6 Decisiones abiertas de esta capa

**1. Qué métricas mostrar en el grid de la card expandida según el rol**

El administrador puede necesitar ver el conteo de alarmas como dato prioritario; el operador puede necesitar velocidad; el cliente directo puede no necesitar telemetría interna. El grid de 4 métricas actual es genérico. La validación con usuarios por rol determinará si se necesitan grids distintos por perfil.

**2. Información del dispositivo de contingencia: ¿mostrar o colapsar por defecto?**

Un GPS de contingencia con un reporte de hace 1 hora puede generar más confusión que claridad si el operador no entiende el modelo de datos. Una opción es mostrar los dispositivos no-Principal colapsados por defecto, con una etiqueta explicativa de la frecuencia de reporte. Esto requiere validación con usuarios técnicos y no técnicos por separado.

**Método de validación propuesto para ambas:** Test de usabilidad think-aloud mostrando un vehículo con 3 GPS en distintas posiciones. Observar si el usuario entiende la discrepancia de posiciones sin instrucción previa (ver `ux-validacion-metodologias.md`).

---

---

## 9. Decisión 5 — Sistema de acciones contextuales con múltiples puntos de entrada

### 9.1 El problema que resuelve

En plataformas de gestión de flotas, las acciones operativas críticas —iniciar un parqueo, registrar una captura, abrir un viaje— tienen un costo de acceso alto en el modelo tradicional: el usuario debe identificar el vehículo, navegar a su vista de detalle, ubicar el menú de acciones y ejecutar. Cada paso adicional entre la intención y la acción es fricción que, en situaciones de urgencia operativa, se traduce en tiempo perdido o en errores por presión.

La pregunta de diseño es: **¿desde cuántos puntos del flujo debería el usuario poder ejecutar una acción crítica sin perder el contexto en el que está trabajando?**

---

### 9.2 Los tres puntos de entrada al mismo conjunto de acciones

CLocater implementa el principio de **acceso sin pérdida de contexto**: las acciones principales de una unidad son alcanzables desde cualquier superficie donde el usuario pueda estar trabajando, sin necesidad de navegar a una vista dedicada.

**Punto de entrada 1 — Card contextual del mapa (clic en el marcador)**

Cuando el usuario hace clic sobre el marcador de un vehículo en el mapa, aparece una card anclada en la esquina inferior izquierda con:
- Identidad de la unidad: placa + estado (Detenido / Activo) + estado de ignición (Apagado / Encendido)
- Fecha y hora del último reporte
- Dirección legible
- Barra de acciones primarias: **Parqueo · Captura · Viajes · Más**

El usuario que está explorando el mapa —revisando posiciones, evaluando rutas, respondiendo a una alerta geográfica— puede ejecutar una acción sobre ese vehículo sin abandonar el mapa ni abrir el panel lateral. La card se superpone al mapa con glassmorphism; el contexto geográfico permanece visible.

**Punto de entrada 2 — Menú ⋮ de la card en el panel de búsqueda**

Cada tarjeta de vehículo en el `FloatingMonitor` expone un botón de tres puntos (⋮) en su cabecera. Este menú da acceso a las mismas acciones primarias y a acciones secundarias (ubicación, copiar información, anclar vehículo). El usuario que está buscando o filtrando vehículos en el panel puede ejecutar una acción sin tener que abrir el detalle completo ni ir al mapa.

**Punto de entrada 3 — Menú ⋮ del dispositivo GPS en el panel de Dispositivos**

Cada dispositivo GPS listado en el panel de Dispositivos GPS también expone su propio menú de tres puntos. Este punto de entrada atiende el flujo del usuario técnico —soporte, ESAD, administrador— que está revisando el estado de los dispositivos y necesita ejecutar una acción sobre la unidad sin salir del contexto de diagnóstico del GPS.

---

### 9.3 Las acciones primarias y su lógica de selección

Las cuatro acciones visibles en la barra son **Parqueo, Captura, Viajes** y **Más**. La elección de estas tres como acciones de primer nivel no es arbitraria.

| Acción | Qué inicia | Por qué es primaria |
|---|---|---|
| **Parqueo** | Registro de estadía de la unidad en un punto | Acción reactiva frecuente: el operador detecta una unidad detenida y necesita registrar formalmente el parqueo |
| **Captura** | Apertura del panel de detalle completo de la unidad | Permite al usuario "tomar control" de la unidad para monitoreo intensivo; es la transición de observar a gestionar activamente |
| **Viajes** | Inicio o revisión de viaje asignado | Acción de flujo de despacho; frecuencia alta para operadores de logística |
| **Más** | Acceso a acciones secundarias (ubicación, comando, copiar, historial) | Preserva la limpieza visual de la barra sin eliminar capacidades menos frecuentes |

El criterio de primer nivel es **frecuencia de uso + urgencia operativa**. Las acciones que el operador ejecuta bajo presión o en ciclos cortos de trabajo (parqueo, captura, viaje) están en la barra visible. Las acciones que requieren reflexión o son de menor frecuencia quedan bajo "Más".

---

### 9.4 Consistencia entre puntos de entrada: mismo conjunto de acciones, mismo orden

Los tres puntos de entrada exponen el mismo conjunto de acciones en el mismo orden. Esta consistencia no es un detalle visual; es un requisito de memoria muscular. Si el operador aprende que "Captura está en la segunda posición de la barra", ese aprendizaje debe ser válido independientemente de desde dónde abra el menú. Variaciones en el orden o en la presencia de acciones entre puntos de entrada obligan al usuario a buscar en lugar de actuar.

La única diferencia permitida entre puntos de entrada es el nivel de información contextual disponible: la card del mapa muestra la dirección y el estado; el menú ⋮ de la card del panel muestra el mismo menú sin el contexto visual del mapa. Las acciones son idénticas.

---

### 9.5 Por qué no existe una sola vista de acciones centralizada

El modelo alternativo —una vista de detalle de vehículo con todas las acciones en un solo lugar— obliga al usuario a cambiar de contexto antes de poder actuar. Si el operador está en el mapa viendo una alerta de posición y necesita iniciar un parqueo, el modelo centralizado le exigiría: cerrar el contexto del mapa → navegar a la vista de detalle → ejecutar la acción → volver al mapa. Cuatro pasos.

Con el sistema de puntos de entrada múltiples: clic en el marcador → clic en Parqueo. Dos pasos. El mapa nunca se cierra.

Este patrón —**acciones contextuales sobre el objeto, no acciones en una vista dedicada al objeto**— es la diferencia entre una interfaz de monitoreo reactivo (pensada para responder rápido a eventos) y una interfaz de administración (pensada para operar con tiempo y contexto completo). CLocater está diseñada para el primer caso.

---

### 9.6 Decisión abierta: composición del menú "Más" por rol

El contenido de "Más" varía según el rol del usuario. Un administrador puede necesitar acceso a "Comando" (envío de instrucciones al dispositivo); un operador puede necesitar "Ver historial de viajes"; un cliente puede no necesitar acceso técnico en absoluto.

La composición actual del menú "Más" es genérica. La validación con usuarios por rol determinará qué acciones deben promoverse al nivel primario para cada perfil, y cuáles pueden eliminarse del menú para reducir opciones irrelevantes.

**Método de validación propuesto:** Entrevista de frecuencia de acciones — "De las acciones que te muestro, ¿cuáles ejecutas más de 5 veces al día? ¿Cuáles ejecutas menos de una vez por semana?" Las acciones de alta frecuencia son candidatas a primer nivel; las de baja frecuencia van bajo "Más" o se eliminan de la vista rápida.

---

---

## 10. Decisión 6 — Modelo de pestañas por unidad y resiliencia ante fallo de GPS

### 10.1 El problema de las vistas que reemplazan el mapa

El modelo tradicional de plataformas de flota opera con vistas excluyentes: el usuario abre el detalle de un vehículo y el mapa desaparece. Para volver al mapa, debe cerrar el detalle. Si en ese intermedio necesita consultar la posición de otra unidad, comparar dos vehículos, o simplemente orientarse geográficamente, debe abandonar el contexto de detalle que estaba revisando.

Este modelo es funcional para usuarios que trabajan de forma secuencial —primero el mapa, luego el detalle, luego vuelven al mapa—, pero penaliza el flujo real del operador de alta carga, que necesita mantener múltiples contextos activos simultáneamente: el mapa general de la flota, el viaje en curso de una unidad, y la captura activa de otra.

---

### 10.2 El sistema de pestañas: el mapa como contexto permanente

Cuando el usuario inicia una acción sobre una unidad —un viaje, una captura— el sistema no reemplaza el mapa con la vista de detalle. En cambio, **abre una pestaña nueva en la barra inferior**, manteniendo el mapa como contexto base al que siempre se puede volver.

La barra de pestañas ocupa la franja inferior de la pantalla y contiene:
- **Pestaña "Mapa"** — siempre presente, siempre accesible, cierre no permitido
- **Pestaña por unidad en acción** — identificada por placa (TRK-221), con ícono de tipo de vehículo y botón de cierre. Si la unidad tiene una alerta activa, la pestaña muestra un badge de advertencia

El usuario puede tener múltiples pestañas de unidades abiertas simultáneamente. Cambiar entre ellas no destruye el estado de ninguna: el viaje que estaba revisando en TRK-221 continúa exactamente donde lo dejó cuando vuelve de revisar el mapa.

**Por qué el mapa no puede cerrarse:**
El mapa no es una vista más; es el espacio de trabajo primario de la plataforma. Todas las acciones ocurren en referencia a una posición geográfica. Permitir cerrar el mapa quitaría el fundamento de orientación sobre el que el operador toma decisiones. La pestaña "Mapa" no tiene botón de cierre.

---

### 10.3 Qué contiene cada pestaña de unidad

**Vista de Viajes:**
El panel lateral de la pestaña de viaje muestra la lista de viajes de esa unidad, con:
- Identificador de la unidad + estado GPS + estado de ignición en el encabezado
- Filtros de fecha: Hoy / Todos / Fecha específica
- Por cada viaje: fecha, estado (En curso / Finalizado), rango horario, dirección de origen, dirección de destino, distancia total, duración, contador de eventos
- El mapa a la derecha centra la vista en esa unidad, manteniendo visibles el resto de vehículos de la flota en sus posiciones reales

**Vista de Captura:**
La pestaña de captura es la superficie de monitoreo más intensiva del sistema. Presenta tres columnas:
- **Columna izquierda — Info del dispositivo:** datos técnicos del GPS activo (tipo, IMEI, línea, grupo, odómetro, velocidad, combustible, estado de conexión, alarmas) y datos del vehículo (propietario, placa, código de motor)
- **Columna central — Posiciones:** lista cronológica de cada posición registrada durante la sesión de captura, con timestamp, dirección legible y coordenadas. Se actualiza en tiempo real a medida que el GPS reporta nuevas posiciones
- **Columna derecha — Mapa:** trayectoria de la captura dibujada como línea punteada sobre el mapa, con marcador de inicio (punto A). La ruta se construye punto a punto en tiempo real

En la parte superior del mapa, una barra de progreso de estado de la captura: **Inicio de captura → En proceso → Finalizado**. El usuario sabe en qué fase de la captura está sin necesidad de interpretar los datos del panel.

---

### 10.4 Resiliencia operativa: detección proactiva de fallo del GPS principal

Durante una sesión de captura, el sistema monitorea continuamente el estado de transmisión del GPS activo. Si el GPS principal (tipo "Flotas") deja de reportar mientras la captura está en curso, **el sistema detecta el fallo y presenta proactivamente una modal de alerta**.

**La modal "GPS principal sin señal" comunica:**
- Que el GPS principal no está reportando (con ícono de advertencia en amarillo — alerta, no error crítico)
- Que hay otro dispositivo GPS disponible en esa unidad (con nombre del tipo y número de dispositivo)
- El estado del dispositivo alternativo: "Disponible"
- Dos opciones claras: **Omitir** (continuar la captura sabiendo que el GPS principal falló) o **Cambiar a contingencia →** (migrar la sesión al GPS de respaldo)

**Por qué esta modal es una decisión de diseño relevante y no solo un mensaje de error:**

La mayoría de los sistemas de rastreo muestran un estado de "sin señal" en un badge o en la columna de estado, y dejan que el operador lo descubra por sí mismo mientras trabaja. El costo de esa omisión es silencioso pero severo: la captura continúa ejecutándose sobre un GPS que no reporta, acumulando posiciones vacías o erróneas, sin que el operador lo sepa hasta que revisa el resultado.

CLocater invierte esa lógica: **el sistema detecta el problema antes que el usuario y le propone la solución**. El operador no necesita saber nada sobre GPS de contingencia, frecuencias de reporte o redundancia de dispositivos; el sistema le presenta la situación en lenguaje llano y le da una acción directa.

**El diseño de la acción primaria "Cambiar a contingencia →":**
La acción de migración es el botón primario (fondo azul, texto blanco, ícono de dispositivo + flecha de dirección). "Omitir" es la acción secundaria (texto plano, sin fondo). Este orden comunica la recomendación del sistema sin eliminar la agencia del operador: si el operador tiene una razón para no cambiar, puede omitir. Pero el diseño nunca presenta ambas opciones como equivalentes.

---

### 10.5 Actualización de posiciones bajo demanda

La lista de posiciones en la vista de captura no es estática ni se actualiza sola en bucle forzado. **Se actualiza cuando el usuario lo necesita**: el contador de posiciones ("POSICIONES 21") refleja el total acumulado, y el botón de recarga permite al operador solicitar la actualización en el momento en que lo considera oportuno.

Esta decisión responde a dos realidades operativas:
1. Un GPS de contingencia puede reportar cada 1 hora. Forzar actualizaciones automáticas frecuentes generaría una sensación de "pantalla que no responde" si no hay datos nuevos.
2. El operador que está revisando la lista de posiciones necesita que esa lista sea estable mientras la lee; si se actualiza sola puede perder la posición que estaba leyendo o confundirse con los nuevos registros que aparecen.

El control de actualización manual devuelve la agencia al operador: él decide cuándo quiere ver si hay posiciones nuevas, en lugar de que la interfaz decida por él.

---

### 10.6 Resumen de la arquitectura de multitarea

| Patrón | Modelo tradicional | CLocater |
|---|---|---|
| Acceso al detalle de un vehículo | Reemplaza el mapa | Abre una pestaña; el mapa persiste |
| Múltiples vehículos en detalle simultáneo | Imposible | Múltiples pestañas, cada una con su estado preservado |
| Fallo del GPS durante una sesión activa | Badge de estado; el usuario debe descubrirlo | Modal proactiva con diagnóstico y acción directa |
| GPS de contingencia como recurso | Configurable manualmente desde otra vista | Propuesto automáticamente en el momento exacto en que se necesita |
| Actualización de posiciones | Automática (puede interrumpir la lectura) | Bajo demanda: el operador controla cuándo refresca |

---

### 10.7 Decisiones abiertas

**1. ¿Cuántas pestañas puede tener abiertas un operador simultáneamente?**
Sin límite definido, el operador podría acumular pestañas de todas las unidades de la flota. A partir de cierto número (estimado: 5-6 pestañas), la barra inferior se satura y las placas dejan de ser legibles. Se debe definir un límite máximo y el comportamiento cuando se alcanza (scroll horizontal en la barra, desbordamiento con "N más", o aviso de límite).

**2. ¿Qué información mostrar en el badge de alerta de la pestaña?**
Cuando una unidad en pestaña tiene un evento de alarma, la pestaña muestra un badge. Está pendiente definir si el badge muestra el conteo de alarmas, el tipo de alarma más reciente, o solo un indicador genérico de atención requerida.

**Método de validación propuesto:** Test de usabilidad think-aloud con escenario de múltiples vehículos. Observar si el operador descubre solo la navegación entre pestañas, si comprende que el mapa persiste, y si el límite de pestañas genera confusión o frustración.

---

---

## 11. Decisión 7 — Control de layout y visibilidad por el usuario

### 11.1 El principio: la interfaz se adapta al usuario, no al revés

Las plataformas B2B de alta complejidad fallan cuando asumen que todos los usuarios necesitan ver la misma información en el mismo orden y en la misma posición. Un operador que usa una pantalla de 24 pulgadas en un centro de control tiene necesidades de distribución distintas a un supervisor que trabaja en una laptop de 14 pulgadas sobre el terreno. Un técnico de soporte que necesita ver los datos de IMEI y línea de forma inmediata tiene necesidades distintas a un operador de logística que solo le importa la lista de posiciones.

La respuesta de diseño de CLocater no es crear perfiles de layout por rol —lo que generaría una proliferación de variantes difíciles de mantener— sino **dar al usuario los controles para adaptar el layout a su propia necesidad**, dentro de un conjunto acotado de opciones que mantienen la coherencia del sistema.

---

### 11.2 Control 1 — Posición del panel de Posiciones

Dentro de la vista de captura, el panel "POSICIONES" —la lista cronológica de puntos registrados— puede reposicionarse mediante un selector de tres opciones presentado como un picker visual de miniaturas:

| Opción | Descripción | Caso de uso típico |
|---|---|---|
| **Izquierda** | Panel de posiciones a la izquierda de la pantalla, info del GPS a la derecha | Usuario que quiere seguir la lista mientras ve el mapa al fondo |
| **Derecha** | Panel de posiciones al extremo derecho | Usuario con pantalla ancha que prefiere el mapa centrado |
| **Abajo** | Panel de posiciones en una franja horizontal inferior | Usuario que quiere maximizar el espacio vertical del mapa y la info del GPS |

El picker usa miniaturas de layout —íconos que representan gráficamente la distribución resultante— en lugar de texto descriptivo. El usuario no necesita leer para entender qué producirá cada opción; la miniatura lo comunica directamente. La opción activa se resalta con borde y fondo azul.

**Por qué tres posiciones y no drag libre:**
El drag libre (como el del FloatingMonitor en el mapa principal) funciona bien sobre una superficie abierta como el mapa. En la vista de captura, los tres paneles deben mantener proporciones coherentes entre sí para que la información sea legible. Un snap a tres posiciones garantiza que ninguna combinación produzca un panel demasiado estrecho o un mapa inutilizablemente pequeño. La libertad del usuario está acotada por la legibilidad mínima del sistema.

---

### 11.3 Control 2 — Visibilidad de secciones mediante tabs

El panel izquierdo de la vista de captura contiene dos bloques de información con naturaleza distinta: **Dispositivo GPS** (datos técnicos del dispositivo activo) e **Información del Vehículo** (datos de identidad de la unidad). Sobre este panel, tres pestañas actúan como filtros de visibilidad: **Info, GPS, Posiciones**.

Cada pestaña oculta o muestra una capa de contenido:

- **Info** — muestra el bloque "Información del Vehículo" (propietario, placa, código de motor) y colapsa los datos técnicos del GPS. Para el operador que necesita identificar la unidad legalmente o comunicarse con el propietario.
- **GPS** — muestra el bloque "Dispositivo GPS" completo (tipo, IMEI, línea, grupo, odómetro, velocidad, combustible, conexión, alarmas). Para el técnico o el operador que está diagnosticando el estado del dispositivo.
- **Posiciones** — equivalente al selector de posición del panel; permite traer la lista de posiciones al foco sin usar el selector de reposicionamiento.

**La diferencia entre ocultar y eliminar:**
Los datos que el usuario oculta mediante las tabs no desaparecen del sistema; siguen actualizándose en segundo plano. El usuario que oculta el bloque GPS mientras revisa las posiciones puede volver a verlo en cualquier momento sin perder datos. Esta distinción es fundamental para que el usuario confíe en el control: ocultar no significa perder.

---

### 11.4 La filosofía de diseño detrás de ambos controles

Estos dos mecanismos comparten un principio común que los diferencia de la personalización tradicional: **son controles de sesión, no configuraciones persistentes**.

El usuario no está "configurando su perfil"; está ajustando el workspace para la tarea específica que está ejecutando ahora. Cuando cierra la sesión de captura y abre otra, el sistema puede ofrecer la última posición usada como punto de partida, pero la capacidad de cambiarla en cualquier momento durante la sesión es lo que hace al control útil.

Este patrón es consistente con las herramientas de productividad modernas (Notion, Linear, Figma) donde el usuario ajusta el layout según el contexto de trabajo actual, no según una preferencia fija. La diferencia con esas herramientas es que CLocater acota las opciones disponibles al mínimo funcional, evitando la parálisis por exceso de configuración que afecta a herramientas hiperpersonalizables.

**La regla de diseño que gobierna ambos controles:** el usuario puede cambiar *cómo ve* la información, pero no puede cambiar *qué información existe*. El sistema siempre tiene los datos; el usuario decide cuánta superficie dedicarle en cada momento.

---

### 11.5 Extensibilidad del modelo

El mismo patrón de control de visibilidad y posición es aplicable a otras superficies del sistema donde el usuario podría beneficiarse de adaptabilidad:

- **Vista de Viajes:** las columnas del panel de viajes (origen, destino, distancia, duración, eventos) podrían ser ocultables individualmente para usuarios que solo necesitan ver origen-destino y duración.
- **FloatingMonitor:** la barra de filtros (Estado, Tipo, Más) podría permitir al usuario reordenar los filtros según cuál usa más, o fijar un filtro como predeterminado.
- **Panel de Dispositivos GPS:** el orden de los dispositivos (Principal primero, luego Secundarios) podría ser reordenable para usuarios que trabajan habitualmente con el dispositivo de contingencia como fuente primaria.

Estas extensiones no están implementadas; se documentan aquí como horizonte del modelo para guiar las decisiones de diseño cuando el producto escale.

---

### 11.6 Decisión abierta: ¿persistir la configuración entre sesiones?

La pregunta abierta más relevante de esta decisión es si el sistema debe recordar la posición del panel y las tabs activas entre sesiones. Dos posturas:

- **No persistir:** cada sesión empieza en el estado por defecto. El usuario siempre tiene certeza de qué va a encontrar. Más predecible, menos personalizado.
- **Persistir por usuario:** el sistema recuerda la última configuración usada. El operador que siempre trabaja con el panel de posiciones abajo no tiene que reposicionarlo cada vez. Más eficiente, requiere backend de preferencias por usuario.

**Método de validación propuesto:** Entrevista de frecuencia — "Si reposicionas el panel hoy, ¿esperarías encontrarlo en la misma posición mañana cuando vuelvas a usar la plataforma?"

---

---

## 12. Decisión 8 — Asistente inteligente como reductor de carga cognitiva y ejecutor de acciones

### 12.1 El problema raíz: la complejidad de la flota escala, la atención del operador no

Una plataforma de rastreo vehicular con 85 unidades activas, múltiples dispositivos GPS por unidad, alertas en tiempo real, filtros de estado, vistas de viaje, capturas en curso y herramientas de gestión es, por definición, un sistema de alta densidad informativa. Cada una de las decisiones de diseño documentadas en este informe —la revelación progresiva, los filtros contextuales, el control de layout— tiene como objetivo reducir la fricción para acceder a la información correcta en el momento correcto.

Pero existe un límite estructural a lo que el diseño visual puede resolver: **la carga cognitiva del operador que no recuerda la placa de una unidad, que necesita ubicar un vehículo por una característica que no es la placa, o que está bajo presión operativa y no puede dedicar tiempo a filtrar, buscar y escanear.**

La pregunta de diseño que abre esta decisión no es "¿cómo organizamos mejor la información?" sino **"¿qué pasa cuando el usuario ya no quiere navegar la interfaz y solo quiere obtener un resultado?"**

---

### 12.2 La carga cognitiva como problema de diseño medible

El concepto de carga cognitiva en UX describe el esfuerzo mental que el usuario debe invertir para operar una interfaz. Existen tres tipos:

| Tipo | Descripción | Origen en plataformas de flota |
|---|---|---|
| **Intrínseca** | Complejidad inherente al dominio | La flota tiene 85 unidades, cada una con estado, GPS, alertas y métricas |
| **Extrínseca** | Complejidad generada por la interfaz | Tener que filtrar, buscar, escanear y navegar para llegar a un dato |
| **Germinal** | Esfuerzo de procesamiento que genera aprendizaje útil | Recordar qué hace cada botón, qué significa cada badge |

El diseño de CLocater reduce activamente la carga extrínseca (filtros rápidos, revelación progresiva, atajos de teclado). Pero la carga intrínseca —la que viene de la complejidad real del dominio— no puede eliminarse con diseño visual. Un operador que gestiona 85 vehículos tiene 85 unidades que atender.

El asistente inteligente ataca la carga intrínseca de una forma que el diseño visual no puede: **permite al operador expresar su necesidad en lenguaje natural y delegar la búsqueda y ejecución al sistema**.

---

### 12.3 Qué hace el asistente y cómo lo hace

El asistente de CLocater es un agente conversacional con acceso al estado en tiempo real de la flota. Acepta entrada por voz (reconocimiento de audio vía Groq Whisper) y por texto, y responde en lenguaje natural con síntesis de voz opcional.

**Capacidades actuales del agente:**

| Intención del usuario | Acción que ejecuta el agente |
|---|---|
| "Ubica el camión de Juan" | Busca la unidad por nombre del conductor, hace fly-to en el mapa y la selecciona |
| "¿Dónde está la placa TRK-221?" | Localiza la unidad, centra el mapa en su posición actual |
| "¿Cuántos vehículos están detenidos ahora?" | Consulta el estado de la flota y responde con el conteo en tiempo real |
| "Muéstrame los vehículos sin señal" | Filtra la lista del monitor y centra el mapa en esas unidades |
| "Dame el resumen de la flota" | Genera un reporte verbal del estado general: activos, detenidos, sin señal, con alarmas |

El agente no solo responde; **ejecuta acciones sobre la interfaz**. Cuando el usuario dice "ubica el camión de Juan", el mapa se mueve, la unidad queda seleccionada y el panel de detalle se abre — exactamente lo que el usuario habría hecho en cuatro interacciones manuales, comprimido en una instrucción de voz de tres segundos.

---

### 12.4 El caso de uso central: búsqueda por característica, no por placa

El sistema de búsqueda convencional del FloatingMonitor opera sobre placa y nombre (alias). Funciona bien cuando el operador conoce la placa o el alias de la unidad que busca. Pero hay situaciones frecuentes en las que el operador no tiene ese dato:

- "El vehículo que estaba en la zona de Callao esta mañana"
- "El camión que lleva más de 2 horas detenido"
- "El que tiene alarmas activas en este momento"
- "La moto que está más lejos de Lima"

Ninguno de esos criterios es una placa. Son descripciones de estado, posición, comportamiento o contexto. Un buscador de texto no puede resolverlos. Un filtro visual tampoco, porque el operador necesitaría combinar múltiples filtros, interpretar los resultados y tomar la decisión por sí mismo.

El agente inteligente puede recibir esa descripción, consultar el estado de la flota, identificar la unidad que cumple los criterios y presentar el resultado directamente — sin que el usuario haya tenido que recordar ninguna placa, activar ningún filtro ni escanear ninguna lista.

---

### 12.5 Entrada por voz: por qué es más que una conveniencia

La entrada por voz no es solo una modalidad alternativa de input; es una solución a un problema físico real. Los operadores de flota frecuentemente trabajan en condiciones donde el mouse y el teclado no son el canal más eficiente:

- Operadores de campo que supervisan desde un vehículo en movimiento
- Supervisores en salas de control con múltiples monitores que no quieren cambiar el foco de pantalla
- Operadores que están al teléfono con un conductor y necesitan ubicar la unidad de ese conductor mientras siguen hablando

En esos contextos, poder decir "¿dónde está JUAN?" sin soltar el teléfono, sin mover el mouse y sin cambiar la vista es la diferencia entre una plataforma que se integra al flujo de trabajo real y una que lo interrumpe.

El reconocimiento de voz implementado (Groq Whisper) incluye detección de actividad de voz (VAD) con umbral de ruido para entornos de trabajo ruidosos, y cancelación de eco para evitar falsos positivos cuando el sistema mismo está reproduciendo audio. No es un prototipo de demostración; está diseñado para funcionar en el entorno operativo real.

---

### 12.6 El agente como capa de abstracción sobre la complejidad del sistema

Una forma de entender el rol del asistente es como una **capa de abstracción conversacional** sobre todas las decisiones de diseño documentadas en este informe. El usuario no necesita saber:

- Que el mapa tiene un FloatingMonitor con filtros de Estado y Tipo
- Que puede expandir una card para ver las métricas
- Que puede abrir el panel de Dispositivos GPS para ver posiciones individuales
- Que puede iniciar una captura desde el menú ⋮

El usuario puede simplemente decir lo que necesita, y el agente navega el sistema en su nombre.

Esto no reemplaza el diseño visual — el diseño visual sigue siendo la interfaz principal para el 90% de las interacciones. Pero para el 10% de casos donde la complejidad del dominio supera la capacidad de navegación del usuario en ese momento (alta presión, falta de información del nombre/placa, multitarea simultánea), el agente elimina la barrera.

---

### 12.7 Consideraciones de confianza y transparencia

Un asistente que ejecuta acciones sobre la interfaz introduce un riesgo de confianza que el diseño visual no tiene: el usuario necesita saber qué hizo el agente, por qué lo hizo así, y cómo deshacerlo si no era lo que quería.

Las decisiones de diseño de confianza implementadas:

- **El agente confirma antes de ejecutar acciones destructivas o irreversibles.** Ubicar una unidad en el mapa es inmediatamente reversible (el usuario puede cerrar la selección); iniciar una captura o cambiar un GPS no lo es. Las acciones del segundo tipo requieren confirmación explícita.
- **El agente responde en lenguaje natural describiendo lo que hizo.** "Encontré TRK-221 en Av. Colonial, Breña. La estoy mostrando en el mapa." El usuario puede verificar visualmente que la acción fue correcta.
- **El modo de texto está siempre disponible como alternativa al modo de voz.** Un operador que no quiere que sus interacciones con el agente sean audibles (sala con clientes, reunión) puede cambiar a texto sin perder ninguna capacidad.
- **El agente no tiene acceso a acciones de configuración del sistema ni a datos sensibles de otras cuentas.** Su dominio de acción está acotado al estado de la flota del usuario autenticado.

---

### 12.8 Decisiones abiertas

**1. ¿El agente debe ser proactivo o solo reactivo?**
El modelo actual es reactivo: el agente responde cuando el usuario lo invoca. Un modelo proactivo implicaría que el agente alerte al operador cuando detecta situaciones relevantes ("Hay 3 vehículos detenidos más de 1 hora en zonas no permitidas"). Esto amplía el valor pero también aumenta la interrupción. Requiere definir umbrales de relevancia por rol antes de implementar.

**2. ¿El agente debe tener memoria de sesión?**
En el modelo actual, cada invocación del agente es independiente. Un agente con memoria de sesión podría responder a "el mismo vehículo de antes" o "el que me mostraste hace un momento". La memoria de sesión aumenta la naturalidad de la conversación pero también la complejidad de la gestión de contexto.

**Método de validación propuesto:** Prueba de concepto con operadores reales — entrevista de usabilidad donde el participante resuelve 5 tareas de búsqueda de unidades: 3 con la placa conocida (búsqueda convencional vs. agente) y 2 sin la placa (solo con descripción de característica). Observar en cuál de los dos modos completa la tarea más rápido y con menos errores.

---

## 13. Próximas decisiones a validar

Las siguientes decisiones están identificadas pero pendientes de validación con usuarios reales antes de implementar:

1. **Buscador en sidebar:** umbral de activación cuando los ítems navegables superen 9.
2. **Toggle light/dark visible para el usuario final:** actualmente disponible técnicamente; pendiente de exposición controlada (algunos clientes tienen política de interfaz corporativa fija).
3. **Badges de notificación en ítems:** "En vivo" tiene badge numérico (3). Evaluar si otros ítems (Informes, Geocercas) requieren badges de estado.
4. **Orden de los ítems de Gestión:** Caminos y Geocercas son las primeras funciones del grupo Gestión; el producto escalará con más ítems en este grupo (Mantenimiento, Conductores, Asignaciones).

---

*Documento preparado para presentación ejecutiva de decisiones UX — CLocater v0.x*
*Análisis basado en benchmark directo de interfaces (jun 2026) + principios Nielsen + Miller's Law + heurísticas de orientación espacial en interfaces de navegación lateral.*
