import { useState } from 'react'
import { DIAS, DIAS_LABEL } from '../store.js'

const COLORS = {
  basico: '#5b8fd4',
  recurrente: '#6ab187',
  proyecto: '#d4a843',
}

export default function FranjaEditor({ franjas = [], onChange, colorTag }) {
  const [bulkDias, setBulkDias] = useState([])
  const [bulkInicio, setBulkInicio] = useState('08:00')
  const [bulkFin, setBulkFin] = useState('12:00')
  const [showBulk, setShowBulk] = useState(franjas.length === 0)

  function toggleBulkDia(dia) {
    setBulkDias(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  function applyBulk() {
    if (bulkDias.length === 0) return
    const nuevas = bulkDias.map(dia => ({ dia, inicio: bulkInicio, fin: bulkFin }))
    onChange([...franjas, ...nuevas])
    setBulkDias([])
    setShowBulk(false)
  }

  function removeFranja(i) {
    onChange(franjas.filter((_, idx) => idx !== i))
  }

  function updateFranja(i, field, value) {
    onChange(franjas.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  }

  const totalHoras = franjas.reduce((acc, f) => {
    const [ih, im] = (f.inicio || '00:00').split(':').map(Number)
    const [fh, fm] = (f.fin || '00:00').split(':').map(Number)
    return acc + Math.max(0, (fh + fm / 60) - (ih + im / 60))
  }, 0)

  const accentColor = colorTag || 'var(--gold)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Modo bulk: agregar bloque a varios días */}
      {showBulk && (
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agregar bloque horario
          </div>

          {/* Selector de días */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DIAS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleBulkDia(d)}
                style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600,
                  border: `1px solid ${bulkDias.includes(d) ? accentColor : 'var(--border)'}`,
                  background: bulkDias.includes(d) ? `${accentColor}22` : 'var(--surface)',
                  color: bulkDias.includes(d) ? accentColor : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {DIAS_LABEL[d]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBulkDias(['lunes','martes','miercoles','jueves','viernes'])}
              style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                fontFamily: 'inherit', border: '1px dashed var(--border)',
                background: 'transparent', color: 'var(--text-dim)',
              }}
            >
              L–V
            </button>
            <button
              type="button"
              onClick={() => setBulkDias([...DIAS])}
              style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                fontFamily: 'inherit', border: '1px dashed var(--border)',
                background: 'transparent', color: 'var(--text-dim)',
              }}
            >
              Todos
            </button>
          </div>

          {/* Hora inicio → fin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="time" className="input"
              style={{ width: 110, padding: '5px 8px' }}
              value={bulkInicio}
              onChange={e => setBulkInicio(e.target.value)}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>→</span>
            <input
              type="time" className="input"
              style={{ width: 110, padding: '5px 8px' }}
              value={bulkFin}
              onChange={e => setBulkFin(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={bulkDias.length === 0}
              onClick={applyBulk}
              style={{ opacity: bulkDias.length === 0 ? 0.4 : 1 }}
            >
              + Agregar {bulkDias.length > 0 ? `(${bulkDias.length} días)` : ''}
            </button>
            {franjas.length > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowBulk(false)}>
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de franjas existentes */}
      {franjas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Agrupar visualmente por día */}
          {DIAS.filter(d => franjas.some(f => f.dia === d)).map(dia => (
            <div key={dia} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: accentColor,
                width: 24, textAlign: 'center', flexShrink: 0,
              }}>
                {DIAS_LABEL[dia]}
              </span>
              {franjas.map((f, i) => f.dia !== dia ? null : (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
                  borderRadius: 6, padding: '3px 6px',
                }}>
                  <input
                    type="time" className="input"
                    style={{ width: 90, padding: '2px 4px', fontSize: 12, background: 'transparent', border: 'none' }}
                    value={f.inicio}
                    onChange={e => updateFranja(i, 'inicio', e.target.value)}
                  />
                  <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>→</span>
                  <input
                    type="time" className="input"
                    style={{ width: 90, padding: '2px 4px', fontSize: 12, background: 'transparent', border: 'none' }}
                    value={f.fin}
                    onChange={e => updateFranja(i, 'fin', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFranja(i)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-dim)', fontSize: 13, lineHeight: 1, padding: '0 2px',
                    }}
                    title="Quitar"
                  >✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Footer: total + botón agregar más */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
        {!showBulk && (
          <button
            type="button" className="btn btn-ghost btn-sm"
            onClick={() => setShowBulk(true)}
          >
            + Agregar bloque
          </button>
        )}
        {franjas.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Total: <strong style={{ color: accentColor }}>{totalHoras.toFixed(1)}h/sem</strong>
          </span>
        )}
      </div>
    </div>
  )
}
