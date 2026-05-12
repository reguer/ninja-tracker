import { useState } from 'react'
import FranjaEditor from '../components/FranjaEditor.jsx'
import { EscenarioMultiSelect } from '../components/EscenarioSelect.jsx'
import { horasSemanales } from '../engine.js'

export default function Recurrentes({ state, addActividad, updateActividad, deleteActividad }) {
  const recurrentes = state.actividades.filter(a => a.tipo === 'recurrente')
  const [expandido, setExpandido] = useState(null)

  function agregar() {
    addActividad({
      nombre: 'Nueva actividad recurrente',
      tipo: 'recurrente',
      franjas: [],
      escenarios: ['base'],
      activo: true,
    })
  }

  const totalHoras = recurrentes
    .filter(a => a.activo && a.escenarios.includes(state.config.escenarioActivo))
    .reduce((acc, a) => acc + horasSemanales(a.franjas), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Recurrentes</div>
          <div className="page-subtitle">Actividades configurables: ejercicio, meditación, lectura, etc.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {recurrentes.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Activas ({state.config.escenarioActivo}): <strong style={{ color: 'var(--sage)' }}>{totalHoras.toFixed(1)}h/sem</strong>
            </span>
          )}
          <button className="btn btn-primary" onClick={agregar}>+ Agregar</button>
        </div>
      </div>

      {recurrentes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px var(--gap)' }}>
          No hay actividades recurrentes.<br />
          <span style={{ fontSize: 12 }}>Ejemplos: ejercicio, meditación, lectura, idiomas.</span>
        </div>
      )}

      <div className="card-grid">
        {recurrentes.map(act => (
          <ActividadRecurrenteCard
            key={act.id}
            act={act}
            escenarioActivo={state.config.escenarioActivo}
            expandido={expandido === act.id}
            onToggle={() => setExpandido(expandido === act.id ? null : act.id)}
            onUpdate={(payload) => updateActividad(act.id, payload)}
            onDelete={() => deleteActividad(act.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ActividadRecurrenteCard({ act, escenarioActivo, expandido, onToggle, onUpdate, onDelete }) {
  const horas = horasSemanales(act.franjas)
  const activaEnEscenario = act.escenarios.includes(escenarioActivo)

  return (
    <div className="card" style={{
      borderLeft: `3px solid var(--sage)`,
      opacity: act.activo ? 1 : 0.5,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          className="toggle"
          checked={act.activo}
          onChange={e => onUpdate({ activo: e.target.checked })}
        />
        <input
          className="editable-title"
          value={act.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
          placeholder="Nombre de la actividad"
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600 }}>
            {horas.toFixed(1)}h/sem
          </span>
          {!activaEnEscenario && (
            <span className="chip" title={`Inactiva en escenario "${escenarioActivo}"`}>off</span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onToggle} style={{ flexShrink: 0 }}>
          {expandido ? '▲' : '▼'}
        </button>
      </div>

      {expandido && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <hr className="divider" style={{ margin: '0 0 4px' }} />

          <div className="field">
            <label>Franjas horarias</label>
            <FranjaEditor
              franjas={act.franjas}
              onChange={franjas => onUpdate({ franjas })}
              colorTag={act.colorTag || '#6ab187'}
            />
          </div>

          <div className="field">
            <label>Activa en escenarios</label>
            <EscenarioMultiSelect
              selected={act.escenarios}
              onChange={escenarios => onUpdate({ escenarios })}
            />
            <span className="hint">Solo cuenta en el cálculo cuando el escenario activo está seleccionado.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>
              Eliminar actividad
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
