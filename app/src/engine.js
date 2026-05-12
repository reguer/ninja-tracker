// Motor de cálculo de capacidad — puro JS, sin dependencias de UI

const DIA_INDEX = {
  lunes: 1, martes: 2, miercoles: 3, jueves: 4,
  viernes: 5, sabado: 6, domingo: 0,
}

// Convierte "08:30" → 8.5 horas
function horasDeString(hhmm) {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h + (m || 0) / 60
}

// Duración de una franja en horas
function duracionFranja(franja) {
  return Math.max(0, horasDeString(franja.fin) - horasDeString(franja.inicio))
}

// Horas semanales de una lista de franjas (puede haber varias por día)
function horasSemanales(franjas) {
  return franjas.reduce((acc, f) => acc + duracionFranja(f), 0)
}

// Horas semanales de franjas filtradas por días específicos
function horasSemanalesPorDias(franjas, dias) {
  if (!dias || dias.length === 0) return horasSemanales(franjas)
  return franjas
    .filter(f => dias.includes(f.dia))
    .reduce((acc, f) => acc + duracionFranja(f), 0)
}

// Horas de actividades filtradas por escenario activo
function horasActividadesPorTipo(actividades, tipo, escenario) {
  return actividades
    .filter(a => a.tipo === tipo && a.activo && a.escenarios.includes(escenario))
    .reduce((acc, a) => acc + horasSemanales(a.franjas), 0)
}

// Horas semanales asignadas a proyectos activos en el escenario
function horasProyectosAsignadas(proyectos, escenario) {
  return proyectos
    .filter(p => p.activo && p.escenarios.includes(escenario))
    .reduce((acc, p) => acc + horasSemanales(p.franjas), 0)
}

// Capacidad neta disponible para proyectos (horas/semana)
function calcularCapacidadNeta(config, actividades, escenario) {
  const esc = escenario || config.escenarioActivo
  const horasBase = config.horasDia * 7
  const basicos = horasActividadesPorTipo(actividades, 'basico', esc)
  const recurrentes = horasActividadesPorTipo(actividades, 'recurrente', esc)
  const buffer = (config.bufferSeguridad || 0) * 7
  return Math.max(0, horasBase - basicos - recurrentes - buffer)
}

// Saldo libre = capacidad neta − proyectos asignados
function calcularSaldoLibre(config, actividades, proyectos, escenario) {
  const esc = escenario || config.escenarioActivo
  const neta = calcularCapacidadNeta(config, actividades, esc)
  const asignadas = horasProyectosAsignadas(proyectos, esc)
  return neta - asignadas
}

// Semáforo de la semana
function semaforo(saldoLibre, buffer) {
  if (saldoLibre < 0) return 'SATURADO'
  if (saldoLibre < (buffer || 1) * 7) return 'RIESGO'
  return 'OK'
}

// Fecha fin estimada de un proyecto dadas sus franjas y horas restantes
function calcularFechaFin(inicio, horasTotales, avance, franjas) {
  if (!inicio || !horasTotales || !franjas || franjas.length === 0) return null
  const horasRestantes = horasTotales * (1 - (avance || 0))
  const hPorSemana = horasSemanales(franjas)
  if (hPorSemana <= 0) return null
  const semanasRestantes = horasRestantes / hPorSemana
  const diasRestantes = Math.ceil(semanasRestantes * 7)
  const fechaInicio = new Date(inicio)
  fechaInicio.setDate(fechaInicio.getDate() + diasRestantes)
  return fechaInicio.toISOString().slice(0, 10)
}

// Resuelve fecha inicio de un elemento considerando dependencia
function resolverInicio(item, todos) {
  if (item.finFijo) return item.inicio // inicio fijo manual
  if (!item.dependeDe) return item.inicio
  const predecesor = todos.find(t => t.id === item.dependeDe)
  if (!predecesor) return item.inicio
  const finPredecesor = calcularFechaFin(
    resolverInicio(predecesor, todos),
    predecesor.horasEstimadas || predecesor.horasTotalesEstimadas,
    predecesor.avance || 0,
    predecesor.franjas
  )
  if (!finPredecesor) return item.inicio
  const d = new Date(finPredecesor)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// Calcula toda la info de un proyecto (con dependencias)
function calcularProyecto(proyecto, todosProyectos) {
  const inicio = resolverInicio(proyecto, todosProyectos)
  const fin = proyecto.finFijo || calcularFechaFin(
    inicio,
    proyecto.horasTotalesEstimadas,
    proyecto.avance,
    proyecto.franjas
  )
  const horasRestantes = proyecto.horasTotalesEstimadas * (1 - (proyecto.avance || 0))
  const hPorSemana = horasSemanales(proyecto.franjas)
  return { ...proyecto, inicioCalculado: inicio, finCalculado: fin, horasRestantes, hPorSemana }
}

// Calcula toda la info de una fase (con dependencias dentro del proyecto)
function calcularFase(fase, todasFases) {
  const inicio = resolverInicio(fase, todasFases)
  const fin = fase.finFijo || calcularFechaFin(
    inicio,
    fase.horasEstimadas,
    fase.avance || 0,
    fase.franjas
  )
  const hPorSemana = horasSemanales(fase.franjas)
  return { ...fase, inicioCalculado: inicio, finCalculado: fin, hPorSemana }
}

// Resultado completo del motor para el estado actual
export function calcular(state) {
  const { config, actividades, proyectos, fases } = state
  const esc = config.escenarioActivo

  const horasBase = config.horasDia * 7
  const horasBasicos = horasActividadesPorTipo(actividades, 'basico', esc)
  const horasRecurrentes = horasActividadesPorTipo(actividades, 'recurrente', esc)
  const buffer = (config.bufferSeguridad || 0) * 7
  const capacidadNeta = Math.max(0, horasBase - horasBasicos - horasRecurrentes - buffer)
  const horasProyectos = horasProyectosAsignadas(proyectos, esc)
  const saldoLibre = capacidadNeta - horasProyectos
  const utilizacion = capacidadNeta > 0 ? horasProyectos / capacidadNeta : 0

  const proyectosCalculados = proyectos.map(p => calcularProyecto(p, proyectos))
  const fasesCalculadas = fases.map(f => calcularFase(f, fases))

  return {
    horasBase,
    horasBasicos,
    horasRecurrentes,
    buffer,
    capacidadNeta,
    horasProyectos,
    saldoLibre,
    utilizacion,
    semaforo: semaforo(saldoLibre, config.bufferSeguridad),
    proyectosCalculados,
    fasesCalculadas,
  }
}

export { horasSemanales, duracionFranja, calcularFechaFin, resolverInicio }
