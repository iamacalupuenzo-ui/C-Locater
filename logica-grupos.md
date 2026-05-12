# Lógica de Grupos y Subgrupos — GPS

> Documento de entendimiento UX sobre la organización jerárquica de dispositivos GPS.
> Creado: 2026-05-09

---

## 1. Conceptos

| Término | Definición | Ejemplo |
|---------|------------|---------|
| **Grupo** | Entidad dueña del contrato. Es la organización/cliente que contrata el servicio de rastreo. | Santander, BCP Leasing, BBVA, Caja Cusco, Enzo |
| **Subgrupo** | Flota o división específica dentro del grupo. Agrupa vehículos por unidad operativa, zona geográfica o proyecto. | Flota Lima Norte, EnzoMacalupu, Unidad Pesada, Delivery Miraflores |

---

## 2. Reglas de negocio

### 2.1 Obligatoriedad

Todo dispositivo GPS nuevo debe tener **grupo y subgrupo asignados**. Ambos campos son obligatorios — no existe un dispositivo sin grupo o sin subgrupo.

| `group` | `subgroup` | ¿Válido? |
|---------|-----------|:--------:|
| ✅ | ✅ | **Válido** |
| ✅ | ❌ | Inválido |
| ❌ | ✅ | Inválido |
| ❌ | ❌ | Inválido |

### 2.2 Jerarquía

```
Grupo (entidad dueña)
  └── Subgrupo (flota específica)
        └── Dispositivo GPS
```

Un subgrupo **siempre pertenece a un grupo**. No existen subgrupos huérfanos. La relación es estricta: grupo → subgrupo → dispositivo.

### 2.3 Asignación flexible

El usuario puede asignar un dispositivo a **cualquier subgrupo existente**, sin importar el grupo al que pertenezca. No hay restricción cruzada — un dispositivo puede asociarse a un subgrupo de otro grupo si la operación lo requiere.

### 2.4 Un dispositivo = un grupo + un subgrupo

Cada dispositivo GPS tiene un único grupo y un único subgrupo. No pertenece a múltiples grupos ni subgrupos simultáneamente.

### 2.5 Contexto multi-dispositivo por vehículo

Un vehículo puede tener varios dispositivos GPS, cada uno con su propio grupo y subgrupo. Esto refleja escenarios reales donde diferentes GPS del mismo vehículo fueron adquiridos bajo contratos distintos.

**Ejemplo real:**

| Vehículo | Dispositivo | Grupo | Subgrupo |
|----------|------------|-------|----------|
| MOT-101 | GPS Santander (índice 0) | Santander Autos | Flota Lima Norte |
| MOT-101 | GPS propio del admin (índice 1) | Enzo | EnzoMacalupu |

---

## 3. Ciclo de vida del grupo/subgrupo

### 3.1 Creación

1. Se crea un **grupo** (entidad financiera, cliente corporativo, o persona)
2. Dentro del grupo se crea uno o más **subgrupos** (flotas operativas)
3. Al registrar un nuevo dispositivo GPS, se selecciona el grupo y subgrupo destino

### 3.2 Reasignación

Un dispositivo puede reasignarse a otro subgrupo (incluso de otro grupo) cuando cambia su contexto operativo. Históricamente conserva el registro de asignaciones anteriores (pendiente de implementación).

### 3.3 Visualización por rol

| Rol | ¿Ve grupo/subgrupo? |
|-----|:-------------------:|
| `esad` | ✅ Sí |
| `admin` | ❌ No |
| `operator` | ❌ No |
| `client` | ❌ No |

Solo el rol `esad` tiene visibilidad de esta información, tanto en la vista expandida del vehículo como en el popover de cada dispositivo GPS individual.

---

## 4. Estructura de datos

```typescript
type GpsDevice = {
  type: GpsServiceType;
  group: string;    // requerido — grupo al que pertenece
  subgroup: string; // requerido — subgrupo al que pertenece
  // ... otros campos
};
```

---

## 5. Decisiones de UX

1. **Grupo + subgrupo obligatorios**: se descartó el escenario de "solo grupo" o "solo subgrupo" porque en la operación real todo dispositivo pertenece a un cliente (grupo) y a una flota específica (subgrupo).

2. **Subgrupo sin restricción cruzada**: un dispositivo puede asignarse a cualquier subgrupo existente, incluso de otro grupo, para cubrir casos de reasignación operativa.

3. **Visible solo para `esad`**: la información de agrupación es administrativa/contractual, no operativa. El admin, operator y cliente no necesitan ver esta jerarquía en su día a día.

4. **El identificativo se almacena por dispositivo, no por vehículo**: cada GPS puede tener contratos distintos, incluso dentro del mismo vehículo.

---

## 6. Ejemplos de uso

### Caso 1: Cliente corporativo con flota propia

```
Grupo:    CrediScotia
Subgrupo: Flota Lima Norte
GPS:      ANA - SVR Plus (IMEI: 354823091234567)
```

### Caso 2: Admin con GPS propio y GPS del banco en el mismo vehículo

```
Vehículo: MOT-101

GPS #1:
  Grupo:    Santander Autos
  Subgrupo: Flota Lima Norte
  Tipo:     SVR Plus

GPS #2:
  Grupo:    Enzo
  Subgrupo: EnzoMacalupu
  Tipo:     SVR Contingencia
```

### Caso 3: Reasignación a subgrupo de otro grupo

```
Antes:
  Grupo:    BCP Leasing
  Subgrupo: Unidad Pesada

Después (cambio de contrato):
  Grupo:    BBVA Perú
  Subgrupo: Delivery Miraflores
```

---

## 7. Pendientes

| # | Tema | Estado |
|---|------|--------|
| 1 | UI de selección de grupo/subgrupo al registrar nuevo GPS | Pendiente |
| 2 | Historial de cambios de grupo/subgrupo por dispositivo | Pendiente |
| 3 | Validación visual de campos obligatorios en formulario | Pendiente |
| 4 | Búsqueda/filtro de subgrupos existentes al asignar | Pendiente |

---

*Fin del documento logica-grupos.md*
