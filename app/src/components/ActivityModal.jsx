import { useState } from 'react'
import FranjaEditor from './FranjaEditor.jsx'
import { ESCENARIOS, ESCENARIO_LABEL } from '../store.js'

const TIPOS = [
  { id: 'basico',     label: 'Básico',     icon: '■', desc: 'Fijo siempre (sueño, comidas)', color: '#5b8fd4' },
  { id: 'recurrente', label: 'Recurrente', icon: '◆', desc: 'Habitual en ciertos escenarios', color: '#6ab187' },
  { id: 'proyecto',   label: 'Proyecto',   icon: '▲', desc: 'Con horas estimadas y fecha fin', color: '#d4a843' },
  { id: 'bloqueo',    label: 'Evento / Bloqueo', icon: '◉', desc: 'Vacaciones, viaje, evento', color: '#c46b7a' },
]

const BLOQUEO_TIPOS = [
  { id: 'vacaciones', label: 'Vacaciones' },
  { id: 'evento_social', label: 'Evento social' },
  { id: 'feriado', label: 'Feriado / día libre' },
  { id: 'personal', label: 'Asunto personal' },
]

export default function ActivityModal({ open, onClose, addActividad, addProyecto, addBloqueo }) {
  const [tipo, setTipo] = useState('basico')
  const [form, setForm] = useState(getDefaultForm('basico'))

  if (!open) return null

  function getDefaultForm(t) {
    const today = new Date().toISOString().slice(0, 10)
    if (t === 'bloqueo') return { nombre: '', tipoBloqueo: 'vacaciones', inicio: today, fin: today, activo: true }
    if (t === 'proyecto') return {
      nombre: '', horasTotalesEstimadas: 40, avance: 0,
      inicio: today, franjas: [], escenarios: ['base'], activo: true,
      estado: 'no_iniciado', colorTag: '#d4a843',
    }
    return { nombre: '', franjas: [], escenarios: t === 'basico' ? [...ESCENARIOS] : ['base'], activo: true, colorTag: '#5b8fd4' }
  }

  function changeTipo(t) {
    setTipo(t)
    setForm(getDefaultForm(t))
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleEscenario(esc) {
    set('escenarios', form.escenarios?.includes(esc)
      ? form.escenarios.filter(e => e !== esc)
      : [...(form.escenarios || []), esc]
    )
  }

  function save() {
    if (!form.nombre.trim()) return
    if (tipo === 'bloqueo') {
      addBloqueo({ ...form, tipo: form.tipoBloqueo })
    } else if (tipo === 'proyecto') {
      addProyecto({ ...form, tipo: 'proyecto' })
    } else {
      addActividad({ ...form, tipo })
    }
    onClose()
  }

  const tipoConfig = TIPOS.find(t => t.id === tipo)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva actividad</div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 4,
            }}
          >✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Tipo selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
            {TIPOS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => changeTipo(t.id)}
                style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  border: `1px solid ${tipo === t.id ? t.color : 'var(--border)'}`,
                  background: tipo === t.id ? `${t.color}18` : 'var(--surface2)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: tipo === t.id ? t.color : 'var(--text)', marginBottom: 2 }}>
                  {t.icon} {t.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Nombre */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Nombre</label>
            <input
              className="input" autoFocus
              placeholder={tipo === 'bloqueo' ? 'ej. Semana Santa' : tipo === 'proyecto' ? 'ej. Newsletter mensual' : 'ej. Ejercicio'}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
            />
          </div>

          {/* Campos por tipo */}
          {tipo === 'bloqueo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row">
                <div className="field">
                  <label>Tipo</label>
                  <select className="input" value={form.tipoBloqueo} onChange={e => set('tipoBloqueo', e.target.value)}>
                    {BLOQUEO_TIPOS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Fecha inicio</label>
                  <input type="date" className="input" value={form.inicio} onChange={e => set('inicio', e.target.value)} />
                </div>
                <div className="field">
                  <label>Fecha fin</label>
                  <input type="date" className="input" value={form.fin} onChange={e => set('fin', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tipo === 'proyecto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row">
                <div className="field">
                  <label>Horas totales estimadas</label>
                  <input type="number" className="input" min={1} value={form.horasTotalesEstimadas}
                    onChange={e => set('horasTotalesEstimadas', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="field">
                  <label>Avance %</label>
                  <input type="number" className="input" min={0} max={100} value={Math.round((form.avance || 0) * 100)}
                    onChange={e => set('avance', (parseFloat(e.target.value) || 0) / 100)} />
                </div>
              </div>
              <div className="field">
                <label>Fecha inicio</label>
                <input type="date" className="input" value={form.inicio} onChange={e => set('inicio', e.target.value)} />
              </div>
              <div className="field">
                <label>Horarios asignados por día</label>
                <FranjaEditor franjas={form.franjas || []} onChange={v => set('franjas', v)} colorTag={form.colorTag} />
              </div>
              <EscenarioSelect escenarios={form.escenarios || []} onChange={v => set('escenarios', v)} />
            </div>
          )}

          {(tipo === 'basico' || tipo === 'recurrente') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Bloques horarios</label>
                <FranjaEditor
                  franjas={form.franjas || []}
                  onChange={v => set('franjas', v)}
                  colorTag={tipoConfig.color}
                />
              </div>
              {tipo === 'recurrente' && (
                <EscenarioSelect escenarios={form.escenarios || []} onChange={v => set('escenarios', v)} />
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={!form.nombre.trim()}
              style={{ opacity: form.nombre.trim() ? 1 : 0.4 }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EscenarioSelect({ escenarios, onChange }) {
  function toggle(esc) {
    onChange(escenarios.includes(esc) ? escenarios.filter(e => e !== esc) : [...escenarios, esc])
  }
  return (
    <div className="field">
      <label>Activo en escenarios</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ESCENARIOS.map(e => (
          <button
            key={e} type="button"
            onClick={() => toggle(e)}
            style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500,
              border: `1px solid ${escenarios.includes(e) ? 'var(--gold)' : 'var(--border)'}`,
              background: escenarios.includes(e) ? 'rgba(212,168,67,0.18)' : 'var(--surface2)',
              color: escenarios.includes(e) ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            {ESCENARIO_LABEL[e]}
          </button>
        ))}
      </div>
    </div>
  )
}
