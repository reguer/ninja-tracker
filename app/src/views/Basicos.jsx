import { useState } from 'react'
import FranjaEditor from '../components/FranjaEditor.jsx'
import { horasSemanales } from '../engine.js'

export default function Basicos({ state, addActividad, updateActividad, deleteActividad }) {
  const basicos = state.actividades.filter(a => a.tipo === 'basico')
  const [expandido, setExpandido] = useState(null)

  function agregar() {
    addActividad({
      nombre: 'Nueva actividad básica',
      tipo: 'basico',
      franjas: [],
      escenarios: ['base', 'vacaciones', 'pico', 'bloqueo_parcial'],
      activo: true,
    })
  }

  const totalHoras = basicos
    .filter(a => a.activo)
    .reduce((acc, a) => acc + horasSemanales(a.franjas), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Básicos</div>
          <div className="page-subtitle">Actividades fijas que siempre consumen tiempo (sueño, comidas, traslados)</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {basicos.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Total: <strong style={{ color: 'var(--blue)' }}>{totalHoras.toFixed(1)}h/sem</strong>
            </span>
          )}
          <button className="btn btn-primary" onClick={agregar}>+ Agregar</button>
        </div>
      </div>

      {basicos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px var(--gap)' }}>
          No hay actividades básicas.<br />
          <span style={{ fontSize: 12 }}>Ejemplos: sueño, comidas, higiene, traslado al trabajo.</span>
        </div>
      )}

      <div className="card-grid">
        {basicos.map(act => (
          <ActividadCard
            key={act.id}
            act={act}
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

function ActividadCard({ act, expandido, onToggle, onUpdate, onDelete }) {
  const horas = horasSemanales(act.franjas)

  return (
    <div className="card" style={{ borderLeft: `3px solid var(--blue)`, opacity: act.activo ? 1 : 0.5 }}>
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
        <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, flexShrink: 0 }}>
          {horas.toFixed(1)}h/sem
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onToggle}
          style={{ flexShrink: 0 }}
        >
          {expandido ? '▲' : '▼'}
        </button>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <hr className="divider" style={{ margin: '0 0 4px' }} />

          <div className="field">
            <label>Franjas horarias</label>
            <FranjaEditor
              franjas={act.franjas}
              onChange={franjas => onUpdate({ franjas })}
              colorTag={act.colorTag || '#5b8fd4'}
            />
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
