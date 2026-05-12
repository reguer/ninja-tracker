import { useState, useRef, useEffect, useMemo } from 'react'
import { DIAS, DIAS_LABEL } from '../store.js'

const START_H = 6
const END_H = 24
const PX_H = 54   // pixels per hour

function toH(hhmm) {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h + (m || 0) / 60
}

function toS(h) {
  h = Math.max(0, Math.min(23.75, h))
  const hh = Math.floor(h)
  const mm = Math.round(((h - hh) * 60) / 15) * 15
  if (mm >= 60) return `${String(hh + 1).padStart(2, '0')}:00`
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function snap(h) { return Math.round(h * 4) / 4 }

const HOURS = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i)

export default function WeekCalendar({ actividades, proyectos, escenario, dragSource, onUpdateActividad, onUpdateProyecto }) {
  const [ghost, setGhost] = useState(null)
  const [resizing, setResizing] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)

  const colRefs = useRef({})

  const blocksByDay = useMemo(() => {
    const map = {}
    DIAS.forEach(d => { map[d] = [] })

    const allActs = (actividades || []).filter(a =>
      a.activo !== false && (a.escenarios ?? ['base']).includes(escenario)
    )
    const allProjs = (proyectos || []).filter(p =>
      p.activo !== false && (p.escenarios ?? ['base']).includes(escenario)
    )

    ;[...allActs, ...allProjs].forEach(item => {
      const isProj = !!(proyectos || []).find(p => p.id === item.id)
      ;(item.franjas || []).forEach((f, idx) => {
        if (map[f.dia]) {
          map[f.dia].push({
            key: `${item.id}::${idx}`,
            actId: item.id, fi: idx, isProj,
            nombre: item.nombre || '—',
            color: item.colorTag || (isProj ? '#d4a843' : '#6ab187'),
            inicio: f.inicio, fin: f.fin,
          })
        }
      })
    })
    return map
  }, [actividades, proyectos, escenario])

  function colY(e, dia) {
    const col = colRefs.current[dia]
    return col ? e.clientY - col.getBoundingClientRect().top : 0
  }

  function yToHour(y) {
    return snap(Math.max(START_H, Math.min(END_H - 0.25, START_H + y / PX_H)))
  }

  // ── Drop from activity panel ────────────────────────────────
  function onDragOver(e, dia) {
    if (!dragSource) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setGhost({ dia, startH: yToHour(colY(e, dia)) })
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setGhost(null)
  }

  function onDrop(e, dia) {
    e.preventDefault()
    if (!dragSource || !ghost) { setGhost(null); return }
    const startH = ghost.startH
    const newFranja = { dia, inicio: toS(startH), fin: toS(Math.min(END_H, startH + 1)) }
    const { item } = dragSource
    const isProj = !!(proyectos || []).find(p => p.id === item.id)
    if (isProj) {
      const prj = (proyectos || []).find(p => p.id === item.id)
      if (prj) onUpdateProyecto(prj.id, { franjas: [...(prj.franjas || []), newFranja] })
    } else {
      const act = (actividades || []).find(a => a.id === item.id)
      if (act) onUpdateActividad(act.id, { franjas: [...(act.franjas || []), newFranja] })
    }
    setGhost(null)
  }

  // ── Resize (drag bottom handle) ─────────────────────────────
  function startResize(e, block) {
    e.stopPropagation(); e.preventDefault()
    const item = block.isProj
      ? (proyectos || []).find(p => p.id === block.actId)
      : (actividades || []).find(a => a.id === block.actId)
    if (!item) return
    const f = (item.franjas || [])[block.fi]
    if (!f) return
    setResizing({ ...block, startY: e.clientY, origFin: toH(f.fin), origIni: toH(f.inicio) })
  }

  useEffect(() => {
    if (!resizing) return
    function onMove(e) {
      const delta = (e.clientY - resizing.startY) / PX_H
      const newFin = snap(Math.max(resizing.origIni + 0.25, Math.min(END_H, resizing.origFin + delta)))
      patchFranja(resizing.actId, resizing.fi, resizing.isProj, { fin: toS(newFin) })
    }
    function onUp() { setResizing(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing, actividades, proyectos])

  function patchFranja(actId, fi, isProj, patch) {
    const item = isProj
      ? (proyectos || []).find(p => p.id === actId)
      : (actividades || []).find(a => a.id === actId)
    if (!item) return
    const newFranjas = (item.franjas || []).map((f, i) => i === fi ? { ...f, ...patch } : f)
    if (isProj) onUpdateProyecto(actId, { franjas: newFranjas })
    else onUpdateActividad(actId, { franjas: newFranjas })
  }

  function deleteFranja(actId, fi, isProj) {
    const item = isProj
      ? (proyectos || []).find(p => p.id === actId)
      : (actividades || []).find(a => a.id === actId)
    if (!item) return
    const newFranjas = (item.franjas || []).filter((_, i) => i !== fi)
    if (isProj) onUpdateProyecto(actId, { franjas: newFranjas })
    else onUpdateActividad(actId, { franjas: newFranjas })
    setSelectedKey(null)
  }

  const totalPx = (END_H - START_H) * PX_H
  const isDragging = !!dragSource

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} onClick={() => setSelectedKey(null)}>
      {/* Day headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 2,
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
        paddingBottom: 6, paddingTop: 4,
      }}>
        <div />
        {DIAS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 12, fontWeight: 700,
            color: ['sabado','domingo'].includes(d) ? 'var(--text-dim)' : 'var(--text-muted)',
            padding: '6px 0',
          }}>
            {DIAS_LABEL[d]}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 2 }}>
        {/* Hour axis */}
        <div style={{ position: 'relative', height: totalPx }}>
          {HOURS.map(h => (
            <div key={h} style={{
              position: 'absolute', top: (h - START_H) * PX_H - 6, right: 4,
              fontSize: 9, color: 'var(--text-dim)', lineHeight: 1,
            }}>
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DIAS.map(dia => {
          const isTarget = ghost?.dia === dia
          return (
            <div
              key={dia}
              ref={el => { colRefs.current[dia] = el }}
              style={{
                position: 'relative', height: totalPx,
                background: isTarget ? 'rgba(212,168,67,0.07)' : 'var(--surface2)',
                borderRadius: 6,
                border: `1px solid ${isTarget ? 'var(--gold)' : 'var(--border)'}`,
                cursor: isDragging ? 'copy' : 'default',
                transition: 'background 0.1s, border-color 0.1s',
              }}
              onDragOver={e => onDragOver(e, dia)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, dia)}
            >
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0, top: (h - START_H) * PX_H,
                  borderTop: h % 2 === 0 ? '1px solid rgba(46,46,58,0.8)' : '1px dashed rgba(46,46,58,0.35)',
                  pointerEvents: 'none',
                }} />
              ))}

              {/* Ghost preview */}
              {isTarget && dragSource && (
                <div style={{
                  position: 'absolute',
                  top: (ghost.startH - START_H) * PX_H,
                  height: PX_H,
                  left: 2, right: 2,
                  background: (dragSource.item?.colorTag || '#6ab187') + '55',
                  border: `1px dashed ${dragSource.item?.colorTag || '#6ab187'}`,
                  borderRadius: 5, padding: '2px 5px',
                  fontSize: 10, color: '#e8e8f0',
                  pointerEvents: 'none', zIndex: 6,
                }}>
                  {dragSource.item?.nombre}
                </div>
              )}

              {/* Activity blocks */}
              {blocksByDay[dia].map(block => {
                const sH = toH(block.inicio)
                const eH = toH(block.fin)
                if (sH >= END_H || eH <= START_H) return null
                const top = (Math.max(sH, START_H) - START_H) * PX_H
                const height = Math.max(10, (Math.min(eH, END_H) - Math.max(sH, START_H)) * PX_H)
                const dur = eH - sH
                const isSelected = selectedKey === block.key
                const isResizingThis = resizing?.key === block.key

                return (
                  <div
                    key={block.key}
                    onClick={e => { e.stopPropagation(); setSelectedKey(isSelected ? null : block.key) }}
                    style={{
                      position: 'absolute', top, height, left: 2, right: 2,
                      background: block.color + (isSelected ? 'ff' : 'dd'),
                      borderRadius: 5, padding: '2px 6px 8px',
                      fontSize: 10, fontWeight: 600, color: '#0f0f13',
                      overflow: 'visible',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 0 0 2px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.5)'
                        : '0 1px 3px rgba(0,0,0,0.25)',
                      userSelect: 'none',
                      zIndex: isSelected ? 8 : isResizingThis ? 7 : 2,
                      transition: 'box-shadow 0.1s',
                    }}
                  >
                    {dur > 0.3 && (
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {block.nombre}
                      </div>
                    )}
                    {dur > 0.6 && (
                      <div style={{ fontSize: 8, opacity: 0.75 }}>{block.inicio}–{block.fin}</div>
                    )}

                    {/* Popup on select */}
                    {isSelected && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute', bottom: '100%', left: 0, zIndex: 20,
                          marginBottom: 4,
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 10, padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          minWidth: 200,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                          {block.nombre}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                          <input type="time" className="input"
                            style={{ flex: 1, padding: '4px 6px', fontSize: 12 }}
                            value={block.inicio}
                            onChange={e => patchFranja(block.actId, block.fi, block.isProj, { inicio: e.target.value })}
                          />
                          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>→</span>
                          <input type="time" className="input"
                            style={{ flex: 1, padding: '4px 6px', fontSize: 12 }}
                            value={block.fin}
                            onChange={e => patchFranja(block.actId, block.fi, block.isProj, { fin: e.target.value })}
                          />
                        </div>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--rose)', color: '#fff', border: 'none', width: '100%', justifyContent: 'center' }}
                          onClick={() => deleteFranja(block.actId, block.fi, block.isProj)}
                        >
                          Quitar bloque
                        </button>
                      </div>
                    )}

                    {/* Resize handle */}
                    <div
                      onMouseDown={e => startResize(e, block)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
                        cursor: 'ns-resize',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <div style={{ width: 18, height: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 1 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
