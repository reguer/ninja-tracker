import { useState } from 'react'
import { DIAS, DIAS_LABEL } from '../store.js'

const START_H = 6
const END_H = 23
const TOTAL_H = END_H - START_H

const HOUR_MARKS = [6, 8, 10, 12, 14, 16, 18, 20, 22]

function toDecimal(hhmm) {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h + m / 60
}

function blockStyle(inicio, fin, color) {
  const s = Math.max(toDecimal(inicio), START_H)
  const e = Math.min(toDecimal(fin), END_H)
  if (e <= s) return null
  const top = ((s - START_H) / TOTAL_H) * 100
  const height = ((e - s) / TOTAL_H) * 100
  return { top: `${top}%`, height: `${height}%`, background: color }
}

export default function WeekGrid({ actividades = [], proyectos = [], bloqueos = [], escenario }) {
  const [hoveredBlock, setHoveredBlock] = useState(null)

  // Collect all blocks per day
  const dayBlocks = {}
  DIAS.forEach(d => { dayBlocks[d] = [] })

  actividades
    .filter(a => a.activo && a.escenarios?.includes(escenario))
    .forEach(act => {
      act.franjas?.forEach(f => {
        if (dayBlocks[f.dia]) {
          dayBlocks[f.dia].push({
            nombre: act.nombre,
            inicio: f.inicio,
            fin: f.fin,
            color: act.colorTag || (act.tipo === 'basico' ? '#5b8fd4' : '#6ab187'),
            tipo: act.tipo,
            id: act.id + f.inicio + f.dia,
          })
        }
      })
    })

  proyectos
    .filter(p => p.activo && p.escenarios?.includes(escenario))
    .forEach(prj => {
      prj.franjas?.forEach(f => {
        if (dayBlocks[f.dia]) {
          dayBlocks[f.dia].push({
            nombre: prj.nombre,
            inicio: f.inicio,
            fin: f.fin,
            color: prj.colorTag || '#d4a843',
            tipo: 'proyecto',
            id: prj.id + f.inicio + f.dia,
          })
        }
      })
    })

  const gridHeight = 360

  return (
    <div style={{ userSelect: 'none' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
        <div />
        {DIAS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: ['sabado', 'domingo'].includes(d) ? 'var(--text-dim)' : 'var(--text-muted)',
            padding: '4px 0', letterSpacing: '0.04em',
          }}>
            {DIAS_LABEL[d]}
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px repeat(7, 1fr)', gap: 2 }}>
        {/* Time axis */}
        <div style={{ position: 'relative', height: gridHeight }}>
          {HOUR_MARKS.map(h => (
            <div key={h} style={{
              position: 'absolute',
              top: `${((h - START_H) / TOTAL_H) * 100}%`,
              right: 4, transform: 'translateY(-50%)',
              fontSize: 9, color: 'var(--text-dim)', lineHeight: 1,
            }}>
              {h}h
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DIAS.map(dia => (
          <div key={dia} style={{
            position: 'relative', height: gridHeight,
            background: 'var(--surface2)', borderRadius: 6, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {/* Hour lines */}
            {HOUR_MARKS.slice(1).map(h => (
              <div key={h} style={{
                position: 'absolute', left: 0, right: 0,
                top: `${((h - START_H) / TOTAL_H) * 100}%`,
                borderTop: '1px solid var(--border)', opacity: 0.5, pointerEvents: 'none',
              }} />
            ))}

            {/* Activity blocks */}
            {dayBlocks[dia].map(block => {
              const bs = blockStyle(block.inicio, block.fin, block.color)
              if (!bs) return null
              const isHovered = hoveredBlock === block.id
              const durationH = toDecimal(block.fin) - toDecimal(block.inicio)
              const showLabel = durationH >= 0.5

              return (
                <div
                  key={block.id}
                  onMouseEnter={() => setHoveredBlock(block.id)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  title={`${block.nombre} ${block.inicio}–${block.fin}`}
                  style={{
                    position: 'absolute', left: 2, right: 2,
                    top: bs.top, height: bs.height,
                    background: bs.background,
                    borderRadius: 4,
                    padding: '2px 4px',
                    fontSize: 9, fontWeight: 600,
                    color: '#0f0f13',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    opacity: isHovered ? 1 : 0.82,
                    transition: 'opacity 0.1s',
                    cursor: 'default',
                    zIndex: isHovered ? 2 : 1,
                    boxShadow: isHovered ? `0 0 0 1px ${bs.background}` : 'none',
                  }}
                >
                  {showLabel ? block.nombre : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <LegendItem color="#5b8fd4" label="Básicos" />
        <LegendItem color="#6ab187" label="Recurrentes" />
        <LegendItem color="#d4a843" label="Proyectos" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
