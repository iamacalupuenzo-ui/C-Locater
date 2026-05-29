export const FLEET_KNOWLEDGE = `
## CLocater — Sistema de Monitoreo GPS para Flotas en Perú

### Plataforma
CLocater es una solución web de rastreo en tiempo real para empresas de transporte, logística y seguridad vehicular en el Perú. Muestra la flota en un mapa interactivo con datos GPS en vivo.

### Tipos de vehículos
| Tipo | Código | Descripción |
|------|--------|-------------|
| Auto / Camioneta | car | Vehículo particular, camioneta 4x4, pick-up |
| Motocicleta | motorcycle | Moto lineal, mototaxi, motocarga |
| Camión | truck | Vehículo de carga, furgón, cisterna |
| Bus / Minivan | bus | Transporte de pasajeros, coaster, combi |
| Maquinaria | machinery | Excavadora, retroexcavadora, compactadora |

### Estados del vehículo
- **active** (Activo en ruta): motor encendido, vehículo en movimiento, GPS transmitiendo
- **stopped** (Detenido): motor apagado o vehículo estacionado, GPS activo
- **offline** (Sin señal): dispositivo GPS no transmite; puede estar apagado, sin batería o sin cobertura celular

### Datos disponibles por vehículo
- **plate**: placa de rodaje (ej: ABC-123, MOT-901, A3C-456). Las placas peruanas tienen 3 letras + 3 números, separados por guión.
- **name**: nombre asignado por el operador (ej: "Ruta Norte 01", "Moto García")
- **owner**: empresa o propietario responsable
- **type**: tipo de vehículo (car, motorcycle, truck, bus, machinery)
- **status**: estado actual (active, stopped, offline)
- **position**: coordenadas GPS (lat, lng) actualizadas en tiempo real
- **speed**: velocidad en km/h
- **ignition**: estado del motor (on = encendido, off = apagado)
- **alarmCount**: número de alertas activas en este momento

### Alertas y alarmas
Las alertas se generan automáticamente por:
1. **Exceso de velocidad**: supera el límite configurado por zona
2. **Geocerca**: el vehículo entra o sale de una zona geográfica restringida
3. **Motor fuera de horario**: encendido en horas no autorizadas
4. **Vehículo detenido en exceso**: parado más tiempo del permitido en zona de tránsito
5. **Manipulación del GPS**: desconexión o interferencia del dispositivo
6. **Batería baja**: nivel crítico del dispositivo rastreador

### Interpretación de placas
El usuario puede mencionar placas de distintas formas:
- "MOT guion novecientos uno" → MOT-901
- "moto 901" → buscar vehículo tipo moto con placa que contenga 901
- "ABC ciento veintitrés" → ABC-123
- "el vehículo de García" → buscar por propietario "García"
- "la camioneta roja de Lima" → buscar por nombre o tipo car

### Operaciones del asistente
El asistente puede ejecutar estas acciones en tiempo real:
1. **navigate_to_vehicle(plate)**: mueve el mapa a la ubicación exacta del vehículo y lo selecciona visualmente
2. **get_vehicle_info(plate)**: retorna estado, propietario, velocidad, ignición, alertas
3. **get_fleet_summary()**: total de unidades, cuántas activas/detenidas/offline y con alertas
4. **list_vehicles_by_status(status)**: lista vehículos filtrados por active/stopped/offline

### Contexto operativo
- Zona horaria: Perú (UTC-5), sin horario de verano
- El mapa usa OpenStreetMap con capas de tráfico
- Los datos se actualizan cada 30 segundos en la versión estándar
- El operador puede monitorear desde escritorio o móvil
- Las consultas de voz usan español peruano
`;
