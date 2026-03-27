# 01. Arquitectura Funcional (Pase 2)

## Principio rector
El sistema ahora esta centrado en una sola pregunta:

**Cuanto tiempo disponible real tengo para proyectos sin sobrecargarme?**

## Capas funcionales
1. `Config`: parametros globales de capacidad y escenario activo.
2. `Actividades`: bloques de tiempo con distincion explicita entre fijo inevitable y recurrente configurable.
3. `Proyectos` y `FasesProyecto`: carga semanal y proyeccion real por horas.
4. `EventosDiversion`: bloqueos extraordinarios (total, por horas, reduccion parcial) por escenario.
5. `Calendario`: motor diario de capacidad real.
6. `Dashboard`: respuesta rapida semanal/mensual/anual para decisiones de asignacion.

## Distinciones clave ya explicitadas
- `fijo_inevitable`
- `recurrente_configurable`
- `proyectos`
- `bloqueos_extraordinarios`

## Campos nuevos orientados a calculo real
En la captura principal ya existen:
- `DuracionMin`
- `TrasladoMinIda`
- `TrasladoMinVuelta`
- `VecesPorSemana`
- `TipoBloque`
- `EsFijo`
- `ConsumeTiempo`
- `CapacidadAfectada`
- `PrioridadReal`
- `EscenarioSemana`

## Resultado operativo
La capacidad para proyectos se calcula desde calendario diario y se agrega por semana/mes/anio, con saldo libre real y alertas de saturacion.
