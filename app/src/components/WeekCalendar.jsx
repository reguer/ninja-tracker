import { useState, useRef, useEffect, useMemo } from 'react'
import { DIAS, DIAS_LABEL } from '../store.js'

const START_H = 0
const END_H = 24
const PX_H = 54

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

// ── Block edit popup with 3 modes ──────────────────────────────
function BlockPopup({ block, actividades, proyectos, onPatchMulti, onDeleteMulti, onClose }) {
  const [ini, setIni] = useState(block.inicio)
  const [fin, setFin] = useState(block.fin)
  const [mode, setMode] = useState('solo')

  const item = block.isProj
    ? (proyectos || []).find(p => p.id === block.actId)
    : (actividades || []).find(a => a.id === block.actId)

  const franjas = item?.franjas || []
  const sameCount = franjas.filter(f => f.inicio === block.inicio && f.fin === block.fin).length
  const changed = ini !== block.inicio || fin !== block.fin

  function resolveIdxs() {
    if (mode === 'solo') return [block.fi]
    if (mode === 'iguales') return franjas.reduce((acc, f, i) => {
      if (f.inicio === block.inicio && f.fin === block.fin) acc.push(i)
      return acc
    }, [])
    return franjas.map((_, i) => i)
  }

  function handleSave() {
    if (!changed) return
    onPatchMulti(block.actId, block.isProj, resolveIdxs(), { inicio: ini, fin })
    onClose()
  }

  function handleDelete() {
    onDeleteMulti(block.actId, block.isProj, resolveIdxs())
    onClose()
  }

  const modes = [
    { id: 'solo', label: 'Solo este bloque', count: null },
    { id: 'iguales', label: `Misma hora`, count: sameCount, disabled: sameCount <= 1 },
    { id: 'todos', label: `Toda la actividad`, count: franjas.length, disabled: franjas.length <= 1 },
  ]

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', bottom: '100%', left: 0, zIndex: 20,
        marginBottom: 4,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: 220,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
          {block.nombre}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-dim)', fontSize: 14, padding: '0 2px', lineHeight: 1,
        }}>×</button>
      </div>

      {/* Mode selector */}
      <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
          Aplicar cambio a
        </div>
        {modes.map(opt => (
          <label key={opt.id} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            cursor: opt.disabled ? 'default' : 'pointer',
            opacity: opt.disabled ? 0.35 : 1,
            color: mode === opt.id ? 'var(--gold)' : 'var(--text-muted)',
          }}>
            <input
              type="radio" name={`mode-${block.key}`} value={opt.id}
              checked={mode === opt.id}
              disabled={opt.disabled}
              onChange={() => { if (!opt.disabled) setMode(opt.id) }}
              style={{ accentColor: 'var(--gold)' }}
            />
            {opt.label}
            {opt.count != null && (
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>
                ({opt.count} {opt.count === 1 ? 'bloque' : 'bloques'})
              </span>
            )}
          </label>
        ))}
      </div>

      {/* Time inputs */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
        <input type="time" className="input"
          style={{ flex: 1, padding: '4px 6px', fontSize: 12 }}
          value={ini} onChange={e => setIni(e.target.value)}
        />
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>→</span>
        <input type="time" className="input"
          style={{ flex: 1, padding: '4px 6px', fontSize: 12 }}
          value={fin} onChange={e => setFin(e.target.value)}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="btn btn-sm"
          style={{
            flex: 1, justifyContent: 'center',
            background: changed ? 'var(--gold)' : 'var(--surface2)',
            color: changed ? '#0f0f13' : 'var(--text-dim)',
            border: 'none', fontWeight: 700,
            cursor: changed ? 'pointer' : 'default',
          }}
          onClick={handleSave}
        >
          Guardar
        </button>
        <button
          className="btn btn-sm"
          style={{ flex: 1, background: 'var(--rose)', color: '#fff', border: 'none', justifyContent: 'center' }}
          onClick={handleDelete}
        >
          Quitar
        </button>
      </div>
    </div>
  )
}

// ── Activity picker modal ───────────────────────────────────────
function ActivityPicker({ actividades, proyectos, dia, inicio, fin, onSelect, onCancel }) {
  const [search, setSearch] = useState('')
  const all = [
    ...(actividades || []).filter(a => a.activo !== false),
    ...(proyectos || []).filter(p => p.activo !== false),
  ].filter(item => !search || item.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 14, padding: 20,
        width: 300, maxHeight: 460, display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>Asignar actividad</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {DIAS_LABEL[dia] ?? dia} · {inicio} – {fin}
        </div>
        <input autoFocus placeholder="Buscar..." className="input"
          style={{ fontSize: 12, padding: '6px 10px' }}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0 }}>
          {all.map(item => (
            <button key={item.id} onClick={() => onSelect(item)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              background: 'var(--surface2)', border: '1px solid transparent',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', color: 'var(--text)', fontSize: 12, flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: item.colorTag || '#6ab187', flexShrink: 0 }} />
              {item.nombre}
            </button>
          ))}
          {all.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '10px 0' }}>Sin resultados</div>}
        </div>
        <button className="btn btn-sm" style={{ justifyContent: 'center' }} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function WeekCalendar({ actividades, proyectos, escenario, dragSource, hiddenCats, onUpdateActividad, onUpdateProyecto }) {
  const [ghost, setGhost] = useState(null)
  const [resizing, setResizing] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [drawing, setDrawing] = useState(null)
  const [drawingEndH, setDrawingEndH] = useState(null)
  const [blockDrag, setBlockDrag] = useState(null)
  const [picker, setPicker] = useState(null)
  const [nowH, setNowH] = useState(() => { const d = new Date(); return d.getHours() + d.getMinutes() / 60 })

  const colRefs = useRef({})
  const didDragRef = useRef(false)
  const actRef = useRef(actividades)
  const projRef = useRef(proyectos)
  const onUpdateActRef = useRef(onUpdateActividad)
  const onUpdateProjRef = useRef(onUpdateProyecto)
  actRef.current = actividades
  projRef.current = proyectos
  onUpdateActRef.current = onUpdateActividad
  onUpdateProjRef.current = onUpdateProyecto

  const todayDia = useMemo(() => {
    const names = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
    return names[new Date().getDay()]
  }, [])

  useEffect(() => {
    const t = setInterval(() => { const d = new Date(); setNowH(d.getHours() + d.getMinutes() / 60) }, 60000)
    return () => clearInterval(t)
  }, [])

  const blocksByDay = useMemo(() => {
    const map = {}
    DIAS.forEach(d => { map[d] = [] })
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

    ;[...allActs, ...allProjs].forEach(item => {
      const isProj = !!(proyectos || []).find(p => p.id === item.id)
      ;(item.franjas || []).forEach((f, idx) => {
        if (map[f.dia]) {
          map[f.dia].push({
            key: `${item.id}::${idx}`,
            actId: item.id, fi: idx, isProj,
            dia: f.dia,
            nombre: item.nombre || '—',
            color: item.colorTag || (isProj ? '#d4a843' : '#6ab187'),
            inicio: f.inicio, fin: f.fin,
          })
        }
      })
    })
    return map
  }, [actividades, proyectos, escenario, hiddenCats])

  function findDiaFromX(clientX) {
    for (const dia of DIAS) {
      const el = colRefs.current[dia]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right) return dia
    }
    return null
  }

  // ── Franja mutations ───────────────────────────────────────────
  function patchMultiFranjas(actId, isProj, idxs, patch) {
    const item = isProj
      ? (proyectos || []).find(p => p.id === actId)
      : (actividades || []).find(a => a.id === actId)
    if (!item) return
    const newFranjas = (item.franjas || []).map((f, i) => idxs.includes(i) ? { ...f, ...patch } : f)
    if (isProj) onUpdateProyecto(actId, { franjas: newFranjas })
    else onUpdateActividad(actId, { franjas: newFranjas })
  }

  function deleteMultiFranjas(actId, isProj, idxs) {
    const item = isProj
      ? (proyectos || []).find(p => p.id === actId)
      : (actividades || []).find(a => a.id === actId)
    if (!item) return
    const newFranjas = (item.franjas || []).filter((_, i) => !idxs.includes(i))
    if (isProj) onUpdateProyecto(actId, { franjas: newFranjas })
    else onUpdateActividad(actId, { franjas: newFranjas })
    setSelectedKey(null)
  }

  // Patch via refs (inside event handlers, avoids stale closures)
  function patchFranjaLive(actId, fi, isProj, patch) {
    const items = isProj ? projRef.current : actRef.current
    const item = (items || []).find(x => x.id === actId)
    if (!item) return
    const newFranjas = (item.franjas || []).map((f, i) => i === fi ? { ...f, ...patch } : f)
    if (isProj) onUpdateProjRef.current(actId, { franjas: newFranjas })
    else onUpdateActRef.current(actId, { franjas: newFranjas })
  }

  // ── HTML5 drag from ActivityPanel ──────────────────────────────
  function onDragOver(e, dia) {
    if (!dragSource) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const col = colRefs.current[dia]
    if (!col) return
    const y = e.clientY - col.getBoundingClientRect().top
    setGhost({ dia, startH: snap(Math.max(START_H, Math.min(END_H - 0.25, y / PX_H))) })
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setGhost(null)
  }

  function onDrop(e, dia) {
    e.preventDefault()
    if (!dragSource || !ghost) { setGhost(null); return }
    const startH = ghost.startH
    const newFranja = { dia, inicio: toS(startH), fin: toS(Math.min(23.75, startH + 1)) }
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

  // ── Resize handle ───────────────────────────────────────────────
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
      const newFin = snap(Math.max(resizing.origIni + 0.25, Math.min(END_H - 0.25, resizing.origFin + delta)))
      patchMultiFranjas(resizing.actId, resizing.isProj, [resizing.fi], { fin: toS(newFin) })
    }
    function onUp() { setResizing(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing, actividades, proyectos])

  // ── Draw new block ──────────────────────────────────────────────
  function startDrawing(e, dia) {
    if (dragSource || blockDrag || resizing) return
    e.preventDefault()
    const col = colRefs.current[dia]
    if (!col) return
    const y = e.clientY - col.getBoundingClientRect().top
    const h = snap(Math.max(START_H, Math.min(END_H - 0.25, y / PX_H)))
    setSelectedKey(null)
    setDrawing({ dia, startH: h })
    setDrawingEndH(h + 0.25)
  }

  useEffect(() => {
    if (!drawing) { setDrawingEndH(null); return }
    function onMove(e) {
      const col = colRefs.current[drawing.dia]
      if (!col) return
      const y = e.clientY - col.getBoundingClientRect().top
      setDrawingEndH(snap(Math.max(START_H, Math.min(END_H, y / PX_H))))
    }
    function onUp(e) {
      const col = colRefs.current[drawing.dia]
      let endH = drawing.startH + 0.25
      if (col) {
        const y = e.clientY - col.getBoundingClientRect().top
        endH = snap(Math.max(START_H, Math.min(END_H, y / PX_H)))
      }
      const startH = Math.min(drawing.startH, endH)
      const finalEnd = Math.max(drawing.startH, endH)
      setDrawing(null); setDrawingEndH(null)
      if (finalEnd - startH >= 0.25) setPicker({ dia: drawing.dia, inicio: toS(startH), fin: toS(finalEnd) })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [drawing])

  // ── Block move drag ─────────────────────────────────────────────
  function startBlockDrag(e, block) {
    e.stopPropagation(); e.preventDefault()
    didDragRef.current = false
    const col = colRefs.current[block.dia]
    if (!col) return
    const y = e.clientY - col.getBoundingClientRect().top
    const origIni = toH(block.inicio)
    const origFin = toH(block.fin)
    const dur = origFin - origIni
    const grabOffset = Math.max(0, Math.min(dur - 0.25, snap(y / PX_H) - origIni))
    setBlockDrag({ block, grabOffset, origIni, origFin })
    setSelectedKey(null)
  }

  useEffect(() => {
    if (!blockDrag) return
    function onMove(e) {
      didDragRef.current = true
      const foundDia = findDiaFromX(e.clientX)
      if (!foundDia) return
      const col = colRefs.current[foundDia]
      if (!col) return
      const y = e.clientY - col.getBoundingClientRect().top
      const dur = blockDrag.origFin - blockDrag.origIni
      const newH = snap(Math.max(START_H, Math.min(END_H - dur, y / PX_H - blockDrag.grabOffset)))
      patchFranjaLive(blockDrag.block.actId, blockDrag.block.fi, blockDrag.block.isProj, {
        dia: foundDia, inicio: toS(newH), fin: toS(newH + dur),
      })
    }
    function onUp() { setBlockDrag(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [blockDrag])

  // ── Activity picker ─────────────────────────────────────────────
  function onPickerSelect(item) {
    if (!picker) return
    const isProj = !!(proyectos || []).find(p => p.id === item.id)
    const newFranja = { dia: picker.dia, inicio: picker.inicio, fin: picker.fin }
    if (isProj) {
      const prj = (proyectos || []).find(p => p.id === item.id)
      if (prj) onUpdateProyecto(prj.id, { franjas: [...(prj.franjas || []), newFranja] })
    } else {
      const act = (actividades || []).find(a => a.id === item.id)
      if (act) onUpdateActividad(act.id, { franjas: [...(act.franjas || []), newFranja] })
    }
    setPicker(null)
  }

  const totalPx = END_H * PX_H
  const isDragging = !!dragSource
  const isDrawing = !!drawing
  const isMoving = !!blockDrag

  return (
    <div
      style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', userSelect: isDrawing || isMoving ? 'none' : 'auto' }}
      onClick={() => setSelectedKey(null)}
    >
      {picker && (
        <ActivityPicker
          actividades={actividades} proyectos={proyectos}
          dia={picker.dia} inicio={picker.inicio} fin={picker.fin}
          onSelect={onPickerSelect} onCancel={() => setPicker(null)}
        />
      )}

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
            color: d === todayDia ? 'var(--gold)' : ['sabado','domingo'].includes(d) ? 'var(--text-dim)' : 'var(--text-muted)',
            padding: '6px 0',
          }}>{DIAS_LABEL[d]}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 2 }}>
        {/* Hour axis */}
        <div style={{ position: 'relative', height: totalPx }}>
          {HOURS.map(h => (
            <div key={h} style={{
              position: 'absolute', top: h * PX_H - 6, right: 4,
              fontSize: 9, color: 'var(--text-dim)', lineHeight: 1,
            }}>
              {h < 24 ? String(h).padStart(2, '0') : ''}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DIAS.map(dia => {
          const isHtmlTarget = ghost?.dia === dia
          const isDrawingHere = drawing?.dia === dia
          return (
            <div
              key={dia}
              ref={el => { colRefs.current[dia] = el }}
              style={{
                position: 'relative', height: totalPx,
                background: isHtmlTarget ? 'rgba(212,168,67,0.07)' : 'var(--surface2)',
                borderRadius: 6,
                border: `1px solid ${isHtmlTarget ? 'var(--gold)' : 'var(--border)'}`,
                cursor: isDragging ? 'copy' : isDrawing || isMoving ? 'crosshair' : 'crosshair',
                transition: 'background 0.1s, border-color 0.1s',
              }}
              onMouseDown={e => startDrawing(e, dia)}
              onDragOver={e => onDragOver(e, dia)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, dia)}
            >
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0, top: h * PX_H,
                  borderTop: h % 2 === 0 ? '1px solid rgba(46,46,58,0.8)' : '1px dashed rgba(46,46,58,0.35)',
                  pointerEvents: 'none',
                }} />
              ))}

              {/* Red current-time line (today only) */}
              {dia === todayDia && (
                <div style={{
                  position: 'absolute', top: nowH * PX_H - 1,
                  left: -2, right: 0, height: 2,
                  background: '#ef4444', zIndex: 5, pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', left: -3, top: -4,
                    width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                  }} />
                </div>
              )}

              {/* HTML5 drop ghost */}
              {isHtmlTarget && dragSource && (
                <div style={{
                  position: 'absolute',
                  top: (ghost.startH - START_H) * PX_H, height: PX_H, left: 2, right: 2,
                  background: (dragSource.item?.colorTag || '#6ab187') + '55',
                  border: `1px dashed ${dragSource.item?.colorTag || '#6ab187'}`,
                  borderRadius: 5, padding: '2px 5px', fontSize: 10, color: '#e8e8f0',
                  pointerEvents: 'none', zIndex: 6,
                }}>{dragSource.item?.nombre}</div>
              )}

              {/* Draw ghost */}
              {isDrawingHere && drawingEndH !== null && (
                <div style={{
                  position: 'absolute',
                  top: Math.min(drawing.startH, drawingEndH) * PX_H,
                  height: Math.max(0.25, Math.abs(drawingEndH - drawing.startH)) * PX_H,
                  left: 2, right: 2,
                  background: 'rgba(106,177,135,0.25)',
                  border: '2px dashed #6ab187', borderRadius: 5,
                  pointerEvents: 'none', zIndex: 6,
                }} />
              )}

              {/* Activity blocks */}
              {blocksByDay[dia].map(block => {
                const sH = toH(block.inicio)
                const eH = toH(block.fin)
                if (sH >= END_H || eH <= START_H) return null
                const top = sH * PX_H
                const height = Math.max(10, (eH - sH) * PX_H)
                const dur = eH - sH
                const isSelected = selectedKey === block.key
                const isResizingThis = resizing?.key === block.key
                const isDraggingThis = blockDrag?.block.key === block.key

                return (
                  <div
                    key={block.key}
                    onClick={e => {
                      e.stopPropagation()
                      if (didDragRef.current) { didDragRef.current = false; return }
                      setSelectedKey(isSelected ? null : block.key)
                    }}
                    onMouseDown={e => startBlockDrag(e, block)}
                    style={{
                      position: 'absolute', top, height, left: 2, right: 2,
                      background: block.color + (isSelected ? 'ff' : isDraggingThis ? '99' : 'dd'),
                      borderRadius: 5, padding: '2px 6px 8px',
                      fontSize: 10, fontWeight: 600, color: '#0f0f13',
                      overflow: 'visible',
                      cursor: isDraggingThis || isMoving ? 'grabbing' : 'grab',
                      boxShadow: isSelected
                        ? '0 0 0 2px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.5)'
                        : isDraggingThis ? '0 4px 16px rgba(0,0,0,0.4)'
                        : '0 1px 3px rgba(0,0,0,0.25)',
                      userSelect: 'none',
                      zIndex: isSelected ? 8 : isDraggingThis ? 9 : isResizingThis ? 7 : 2,
                      opacity: isDraggingThis ? 0.55 : 1,
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

                    {/* Enhanced popup */}
                    {isSelected && (
                      <BlockPopup
                        block={block}
                        actividades={actividades}
                        proyectos={proyectos}
                        onPatchMulti={patchMultiFranjas}
                        onDeleteMulti={deleteMultiFranjas}
                        onClose={() => setSelectedKey(null)}
                      />
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
