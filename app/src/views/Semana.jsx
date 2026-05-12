import { useState } from 'react'
import ActivityPanel from '../components/ActivityPanel.jsx'
import WeekCalendar from '../components/WeekCalendar.jsx'
import ActivityModal from '../components/ActivityModal.jsx'
import { ESCENARIOS, ESCENARIO_LABEL } from '../store.js'
import { calcular } from '../engine.js'

export default function Semana({ state, setConfig, updateActividad, updateProyecto, addActividad, addProyecto, addBloqueo }) {
  const [dragSource, setDragSource] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { config, actividades, proyectos } = state

  const resultado = calcular(state)
  const { saldoLibre, capacidadNeta, semaforo } = resultado
  const semaforoColor = { OK:'var(--ok)', RIESGO:'var(--riesgo)', SATURADO:'var(--saturado)' }[semaforo]

  function onDragStart(e, item) {
    e.dataTransfer.effectAllowed = 'copy'
    setDragSource({ type: 'list', item })
  }

  function onDragEnd() { setDragSource(null) }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left panel ─────────────────────────────────────── */}
      <ActivityPanel
        actividades={actividades}
        proyectos={proyectos}
        escenario={config.escenarioActivo}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />

      {/* ── Calendar area ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '8px 12px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          {/* Escenario tabs */}
          <div style={{ display: 'flex', gap: 3, background: 'var(--surface2)', padding: 3, borderRadius: 8 }}>
            {ESCENARIOS.map(esc => (
              <button
                key={esc} type="button"
                onClick={() => setConfig({ escenarioActivo: esc })}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                  background: config.escenarioActivo === esc ? 'var(--gold)' : 'transparent',
                  color: config.escenarioActivo === esc ? '#0f0f13' : 'var(--text-muted)',
                }}
                // NOTE: escenario selector via setConfig passed through store
              >
                {ESCENARIO_LABEL[esc]}
              </button>
            ))}
          </div>

          {/* Capacity pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: 'var(--surface2)', border: '1px solid var(--border)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: semaforoColor }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <strong style={{ color: saldoLibre < 0 ? 'var(--saturado)' : 'var(--text)' }}>
                {saldoLibre.toFixed(1)}h
              </strong> libres de {capacidadNeta.toFixed(1)}h
            </span>
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-dim)', flex: 1 }}>
            Arrastra actividades del panel · Click en bloque para editar · Arrastra borde inferior para redimensionar
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            + Nueva
          </button>
        </div>

        {/* Calendar */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 0' }}>
          <WeekCalendar
            actividades={actividades}
            proyectos={proyectos}
            escenario={config.escenarioActivo}
            dragSource={dragSource}
            onUpdateActividad={updateActividad}
            onUpdateProyecto={updateProyecto}
          />
        </div>
      </div>

      <ActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        addActividad={addActividad}
        addProyecto={addProyecto}
        addBloqueo={addBloqueo}
      />
    </div>
  )
}
