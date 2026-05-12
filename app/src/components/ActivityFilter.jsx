import { CATEGORIAS } from '../store.js'

// hiddenCats: Set<string> — category ids that are hidden
// onToggle(catId): toggle visibility
export default function ActivityFilter({ hiddenCats, onToggle }) {
  const cats = [
    ...CATEGORIAS,
    { id: 'proyecto', label: 'Proyectos', color: '#d4a843' },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
      padding: '4px 12px 4px 0', flexShrink: 0,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 2 }}>
        Filtro
      </span>
      {cats.map(cat => {
        const hidden = hiddenCats.has(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            title={hidden ? `Mostrar ${cat.label}` : `Ocultar ${cat.label}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 20,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 600,
              background: hidden ? 'var(--surface2)' : cat.color + '22',
              color: hidden ? 'var(--text-dim)' : cat.color,
              border: `1px solid ${hidden ? 'var(--border)' : cat.color + '55'}`,
              opacity: hidden ? 0.5 : 1,
              transition: 'opacity 0.15s, background 0.15s',
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: hidden ? 'var(--border)' : cat.color,
              flexShrink: 0,
            }} />
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
