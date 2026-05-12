import { ESCENARIOS } from '../store.js'

const LABELS = {
  base: 'Semana normal',
  vacaciones: 'Vacaciones',
  pico: 'Temporada alta',
  bloqueo_parcial: 'Bloqueo parcial',
}

export default function EscenarioSelect({ value, onChange, style }) {
  return (
    <select
      className="input"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: 'auto', ...style }}
    >
      {ESCENARIOS.map(e => (
        <option key={e} value={e}>{LABELS[e]}</option>
      ))}
    </select>
  )
}

export function EscenarioMultiSelect({ selected = [], onChange }) {
  function toggle(esc) {
    if (selected.includes(esc)) {
      if (selected.length === 1) return // mínimo 1
      onChange(selected.filter(e => e !== esc))
    } else {
      onChange([...selected, esc])
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ESCENARIOS.map(esc => (
        <button
          key={esc}
          className={`dia-btn${selected.includes(esc) ? ' selected' : ''}`}
          onClick={() => toggle(esc)}
          type="button"
        >
          {LABELS[esc]}
        </button>
      ))}
    </div>
  )
}
