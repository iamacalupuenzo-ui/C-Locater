<div align="center">
  <!-- Header / Logo Area -->
  <h1>📍 CLocation - Plataforma de Rastreo Satelital</h1>
  <p><strong>Un sistema moderno, fluido y profesional para la gestión y monitoreo de flotas en tiempo real.</strong></p>
</div>

## 📌 ¿De qué trata el proyecto?
CLocation es una aplicación web avanzada para el rastreo satelital de vehículos. Su objetivo es proporcionar a los administradores de flotas una herramienta visual e intuitiva para supervisar la ubicación, el estado (activo, detenido, fuera de línea) y el historial de rutas ("Caminos") de diversas unidades (motocicletas, autos, camiones).

Se enfoca en ofrecer una **experiencia de usuario (UX) fluida y premium**, inspirada en el minimalismo corporativo y en lineamientos de diseño de interfaces modernas, utilizando el efecto "Glassmorphism" y micro-interacciones sutiles para no sobrecargar cognitivamente al usuario.

## 🛠 Arquitectura y Tecnologías
El proyecto está construido bajo un stack moderno enfocado en alto rendimiento y escalabilidad:

- **Core:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Estilos:** TailwindCSS v4 (implementando diseño Glassmorphism, variables de color semánticas)
- **Mapas:** Leaflet + React-Leaflet (CartoDB Base maps)
- **Iconografía:** Lucide React
- **Animaciones:** Framer Motion

### 📂 Estructura Principal del Proyecto
```text
C-Locater/
├── src/
│   ├── components/
│   │   ├── FleetMap.tsx       # Componente principal del mapa con marcadores personalizados.
│   │   ├── FloatingStats.tsx  # Panel sobrepuesto con estadísticas en tiempo real.
│   │   ├── Sidebar.tsx        # Navegación lateral (Explore, Caminos, Configuración).
│   │   ├── Header.tsx         # Panel superior corporativo.
│   │   ├── CaminosModule.tsx  # Módulo de trazado y visualización de rutas.
│   │   ├── NuevoGrupoModule.tsx # Gestión de agrupaciones de vehículos.
│   │   └── ui/                # Componentes base reutilizables.
│   ├── lib/
│   │   ├── data.ts            # Datos simulados/mock de vehículos y estado.
│   │   └── utils.ts           # Funciones de utilidad (ej. clsx, tailwind merge).
│   ├── App.tsx                # Orquestador principal de las vistas.
│   ├── index.css              # Estilos globales y utilidades.
│   └── main.tsx               # Punto de entrada de la aplicación.
```

## 🚀 Hoja de Ruta (Roadmap de Mejoras)
Para llevar a CLocation al siguiente nivel de fluidez y navegabilidad, implementaremos las siguientes mejoras:

1. **Optimización de Transiciones:** Utilizar `framer-motion` para que el cambio entre el modo "Explore" y los módulos como "Caminos" se sienta instantáneo y fluido.
2. **Interactividad del Mapa y Datos:** Agregar acciones en el panel de `FloatingStats` para que al hacer clic en un vehículo, el mapa haga un "flyTo" automático y centrado.
3. **Responsive Design Mejorado:** Adaptar la `Sidebar` y los paneles flotantes para dispositivos móviles (usando menús inferiores "Bottom Sheets" u hojas colapsables) sin perder visibilidad del mapa.
4. **Organización del Estado:** Refinar el flujo de datos entre los módulos (por ejemplo, el grupo seleccionado o la unidad seleccionada) para un código más mantenible.
