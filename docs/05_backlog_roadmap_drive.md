# 05. Backlog, Roadmap y Plan Google Drive

## Backlog Futuro (priorizado)

### Alta prioridad
- Ajuste de asignacion por dia laboral/no laboral.
- Dashboard con mini-graficas semanales.
- Reporte de tendencia de sobrecarga por mes.
- Validacion automatica de IDs duplicados.

### Media prioridad
- Ambito por categoria real en `EventosDiversion`.
- Capacidad separada por contexto (trabajo/personal).
- Escenarios "what-if" (si aumento X horas/semana).
- Planeacion trimestral semiautomatica.

### Baja prioridad
- Recordatorios por correo.
- Integracion con Google Calendar.
- Exportacion PDF ejecutiva mensual.

## Roadmap 1.1 (4 a 6 semanas)

Objetivo: mejorar precision sin perder simplicidad.

Incluye:
1. Matriz de dias laborables real en `Config` (horas diferentes por dia).
2. Vista semanal compacta para movil (tarjetas).
3. Semaforo por proyecto (capacidad vs asignacion).
4. Control de backlog: proyectos activos vs pausados.

## Roadmap 1.2 (8 a 12 semanas)

Objetivo: pasar de tracker a sistema de decision ligera.

Incluye:
1. Simulador de fecha probable por cambios de horas asignadas.
2. Curva de avance acumulado por proyecto/fase.
3. Integracion opcional con Google Calendar (lectura de eventos).
4. Panel anual con comparativo capacidad vs ejecucion real.

## Plan para conectar con Google Drive

### Fase A (MVP+)
- Guardar libro maestro en carpeta compartida de Drive.
- Usar App Script para importacion CSV por File ID.

### Fase B
- Carpeta `imports/inbox/` para CSV entrantes.
- Script para mover procesados a `imports/archive/`.
- Bitacora de importaciones en hoja `Logs`.

### Fase C
- Versionado liviano con snapshots mensuales (copias de la hoja).
- Permisos por rol (edicion limitada a hojas de captura).

## Estructura de carpetas recomendada en Drive

```text
NinjaTracker/
├─ 00_master/
│  ├─ Ninja_Tracker_MVP (Google Sheet)
│  └─ Ninja_Tracker_MVP.xlsx
├─ 01_imports/
│  ├─ inbox/
│  └─ archive/
├─ 02_exports/
│  ├─ monthly_snapshots/
│  └─ reports/
├─ 03_docs/
│  ├─ README_operativo.md
│  ├─ diccionario_datos.md
│  └─ roadmap.md
└─ 99_backup/
   └─ historico/
```

## Archivos clave que conviene versionar siempre
- `Ninja_Tracker_MVP.xlsx`
- Script generador `generate_ninja_tracker_mvp.py`
- `apps_script/Code.gs`
- CSV templates
- Documentacion funcional y de cambios

## Recomendacion de versionado simple
- Convencion de nombre: `Ninja_Tracker_MVP_vYYYY.MM.DD.xlsx`
- Snapshot mensual del maestro.
- Changelog corto en `03_docs/`.
