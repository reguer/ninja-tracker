import { useState } from 'react'
import FranjaEditor from '../components/FranjaEditor.jsx'
import { CATEGORIAS, ESCENARIOS, ESCENARIO_LABEL } from '../store.js'
import { horasSemanales } from '../engine.js'

const CAT_TIPO = {
  basico: 'basico',
  habito: 'recurrente',
  diversion: 'recurrente',
  estudio: 'recurrente',
  no_hacer: 'no_hacer',
}

export default function Actividades({ state, addActividad, updateActividad, deleteActividad }) {
  const [activeTab, setActiveTab] = useState('habito')
  const [expandido, setExpandido] = useState(null)

  const { actividades, config } = state
  const escenario = config.escenarioActivo

  const catItems = actividades.filter(a => {
    const cat = a.categoria || (a.tipo === 'basico' ? 'basico' : 'habito')
    return cat === activeTab
  })

  const cat = CATEGORIAS.find(c => c.id === activeTab)

  function agregar() {
    addActividad({
      nombre: `Nueva ${cat?.label?.toLowerCase() || 'actividad'}`,
      categoria: activeTab,
      tipo: CAT_TIPO[activeTab] || 'recurrente',
      colorTag: cat?.color || '#6ab187',
      franjas: [],
      escenarios: activeTab === 'basico' ? [...ESCENARIOS] : ['base'],
      activo: true, subtareas: [], notas: '',
    })
  }

  const totalActivas = catItems
    .filter(a => a.activo !== false && (a.escenarios || ['base']).includes(escenario))
    .reduce((s, a) => s + horasSemanales(a.franjas), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Actividades</div>
          <div className="page-subtitle">Gestión de todas tus actividades por categoría</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {catItems.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <strong style={{ color: cat?.color }}>{totalActivas.toFixed(1)}h</strong>/sem activas
            </span>
          )}
          <button className="btn btn-primary" onClick={agregar}>+ Agregar</button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--gap)', flexWrap: 'wrap' }}>
        {CATEGORIAS.map(c => {
          const count = actividades.filter(a => (a.categoria || (a.tipo === 'basico' ? 'basico' : 'habito')) === c.id).length
          return (
            <button
              key={c.id} type="button"
              onClick={() => { setActiveTab(c.id); setExpandido(null) }}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600,
                border: `1px solid ${activeTab === c.id ? c.color : 'var(--border)'}`,
                background: activeTab === c.id ? `${c.color}22` : 'var(--surface2)',
                color: activeTab === c.id ? c.color : 'var(--text-muted)',
              }}
            >
              {c.icon} {c.label} {count > 0 && <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 11 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {catItems.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
          No hay {cat?.label?.toLowerCase()} aún.
          <br /><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={agregar}>+ Agregar primera</button>
        </div>
      )}

      <div className="card-grid">
        {catItems.map(act => (
          <ActividadCard
            key={act.id}
            act={act}
            catColor={cat?.color || '#6ab187'}
            escenarioActivo={escenario}
            expandido={expandido === act.id}
            onToggle={() => setExpandido(expandido === act.id ? null : act.id)}
            onUpdate={p => updateActividad(act.id, p)}
            onDelete={() => deleteActividad(act.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ActividadCard({ act, catColor, escenarioActivo, expandido, onToggle, onUpdate, onDelete }) {
  const horas = horasSemanales(act.franjas)
  const activaEnEsc = (act.escenarios || ['base']).includes(escenarioActivo)
  const [newSubtarea, setNewSubtarea] = useState('')

  function addSubtarea() {
    if (!newSubtarea.trim()) return
    const sub = { id: Date.now(), nombre: newSubtarea.trim(), completado: false }
    onUpdate({ subtareas: [...(act.subtareas || []), sub] })
    setNewSubtarea('')
  }

  function toggleSub(id) {
    onUpdate({ subtareas: (act.subtareas || []).map(s => s.id === id ? { ...s, completado: !s.completado } : s) })
  }

  function deleteSub(id) {
    onUpdate({ subtareas: (act.subtareas || []).filter(s => s.id !== id) })
  }

  return (
    <div className="card" style={{
      borderLeft: `3px solid ${catColor}`,
      opacity: act.activo !== false ? 1 : 0.45,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" className="toggle" checked={act.activo !== false}
          onChange={e => onUpdate({ activo: e.target.checked })} />
        <input className="editable-title" value={act.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
          placeholder="Nombre" />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {horas > 0 && (
            <span style={{ fontSize: 11, color: catColor, fontWeight: 700 }}>{horas.toFixed(1)}h/sem</span>
          )}
          {!activaEnEsc && (
            <span className="chip" style={{ fontSize: 10 }}>off</span>
          )}
          {(act.subtareas || []).length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
              {(act.subtareas || []).filter(s => s.completado).length}/{(act.subtareas || []).length}
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onToggle} style={{ flexShrink: 0 }}>
          {expandido ? '▲' : '▼'}
        </button>
      </div>

      {expandido && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <hr className="divider" style={{ margin: '0 0 4px' }} />

          {/* Color */}
          <div className="form-row">
            <div className="field" style={{ flex: '0 0 auto' }}>
              <label>Color</label>
              <input type="color" value={act.colorTag || catColor}
                onChange={e => onUpdate({ colorTag: e.target.value })}
                style={{ width: 40, height: 32, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
            </div>
            <div className="field">
              <label>Notas</label>
              <input className="input" value={act.notas || ''} placeholder="Notas opcionales"
                onChange={e => onUpdate({ notas: e.target.value })} />
            </div>
          </div>

          {/* Franjas */}
          {act.tipo !== 'no_hacer' && (
            <div className="field">
              <label>Bloques horarios</label>
              <FranjaEditor
                franjas={act.franjas || []}
                onChange={franjas => onUpdate({ franjas })}
                colorTag={act.colorTag || catColor}
              />
            </div>
          )}

          {/* Escenarios (no para básicos) */}
          {act.tipo !== 'basico' && (
            <div className="field">
              <label>Activo en escenarios</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ESCENARIOS.map(esc => {
                  const on = (act.escenarios || ['base']).includes(esc)
                  return (
                    <button key={esc} type="button"
                      onClick={() => {
                        const cur = act.escenarios || ['base']
                        onUpdate({ escenarios: on ? cur.filter(e => e !== esc) : [...cur, esc] })
                      }}
                      style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                        fontFamily: 'inherit', fontWeight: 500,
                        border: `1px solid ${on ? catColor : 'var(--border)'}`,
                        background: on ? `${catColor}22` : 'var(--surface2)',
                        color: on ? catColor : 'var(--text-muted)',
                      }}
                    >
                      {ESCENARIO_LABEL[esc]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sub-tareas */}
          <div className="field">
            <label>Sub-tareas / notas</label>
            {(act.subtareas || []).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <input type="checkbox" checked={s.completado} onChange={() => toggleSub(s.id)}
                  style={{ flexShrink: 0, accentColor: catColor }} />
                <span style={{ flex: 1, fontSize: 12, color: s.completado ? 'var(--text-dim)' : 'var(--text)', textDecoration: s.completado ? 'line-through' : 'none' }}>
                  {s.nombre}
                </span>
                <button onClick={() => deleteSub(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13 }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Nueva sub-tarea…"
                value={newSubtarea} onChange={e => setNewSubtarea(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtarea()} />
              <button className="btn btn-ghost btn-sm" onClick={addSubtarea}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}
