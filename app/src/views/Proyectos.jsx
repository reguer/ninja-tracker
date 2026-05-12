import { useState, useMemo } from 'react'
import FranjaEditor from '../components/FranjaEditor.jsx'
import { EscenarioMultiSelect } from '../components/EscenarioSelect.jsx'
import TimelineCard from '../components/TimelineCard.jsx'
import { calcular, horasSemanales } from '../engine.js'

export default function Proyectos({ state, addProyecto, updateProyecto, deleteProyecto, addFase, updateFase, deleteFase }) {
  const resultado = useMemo(() => calcular(state), [state])
  const { proyectosCalculados, fasesCalculadas } = resultado
  const [expandido, setExpandido] = useState(null)
  const [vista, setVista] = useState('lista') // 'lista' | 'timeline'

  function agregar() {
    addProyecto({
      nombre: 'Nuevo proyecto',
      estado: 'no_iniciado',
      horasTotalesEstimadas: 40,
      avance: 0,
      inicio: new Date().toISOString().slice(0, 10),
      finFijo: null,
      franjas: [],
      escenarios: ['base'],
      dependeDe: null,
      activo: true,
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Proyectos</div>
          <div className="page-subtitle">Fechas de fin calculadas automáticamente según horas asignadas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${vista === 'lista' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setVista('lista')}
          >Lista</button>
          <button
            className={`btn ${vista === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setVista('timeline')}
          >Timeline</button>
          <button className="btn btn-primary" onClick={agregar}>+ Agregar</button>
        </div>
      </div>

      {state.proyectos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px var(--gap)' }}>
          No hay proyectos aún.<br />
          <span style={{ fontSize: 12 }}>Agrega un proyecto y asígnale franjas horarias para ver cuándo terminaría.</span>
        </div>
      )}

      {vista === 'timeline' && (
        <div className="card-grid">
          {proyectosCalculados.map(p => (
            <TimelineCard
              key={p.id}
              proyecto={p}
              fasesDelProyecto={fasesCalculadas.filter(f => f.proyectoId === p.id)}
            />
          ))}
        </div>
      )}

      {vista === 'lista' && (
        <div className="card-grid">
          {proyectosCalculados.map(p => {
            const fasesDeEste = fasesCalculadas.filter(f => f.proyectoId === p.id)
            return (
              <ProyectoCard
                key={p.id}
                proyecto={p}
                fases={fasesDeEste}
                todosProyectos={state.proyectos}
                todasFases={state.fases}
                expandido={expandido === p.id}
                onToggle={() => setExpandido(expandido === p.id ? null : p.id)}
                onUpdate={payload => updateProyecto(p.id, payload)}
                onDelete={() => deleteProyecto(p.id)}
                addFase={payload => addFase(p.id, payload)}
                updateFase={updateFase}
                deleteFase={deleteFase}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProyectoCard({ proyecto, fases, todosProyectos, todasFases, expandido, onToggle, onUpdate, onDelete, addFase, updateFase, deleteFase }) {
  const horas = horasSemanales(proyecto.franjas)
  const pct = Math.min(100, Math.round((proyecto.avance || 0) * 100))
  const hoy = new Date().toISOString().slice(0, 10)
  const atrasado = proyecto.finCalculado && proyecto.finCalculado < hoy && proyecto.avance < 1

  const otrosProyectos = todosProyectos.filter(p => p.id !== proyecto.id)

  return (
    <div className="card" style={{ borderLeft: `3px solid ${atrasado ? 'var(--saturado)' : 'var(--gold)'}` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          className="toggle"
          checked={proyecto.activo}
          onChange={e => onUpdate({ activo: e.target.checked })}
        />
        <input
          className="editable-title"
          value={proyecto.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
          placeholder="Nombre del proyecto"
        />
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{horas.toFixed(1)}h/sem</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onToggle} style={{ flexShrink: 0 }}>
          {expandido ? '▲' : '▼'}
        </button>
      </div>

      {/* Barra progreso */}
      <div className="progress-bar" style={{ marginTop: 10 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Fechas calculadas */}
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Inicio: <strong style={{ color: 'var(--text)' }}>{proyecto.inicioCalculado || '—'}</strong></span>
        <span>Fin estimado: <strong style={{ color: atrasado ? 'var(--saturado)' : 'var(--text)' }}>
          {proyecto.finCalculado || '—'}
          {atrasado && ' ⚠'}
        </strong></span>
        {proyecto.horasRestantes > 0 && (
          <span>Restante: <strong style={{ color: 'var(--text)' }}>{proyecto.horasRestantes.toFixed(0)}h</strong></span>
        )}
      </div>

      {expandido && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <hr className="divider" style={{ margin: '0 0 4px' }} />

          <div className="form-row">
            <div className="field">
              <label>Horas totales estimadas</label>
              <input
                type="number" className="input" min={1}
                value={proyecto.horasTotalesEstimadas}
                onChange={e => onUpdate({ horasTotalesEstimadas: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Avance (%)</label>
              <input
                type="number" className="input" min={0} max={100} step={5}
                value={Math.round((proyecto.avance || 0) * 100)}
                onChange={e => onUpdate({ avance: (parseFloat(e.target.value) || 0) / 100 })}
              />
            </div>
            <div className="field">
              <label>Estado</label>
              <select
                className="input"
                value={proyecto.estado}
                onChange={e => onUpdate({ estado: e.target.value })}
              >
                <option value="no_iniciado">No iniciado</option>
                <option value="en_progreso">En progreso</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Fecha inicio</label>
              <input
                type="date" className="input"
                value={proyecto.inicio}
                onChange={e => onUpdate({ inicio: e.target.value })}
                disabled={!!proyecto.dependeDe}
              />
              {proyecto.dependeDe && <span className="hint">Calculada por dependencia</span>}
            </div>
            <div className="field">
              <label>Fecha fin (fijar manual)</label>
              <input
                type="date" className="input"
                value={proyecto.finFijo || ''}
                onChange={e => onUpdate({ finFijo: e.target.value || null })}
                placeholder="Dejar vacío = calculada"
              />
              <span className="hint">Vacío = se calcula por horas/semana</span>
            </div>
          </div>

          <div className="field">
            <label>Depende de (otro proyecto)</label>
            <select
              className="input"
              value={proyecto.dependeDe || ''}
              onChange={e => onUpdate({ dependeDe: e.target.value || null })}
            >
              <option value="">Sin dependencia</option>
              {otrosProyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre || p.id}</option>
              ))}
            </select>
            <span className="hint">La fecha de inicio se moverá automáticamente cuando cambie el proyecto predecesor.</span>
          </div>

          <div className="field">
            <label>Franjas horarias semanales</label>
            <FranjaEditor
              franjas={proyecto.franjas}
              onChange={franjas => onUpdate({ franjas })}
            />
            <span className="hint">Las horas/semana totales determinan cuándo termina el proyecto.</span>
          </div>

          <div className="field">
            <label>Activo en escenarios</label>
            <EscenarioMultiSelect
              selected={proyecto.escenarios}
              onChange={escenarios => onUpdate({ escenarios })}
            />
          </div>

          {/* Fases */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fases del proyecto
              </label>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => addFase({
                  nombre: 'Nueva fase',
                  horasEstimadas: 10,
                  franjas: [],
                  dependeDe: fases.length > 0 ? fases[fases.length - 1].id : null,
                })}
              >+ Fase</button>
            </div>
            {fases.length === 0 && (
              <p className="hint" style={{ marginBottom: 4 }}>Sin fases. Puedes dividir el proyecto en etapas con dependencias.</p>
            )}
            {fases.map((f, i) => (
              <FaseInline
                key={f.id}
                fase={f}
                index={i}
                todasFases={fases}
                onUpdate={payload => updateFase(f.id, payload)}
                onDelete={() => deleteFase(f.id)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>
              Eliminar proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FaseInline({ fase, index, todasFases, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const horas = horasSemanales(fase.franjas)
  const otrasFases = todasFases.filter(f => f.id !== fase.id)

  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      marginBottom: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {index > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>↓</span>}
        <input
          className="editable-title"
          style={{ fontSize: 13 }}
          value={fase.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
          placeholder={`Fase ${index + 1}`}
        />
        <span style={{ fontSize: 11, color: 'var(--sage)', flexShrink: 0 }}>
          {fase.horasEstimadas}h · {horas.toFixed(1)}h/sem
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} style={{ padding: '2px 6px' }}>
          {open ? '▲' : '▼'}
        </button>
      </div>

      {/* Fechas inline */}
      {(fase.inicioCalculado || fase.finCalculado) && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, paddingLeft: index > 0 ? 20 : 0 }}>
          {fase.inicioCalculado} → {fase.finCalculado || '—'}
        </div>
      )}

      {open && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="form-row">
            <div className="field">
              <label>Horas estimadas</label>
              <input
                type="number" className="input" min={1}
                value={fase.horasEstimadas}
                onChange={e => onUpdate({ horasEstimadas: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Depende de (fase anterior)</label>
              <select
                className="input"
                value={fase.dependeDe || ''}
                onChange={e => onUpdate({ dependeDe: e.target.value || null })}
              >
                <option value="">Sin dependencia</option>
                {otrasFases.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre || f.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Franjas horarias</label>
            <FranjaEditor
              franjas={fase.franjas}
              onChange={franjas => onUpdate({ franjas })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Eliminar fase</button>
          </div>
        </div>
      )}
    </div>
  )
}
