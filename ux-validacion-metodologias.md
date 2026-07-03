# Plan de Validación UX — CLocater

> Documento de metodologías y preguntas de investigación para validar y cerrar las decisiones de diseño documentadas en el informe ejecutivo.
> Las metodologías están mapeadas a cada decisión abierta; no se valida lo que ya tiene evidencia suficiente del benchmark.

---

## Principio de selección de metodología

Cada decisión de diseño tiene un tipo de incertidumbre distinto. Elegir la metodología incorrecta produce datos que no responden la pregunta real:

| Tipo de incertidumbre | Metodología adecuada |
|---|---|
| ¿El usuario encuentra lo que busca en la navegación? | Tree testing |
| ¿El usuario agrupa los conceptos como nosotros los agrupamos? | Card sorting |
| ¿El usuario entiende para qué sirve un elemento? | Entrevista contextual / Think-aloud |
| ¿El usuario adopta un comportamiento nuevo (atajos)? | Entrevista de hábitos + test de rendimiento |
| ¿El usuario puede completar una tarea con el diseño actual? | Test de usabilidad moderado |
| ¿Cuál de dos diseños permite completar la tarea más rápido? | Test A/B con métricas de tiempo |

---

## 1. Validación — Navegación principal (Sidebar)

**Decisión abierta:** ¿La agrupación actual (Navegación / Gestión) y los nombres de los ítems corresponden al modelo mental del usuario?

### 1.1 Tree Testing

**Qué responde:** Si el usuario puede encontrar una función específica dentro de la estructura de navegación propuesta, sin ver el diseño visual. Elimina el efecto de los íconos y el layout como pista.

**Cómo se aplica:**
Presentar la estructura del sidebar como árbol de texto plano. Dar al participante una serie de tareas y pedirle que navegue el árbol hasta donde cree que encontraría la función.

**Árbol a testear:**
```
Dashboard
Explorar
Flota
  └── Vehículos
  └── Conductores
  └── Asignaciones
En vivo
Informes
  └── Actividad
  └── Histórico
— Gestión —
Caminos
Geocercas
```

**Tareas propuestas:**
1. "Quieres ver todos los vehículos de la flota registrados en el sistema. ¿Dónde irías?"
2. "Recibes una alerta de un vehículo detenido. Quieres ver su posición en el mapa ahora mismo. ¿Dónde irías?"
3. "Necesitas revisar los recorridos del mes pasado. ¿Dónde irías?"
4. "Quieres crear una ruta nueva para un conductor. ¿Dónde irías?"
5. "Quieres ver qué está pasando con todos los vehículos en este momento. ¿Dónde irías?"

**Métricas a registrar:**
- Tasa de éxito directo (llegó al ítem correcto sin backtrack)
- Tasa de éxito con backtrack
- Ítems con mayor tasa de error (revelan nombres o agrupaciones problemáticos)

**Participantes recomendados:** 8 a 12 usuarios (operadores y administradores de flota). El tree testing no requiere prototipo; puede hacerse con Optimal Workshop, Maze o incluso en papel.

**Umbral de decisión:** Si un ítem tiene menos del 70% de éxito directo, el nombre o su agrupación se revisa antes de cerrar el diseño.

---

### 1.2 Card Sorting (abierto o cerrado)

**Qué responde:** Cómo el usuario agrupa mentalmente las funciones del sistema. Valida si la separación "Navegación / Gestión" es intuitiva o si los usuarios organizarían los ítems de otra forma.

**Cuándo usarlo:** Antes de definir si se agregan nuevas funciones al sidebar (por ejemplo, Conductores como ítem primario vs. subítem de Flota).

**Variante recomendada:** Card sorting **cerrado** con las categorías actuales ("Acciones de monitoreo" / "Configuración de operación") para confirmar si los usuarios distribuyen los ítems como el sistema los organiza.

**Ítems a incluir en las cards:**
Ver mapa en tiempo real · Ver historial de recorridos · Gestionar conductores · Crear una ruta · Definir una geocerca · Ver alertas activas · Ver métricas de la flota · Asignar conductor a vehículo · Ver detalle de un vehículo específico · Descargar reporte de actividad

**Pregunta de cierre (post-sorting):** "¿Hay alguna tarjeta que no supiste dónde ubicar? ¿Por qué?"

**Participantes recomendados:** 15 a 20 usuarios para card sorting (cuantos más, más estable es el dendrograma de agrupación).

---

## 2. Validación — Atajos de teclado

**Decisión abierta:** ¿Los usuarios de flota están dispuestos a adoptar atajos de teclado? ¿Los atajos asignados son intuitivos o generan conflicto con sus hábitos actuales?

### 2.1 Entrevista de hábitos de uso

**Qué responde:** El perfil de interacción real del usuario: cuánto tiempo pasa en la plataforma, qué acciones repite más frecuentemente, si usa atajos en otras herramientas (Excel, Windows), si conoce el teclado como herramienta de trabajo.

**Guía de preguntas:**

**Bloque 1 — Perfil de uso actual**
- ¿Cuántas horas al día usas la plataforma de rastreo?
- ¿Qué es lo primero que haces cuando la abres en la mañana?
- ¿Hay acciones que haces más de 10 veces al día? ¿Cuáles son?
- ¿Usas más el mouse o el teclado para navegar en la plataforma?

**Bloque 2 — Hábitos de teclado en otras herramientas**
- ¿Usas atajos de teclado en Excel o en otras aplicaciones que usas seguido?
- ¿Hay algún atajo que uses tanto que ya no piensas al ejecutarlo?
- ¿Alguna vez sentiste que una herramienta era lenta porque tenías que hacer muchos clics?

**Bloque 3 — Reacción ante los atajos propuestos**
*(Mostrar la interfaz con los badges `<kbd>` visibles)*
- ¿Qué ves en estos botones del menú? ¿Para qué crees que sirven los números y letras?
- Si presionas `1` en el teclado, ¿qué esperarías que pasara?
- ¿Cuál de estas teclas te parece natural para ir al mapa? ¿Y para ir a los reportes?

**Bloque 4 — Disposición de adopción**
- Si esta plataforma tuviera atajos de teclado para las acciones que más repites, ¿los usarías? ¿Por qué sí o no?
- ¿Qué te haría falta para empezar a usarlos con confianza?

**Participantes recomendados:** 5 a 8 usuarios de perfil operador de alta frecuencia. Las entrevistas de hábitos tienen punto de saturación temprano.

---

### 2.2 Test de rendimiento (antes / después)

**Qué responde:** Si los atajos reducen mediblemente el tiempo de navegación entre vistas.

**Protocolo:**
1. Dar al participante 5 tareas de navegación (ir al mapa, ir a informes, ir a flota, colapsar sidebar, abrir buscador).
2. Primera ronda: solo con mouse, sin conocimiento de atajos.
3. Explicar los atajos disponibles (2 minutos de instrucción).
4. Segunda ronda: mismas 5 tareas, con opción de usar atajos.
5. Registrar tiempo por tarea en ambas rondas.

**Métrica de éxito:** Reducción de tiempo ≥ 30% en la segunda ronda para al menos 3 de las 5 tareas.

**Nota:** Este test es más relevante con usuarios que ya han tenido una semana de exposición a la plataforma. Con usuarios nuevos, la curva de aprendizaje del atajo puede inflar los tiempos de la segunda ronda.

---

## 3. Validación — Panel flotante de monitoreo

**Decisiones abiertas:**
- ¿Qué filtros necesita el usuario además de Estado y Tipo?
- ¿Qué información debe mostrar cada card en vista colapsada, por rol?

### 3.1 Entrevista contextual — Preguntas sobre información del mapa

**Qué responde:** Qué datos necesita ver el usuario de forma inmediata cuando abre la lista de vehículos, y bajo qué condiciones opera esa necesidad.

**Guía de preguntas:**

**Bloque 1 — Contexto de uso de la lista**
- Cuando abres la lista de vehículos, ¿qué es lo primero que buscas ver?
- ¿Hay momentos del día en que la usas diferente? Por ejemplo, a primera hora vs. en medio de una operación.
- ¿Cuándo necesitas acotar la lista? ¿Qué criterio usas para filtrar?

**Bloque 2 — Información mínima necesaria por vehículo**
- Si solo pudieras ver 3 datos de cada vehículo en la lista (sin abrir el detalle), ¿cuáles serían?
- ¿Cuándo necesitas saber la velocidad de un vehículo sin abrir su detalle?
- ¿El nombre del conductor es importante para ti en la lista rápida, o solo cuando ya abriste el vehículo?
- ¿Necesitas ver la dirección (texto de calle) en la lista, o con el ícono de estado te alcanza?

**Bloque 3 — Filtros**
- Si pudieras filtrar la lista, ¿qué filtro usarías más seguido?
- ¿Trabajas con grupos de vehículos (flotas, empresas, zonas)? ¿Necesitarías filtrar por grupo?
- ¿Cuándo necesitas ver solo los vehículos detenidos? ¿Qué haces con esa información?
- ¿Alguna vez necesitas buscar por conductor en lugar de por placa?

**Bloque 4 — Reacción al panel flotante**
*(Mostrar el diseño actual del FloatingMonitor)*
- ¿Qué te genera esta forma de ver los vehículos comparado con la tabla que conoces?
- ¿Hay algo que extrañas de la tabla?
- ¿El panel en esta posición te molesta o te parece bien? ¿Lo moverías a otro lado?
- ¿Cuándo querrías que el panel desaparezca solo?

**Participantes recomendados:** 6 a 8 usuarios, separados por rol (al menos 2 administradores + 2 operadores + 2 clientes directos), ya que las necesidades de información varían significativamente por rol.

---

### 3.2 Card Sorting de campos por rol

**Qué responde:** Qué 3 a 4 campos de datos considera cada rol indispensables en la vista colapsada de la card.

**Instrucción al participante:** "Te voy a mostrar los datos que podemos mostrar de cada vehículo en la lista. Elige los 4 que no podrían faltar para ti. Luego ordénalos del más importante al menos importante."

**Cards de datos disponibles:**
Placa · Estado del vehículo (activo/detenido/sin señal) · Estado de ignición (on/off) · Velocidad actual · Última dirección (texto de calle) · Fecha y hora del último reporte · Nombre del conductor · Tipo de vehículo · Tiempo de parada · Número de alarmas activas · Empresa propietaria · Código GPS

**Aplicación por rol:**
- Realizar la sesión por separado con cada perfil de rol.
- Comparar los rankings: los campos con consenso alto (elegidos por ≥ 80% de un rol) son candidatos fijos para esa card. Los campos con consenso bajo abren una discusión de diseño.

**Participantes recomendados:** 5 por rol (15 en total si se validan los 3 roles).

---

## 4. Validación — Sidebar colapsado y tooltips

**Decisión abierta:** ¿El usuario que colapsa el sidebar puede orientarse con solo íconos + tooltip en hover?

### 4.1 Test de usabilidad moderado (Think-aloud)

**Protocolo:**
1. Dar al participante la interfaz con el sidebar colapsado (solo íconos, sin labels).
2. Pedir que complete 3 tareas de navegación sin explicar que puede expandir el sidebar.
3. Observar: ¿hace hover sobre los íconos para leer los tooltips? ¿Los tooltips son suficientes orientación? ¿Expande el sidebar sin que se le indique?

**Tareas:**
1. "Ve a la sección de reportes."
2. "Abre la lista de geocercas."
3. "Cambia al modo oscuro."

**Lo que se observa:**
- ¿Identifica los íconos sin tooltip (reconocimiento directo)?
- ¿Usa el tooltip como confirmación antes de hacer clic?
- ¿Colapsa/expande el sidebar espontáneamente como respuesta a la tarea?

---

## 4b. Validación — Card de vehículo y modelo multi-GPS

**Decisiones abiertas:**
- ¿El usuario comprende que dos posiciones distintas en el mapa corresponden a dos GPS distintos del mismo vehículo, y no a un error del sistema?
- ¿Qué métricas necesita ver cada rol en el grid de la card expandida?
- ¿Los dispositivos no-Principal deben mostrarse colapsados por defecto?

### Test de usabilidad think-aloud — comprensión del modelo multi-GPS

**Qué responde:** Si el usuario entiende sin instrucción previa que una unidad puede tener múltiples GPS con posiciones distintas, y si la interfaz actual comunica eso con suficiente claridad.

**Protocolo:**
1. Mostrar al participante el mapa con un vehículo que tiene 3 GPS en posiciones distintas (por ejemplo, el vehículo ANA con GPS Principal y GPS de contingencia separados).
2. Pedir que piense en voz alta mientras responde: *"Este vehículo tiene dos marcadores en el mapa que están separados. ¿Qué crees que significa eso?"*
3. Sin intervenir, dejar que el participante explore el panel de Dispositivos GPS.
4. Observar si llega solo a la explicación correcta (frecuencia de reporte diferente) o si necesita guía.

**Preguntas de cierre:**
- ¿Qué entendiste de los distintos dispositivos GPS que tiene este vehículo?
- ¿Cuál de las dos posiciones usarías tú para saber dónde está el vehículo ahora mismo? ¿Por qué?
- ¿El término "Principal" / "Contingencia" te dice algo sobre cuál es más confiable?
- ¿Te generó confusión ver dos posiciones distintas, o lo encontraste claro?

**Umbral de éxito:** Al menos 70% de los participantes llegan a la explicación correcta sin intervención del moderador. Si el porcentaje es menor, se revisa el copy de la etiqueta de jerarquía y el tooltip explicativo de la frecuencia de reporte.

**Participantes recomendados:** 6 usuarios mixtos (3 con perfil técnico / operador; 3 con perfil cliente sin conocimiento técnico de GPS).

---

### Entrevista de métricas por rol

**Guía de preguntas:**

**Sobre el grid de métricas en la card expandida:**
- Cuando abres el detalle de un vehículo, ¿qué número o dato es lo primero que buscas con la vista?
- ¿La velocidad es un dato que necesitas ver sin abrir el detalle completo, o solo cuando ya decidiste revisar ese vehículo?
- ¿Qué significa para ti ver 80% de batería en un vehículo? ¿A qué porcentaje empiezas a preocuparte?
- ¿El odómetro (kilómetros totales) te dice algo útil en una revisión rápida, o es más un dato para reportes?
- ¿Cuándo importa el conteo de eventos/alarmas en la lista rápida? ¿O solo importa cuando ya hay una alerta activa?

**Sobre los datos del GPS de contingencia:**
- ¿Sabías que algunos vehículos tienen un GPS de respaldo que reporta con menos frecuencia?
- Si ese GPS te muestra una posición de hace 1 hora, ¿te sirve ese dato o te genera confusión?
- ¿Preferirías que los GPS secundarios y de contingencia estén ocultos por defecto y solo se muestren si los pides?

---

## 4c. Validación — Acciones contextuales y menú "Más"

**Decisión abierta:** ¿Cuáles acciones deben estar en la barra visible vs. bajo "Más", por rol?

### Entrevista de frecuencia de acciones

**Qué responde:** Con qué frecuencia ejecuta cada rol cada una de las acciones disponibles, para determinar qué debe estar en primer nivel y qué puede ocultarse bajo "Más".

**Instrucción al participante:** "Te voy a mostrar una lista de acciones que puedes hacer sobre un vehículo. Para cada una, dime con qué frecuencia la ejecutas en un día normal de trabajo."

**Lista de acciones a evaluar:**
Iniciar parqueo · Abrir captura del vehículo · Iniciar / revisar viaje · Ver ubicación en el mapa · Ver historial de recorridos · Enviar comando al dispositivo · Copiar información del vehículo · Compartir ubicación · Anclar vehículo en la lista · Ver dispositivos GPS

**Escala de frecuencia:**
- Más de 10 veces al día
- Entre 3 y 10 veces al día
- 1 o 2 veces al día
- Menos de una vez al día
- Nunca o casi nunca

**Pregunta de cierre:**
- "¿Hay alguna acción que harías seguido pero que no está en esta lista?"
- "¿Hay alguna acción en la lista que nunca usarías? ¿Por qué?"

**Umbral de decisión:** Una acción que el 70% o más de un rol ejecuta más de 3 veces al día es candidata a primer nivel visible para ese rol. Una acción que menos del 30% ejecuta más de una vez al día puede ir bajo "Más" o eliminarse de la barra rápida para ese rol.

**Participantes recomendados:** 5 por rol (operador, administrador, cliente). Aplicar en la misma sesión que la entrevista contextual del panel.

---

### Test de acceso contextual (benchmark de pasos)

**Qué responde:** Si el sistema de múltiples puntos de entrada realmente reduce el número de pasos respecto al modelo anterior.

**Protocolo:**
1. Dar al participante una tarea: *"Un vehículo acaba de detenerse en una zona que no corresponde. Necesitas iniciar un parqueo para ese vehículo. ¿Cómo lo harías?"*
2. Primera condición: sin card contextual en el mapa (simular el modelo anterior — solo desde el panel de búsqueda o desde vista de detalle).
3. Segunda condición: con la card contextual del mapa activa.
4. Registrar: número de clics, tiempo total, errores o búsqueda visual prolongada.

**Métrica de éxito:** La condición con card contextual debe completarse en ≤ 3 pasos y en menos del 50% del tiempo de la condición anterior.

---

## 4d. Validación — Sistema de pestañas y resiliencia GPS

**Decisiones abiertas:**
- ¿El operador descubre y adopta la navegación por pestañas sin instrucción?
- ¿Cuántas pestañas simultáneas son manejables antes de saturar la barra?
- ¿El badge de alerta en la pestaña comunica urgencia con suficiente claridad?

### Test de usabilidad think-aloud — multitarea con pestañas

**Escenario:** El participante tiene el mapa abierto con varias unidades visibles. Se le pide completar las siguientes tareas en secuencia sin instrucciones sobre el sistema de pestañas.

**Tareas:**
1. "Abre el viaje de TRK-221 y dime cuántos kilómetros recorrió hoy."
2. Sin cerrar TRK-221, "vuelve al mapa y dime qué vehículo está más al norte."
3. "Ahora abre la captura de ABC-123."
4. "Cambia entre TRK-221 y ABC-123 sin cerrar ninguna."
5. "Cierra la pestaña de TRK-221."

**Lo que se observa:**
- ¿Descubre la barra de pestañas antes de que se le indique, o busca el mapa por otro lado?
- ¿Entiende que puede tener dos unidades abiertas al mismo tiempo?
- ¿La pestaña "Mapa" es encontrable cuando necesita volver al mapa general?
- ¿Con cuántas pestañas abiertas empieza a confundirse o a perder orientación?

**Preguntas de cierre:**
- ¿Cómo te resultó navegar entre el mapa y los vehículos?
- ¿Esperabas que al abrir el viaje el mapa desapareciera?
- Si tuvieras 5 vehículos abiertos al mismo tiempo, ¿te sería útil o confuso?

---

### Test de comprensión del modal de fallo GPS

**Escenario:** Durante una sesión de captura activa, se simula la aparición de la modal "GPS principal sin señal".

**Lo que se observa sin intervención:**
- ¿El participante lee el modal o lo cierra instintivamente?
- ¿Entiende qué significa "Contingencia" sin explicación adicional?
- ¿Elige "Cambiar a contingencia" o "Omitir"? Si elige Omitir, ¿por qué?

**Preguntas de cierre:**
- ¿Qué entendiste de este aviso?
- ¿Sabías que el vehículo tenía un GPS de respaldo?
- Si hubieras elegido "Omitir", ¿qué habrías esperado que pasara con la captura?
- El botón azul dice "Cambiar a contingencia". ¿Eso te daba seguridad para hacer clic o te generaba duda?

**Umbral de éxito:** Al menos el 80% de los participantes debe entender correctamente qué implica cada opción antes de hacer clic. Si el porcentaje es menor, se revisa el copy del modal y la descripción del dispositivo de contingencia.

---

## 4e. Validación — Control de layout y visibilidad

**Decisiones abiertas:**
- ¿El usuario descubre el picker de posición del panel sin instrucción?
- ¿Las miniaturas del picker son suficientemente claras para predecir el resultado?
- ¿El usuario espera que el sistema recuerde su configuración entre sesiones?
- ¿Las tabs Info / GPS / Posiciones se entienden como controles de visibilidad o como pestañas de navegación?

### Entrevista de control de layout

**Guía de preguntas:**

**Bloque 1 — Descubrimiento del picker de posición**
*(Mostrar la vista de captura con el picker visible)*
- ¿Qué crees que hace este control? *(señalar el picker de posición del panel)*
- Si haces clic en "Abajo", ¿qué esperarías que pasara?
- ¿Lo usarías? ¿En qué situación lo cambiarías de posición?

**Bloque 2 — Comprensión de las tabs de visibilidad**
*(Mostrar las tabs Info / GPS / Posiciones)*
- ¿Para qué crees que sirven estas tres opciones?
- Si haces clic en "GPS" y desaparece el bloque de información del vehículo, ¿los datos se perdieron o solo se ocultaron?
- ¿Cuál de las tres tabs usarías más seguido en una sesión de captura?

**Bloque 3 — Expectativa de persistencia**
- Si hoy posicionas el panel de posiciones abajo, ¿esperarías encontrarlo abajo mañana cuando vuelvas a abrir la plataforma?
- ¿Preferirías que el sistema recuerde tu configuración o que siempre empiece en el mismo estado por defecto?
- ¿Cambia tu respuesta si usas la plataforma desde distintas computadoras?

**Bloque 4 — Necesidades de personalización no cubiertas**
- ¿Hay algo que te gustaría poder mover u ocultar que no ves en estas opciones?
- ¿Hay información que nunca necesitas ver en la vista de captura y que te gustaría poder quitar?

**Umbral de decisión sobre persistencia:** Si el 70% o más de los participantes espera que la configuración persista entre sesiones, se prioriza la implementación de preferencias por usuario en el backend antes del lanzamiento. Si el porcentaje es menor, se lanza sin persistencia y se evalúa en fase post-beta.

---

## 5. Cronograma sugerido de validaciones

| Fase | Metodología | Decisión que cierra | Esfuerzo estimado |
|---|---|---|---|
| **Fase 1** — Antes de cerrar la navegación | Tree testing (remoto) | Nombres e ítems del sidebar | 1 semana |
| **Fase 1** — Antes de cerrar la navegación | Card sorting cerrado | Agrupación Navegación / Gestión | 1 semana |
| **Fase 2** — Antes de lanzar beta | Entrevista contextual (panel flotante) | Filtros + campos de card por rol | 2 semanas |
| **Fase 2** — Antes de lanzar beta | Card sorting de campos | Información en card colapsada | 1 semana (en paralelo) |
| **Fase 2** — Antes de lanzar beta | Think-aloud multi-GPS | Comprensión del modelo de posiciones distintas por dispositivo | 1 semana |
| **Fase 2** — Antes de lanzar beta | Entrevista de métricas por rol | Grid de la card expandida + visibilidad GPS contingencia | 1 semana (en paralelo) |
| **Fase 2** — Antes de lanzar beta | Entrevista de frecuencia de acciones | Composición del menú "Más" por rol | 1 semana (en paralelo con entrevista contextual) |
| **Fase 2** — Antes de lanzar beta | Test de acceso contextual (benchmark de pasos) | Validar reducción de fricción vs. modelo anterior | 1 semana |
| **Fase 2** — Antes de lanzar beta | Think-aloud multitarea con pestañas | Descubrimiento del sistema de pestañas + límite de pestañas manejable | 1 semana |
| **Fase 2** — Antes de lanzar beta | Test de comprensión del modal GPS | Claridad del modal de fallo + adopción de acción de cambio a contingencia | 1 semana (en paralelo) |
| **Fase 2** — Antes de lanzar beta | Entrevista de control de layout | Descubrimiento del picker de posición + expectativa de persistencia entre sesiones | 1 semana |
| **Fase 3** — Post-beta | Prueba de concepto del agente | Velocidad y precisión vs. búsqueda convencional; búsqueda por característica sin placa | 2 semanas |
| **Fase 3** — Post-beta (usuarios reales) | Entrevista de hábitos + test de rendimiento | Adopción de atajos | 2 semanas |
| **Fase 3** — Post-beta | Think-aloud sidebar colapsado | Orientación sin labels | 1 semana |

---

## 4f. Validación — Asistente inteligente

**Decisiones abiertas:**
- ¿El agente reduce el tiempo de búsqueda vs. el método manual para unidades conocidas por placa?
- ¿El agente es la única solución viable para búsqueda por característica sin placa?
- ¿El operador confía en que el agente ejecutó la acción correcta?
- ¿La entrada por voz es adoptable en el entorno real de trabajo del operador?

### Prueba de concepto — Agente vs. búsqueda convencional

**Protocolo:**

**Bloque A — Búsqueda con placa conocida (3 tareas)**
Dar al participante la placa exacta de la unidad a encontrar.
1. Tarea con búsqueda convencional (buscador del FloatingMonitor + filtros)
2. Misma tarea con el agente (voz o texto)
3. Tercera tarea: el participante elige qué método prefiere

Registrar: tiempo por tarea, número de pasos, errores o retrocesos.

**Bloque B — Búsqueda por característica (2 tareas, sin placa)**
El participante no conoce la placa; solo tiene una descripción.
1. *"Encuentra el vehículo que tiene más alarmas activas en este momento."* Primero con búsqueda manual; luego con el agente.
2. *"¿Cuál es el camión que lleva más tiempo detenido?"* Solo con el agente.

Registrar: si el participante puede completar la tarea con búsqueda manual, cuánto tarda, si la completa con el agente y en cuánto tiempo.

**Métricas de éxito del agente:**
- Bloque A: el agente completa la tarea en ≤50% del tiempo del método manual
- Bloque B: el agente puede completar la tarea en al menos el 80% de los casos; la búsqueda manual no puede completarla en tiempo razonable (> 2 min)

---

### Entrevista de confianza y adopción de voz

**Guía de preguntas:**

**Bloque 1 — Reacción al agente**
- ¿Qué sentiste cuando el mapa se movió solo después de tu instrucción?
- ¿Cómo sabías que encontró el vehículo correcto y no uno equivocado?
- Si el agente te muestra el vehículo incorrecto, ¿cómo lo corregirías?

**Bloque 2 — Adopción de voz en el entorno real**
- ¿En tu lugar de trabajo podrías hablarle a la plataforma? ¿Hay ruido, clientes cerca, reuniones?
- ¿Usarías la voz o el texto? ¿Depende de la situación?
- ¿Hay momentos del día en que la voz sería más útil que el mouse?

**Bloque 3 — Límites de confianza**
- ¿Qué acciones te daría miedo delegar al agente? ¿Por qué?
- ¿Si el agente pudiera iniciar una captura por ti, lo usarías o preferirías hacerlo tú mismo?
- ¿Qué información necesitarías ver para confirmar que el agente hizo lo correcto?

**Bloque 4 — Agente proactivo**
- ¿Te gustaría que el agente te avisara cuando detecta algo inusual en la flota, sin que tú se lo pidieras?
- ¿Qué tipo de alertas te serían útiles? ¿Cuáles te molestarían?

---

## 6. Criterios de reclutamiento de participantes

Para que los hallazgos sean accionables, los participantes deben representar el usuario real de la plataforma. Criterios mínimos:

**Perfil operador (alta prioridad):**
- Trabaja en monitoreo de flota como tarea principal (≥ 4h/día en plataforma)
- Conoce el sistema actual (puede ser de la empresa cliente)
- Rango de experiencia: de 6 meses a 5 años en el rol

**Perfil administrador:**
- Gestiona una flota de ≥ 20 vehículos
- Toma decisiones basadas en reportes de la plataforma
- Puede tener menos tiempo en pantalla pero más criterio sobre los datos

**Perfil cliente directo:**
- Usuario final que monitorea su propio vehículo o flota pequeña (< 10 unidades)
- Puede tener menor familiaridad técnica

**Excluir:**
- Usuarios de IT o personal interno que conozca el producto por dentro
- Usuarios con menos de 1 mes usando cualquier plataforma de rastreo

---

*Documento de validación UX — CLocater v0.x*
*Metodologías seleccionadas en función de las decisiones abiertas documentadas en `ux-presentacion-ejecutiva.md`.*
