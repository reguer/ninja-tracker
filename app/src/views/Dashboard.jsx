import { useMemo, useState } from 'react'
import { calcular } from '../engine.js'
import CapacidadBar from '../components/CapacidadBar.jsx'
import WeekGrid from '../components/WeekGrid.jsx'
import { ESCENARIOS, ESCENARIO_LABEL } from '../store.js'

const BLOQUEO_LABEL = {
  vacaciones: 'Vacaciones',
  evento_social: 'Evento social',
  feriado: 'Feriado',
  personal: 'Personal',
}

export default function Dashboard({ state, setConfig, onNewActivity }) {
  const resultado = useMemo(() => calcular(state), [state])
  const { config, proyectos, bloqueos = [] } = state
  const {
    horasBase, horasBasicos, horasRecurrentes, buffer,
    capacidadNeta, horasProyectos, saldoLibre, utilizacion,
    semaforo: semaforoEstado, proyectosCalculados,
  } = resultado

  const [showConfig, setShowConfig] = useState(false)

  const pctUsado = capacidadNeta > 0 ? Math.min(100, Math.round(utilizacion * 100)) : 0
  const semaforoColor = { OK: 'var(--ok)', RIESGO: 'var(--riesgo)', SATURADO: 'var(--saturado)' }[semaforoEstado]

  const proyectosActivos = proyectosCalculados.filter(
    p => p.activo && p.escenarios?.includes(config.escenarioActivo)
  )

  const today = new Date().toISOString().slice(0, 10)
  const bloqueosPróximos = (bloqueos || [])
    .filter(b => b.activo && b.fin >= today)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .slice(0, 4)

  function diasBloqueo(b) {
    const d1 = new Date(b.inicio), d2 = new Date(b.fin)
    return Math.round((d2 - d1) / 86400000) + 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        paddingBottom: 'var(--gap)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Ninja Tracker</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Semana del {formatWeek()}</div>
        </div>

        {/* Escenario tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 3, borderRadius: 8 }}>
          {ESCENARIOS.map(esc => (
            <button
              key={esc}
              type="button"
              onClick={() => setConfig({ escenarioActivo: esc })}
              style={{
                padding: '5px 11px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                background: config.escenarioActivo === esc ? 'var(--gold)' : 'transparent',
                color: config.escenarioActivo === esc ? '#0f0f13' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {ESCENARIO_LABEL[esc]}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={onNewActivity}>
          + Nueva actividad
        </button>
      </div>

      {/* ── KPI principal ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--gap)', alignItems: 'start' }}>
        <div>
          {/* Horas libres grande */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 52, fontWeight: 900, lineHeight: 1,
              color: saldoLibre < 0 ? 'var(--saturado)' : saldoLibre < 3 ? 'var(--riesgo)' : 'var(--text)',
            }}>
              {saldoLibre.toFixed(1)}
            </span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 400 }}>h libres esta semana</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            de {capacidadNeta.toFixed(1)}h disponibles · {pctUsado}% utilizado
          </div>
          <CapacidadBar
            total={horasBase} basicos={horasBasicos}
            recurrentes={horasRecurrentes} proyectos={horasProyectos}
            buffer={buffer} saldo={saldoLibre}
          />
          {/* Mini chips debajo de la barra */}
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <Stat label="Base" value={`${horasBase.toFixed(0)}h`} />
            <Stat label="Básicos" value={`${horasBasicos.toFixed(1)}h`} color="#5b8fd4" />
            <Stat label="Recurrentes" value={`${horasRecurrentes.toFixed(1)}h`} color="#6ab187" />
            <Stat label="Proyectos" value={`${horasProyectos.toFixed(1)}h`} color="#d4a843" />
            <Stat label="Buffer" value={`${buffer.toFixed(1)}h`} color="var(--text-dim)" />
          </div>
        </div>

        {/* Semáforo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: semaforoColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#0f0f13',
            letterSpacing: '0.03em', boxShadow: `0 0 24px ${semaforoColor}55`,
          }}>
            {semaforoEstado}
          </div>
          <button
            type="button"
            onClick={() => setShowConfig(v => !v)}
            style={{
              marginTop: 8, fontSize: 10, color: 'var(--text-dim)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ⚙ ajustar
          </button>
        </div>
      </div>

      {/* Config rápida (colapsable) */}
      {showConfig && (
        <div className="card" style={{ padding: '14px var(--gap)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Parámetros base
          </div>
          <div className="form-row">
            <div className="field">
              <label>Horas despierto / día</label>
              <input type="number" className="input" min={8} max={24} step={0.5}
                value={config.horasDia}
                onChange={e => setConfig({ horasDia: parseFloat(e.target.value) || 16 })} />
            </div>
            <div className="field">
              <label>Buffer seguridad (h/día)</label>
              <input type="number" className="input" min={0} max={4} step={0.25}
                value={config.bufferSeguridad}
                onChange={e => setConfig({ bufferSeguridad: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </div>
      )}

      {/* ── Vista de semana ───────────────────────────────────── */}
      <div className="card">
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Vista semanal — escenario: {ESCENARIO_LABEL[config.escenarioActivo]}
        </div>
        <WeekGrid
          actividades={state.actividades}
          proyectos={proyectos}
          bloqueos={bloqueos}
          escenario={config.escenarioActivo}
        />
      </div>

      {/* ── Proyectos activos + Bloqueos ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>

        {/* Proyectos */}
        <div>
          <SectionTitle>Proyectos activos</SectionTitle>
          {proyectosActivos.length === 0
            ? <EmptyCard>No hay proyectos en este escenario.</EmptyCard>
            : proyectosActivos.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 'var(--gap-sm)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nombre || 'Sin nombre'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {p.finCalculado ? `Fin est. ${p.finCalculado}` : 'Sin fecha estimada'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                    {Math.round((p.avance || 0) * 100)}%
                  </div>
                </div>
                <div style={{ marginTop: 8, background: 'var(--border)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((p.avance || 0) * 100)}%`, height: '100%', background: p.colorTag || 'var(--gold)', borderRadius: 100, transition: 'width 0.3s' }} />
                </div>
                {p.finCalculado && p.finCalculado < today && (
                  <div style={{ fontSize: 10, color: 'var(--saturado)', marginTop: 4 }}>⚠ Fecha estimada vencida</div>
                )}
              </div>
            ))
          }
        </div>

        {/* Bloqueos / Eventos */}
        <div>
          <SectionTitle>Próximos eventos y bloqueos</SectionTitle>
          {bloqueosPróximos.length === 0
            ? <EmptyCard>Sin eventos próximos.<br /><span style={{ fontSize: 11 }}>Agrega vacaciones, feriados o eventos.</span></EmptyCard>
            : bloqueosPróximos.map(b => (
              <div key={b.id} className="card" style={{ marginBottom: 'var(--gap-sm)', padding: '12px 14px', borderLeft: '3px solid var(--rose)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{b.nombre || 'Sin nombre'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {BLOQUEO_LABEL[b.tipo] || b.tipo} · {b.inicio} → {b.fin} · {diasBloqueo(b)} días
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {color && <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />}
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
      marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {children}
    </div>
  )
}

function EmptyCard({ children }) {
  return (
    <div className="card" style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '20px 16px' }}>
      {children}
    </div>
  )
}

function formatWeek() {
  const d = new Date()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return monday.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
