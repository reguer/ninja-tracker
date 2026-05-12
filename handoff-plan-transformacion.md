# HANDOFF: Plan de Transformación Personal — App React
**Tipo:** Product spec / engineering brief  
**Para usar con:** Claude Code · Codex · cualquier agente de código  
**Estado del proyecto:** v0.1 entregado (React .jsx) → v1.0 por construir  
**Fecha:** 2025

---

## 1. Contexto y origen del producto

Este producto nació de una conversación real sobre cambio profundo de vida. El usuario describió:

- Dificultad crónica para concentrarse y comenzar proyectos
- Consumo impulsivo de entretenimiento y contenido de baja calidad como mecanismo de evasión
- Dependencia de nicotina (dispositivo IQOS/aikos) con intención clara de dejarla
- Deseo de dejar otros hábitos dañinos simultáneamente
- Falta de constancia en proyectos personales y de trabajo
- Ausencia de estructura y rutina diaria sólida

La respuesta fue un plan de 21 días escalado a 1 año, basado en cuatro pilares:
1. **Ciencia del cambio conductual** — self-monitoring, implementation intentions (si-entonces), habit formation por repetición contextual
2. **Evidencia clínica para cesación de nicotina** — OMS/CDC: combinación de intervención conductual + farmacológica cuando aplica; quit plan, identificación de disparadores, respuestas preparadas
3. **Fisiología de atención y función ejecutiva** — sueño regular, actividad física con efectos probados sobre control atencional
4. **Filosofía práctica antigua** — Estoicismo (distinguir control, no obedecer impulsos), Aristóteles (carácter por repetición de actos), Sócrates (vida examinada, no automática)

**Principio rector del plan:** La motivación es un subproducto irregular. La estructura es el sistema. La acción precede a la motivación.

---

## 2. Estructura del plan (dominio)

### 2.1 Plan de 21 días — 3 fases

| Fase | Días | Objetivo | Clave |
|------|------|----------|-------|
| I | 1–7 | Control básico | Orden mínimo confiable. 1 bloque de trabajo/día. Inicio reducción nicotina |
| II | 8–14 | Identidad | 2 bloques/día, 4+ días. Abandono nicotina o plan de cese. Máx. 3 proyectos activos |
| III | 15–21 | Dirección | 2–3 bloques. Sistema semanal. Ocio deliberado. Evaluación escrita día 21 |

**Reglas maestras (no negociables durante 21 días):**
- Hora fija de despertar (±30 min)
- Sin entretenimiento antes del primer bloque de trabajo
- Al menos 1 bloque serio diario
- Nicotina con plan, no con heroísmo desordenado
- Registro diario de cumplimiento (5 casillas)
- El día se mide por qué hiciste, no por cómo te sentiste

**Estructura diaria fija:**
- Mañana: despertar fijo → agua + luz natural → bitácora 5–10 min (qué importa / qué evitaré / primer paso) → movimiento 20 min → primer bloque antes de entretenimiento
- Trabajo: 1 bloque mínimo 25–50 min → pausa → segundo bloque si hay energía
- Mediodía: revisión de disparadores del día
- Noche: apagar entretenimiento 60 min antes de dormir → registrar cumplimiento → frase de identidad escrita

### 2.2 Plan anual — 4 trimestres

| Trimestre | Meses | Tema | Objetivo principal |
|-----------|-------|------|--------------------|
| T1 | 1–3 | Estabilidad | Rutina + cesación nicotina + 1–2 bloques/día |
| T2 | 4–6 | Capacidad | Volumen de trabajo + ejercicio + metas mensuales por proyecto |
| T3 | 7–9 | Expansión | Cerrar proyecto A, comenzar B solo al cerrar, tolerancia al vacío |
| T4 | 10–12 | Identidad consolidada | Revisión anual, reglas que funcionaron, prioridades año siguiente |

### 2.3 Código personal (7 reglas)
1. La acción precede a la motivación
2. No confío en impulsos; confío en sistemas
3. Lo placentero se programa al final, no al principio
4. Cada día debe dejar una huella visible
5. No llevo más proyectos activos de los que puedo honrar
6. La incomodidad no es emergencia
7. Mi carácter se entrena con repeticiones, no con intenciones

---

## 3. Descripción del producto de software

Una **web app React de una sola página** (puede ser app móvil en el futuro) que combina:
- Cuestionario de onboarding profundo
- Motor de generación de plan personalizado
- Dashboard visual interactivo con múltiples vistas
- **Calculadora de tiempo disponible real** (módulo nuevo — ver sección 5)

El usuario responde el cuestionario una vez. El sistema genera su plan personalizado para 21 días y 12 meses. El dashboard es manipulable: puede ajustar frecuencias, reordenar prioridades, reasignar tiempo.

---

## 4. Estado actual — v0.1 entregado

Se entregó un archivo `.jsx` funcional que incluye:

### ✅ Implementado

**Cuestionario — 8 secciones:**
1. Identidad y punto de partida actual
2. Lo que quiere dejar (nicotina, entretenimiento, otros vicios) — tipo, velocidad, urgencia
3. Lo que quiere construir (rutina de mañana, ejercicio, prácticas mentales) — checkboxes
4. Proyectos y trabajo (proyecto principal, etapa, estilo de trabajo, meta económica)
5. Actividades, ocio y viajes
6. Relaciones y tiempo de calidad
7. Metas medibles (salud, financiero, aprendizaje, hábito/racha)
8. Metas del alma (felicidad, paz, libertad, identidad futura en presente)

**Dashboard — 3 vistas:**
- **Resumen (Overview):** banner personalizado con nombre + cita de identidad futura, tarjetas de metas medibles, lista de prioridades draggable (HTML5 drag & drop), hábitos con selector de frecuencia ajustable, código personal de 7 reglas, nota de advertencia médica
- **Cronograma (Gantt):** barras de 12 meses por proyecto/hábito, bandas trimestrales con color y tema, tarjetas de detalle por trimestre, leyenda
- **21 Días (Calendar):** grid 7×3 clicable, tarjetas de fase, detalle por día (mañana/trabajo/noche + objetivo específico rotado)

**Motor de generación:** `generatePlan(flatAnswers)` — produce fases, trimestres, items gantt y hábitos a partir de las respuestas del cuestionario.

### ❌ No implementado (pendiente)
- Calculadora de tiempo disponible real (módulo nuevo — sección 5)
- Persistencia de datos (localStorage / backend)
- Export/print del plan
- Notificaciones / recordatorios
- Check-in diario / tracking de cumplimiento
- Modo edición completo del plan
- Soporte mobile nativo
- Onboarding de nicotina con plan de reducción interactivo día por día

---

## 5. Módulo nuevo: Calculadora de tiempo disponible real

### 5.1 Problema que resuelve

El plan genera proyectos y metas, pero no responde una pregunta crítica: **¿cuándo termina realmente este proyecto si le dedico X horas a la semana?**

El usuario necesita saber:
1. Cuántas horas tiene disponibles por semana después de obligaciones fijas
2. Cuánto de ese tiempo libre va a hábitos diarios/semanales/mensuales que requieren tiempo
3. Cuántas horas netas quedan para trabajo en proyectos
4. Dadas esas horas y la estimación de tamaño del proyecto → fecha estimada de completion
5. Si tiene múltiples proyectos activos → distribución real entre ellos

### 5.2 Inputs del módulo

**Bloque A — Tiempo total disponible (horas/semana)**
```
Horas de trabajo/obligaciones fijas por semana:   [__]
Horas de sueño total (calculado: h/noche × 7):    [auto]
Horas libres brutas resultantes:                  [calculado]
```

**Bloque B — Hábitos y actividades fijas (cada una con frecuencia + duración)**

El usuario puede agregar/quitar filas. Cada fila tiene:
```
Nombre del hábito/actividad  |  Frecuencia  |  Duración por sesión  |  Horas/semana (calculado)
──────────────────────────────────────────────────────────────────────────────────────────────
Rutina de mañana             |  diario       |  45 min               |  5.25 h
Ejercicio                    |  4x/semana    |  45 min               |  3.0 h
Meditación                   |  diario       |  15 min               |  1.75 h
Terapia                      |  1x/semana    |  60 min               |  1.0 h
...
Total hábitos:                                                         [suma]
```

Frecuencias disponibles: diario / 6x sem / 5x sem / 4x sem / 3x sem / 2x sem / 1x sem / quincenal / mensual

**Bloque C — Tiempo neto para proyectos**
```
Horas libres brutas:          [de Bloque A]
Menos tiempo en hábitos:      [de Bloque B]
Menos buffer imprevistos (%)  [slider 10–30%]
= Horas netas disponibles/sem: [calculado, destacado]
```

**Bloque D — Proyectos activos (máx. 3)**

Para cada proyecto:
```
Nombre del proyecto           [texto]
Tamaño estimado               [horas totales] o [días × carga diaria]
Porcentaje de avance actual   [0–100%]
Horas restantes estimadas     [calculado o manual]
Prioridad                     [A / B / C]
% del tiempo neto asignado    [slider — los 3 proyectos deben sumar ≤ 100%]
Horas/semana asignadas        [calculado: tiempo neto × %]
Fecha estimada de completion  [calculado: horas restantes / horas/semana asignadas]
```

**Outputs visuales del módulo:**
1. **Semana visual** — barra de 168h dividida en: sueño / trabajo/obligaciones / hábitos / proyectos / buffer / libre
2. **Timeline de proyectos** — mini Gantt mostrando cuándo termina cada proyecto según tiempo asignado
3. **Alerta de sobrecarga** — si el total supera horas disponibles, muestra en rojo cuántas horas hay que recortar
4. **Tabla resumen** — una fila por proyecto con nombre, horas/sem, semanas restantes, fecha objetivo

### 5.3 Lógica de cálculo

```
HORAS_SEMANA_TOTAL = 168

SUEÑO_SEMANAL = horas_noche × 7

HORAS_LIBRES_BRUTAS = HORAS_SEMANA_TOTAL - sueño_semanal - horas_trabajo_fijas

HORAS_HABITOS = Σ(duración_sesión × frecuencia_semanal_normalizada)
  donde frecuencia_semanal_normalizada:
    diario = 7, 6x = 6, 5x = 5, 4x = 4, 3x = 3, 2x = 2, 1x = 1
    quincenal = 0.5, mensual = 0.25

HORAS_NETAS = HORAS_LIBRES_BRUTAS × (1 - buffer_pct/100) - HORAS_HABITOS

Para cada proyecto p:
  horas_asignadas_p = HORAS_NETAS × (porcentaje_p / 100)
  semanas_restantes_p = horas_restantes_p / horas_asignadas_p
  fecha_completion_p = fecha_hoy + semanas_restantes_p × 7 días

ALERTA si: Σ(porcentajes_proyectos) > 100 ó HORAS_NETAS < 0
```

### 5.4 Comportamiento UX requerido

- **Reactivo:** todo se recalcula en tiempo real al mover cualquier slider o editar cualquier campo
- **Persistente:** los valores del usuario se guardan (localStorage como mínimo)
- **Integrado con el plan:** las fechas calculadas se reflejan en el Gantt anual del dashboard
- **Advertencia de realismo:** si el usuario asigna <4h/semana a su proyecto A, mostrar mensaje: "A este ritmo, este proyecto termina en [N meses]. ¿Es eso aceptable?"
- **Edición de hábitos inline:** el usuario puede agregar/quitar hábitos, cambiar duración y frecuencia sin salir de la vista

---

## 6. Arquitectura de componentes recomendada

```
App
├── Questionnaire                    # onboarding
│   ├── SectionStep (×8)
│   └── ProgressDots
│
├── Dashboard                        # shell con tabs
│   ├── OverviewTab
│   │   ├── IdentityBanner
│   │   ├── GoalCards (medibles + alma)
│   │   ├── PriorityList (draggable)
│   │   ├── HabitFrequencyPanel
│   │   └── PersonalCode
│   │
│   ├── TimeCalculatorTab            # ← MÓDULO NUEVO (sección 5)
│   │   ├── WeeklyTimeSetup          # Bloque A
│   │   ├── HabitTimeTable           # Bloque B (filas add/remove)
│   │   ├── NetTimeSummary           # Bloque C
│   │   ├── ProjectTimeAllocator     # Bloque D (sliders)
│   │   ├── WeekBar168h              # visualización semana
│   │   └── ProjectTimeline          # mini Gantt de completion
│   │
│   ├── GanttTab                     # cronograma anual
│   └── CalendarTab                  # plan 21 días
│
└── planEngine.js                    # generatePlan(), calculateTime()
```

---

## 7. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 (hooks) |
| Estilos | CSS-in-JS inline (sin dependencias de styling) o Tailwind core |
| Animaciones | CSS transitions (sin Motion library por ahora) |
| Drag & Drop | HTML5 nativo (ya implementado en v0.1) |
| Persistencia | localStorage → migrar a Supabase/Firebase en v2 |
| Fuentes | Google Fonts: Cormorant Garamond (display) + DM Sans (body) |
| Deploy | Vercel / Netlify (estático) |
| Testing | Vitest + React Testing Library (opcional en v1) |

**Sin dependencias de UI component libraries.** Todo el diseño es custom. No usar shadcn, MUI, Ant Design ni similares.

---

## 8. Sistema de diseño (tokens)

```javascript
const T = {
  bg: "#0A0A0C",          // fondo principal
  surface: "#111114",     // navbar / superficies elevadas
  card: "#18181C",        // tarjetas
  cardHover: "#1E1E24",
  border: "#252528",
  gold: "#BF8C3A",        // acento principal — proyectos, logros
  goldLight: "#D4A84B",
  goldPale: "#E8C87A",
  sage: "#5A8A6A",        // físico, hábitos
  sagePale: "#7AAD88",
  rose: "#A05050",        // salud, cesación, control
  rosePale: "#C07070",
  blue: "#3D6E8A",        // hábitos base, identidad
  bluePale: "#5E9AB8",
  text: "#E0DDD8",
  textMuted: "#8A8A94",
  textFaint: "#4A4A52",
};
```

Fuentes: `'Cormorant Garamond', serif` para títulos/display — `'DM Sans', sans-serif` para cuerpo y UI.

Tema: oscuro permanente. Sin modo claro en v1.

---

## 9. Datos del cuestionario → estructura de estado

```javascript
// answers: { [sectionId]: { [fieldId]: value } }
// flatAnswers: Object.values(answers).reduce((a,s) => ({...a,...s}), {})

// Secciones y sus campos clave:
{
  identity: {
    name: string,
    currentState: string,         // estado actual de vida
    triggerMoment: string,        // qué los llevó a cambiar
    mainProblem: string           // radio — tipo principal de obstáculo
  },
  quit: {
    nicotine: string,             // radio — intención con nicotina
    entertainment: string[],      // checkboxes — tipos de entretenimiento
    otherVices: string,
    quitUrgency: string           // radio — velocidad de cesación
  },
  build: {
    morningRoutine: string[],     // checkboxes — elementos rutina mañana
    exercise: string[],           // checkboxes — tipos de ejercicio
    mindPractice: string[],
    wakeTime: string              // radio — hora de despertar
  },
  projects: {
    mainProject: string,
    projectStage: string,
    otherProjects: string,
    workStyle: string[],
    incomeGoal: string
  },
  life: {
    hobbies: string[],
    travel: string,
    leisurePhilosophy: string
  },
  relationships: {
    keyPeople: string,
    relationshipGoals: string[],
    connectionState: string
  },
  measurable: {
    healthGoal: string,
    financialGoal: string,
    learningGoal: string,
    projectGoal: string,
    habitGoal: string
  },
  soul: {
    happiness: string,
    peace: string,
    freedom: string[],
    futureIdentity: string        // escrito en presente — base del identity banner
  }
}
```

---

## 10. Modelo de datos para el módulo de tiempo (nuevo)

```javascript
// timeData: guardado en localStorage key "plan_time_v1"
{
  setup: {
    sleepHoursPerNight: 7.5,      // default 7.5
    fixedWorkHoursPerWeek: 40,    // trabajo/obligaciones fijas
    bufferPercent: 20             // porcentaje de buffer para imprevistos
  },
  habits: [
    {
      id: "h_001",
      name: "Rutina de mañana",
      frequencyPerWeek: 7,        // normalizado: 7=diario, 0.5=quincenal, etc.
      durationMinutes: 45,
      category: "Mañana",         // Mañana / Físico / Mente / Social / Admin
      isFixed: true               // true = no se puede quitar (viene del plan base)
    },
    // ...más hábitos
  ],
  projects: [
    {
      id: "p_001",
      name: "Proyecto A",
      priority: "A",
      estimatedTotalHours: 200,
      progressPercent: 10,
      allocatedPercent: 60,       // % del tiempo neto asignado a este proyecto
      startDate: "2025-01-01"
    },
    // máx. 3
  ]
}
```

---

## 11. Comportamiento de proyectos: finito vs. continuo

El plan distingue dos tipos de proyectos/planes:

| Tipo | Descripción | Cómo se modela |
|------|-------------|----------------|
| **Finito** | Tiene fecha de entrega o criterio de "terminado" | Horas totales estimadas → fecha de completion calculada |
| **Continuo** | No termina, requiere mantenimiento constante (hábitos, salud, relaciones) | Horas/semana fijas, sin fecha de fin, aparece como barra continua en Gantt |
| **Intensivo al inicio** | Requiere más atención al principio y luego solo mantenimiento | Dos fases: intensiva (meses 1–3) + mantenimiento (meses 4–12), con horas distintas por fase |

El módulo de tiempo debe permitir seleccionar el tipo de cada proyecto/plan y ajustar la lógica de cálculo correspondientemente.

---

## 12. Flujo de usuario completo (happy path)

```
1. Llega a la app → ve pantalla de bienvenida con propósito del plan
2. Responde cuestionario (8 secciones, ~5–8 min)
3. Ve "Generando tu plan..." → transición al Dashboard
4. Dashboard abre en tab Resumen → ve su nombre, cita de identidad, metas
5. Va a tab Calculadora de Tiempo → configura semana, hábitos, proyectos
6. Ve fecha real de completion del proyecto principal
7. Va a tab Cronograma → ve Gantt actualizado con fechas reales del paso 6
8. Va a tab 21 Días → toca el Día 1 → ve su plan exacto para mañana
9. Puede volver al Resumen → ajustar frecuencias de hábitos → todo se recalcula
10. Puede editar respuestas del cuestionario → plan se regenera
```

---

## 13. Prioridad de desarrollo — sprints sugeridos

### Sprint 1 (módulo tiempo — es la pieza faltante más importante)
- `TimeCalculatorTab` completo con Bloques A, B, C, D
- Cálculo reactivo en tiempo real
- WeekBar168h visual
- ProjectTimeline mini Gantt
- Integración de fechas calculadas → Gantt principal

### Sprint 2 (persistencia + edición)
- localStorage para timeData, answers y plan
- Modo edición de respuestas del cuestionario
- Edición inline de hábitos en OverviewTab

### Sprint 3 (tracking diario)
- Check-in diario: marcar las 5 casillas del día
- Streak counter por hábito
- Vista de progreso semanal real vs. planificado

### Sprint 4 (pulido y mobile)
- Responsive completo para mobile
- Animaciones de transición entre tabs
- Export del plan como PDF o imagen
- Pantalla de bienvenida + intro

---

## 14. Archivos entregados

| Archivo | Descripción |
|---------|-------------|
| `plan-transformacion.jsx` | Componente React completo v0.1 — cuestionario + dashboard 3 vistas |

---

## 15. Notas para el agente de código

- **No agregar dependencias de styling** (no Tailwind compiler, no CSS modules, no styled-components). Todo el estilo es inline con el sistema de tokens definido en la sección 8.
- **El componente raíz debe exportarse como `default`** desde el archivo principal.
- **No usar `<form>` HTML.** Todos los inputs usan handlers React (`onClick`, `onChange`).
- **No usar localStorage sin manejo de errores.** Siempre `try/catch`.
- **El módulo de tiempo (sección 5) es la prioridad #1.** El Gantt existente debe actualizarse para reflejar las fechas calculadas por ese módulo.
- **El plan distingue proyectos finitos, continuos e intensivos al inicio** (sección 11) — el tipo debe ser seleccionable y afectar tanto la calculadora como el Gantt.
- **La lógica de negocio** (cálculos, generación de plan) debe estar separada de los componentes UI en un archivo `planEngine.js`.
- **Todos los textos en español.** El producto es completamente en español.
- **Fuentes via Google Fonts** inyectadas en `useEffect` al montar el componente raíz.

---

*Fin del handoff — versión 1.0*
