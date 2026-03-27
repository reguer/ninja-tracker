# 04. Instrucciones de Uso (Pase 2)

## Paso 1: Configuracion inicial
1. Abre `Ninja_Tracker_MVP.xlsx` o conviertelo a Google Sheets.
2. En `Config` valida:
   - `HorasBaseDia`
   - `HorasSuenoObjetivo`
   - `HorasFijasBaseInevitables`
   - `BufferSeguridadDia`

## Paso 2: Cargar bloques reales
En `Actividades` captura primero lo inevitable:
- `TipoBloque = fijo_inevitable`
- `ConsumeTiempo = SI`
- `DuracionMin` + traslados

Luego carga lo configurable:
- `TipoBloque = recurrente_configurable`

## Paso 3: Cargar proyectos
En `Proyectos` define `HorasAsignadasSemana` y `PrioridadReal`.

## Paso 4: Cargar eventos extraordinarios
En `EventosDiversion` usa:
- `bloqueo_total`
- `bloqueo_horas`
- `reduccion_parcial`

Y etiqueta `EscenarioSemana` cuando aplique (ej. `vacaciones`).

## Paso 5: Leer decisiones en Dashboard
En `Dashboard` usa:
- `Vista` (semanal/mensual/anual)
- `EscenarioSemana`

Responde en segundos:
- cuanto tiempo libre real hay
- cuanto esta comprometido
- cuanto mas puedes asignar sin saturarte
- que bloque consume mas

## Uso movil recomendado
- Captura diaria: `RegistroHabitos`
- Planeacion semanal: `Dashboard` + `Actividades` + `Proyectos`
