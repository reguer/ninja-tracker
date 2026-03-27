# 07. Auditoria Pase 2 (Calculadora de Tiempo Real)

## A) Lo que ya estaba bien
- Arquitectura por hojas separadas (configuracion, captura, calendario, dashboard).
- Motor diario en `Calendario` con saldo y semaforos.
- Dashboard con vista semanal/mensual/anual.
- Soporte de CSV y Apps Script opcional.

## B) Ajustes aplicados
- Se reforzo el enfoque de **calculadora de capacidad real**.
- Se incorporaron traslados explicitos ida/vuelta.
- Se separo calculo en bloques:
  - fijos inevitables
  - recurrentes configurables
  - extraordinarios
  - proyectos
- Se agrego simulacion por `EscenarioSemana`.
- Se actualizaron templates CSV y Apps Script de importacion.

## C) Campos nuevos incorporados
- `TrasladoMinIda`
- `TrasladoMinVuelta`
- `DuracionMin`
- `VecesPorSemana`
- `TipoBloque`
- `EsFijo`
- `ConsumeTiempo`
- `CapacidadAfectada`
- `PrioridadReal`
- `EscenarioSemana`

## D) Resultado operativo
- Dashboard responde de forma directa:
  - tiempo libre real
  - tiempo comprometido
  - capacidad adicional asignable
  - consumo por tipo de bloque
  - impacto al cambiar escenario semanal
