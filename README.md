# Ninja Tracker MVP

MVP funcional para planeacion personal en **Google Sheets / XLSX** con foco en:
- Recurrentes
- Proyectos
- Diversiones

En esta version consolidada (Pase 2), el sistema se centra primero en ser una **calculadora de tiempo disponible real** y despues un tracker.

## 1) Resumen Ejecutivo

`Ninja Tracker MVP` es una plantilla lista para usar que convierte tu planeacion en un flujo operativo minimo:
1. Definir capacidad diaria real (`Config`).
2. Cargar bloques recurrentes y habitos (`Actividades`).
3. Registrar proyectos y sus horas semanales (`Proyectos`, `FasesProyecto`).
4. Bloquear/reducir disponibilidad con eventos (`EventosDiversion`).
5. Revisar capacidad neta, saturacion y foco semanal/mensual/anual (`Calendario`, `Dashboard`).

Resultado: una vista clara de **horas disponibles, comprometidas y libres** con alertas tempranas de sobrecarga.

## 2) Entregables Incluidos

- Plantilla XLSX lista: `Ninja_Tracker_MVP.xlsx`
- Generador reproducible: `scripts/generate_ninja_tracker_mvp.py`
- CSV templates de importacion: carpeta `templates/csv/`
- Apps Script opcional para menu + import CSV desde Drive: `apps_script/Code.gs`
- Documentacion funcional completa: carpeta `docs/`

## 3) Arquitectura y Modelo

Ver documentos:
- `docs/01_arquitectura_funcional.md`
- `docs/02_modelo_datos_y_diccionario.md`

## 4) Formulas Clave

Ver documento:
- `docs/03_formulas_clave.md`

## 5) Instrucciones Paso a Paso

Ver documento:
- `docs/04_instrucciones_uso.md`

## 6) Formato CSV de Importacion

Ver documento:
- `docs/06_formato_csv_importacion.md`

## 7) Roadmap y Escalamiento

Ver documento:
- `docs/05_backlog_roadmap_drive.md`

## 8) Auditoria Pase 2

Ver documento:
- `docs/07_auditoria_pase2.md`

## 9) Estructura de Archivos

```text
CalculadoraTiempo/
├─ Ninja_Tracker_MVP.xlsx
├─ README.md
├─ scripts/
│  └─ generate_ninja_tracker_mvp.py
├─ templates/
│  └─ csv/
│     ├─ actividades_import.csv
│     ├─ proyectos_import.csv
│     ├─ fases_proyecto_import.csv
│     └─ eventos_diversion_import.csv
├─ apps_script/
│  └─ Code.gs
└─ docs/
   ├─ 01_arquitectura_funcional.md
   ├─ 02_modelo_datos_y_diccionario.md
   ├─ 03_formulas_clave.md
   ├─ 04_instrucciones_uso.md
   ├─ 05_backlog_roadmap_drive.md
   ├─ 06_formato_csv_importacion.md
   └─ 07_auditoria_pase2.md
```
