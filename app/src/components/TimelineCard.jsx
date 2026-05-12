export default function TimelineCard({ proyecto, fasesDelProyecto = [] }) {
  const { nombre, avance = 0, inicioCalculado, finCalculado, horasRestantes, hPorSemana, estado } = proyecto

  const pct = Math.min(100, Math.round(avance * 100))
  const hoy = new Date().toISOString().slice(0, 10)
  const atrasado = finCalculado && finCalculado < hoy && avance < 1

  return (
    <div className="card" style={{ borderLeft: `3px solid ${atrasado ? 'var(--saturado)' : 'var(--gold)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{nombre || 'Sin nombre'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {inicioCalculado} → {finCalculado || '—'}
            {atrasado && <span style={{ color: 'var(--saturado)', marginLeft: 8 }}>⚠ Atrasado</span>}
          </div>
        </div>
        <span className={`chip ${atrasado ? 'chip-saturado' : pct >= 100 ? 'chip-ok' : ''}`}>
          {pct}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="progress-bar" style={{ marginBottom: 8 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        {horasRestantes != null && (
          <span>Restantes: <strong style={{ color: 'var(--text)' }}>{horasRestantes.toFixed(0)}h</strong></span>
        )}
        {hPorSemana > 0 && (
          <span>Ritmo: <strong style={{ color: 'var(--text)' }}>{hPorSemana.toFixed(1)}h/sem</strong></span>
        )}
        {estado && (
          <span>Estado: <strong style={{ color: 'var(--text)' }}>{estado}</strong></span>
        )}
      </div>

      {/* Fases (si las hay) */}
      {fasesDelProyecto.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fases</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {fasesDelProyecto.map((f, i) => {
              const fPct = Math.min(100, Math.round((f.avance || 0) * 100))
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>↓</span>}
                  {i === 0 && <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>  </span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.nombre || `Fase ${i + 1}`}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {f.inicioCalculado} → {f.finCalculado || '—'}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 3, height: 4 }}>
                      <div className="progress-fill" style={{ width: `${fPct}%`, background: 'var(--sage)' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
