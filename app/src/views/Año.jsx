import { useState, useMemo } from 'react'
import { DIAS, CATEGORIAS } from '../store.js'
import ActivityFilter from '../components/ActivityFilter.jsx'

const JS_DAY_TO_DIA = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
const WEEK_DAYS_MON_FIRST = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
const WEEK_LABELS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']
const MES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

// Compute hours + dominant category for a DIAS name
function getDayStats(dia, actividades, proyectos, escenario, hiddenCats) {
  const hc = hiddenCats || new Set()
  let totalH = 0
  const catHours = {}

  const allItems = [
    ...(actividades || []).filter(a =>
      a.activo !== false &&
      (a.escenarios ?? ['base']).includes(escenario) &&
      !hc.has(a.categoria || a.tipo || '')
    ).map(a => ({ ...a, _cat: a.categoria || a.tipo || 'habito', _isProj: false })),
    ...(proyectos || []).filter(p =>
      p.activo !== false &&
      (p.escenarios ?? ['base']).includes(escenario) &&
      !hc.has('proyecto')
    ).map(p => ({ ...p, _cat: 'proyecto', _isProj: true })),
  ]

  allItems.forEach(item => {
    ;(item.franjas || []).filter(f => f.dia === dia).forEach(f => {
      const [sh, sm] = f.inicio.split(':').map(Number)
      const [eh, em] = f.fin.split(':').map(Number)
      const h = Math.max(0, (eh + em / 60) - (sh + sm / 60))
      totalH += h
      catHours[item._cat] = (catHours[item._cat] || 0) + h
    })
  })

  const dominant = Object.entries(catHours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  return { totalH, dominant }
}

function getColor(cat) {
  if (!cat) return null
  if (cat === 'proyecto') return '#d4a843'
  return CATEGORIAS.find(c => c.id === cat)?.color ?? '#6ab187'
}

// Generate all weeks of a year, starting Monday
function getYearWeeks(year) {
  const jan1 = new Date(year, 0, 1)
  // Find first Monday at or before Jan 1
  const startDow = (jan1.getDay() + 6) % 7 // 0=Mon
  const start = new Date(jan1)
  start.setDate(jan1.getDate() - startDow)

  const weeks = []
  let cur = new Date(start)
  while (cur.getFullYear() <= year || cur <= new Date(year, 11, 31)) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(cur)
      date.setDate(cur.getDate() + d)
      week.push({ date, inYear: date.getFullYear() === year })
    }
    weeks.push(week)
    cur.setDate(cur.getDate() + 7)
    if (cur.getFullYear() > year && weeks.length > 53) break
  }
  return weeks
}

// Determine which weeks start which month (for month labels)
function getMonthStartWeeks(weeks, year) {
  const seen = new Set()
  const result = {}
  weeks.forEach((week, wi) => {
    week.forEach(({ date, inYear }) => {
      if (!inYear) return
      const m = date.getMonth()
      if (!seen.has(m)) { seen.add(m); result[wi] = m }
    })
  })
  return result
}

export default function Año({ state, hiddenCats, onToggleFilter }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [tooltip, setTooltip] = useState(null) // { x, y, content }

  const { actividades, proyectos, config } = state
  const escenario = config.escenarioActivo

  // Pre-compute stats for each DIAS name (template, not date-specific)
  const templateStats = useMemo(() => {
    const result = {}
    DIAS.forEach(dia => {
      result[dia] = getDayStats(dia, actividades, proyectos, escenario, hiddenCats)
    })
    return result
  }, [actividades, proyectos, escenario, hiddenCats])

  const weeks = useMemo(() => getYearWeeks(year), [year])
  const monthLabels = useMemo(() => getMonthStartWeeks(weeks, year), [weeks, year])

  const CELL = 13
  const GAP = 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button className="btn btn-sm" onClick={() => setYear(y => y - 1)} style={{ padding: '4px 10px' }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', minWidth: 60, textAlign: 'center' }}>
          {year}
        </div>
        <button className="btn btn-sm" onClick={() => setYear(y => y + 1)} style={{ padding: '4px 10px' }}>›</button>
        <button className="btn btn-sm" onClick={() => setYear(today.getFullYear())} style={{ fontSize: 10 }}>Este año</button>
        <div style={{ flex: 1 }} />
        <ActivityFilter hiddenCats={hiddenCats} onToggle={onToggleFilter} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[...CATEGORIAS, { id: 'proyecto', label: 'Proyectos', color: '#d4a843' }]
            .filter(c => !hiddenCats.has(c.id))
            .map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
                <div style={{ width: CELL, height: CELL, borderRadius: 3, background: cat.color + '88' }} />
                {cat.label}
              </div>
            ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-dim)' }}>
            <div style={{ width: CELL, height: CELL, borderRadius: 3, background: 'var(--surface2)', border: '1px solid var(--border)' }} />
            Sin actividad
          </div>
        </div>

        {/* Heatmap grid */}
        <div style={{ overflowX: 'auto' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: 28, marginBottom: 4 }}>
            {weeks.map((_, wi) => (
              <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}>
                {monthLabels[wi] !== undefined ? (
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {MES_SHORT[monthLabels[wi]]}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Grid: 7 rows (days) × N cols (weeks) */}
          <div style={{ display: 'flex', gap: 0 }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4, paddingTop: 1 }}>
              {WEEK_LABELS.map((l, i) => (
                <div key={i} style={{
                  height: CELL, fontSize: 8, color: 'var(--text-dim)', lineHeight: `${CELL}px`,
                  textAlign: 'right', width: 20, flexShrink: 0,
                }}>{i % 2 === 0 ? l : ''}</div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map(({ date, inYear }, di) => {
                    const dia = JS_DAY_TO_DIA[date.getDay()]
                    const stats = templateStats[dia]
                    const isToday = date.toDateString() === today.toDateString()
                    const col = stats.totalH > 0 && inYear ? getColor(stats.dominant) : null
                    const opacity = col ? Math.min(1, 0.25 + (stats.totalH / 10) * 0.75) : 1

                    return (
                      <div
                        key={di}
                        style={{
                          width: CELL, height: CELL, borderRadius: 3, flexShrink: 0,
                          background: col ? col : 'var(--surface2)',
                          opacity: inYear ? opacity : 0.15,
                          border: isToday ? '2px solid var(--gold)' : '1px solid rgba(0,0,0,0.15)',
                          cursor: inYear ? 'pointer' : 'default',
                          boxSizing: 'border-box',
                          transition: 'opacity 0.1s',
                        }}
                        onMouseEnter={e => {
                          if (!inYear) return
                          const r = e.currentTarget.getBoundingClientRect()
                          setTooltip({
                            x: r.left, y: r.top,
                            content: {
                              date: date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
                              dia,
                              totalH: stats.totalH,
                              dominant: stats.dominant,
                            }
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats per day-of-week */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Horas programadas por día (plantilla)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {DIAS.map(dia => {
              const s = templateStats[dia]
              const col = s.totalH > 0 ? getColor(s.dominant) : 'var(--border)'
              const isToday = JS_DAY_TO_DIA[today.getDay()] === dia
              return (
                <div key={dia} style={{
                  background: 'var(--surface2)', borderRadius: 8, padding: '10px 8px',
                  border: `1px solid ${isToday ? 'var(--gold)' : 'var(--border)'}`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 4 }}>
                    {dia.charAt(0).toUpperCase() + dia.slice(0, 2)}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: col, lineHeight: 1 }}>
                    {s.totalH.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>h / semana</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 18, top: tooltip.y - 10,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 11, color: 'var(--text)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 200, pointerEvents: 'none', maxWidth: 200,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>{tooltip.content.date}</div>
          <div style={{ color: 'var(--text-muted)' }}>
            {tooltip.content.totalH > 0
              ? `${tooltip.content.totalH.toFixed(1)}h programadas`
              : 'Sin actividades'}
          </div>
          {tooltip.content.dominant && (
            <div style={{ fontSize: 10, color: getColor(tooltip.content.dominant), marginTop: 2 }}>
              {CATEGORIAS.find(c => c.id === tooltip.content.dominant)?.label ?? 'Proyectos'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
