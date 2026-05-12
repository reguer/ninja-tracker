import { useState } from 'react'
import { CATEGORIAS } from '../store.js'

export default function ActivityPanel({ actividades, proyectos, escenario, onDragStart, onDragEnd }) {
  const [expanded, setExpanded] = useState(new Set(['basico','habito']))

  function toggleSection(id) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Group by categoria
  const byCategoria = {}
  CATEGORIAS.forEach(c => { byCategoria[c.id] = [] })
  ;(actividades || []).forEach(a => {
    const cat = a.categoria || (a.tipo === 'basico' ? 'basico' : 'habito')
    if (byCategoria[cat]) byCategoria[cat].push(a)
  })

  const proyItems = (proyectos || [])

  return (
    <div style={{
      width: 210, flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 12px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Actividades
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
          Arrastra al calendario →
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {CATEGORIAS.map(cat => {
          const items = byCategoria[cat.id] || []
          if (items.length === 0) return null
          const open = expanded.has(cat.id)
          const inEscenario = items.filter(a => (a.escenarios || ['base']).includes(escenario) && a.activo !== false)

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleSection(cat.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)', fontFamily: 'inherit',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{inEscenario.length}/{items.length}</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{open ? '▲' : '▼'}</span>
              </button>

              {open && items.map(item => {
                const hasSchedule = (item.franjas || []).length > 0
                const isActive = (item.escenarios || ['base']).includes(escenario) && item.activo !== false
                return (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    catColor={cat.color}
                    hasSchedule={hasSchedule}
                    isActive={isActive}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                )
              })}
            </div>
          )
        })}

        {/* Proyectos section */}
        {proyItems.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('proyecto')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid var(--border)', fontFamily: 'inherit',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#d4a843', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>
                Proyectos
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{expanded.has('proyecto') ? '▲' : '▼'}</span>
            </button>
            {expanded.has('proyecto') && proyItems.map(item => {
              const hasSchedule = (item.franjas || []).length > 0
              const isActive = (item.escenarios || ['base']).includes(escenario) && item.activo !== false
              return (
                <ActivityItem
                  key={item.id}
                  item={item}
                  catColor={item.colorTag || '#d4a843'}
                  hasSchedule={hasSchedule}
                  isActive={isActive}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ item, catColor, hasSchedule, isActive, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'copy'; onDragStart(e, item) }}
      onDragEnd={onDragEnd}
      title={`${item.nombre}${!hasSchedule ? ' · Sin horario asignado' : ''}`}
      style={{
        padding: '5px 12px 5px 20px',
        borderBottom: '1px solid rgba(46,46,58,0.4)',
        cursor: 'grab',
        display: 'flex', alignItems: 'center', gap: 6,
        opacity: isActive ? 1 : 0.35,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: hasSchedule ? catColor : 'var(--border)',
        border: hasSchedule ? 'none' : `1px solid ${catColor}`,
      }} />
      <span style={{
        fontSize: 11, color: 'var(--text)', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {item.nombre}
      </span>
      {!hasSchedule && (
        <span style={{ fontSize: 8, color: 'var(--text-dim)', flexShrink: 0 }}>sin hrs</span>
      )}
    </div>
  )
}
