# 03. Formulas Clave (Pase 2)

## 1) Tiempo disponible real diario
En `Calendario`:

1. `CapacidadTotalDia = HorasBase - HorasSueno`
2. `HorasBloquesFijosInevitables = HorasFijasBaseInevitables + SUMPRODUCT(fijos)`
3. `HorasRecurrentesConfigurables = SUMPRODUCT(recurrentes)`
4. `HorasBloqueadasExtraordinarias = bloqueos/reducciones por eventos`
5. `CapacidadNetaDia = MAX(0, CapacidadTotalDia - fijos - recurrentes - extraordinarios)`
6. `HorasProyectosDia = SUMPRODUCT(horas asignadas semana / 7)`
7. `SaldoLibreRealDia = CapacidadNetaDia - HorasProyectosDia`

## 2) Traslados explicitos
`DuracionTotalHorasCalc = (DuracionMin + TrasladoMinIda + TrasladoMinVuelta) / 60`

Ese valor es el que se descuenta en el calendario cuando `ConsumeTiempo = SI`.

## 3) Capacidad semanal/mensual/anual
En `Dashboard` segun `Vista`:
- `Capacidad total periodo` = suma `CapacidadTotalDia`
- `Capacidad neta periodo` = suma `CapacidadNetaDia`
- `Comprometido en proyectos` = suma `HorasProyectosDia`
- `Saldo libre real` = `CapacidadNetaPeriodo - ProyectosPeriodo`

## 4) Saturacion
- `SATURADO` si `SaldoLibreRealDia < 0`
- `RIESGO` si `SaldoLibreRealDia < BufferSeguridadDia`
- `OK` en caso contrario

## 5) Escenarios
`Config!EscenarioSemanaActivo` toma el valor de `Dashboard!B5`.

El calendario solo considera filas `base` y/o del escenario activo para:
- `Actividades`
- `Proyectos`
- `EventosDiversion`

Esto permite simular semanas de vacaciones o bloqueos parciales sin duplicar libros.
