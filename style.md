# CLocation - Design System & Style Guide

Este documento define las directrices visuales de la plataforma de rastreo satelital **CLocation**, asegurando consistencia y profesionalismo.

## 1. Tipografía y Textos
- **Fuente Principal:** `Roboto` (cargada desde Google Fonts).
- **Uso de Mayúsculas:** Se debe evitar el uso excesivo de letras mayúsculas sostenidas (All-Caps). Emplear estilo oración ("Title case" o "Sentence case") para mejorar la legibilidad y proyectar profesionalismo.

## 2. Paleta de Colores
- **Fondo Global (Background):** Gris claro tecnológico (`#F5F5F7`), inspirado en interfaces minimalistas.
- **Texto Principal:** Gris oscuro / casi negro (`#111827` o `text-gray-900`) para alta legibilidad.
- **Texto Secundario:** Gris medio (`#6B7280` o `text-gray-500`).
- **Estados (Inspiración Apple):**
  - **Activo / En Movimiento:** Verde Apple (`#34C759`).
  - **Detenido / Alerta:** Rojo Apple (`#FF3B30`).
  - **Desconectado / Inactivo:** Gris Apple (`#8E8E93`).

## 3. Disposición y Elementos de Interfaz
- **Efecto "Glassmorphism" sutil:** Los paneles emergentes (FloatingStats, Header) usan fondos translúcidos (`bg-white/80` a `bg-white/95`) con un fuerte desenfoque de fondo (`backdrop-blur-2xl`).
- **Sombras:** Se emplean sombras suaves y controladas (`shadow-[0_2px_12px_rgba(0,0,0,0.04)]`) para evitar que el diseño luzca sobrecargado.
- **Bordes:** Finos y traslúcidos (`border border-white/60`) con radios amplios y elegantes (`rounded-[18px]` o `rounded-2xl`).
- **Header (Panel Superior):** Panel fijo que integra el logo único, controles de navegación y notificaciones, ahorrando espacio vertical.

## 4. Marca (Branding)
- **Nombre:** CLocation.
- **Logotipo:** Icono de vehículo (camión) en color negro puro (`text-black`), posicionado linealmente al lado de la marca en el Header. Se omite el uso de logotipos redundantes en la barra lateral (Sidebar) para optimizar el diseño.

## 5. Diseño General (Vibe)
- **Foco:** Herramienta de Rastreo Satelital. UI minimalista, limpia, corporativa y fácil de interpretar a primera vista (estética que fusiona prácticas de Samsung y Apple).
- **Animaciones:** Transiciones sutiles (Fade-in, scale 1.05) en hovers que indican interactividad sin restar seriedad.
