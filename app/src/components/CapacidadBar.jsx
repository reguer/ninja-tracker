export default function CapacidadBar({ total, basicos, recurrentes, proyectos, buffer, saldo }) {
  const pct = v => total > 0 ? Math.min(100, (v / total) * 100) : 0

  const segments = [
    { label: 'Básicos', value: basicos, color: '#5b8fd4' },
    { label: 'Recurrentes', value: recurrentes, color: '#6ab187' },
    { label: 'Buffer', value: buffer, color: '#3a3a4a' },
    { label: 'Proyectos', value: proyectos, color: '#d4a843' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Barra segmentada */}
      <div style={{
        height: 18,
        background: 'var(--border)',
        borderRadius: 100,
        overflow: 'hidden',
        display: 'flex',
      }}>
        {segments.map(s => (
          <div
            key={s.label}
            title={`${s.label}: ${s.value.toFixed(1)}h`}
            style={{
              width: `${pct(s.value)}%`,
              background: s.color,
              transition: 'width 0.4s',
              flexShrink: 0,
            }}
          />
        ))}
        {/* Libre queda en fondo gris */}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {segments.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.label} <strong style={{ color: 'var(--text)' }}>{s.value.toFixed(1)}h</strong>
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: saldo < 0 ? 'var(--saturado)' : 'var(--text-muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--border)', display: 'inline-block' }} />
          Libre <strong style={{ color: saldo < 0 ? 'var(--saturado)' : 'var(--ok)' }}>{saldo.toFixed(1)}h</strong>
        </span>
      </div>
    </div>
  )
}
