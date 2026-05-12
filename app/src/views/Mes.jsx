import { useState, useMemo } from 'react'
import { DIAS, CATEGORIAS } from '../store.js'
import ActivityFilter from '../components/ActivityFilter.jsx'

// Maps JS getDay() (0=Sun) to DIAS name
const JS_DAY_TO_DIA = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']

const MES_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDaysInMonth(year, month) {
  const days = []
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // Padding days before first
  const startDow = (first.getDay() + 6) % 7 // 0=Mon
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, 1 - (startDow - i))
    days.push({ date: d, current: false })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true })
  }
  // Pad to complete last week
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), current: false })
  }
  return days
}

function getBlocksForDia(dia, actividades, proyectos, escenario, hiddenCats) {
  const hc = hiddenCats || new Set()
  const allActs = (actividades || []).filter(a =>
    a.activo !== false &&
    (a.escenarios ?? ['base']).includes(escenario) &&
    !hc.has(a.categoria || a.tipo || '')
  )
  const allProjs = (proyectos || []).filter(p =>
    p.activo !== false &&
    (p.escenarios ?? ['base']).includes(escenario) &&
    !hc.has('proyecto')
  )
  const blocks = []
  ;[...allActs, ...allProjs].forEach(item => {
    const isProj = !!(proyectos || []).find(p => p.id === item.id)
    ;(item.franjas || []).filter(f => f.dia === dia).forEach(f => {
      blocks.push({
        nombre: item.nombre,
        color: item.colorTag || (isProj ? '#d4a843' : '#6ab187'),
        inicio: f.inicio, fin: f.fin,
      })
    })
  })
  blocks.sort((a, b) => a.inicio.localeCompare(b.inicio))
  return blocks
}

function calcTotalHours(dia, actividades, proyectos, escenario, hiddenCats) {
  const blocks = getBlocksForDia(dia, actividades, proyectos, escenario, hiddenCats)
  return blocks.reduce((sum, b) => {
    const [sh, sm] = b.inicio.split(':').map(Number)
    const [eh, em] = b.fin.split(':').map(Number)
    return sum + Math.max(0, (eh + em / 60) - (sh + sm / 60))
  }, 0)
}

export default function Mes({ state, hiddenCats, onToggleFilter }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const { actividades, proyectos, config } = state
  const escenario = config.escenarioActivo

  const days = useMemo(() => getDaysInMonth(year, month), [year, month])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(null) }

  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  const weekHeaders = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button className="btn btn-sm" onClick={prevMonth} style={{ padding: '4px 10px' }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', minWidth: 160, textAlign: 'center' }}>
          {MES_NAMES[month]} {year}
        </div>
        <button className="btn btn-sm" onClick={nextMonth} style={{ padding: '4px 10px' }}>›</button>
        <button className="btn btn-sm" onClick={goToday} style={{ fontSize: 10 }}>Hoy</button>
        <div style={{ flex: 1 }} />
        <ActivityFilter hiddenCats={hiddenCats} onToggle={onToggleFilter} />
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {/* Week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {weekHeaders.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 700,
              color: ['Sá','Do'].includes(d) ? 'var(--text-dim)' : 'var(--text-muted)',
              padding: '4px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(({ date, current }, idx) => {
            const dia = JS_DAY_TO_DIA[date.getDay()]
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const isToday = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` === todayStr
            const selKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            const isSelected = selectedDay === selKey
            const blocks = getBlocksForDia(dia, actividades, proyectos, escenario, hiddenCats)
            const totalH = blocks.reduce((s, b) => {
              const [sh, sm] = b.inicio.split(':').map(Number)
              const [eh, em] = b.fin.split(':').map(Number)
              return s + Math.max(0, (eh + em / 60) - (sh + sm / 60))
            }, 0)

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : selKey)}
                style={{
                  minHeight: 80, borderRadius: 8, padding: '6px 6px 4px',
                  background: isSelected ? 'var(--surface)' : current ? 'var(--surface2)' : 'var(--bg)',
                  border: `1px solid ${isToday ? 'var(--gold)' : isSelected ? 'var(--border-light)' : 'var(--border)'}`,
                  opacity: current ? 1 : 0.4,
                  cursor: current ? 'pointer' : 'default',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
              >
                {/* Day number */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'var(--gold)' : isWeekend ? 'var(--text-dim)' : 'var(--text)',
                    background: isToday ? 'var(--gold)22' : 'transparent',
                    borderRadius: 4, padding: isToday ? '1px 5px' : '0',
                  }}>
                    {date.getDate()}
                  </span>
                  {totalH > 0 && current && (
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>
                      {totalH.toFixed(1)}h
                    </span>
                  )}
                </div>

                {/* Activity chips */}
                {current && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {blocks.slice(0, 4).map((b, i) => (
                      <div key={i} style={{
                        fontSize: 9, fontWeight: 600,
                        background: b.color + '33', color: b.color,
                        borderRadius: 3, padding: '1px 4px',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}>
                        {b.inicio.slice(0, 5)} {b.nombre}
                      </div>
                    ))}
                    {blocks.length > 4 && (
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', paddingLeft: 4 }}>
                        +{blocks.length - 4} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected day detail panel */}
        {selectedDay && (() => {
          const [y, m, d] = selectedDay.split('-').map(Number)
          const date = new Date(y, m, d)
          const dia = JS_DAY_TO_DIA[date.getDay()]
          const blocks = getBlocksForDia(dia, actividades, proyectos, escenario, hiddenCats)
          if (blocks.length === 0) return null
          return (
            <div style={{
              marginTop: 16, background: 'var(--surface)', borderRadius: 10, padding: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
                {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {blocks.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 10px', background: 'var(--surface2)', borderRadius: 8,
                    borderLeft: `3px solid ${b.color}`,
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', minWidth: 80 }}>
                      {b.inicio} – {b.fin}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{b.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
