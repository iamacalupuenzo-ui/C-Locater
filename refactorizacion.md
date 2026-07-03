# Refactorización — Adopción de la librería UI (`ui/`)

> **Proyecto:** C-Locater (plataforma única C-Loc, post-eliminación de C-Go)
> **Objetivo:** Migrar progresivamente los componentes existentes para que usen la librería de diseño en `src/shared/components/ui/` en vez de elementos HTML/Tailwind hechos a mano, sin alterar el layout ni el comportamiento.
> **Alcance de esta sesión:** Primer módulo migrado de punta a punta — **Caminos** (`CaminosModule.tsx`), sin tocar sus submódulos.

---

## 1. Dónde está la librería UI

| Recurso | Ubicación |
|---|---|
| Carpeta de componentes | `src/shared/components/ui/` |
| Barrel export (import central) | `src/shared/components/ui/index.ts` |
| Componentes disponibles | `Button`, `StatusBadge` / `TagBadge` / `CountBadge` (`Badge.tsx`), `Checkbox`, `DropdownMenu` (+ tipo `MenuItem`), `IconButton`, `Input`, `Label`, `Modal`, `SearchableSelect`, `SearchInput`, `SegmentedControl` (+ tipo `SegmentOption`), `Select` (+ tipo `SelectOption`), `Textarea`, `Toast`, `UserMenu` (+ tipo `UserMenuUser`) |
| Forma de importar | `import { Button, Checkbox, IconButton, SegmentedControl } from './ui';` (rutas relativas desde cada componente que la consume) |

Antes de esta sesión, la librería existía pero estaba prácticamente sin usar: solo `FloatingMonitor.tsx` y `VehicleAccordionItem.tsx` importaban de `ui/`. El resto de la app sigue usando HTML/Tailwind directo todavía.

---

## 2. Criterio de migración (regla aplicada y a repetir en próximos módulos)

Solo se reemplaza un elemento bespoke por su equivalente de `ui/` cuando hay un **calce estructural y visual real**. Si un widget es muy específico y no tiene buen equivalente en la librería, se deja igual — forzarlo cambia el look sin ganar nada.

Ejemplos de la sesión:
- ✅ Migrado: checkboxes de tabla, segmented control de estado, botón de icono (⋮ y paginación), botón tipo link.
- ❌ No migrado (a propósito): selects custom de búsqueda (`FilterSelect`), el `<select>` nativo de "Filas por página", los botones numerados de paginación, la barra flotante oscura de acciones masivas.

---

## 3. Módulo migrado: Caminos (`src/shared/components/CaminosModule.tsx`)

**Importante:** se migró únicamente el módulo Caminos. **No se tocó** `NuevoGrupoModule.tsx` (submódulo que se abre como overlay desde Caminos), por instrucción explícita.

### Imports añadidos
```tsx
import { Checkbox } from './ui/Checkbox';
import { SegmentedControl } from './ui/SegmentedControl';
import { IconButton } from './ui/IconButton';
```
(Ya existían imports previos de `Button`, `StatusBadge`/`TagBadge`, `SearchInput`, `DropdownMenu` desde `./ui/...`)

### Elementos migrados

| Elemento | Antes | Ahora |
|---|---|---|
| Checkbox de cabecera de tabla (seleccionar todos) | `<input type="checkbox">` nativo | `<Checkbox size="sm" checked={isAllSelected} indeterminate={...} onChange={toggleAll} />` |
| Checkbox de fila | `<input type="checkbox">` nativo + celda con `onClick`/`cursor-pointer` | `<Checkbox size="sm" checked={isSelected} onChange={() => toggleOne(ruta.id)} />` |
| Filtro "Estado" (Todos / Activo / Inactivo) | Segmented control hecho a mano (`bg-gray-100 rounded-lg` + botones) | `<SegmentedControl options={[...]} value={selectedStatus} onChange={setSelectedStatus} size="sm" />` |
| Botón "⋮" de fila (abre menú de opciones) | `<button>` crudo dentro del render-prop de `DropdownMenu` | `<IconButton ref={ref} icon={MoreHorizontal} variant="ghost" size="sm" onClick={...} />` |
| Botón paginación "anterior" | `<button>` crudo con `ChevronLeft` | `<IconButton icon={ChevronLeft} variant="outline" size="sm" disabled={...} onClick={...} />` |
| Botón paginación "siguiente" | `<button>` crudo con `ChevronRight` | `<IconButton icon={ChevronRight} variant="outline" size="sm" disabled={...} onClick={...} />` |
| Link "Limpiar filtros" (estado vacío) | `<button>` con clases de texto subrayado | `<Button variant="link" size="sm" onClick={clearFilters}>Limpiar filtros</Button>` |

### Cambios de firma de funciones (consecuencia de usar `Checkbox`)
```tsx
// toggleAll ahora recibe boolean (checked) en vez del evento nativo
const toggleAll = (checked: boolean) => {
  const next = new Set(selectedIds);
  if (checked) paginatedData.forEach(r => next.add(r.id));
  else paginatedData.forEach(r => next.delete(r.id));
  setSelectedIds(next);
};

// toggleOne sin cambios de lógica, solo se invoca distinto (sin event)
const toggleOne = (id: string) => {
  const next = new Set(selectedIds);
  next.has(id) ? next.delete(id) : next.add(id);
  setSelectedIds(next);
};
```

### Elementos NO migrados en este módulo (a propósito)
- `FilterSelect` (selector custom de "Empresa" / "Grupo logístico"): sin equivalente directo en `ui/`.
- `<select>` nativo de "Filas por página": `Select`/`SearchableSelect` de la librería están pensados para formularios (más padding, label), no calzan en un control compacto inline.
- Botones numerados de paginación (cuadrados `w-8 h-8`): son específicos de esta paginación, no hay componente de librería para esto.
- Barra flotante oscura de acciones masivas (cuando hay filas seleccionadas): **inicialmente no migrada, sí migrada en Sesión 27** — ver sección 5.

### Cambios visuales esperados (no son bugs)
- Los checkboxes pasan de color gris nativo (`accent-gray-900`) a color de marca (`bg-brand`), con esquinas redondeadas — es el estilo del design system, intencional.
- El link "Limpiar filtros" pasa de gris a color de marca (`text-brand`), también intencional.

### Verificación realizada
- `npx tsc --noEmit`: sin errores nuevos en `CaminosModule.tsx` (los únicos errores reportados son preexistentes y no relacionados: `Sidebar.tsx`, `main.tsx`, `PeajesPanel.tsx`, `TripStatsRow.tsx`, `VehicleTabBar.tsx`).
- `npm run build`: build exitoso, sin errores.
- Pendiente: revisión visual en navegador (dev server) del módulo Caminos (tabla, checkboxes, segmented control, menú ⋮, paginación, estado vacío).

---

## 5. CaminosModule — Refinamientos posteriores (Sesión 27)

En esta sesión se refinó el módulo Caminos para alinear completamente su diseño al design system y corregir bugs visuales.

### Barra de acciones masivas — migrada

La barra flotante que aparecía inicialmente no migrada (por ser "muy específica") fue **rediseñada para usar el design system**:

| Antes | Ahora |
|---|---|
| `bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white` | `bg-slate-50 border border-slate-200` |
| `rounded-[2rem]` (custom) | `rounded-xl` (consistente con Modal) |
| Botones hechos a mano (`<button>` con clases) | `<Button variant="ghost" size="sm">` + `<Button variant="danger" size="sm">` |
| Acciones sin iconos | Cada acción con su icono Lucide (`PowerOff`, `Copy`, `Send`, `Trash2`) |
| `font-bold` | `font-semibold` (consistente con design system) |

### Otros refinamientos

- **Iconos de ordenamiento**: `opacity-0 group-hover:opacity-60` → `opacity-40` (siempre visibles)
- **Columnas**: reordenadas a Ruta → Empresa → Grupo
- **Tamaños de texto**: reducidos para consistencia tipográfica con la librería
- **Checkbox wrapper**: envuelto en `<div className="flex items-center justify-center">` dentro de `<th>`/`<td>` para evitar que el navegador distribuya distinto el padding vertical cuando el checkbox está vacío vs con checkmark
- **Transition-colors**: eliminado de rows y checkbox para evitar micro-movimientos al seleccionar
- **SegmentedControl**: sombras eliminadas

---

---

## 5. VehicleTripView — Dropdown de filtro de eventos (Sesión 28)

### Contexto

El dropdown de filtro de eventos (`Filtrar` en VehicleTripView) no seguía el estándar de la librería: usaba un `<span>` como checkbox custom, con colores inline y estilos bespoke (`rounded-sm`, shadow light).

### Cambios realizados

| Elemento | Antes (bespoke) | Después (ui/) |
|---|---|---|
| Checkbox | `<span>` con border/background inline | `<Checkbox size="sm">` |
| Import | `Check` de lucide-react | `Checkbox` de `../ui/Checkbox` |
| Dropdown shadow | `shadow-[0_4px_12px_rgba(0,0,0,0.1)]` | `shadow-[0_4px_20px_rgba(0,0,0,0.18)]` |
| Dropdown radius | `rounded-md` | `rounded-lg` |
| Option radius | `rounded-sm` | `rounded-md` |
| Option padding | `px-2 py-1.5` | `px-3 py-2` |
| Icon size | 12px | 14px |
| Width | `style={{ width: 200 }}` (fijo) | `min-w-[200px]` (flexible) |

### Criterio aplicado

El checkbox hand-made no tenía razón de ser: la librería ya expone `<Checkbox>` con el mismo tamaño (`sm`) y el mismo lenguaje visual (checkmark blanco, borde redondeado). Reemplazarlo elimina código duplicado y asegura que cualquier cambio futuro al componente Checkbox se refleje automáticamente aquí.

### No migrado

- El trigger "Filtrar" mantiene su estilo actual (ya consistente con FloatingMonitor)
- El contador de filtros activos ("02 Filtrar") se conserva igual

### Verificación

- `npm run build`: build exitoso (solo warning preexistente de chunk size)

---

## 6. Próximos pasos sugeridos

1. Confirmar visualmente en navegador el módulo Caminos migrado.
2. Elegir el siguiente módulo a migrar (a definir con el usuario — un módulo completo a la vez, sin submódulos, siguiendo el mismo criterio de la sección 2).
3. Mantener este documento (`refactorizacion.md`) actualizado a medida que se migren más módulos: agregar una sección nueva por módulo con la misma estructura (imports añadidos, tabla de elementos migrados/no migrados, verificación).
