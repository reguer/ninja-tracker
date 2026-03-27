# 02. Modelo de Datos y Diccionario (Pase 2)

## Hoja Actividades (campos clave de calculo)
- `TipoBloque`: `fijo_inevitable` / `recurrente_configurable` / `seguimiento_sin_tiempo`
- `EsFijo`: SI/NO
- `ConsumeTiempo`: SI/NO
- `DuracionMin`: duracion base de la actividad
- `TrasladoMinIda`: minutos de traslado de ida
- `TrasladoMinVuelta`: minutos de traslado de vuelta
- `DuracionTotalHorasCalc` (formula): `(DuracionMin + Ida + Vuelta)/60`
- `VecesPorSemana`: se usa cuando no hay `DiasSemana`
- `CapacidadAfectada`: `total_real` / `solo_proyectos`
- `PrioridadReal`: `critica` / `alta` / `media` / `baja`
- `EscenarioSemana`: `base` u otro escenario

## Hoja Proyectos (nuevos)
- `PrioridadReal`
- `CapacidadAfectada`
- `EscenarioSemana`
- `HorasRestantesCalc`, `SemanasRestantesCalc`, `FechaProbableFinCalc` (formulas)

## Hoja EventosDiversion (nuevos)
- `CapacidadAfectada`
- `EscenarioSemana`
- `Activo`

## Hoja Calendario (motor)
Columnas clave:
- `HorasBloquesFijosInevitables`
- `HorasRecurrentesConfigurables`
- `HorasBloqueadasExtraordinarias`
- `CapacidadNetaDia`
- `HorasProyectosDia`
- `SaldoLibreRealDia`
- `Saturacion`
- `CapacidadTotalDia`
- `HorasComprometidasTotales`

## Hoja Dashboard (respuesta de negocio)
KPIs principales:
- capacidad total del periodo
- capacidad neta del periodo
- comprometido en proyectos
- saldo libre real
- maximo asignable sin sobrecarga
- dias saturados
- consumo por tipo de bloque
