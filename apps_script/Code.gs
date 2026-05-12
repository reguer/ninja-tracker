/** Ninja Tracker MVP - Apps Script opcional */

const IMPORT_CONFIG = {
  Actividades: {
    fields: [
      { header: 'ID', col: 1 },
      { header: 'Nombre', col: 2 },
      { header: 'Tipo', col: 3 },
      { header: 'TipoBloque', col: 4 },
      { header: 'EsFijo', col: 5 },
      { header: 'ConsumeTiempo', col: 6 },
      { header: 'Categoria', col: 7 },
      { header: 'Subcategoria', col: 8 },
      { header: 'Frecuencia', col: 9 },
      { header: 'DiasSemana', col: 10 },
      { header: 'VecesPorSemana', col: 11 },
      { header: 'DuracionMin', col: 12 },
      { header: 'TrasladoMinIda', col: 13 },
      { header: 'TrasladoMinVuelta', col: 14 },
      { header: 'MetaPeriodo', col: 16 },
      { header: 'Unidad', col: 17 },
      { header: 'Prioridad', col: 18 },
      { header: 'PrioridadReal', col: 19 },
      { header: 'Inicio', col: 20 },
      { header: 'Fin', col: 21 },
      { header: 'Activo', col: 22 },
      { header: 'CapacidadAfectada', col: 23 },
      { header: 'EscenarioSemana', col: 24 },
      { header: 'ColorTag', col: 25 },
      { header: 'Notas', col: 26 },
    ],
  },
  Proyectos: {
    fields: [
      { header: 'ProyectoID', col: 1 },
      { header: 'Nombre', col: 2 },
      { header: 'Categoria', col: 3 },
      { header: 'Subcategoria', col: 4 },
      { header: 'Estado', col: 5 },
      { header: 'Prioridad', col: 6 },
      { header: 'PrioridadReal', col: 7 },
      { header: 'Inicio', col: 8 },
      { header: 'FechaObjetivo', col: 9 },
      { header: 'HorasTotalesEstimadas', col: 10 },
      { header: 'HorasAsignadasSemana', col: 11 },
      { header: 'TieneMantenimiento', col: 12 },
      { header: 'HorasMantenimientoSemana', col: 13 },
      { header: 'DependenciaProyectoID', col: 14 },
      { header: 'Avance%', col: 15 },
      { header: 'Activo', col: 16 },
      { header: 'CapacidadAfectada', col: 17 },
      { header: 'EscenarioSemana', col: 18 },
      { header: 'Notas', col: 19 },
    ],
  },
  FasesProyecto: {
    fields: [
      { header: 'FaseID', col: 1 },
      { header: 'ProyectoID', col: 2 },
      { header: 'Orden', col: 3 },
      { header: 'NombreFase', col: 4 },
      { header: 'Estado', col: 5 },
      { header: 'HorasEstimadas', col: 6 },
      { header: 'HorasAsignadasSemana', col: 7 },
      { header: 'DependenciaFaseID', col: 8 },
      { header: 'InicioTentativo', col: 9 },
      { header: 'Avance%', col: 11 },
      { header: 'Notas', col: 12 },
    ],
  },
  EventosDiversion: {
    fields: [
      { header: 'EventoID', col: 1 },
      { header: 'Nombre', col: 2 },
      { header: 'TipoImpacto', col: 3 },
      { header: 'Inicio', col: 4 },
      { header: 'Fin', col: 5 },
      { header: 'HorasBloqueadas', col: 6 },
      { header: 'PorcentajeReduccion', col: 7 },
      { header: 'AmbitoAfectado', col: 8 },
      { header: 'CapacidadAfectada', col: 9 },
      { header: 'EscenarioSemana', col: 10 },
      { header: 'Activo', col: 11 },
      { header: 'Notas', col: 12 },
    ],
  },
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Ninja Tracker')
    .addItem('Importar CSV > Actividades', 'importarCsvActividades')
    .addItem('Importar CSV > Proyectos', 'importarCsvProyectos')
    .addItem('Importar CSV > FasesProyecto', 'importarCsvFasesProyecto')
    .addItem('Importar CSV > EventosDiversion', 'importarCsvEventosDiversion')
    .addSeparator()
    .addItem('Recalcular dependencias (fechas)', 'recalcularDependencias')
    .addSeparator()
    .addItem('Refrescar Dashboard', 'refrescarDashboard')
    .addToUi();
}

function importarCsvActividades() { importarCsvToSheet_('Actividades'); }
function importarCsvProyectos() { importarCsvToSheet_('Proyectos'); }
function importarCsvFasesProyecto() { importarCsvToSheet_('FasesProyecto'); }
function importarCsvEventosDiversion() { importarCsvToSheet_('EventosDiversion'); }

function refrescarDashboard() {
  SpreadsheetApp.flush();
  SpreadsheetApp.getActive().toast('Dashboard actualizado', 'Ninja Tracker', 3);
}

function importarCsvToSheet_(sheetName) {
  const ss = SpreadsheetApp.getActive();
  const ui = SpreadsheetApp.getUi();
  const sheet = ss.getSheetByName(sheetName);
  const config = IMPORT_CONFIG[sheetName];

  if (!sheet || !config) {
    ui.alert(`No se encontro configuracion para la hoja: ${sheetName}`);
    return;
  }

  const prompt = ui.prompt(
    `Importar ${sheetName}`,
    'Pega el File ID de Google Drive del CSV:',
    ui.ButtonSet.OK_CANCEL
  );
  if (prompt.getSelectedButton() !== ui.Button.OK) return;

  const fileId = (prompt.getResponseText() || '').trim();
  if (!fileId) {
    ui.alert('File ID vacio.');
    return;
  }

  let csvText;
  try {
    csvText = DriveApp.getFileById(fileId).getBlob().getDataAsString('UTF-8');
  } catch (error) {
    ui.alert(`No se pudo leer el archivo: ${error.message}`);
    return;
  }

  const rows = parseCsvAuto_(csvText);
  if (!rows || rows.length === 0) {
    ui.alert('CSV vacio o invalido.');
    return;
  }

  const incomingHeaders = rows[0].map((h) => String(h || '').trim());
  const idxMap = mapHeaders_(incomingHeaders);
  const missing = config.fields
    .map((f) => f.header)
    .filter((h) => idxMap[h] == null);

  if (missing.length) {
    ui.alert(`Faltan columnas requeridas:\n- ${missing.join('\n- ')}`);
    return;
  }

  const dataRows = rows
    .slice(1)
    .filter((r) => r.some((v) => String(v || '').trim() !== ''));

  const clearRows = Math.max(sheet.getMaxRows() - 1, dataRows.length);

  config.fields.forEach((field) => {
    sheet.getRange(2, field.col, clearRows, 1).clearContent();
    if (dataRows.length === 0) return;

    const values = dataRows.map((r) => [String(r[idxMap[field.header]] ?? '').trim()]);
    sheet.getRange(2, field.col, values.length, 1).setValues(values);
  });

  SpreadsheetApp.flush();
  ss.toast(`${sheetName}: ${dataRows.length} filas importadas`, 'Importacion completada', 5);
}

function parseCsvAuto_(csvText) {
  const comma = Utilities.parseCsv(csvText, ',');
  const semicolon = Utilities.parseCsv(csvText, ';');
  const commaCols = comma[0] ? comma[0].length : 0;
  const semiCols = semicolon[0] ? semicolon[0].length : 0;
  return semiCols > commaCols ? semicolon : comma;
}

function mapHeaders_(headers) {
  return headers.reduce((acc, h, i) => {
    if (!h) return acc;
    acc[h] = i;
    return acc;
  }, {});
}

// ─── Dependencias entre proyectos y fases ───────────────────────────────────

/**
 * Recalcula fechas de inicio en cascada para Proyectos y FasesProyecto.
 * Llama desde el menú o automáticamente vía onEdit.
 */
function recalcularDependencias() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  _recalcularProyectos(ss);
  _recalcularFases(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('Fechas de dependencias actualizadas.', 'Ninja Tracker', 3);
}

function _recalcularProyectos(ss) {
  const ws = ss.getSheetByName('Proyectos');
  if (!ws) return;

  const data = ws.getDataRange().getValues();
  const headers = data[0];
  const idCol     = headers.indexOf('ProyectoID');
  const inicioCol = headers.indexOf('Inicio');
  const horasTotCol = headers.indexOf('HorasTotalesEstimadas');
  const horasSemanCol = headers.indexOf('HorasAsignadasSemana');
  const avanceCol = headers.indexOf('Avance%');
  const depCol    = headers.indexOf('DependenciaProyectoID');
  const finCalcCol = headers.indexOf('FechaProbableFinCalc');

  if (idCol < 0 || inicioCol < 0 || depCol < 0) return;

  // Mapear id → rowIndex (0-based en data array, offset +1 para la hoja)
  const idToRow = {};
  for (let r = 1; r < data.length; r++) {
    const id = data[r][idCol];
    if (id) idToRow[id] = r;
  }

  // Calcular fin estimado de una fila
  function finEstimado(row) {
    const inicio = row[inicioCol];
    const horasTot = parseFloat(row[horasTotCol]) || 0;
    const horasSem = parseFloat(row[horasSemanCol]) || 0;
    const avance   = parseFloat(row[avanceCol]) || 0;
    if (!inicio || horasSem <= 0 || horasTot <= 0) return null;
    const horasRestantes = horasTot * (1 - avance);
    const diasRestantes  = Math.ceil((horasRestantes / horasSem) * 7);
    const d = new Date(inicio);
    d.setDate(d.getDate() + diasRestantes);
    return d;
  }

  // Resolver inicio respetando dependencia (máx 20 iteraciones para evitar ciclos)
  function resolverInicio(rowIdx, depth) {
    if (depth > 20) return null;
    const row = data[rowIdx];
    const depId = row[depCol];
    if (!depId || !idToRow[depId]) return row[inicioCol] ? new Date(row[inicioCol]) : null;
    const depRowIdx = idToRow[depId];
    const finDep = finEstimado(data[depRowIdx]);
    if (!finDep) return row[inicioCol] ? new Date(row[inicioCol]) : null;
    const inicio = new Date(finDep);
    inicio.setDate(inicio.getDate() + 1);
    return inicio;
  }

  // Aplicar fechas calculadas a las celdas de Inicio
  for (let r = 1; r < data.length; r++) {
    if (!data[r][idCol]) continue;
    const depId = data[r][depCol];
    if (!depId) continue;
    const nuevoInicio = resolverInicio(r, 0);
    if (!nuevoInicio) continue;
    const cell = ws.getRange(r + 1, inicioCol + 1);
    cell.setValue(nuevoInicio);
    cell.setNumberFormat('yyyy-mm-dd');
    data[r][inicioCol] = nuevoInicio; // actualiza en memoria para cascada
  }
}

function _recalcularFases(ss) {
  const ws = ss.getSheetByName('FasesProyecto');
  if (!ws) return;

  const data = ws.getDataRange().getValues();
  const headers = data[0];
  const idCol     = headers.indexOf('FaseID');
  const inicioCol = headers.indexOf('InicioTentativo');
  const horasCol  = headers.indexOf('HorasEstimadas');
  const horasSemanCol = headers.indexOf('HorasAsignadasSemana');
  const avanceCol = headers.indexOf('Avance%');
  const depCol    = headers.indexOf('DependenciaFaseID');

  if (idCol < 0 || inicioCol < 0 || depCol < 0) return;

  const idToRow = {};
  for (let r = 1; r < data.length; r++) {
    const id = data[r][idCol];
    if (id) idToRow[id] = r;
  }

  function finFase(row) {
    const inicio   = row[inicioCol];
    const horas    = parseFloat(row[horasCol]) || 0;
    const horasSem = parseFloat(row[horasSemanCol]) || 0;
    const avance   = parseFloat(row[avanceCol]) || 0;
    if (!inicio || horasSem <= 0 || horas <= 0) return null;
    const restantes = horas * (1 - avance);
    const dias = Math.ceil((restantes / horasSem) * 7);
    const d = new Date(inicio);
    d.setDate(d.getDate() + dias);
    return d;
  }

  for (let r = 1; r < data.length; r++) {
    if (!data[r][idCol]) continue;
    const depId = data[r][depCol];
    if (!depId || !idToRow[depId]) continue;
    const depRow = data[idToRow[depId]];
    const fin = finFase(depRow);
    if (!fin) continue;
    const nuevoInicio = new Date(fin);
    nuevoInicio.setDate(nuevoInicio.getDate() + 1);
    const cell = ws.getRange(r + 1, inicioCol + 1);
    cell.setValue(nuevoInicio);
    cell.setNumberFormat('yyyy-mm-dd');
    data[r][inicioCol] = nuevoInicio;
  }
}

/**
 * Trigger automático: recalcula dependencias cuando el usuario edita
 * Proyectos o FasesProyecto en columnas clave.
 */
function onEdit(e) {
  if (!e) return;
  const sheetName = e.range.getSheet().getName();
  const col = e.range.getColumn();

  const watchSheets = {
    'Proyectos': [8, 10, 11, 14, 15],        // Inicio, HorasTot, HorasSem, Dep, Avance
    'FasesProyecto': [6, 7, 8, 9, 11],       // HorasEst, HorasSem, DepFaseID, InicioTentativo, Avance
    'Formulario_Entrada': Array.from({length: 13}, (_, i) => i + 1),
  };

  if (watchSheets[sheetName] && watchSheets[sheetName].includes(col)) {
    recalcularDependencias();
  }
}
