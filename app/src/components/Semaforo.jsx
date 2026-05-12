const CONFIG = {
  OK:       { color: 'var(--ok)',       bg: 'rgba(106,177,135,0.12)', icon: '●', label: 'Semana OK' },
  RIESGO:   { color: 'var(--riesgo)',   bg: 'rgba(212,168,67,0.12)',  icon: '◆', label: 'En riesgo' },
  SATURADO: { color: 'var(--saturado)', bg: 'rgba(196,107,122,0.12)', icon: '▲', label: 'Saturado' },
}

export default function Semaforo({ estado }) {
  const cfg = CONFIG[estado] || CONFIG.OK
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 100,
      background: cfg.bg,
      border: `1px solid ${cfg.color}`,
    }}>
      <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
      <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13 }}>{cfg.label}</span>
    </div>
  )
}
