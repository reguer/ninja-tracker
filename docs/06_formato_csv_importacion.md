# 06. Formato CSV de Importacion (Pase 2)

## Reglas generales
- UTF-8
- separador `,` (Apps Script acepta `;`)
- fechas `yyyy-mm-dd`
- porcentajes en decimal `0..1`

## Actividades
Plantilla: `templates/csv/actividades_import.csv`

Campos clave requeridos:
- `ID`, `Nombre`, `Tipo`, `TipoBloque`, `EsFijo`, `ConsumeTiempo`
- `Frecuencia`, `DuracionMin`
- `Prioridad`, `PrioridadReal`
- `Inicio`, `Activo`, `CapacidadAfectada`

Campos de calculo real:
- `TrasladoMinIda`
- `TrasladoMinVuelta`
- `VecesPorSemana`
- `EscenarioSemana`

## Proyectos
Plantilla: `templates/csv/proyectos_import.csv`

Campos clave requeridos:
- `ProyectoID`, `Nombre`, `Estado`
- `Prioridad`, `PrioridadReal`
- `HorasTotalesEstimadas`, `HorasAsignadasSemana`
- `Activo`, `CapacidadAfectada`

## FasesProyecto
Plantilla: `templates/csv/fases_proyecto_import.csv`

Campos clave:
- `FaseID`, `ProyectoID`, `Orden`, `NombreFase`
- `HorasEstimadas`, `HorasAsignadasSemana`, `Avance%`

## EventosDiversion
Plantilla: `templates/csv/eventos_diversion_import.csv`

Campos clave:
- `EventoID`, `TipoImpacto`, `Inicio`, `Fin`
- `CapacidadAfectada`, `EscenarioSemana`, `Activo`

## Orden recomendado de importacion
1. Actividades
2. Proyectos
3. FasesProyecto
4. EventosDiversion
