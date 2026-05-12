import { useState } from 'react'
import { useStore } from './store.js'
import Semana from './views/Semana.jsx'
import Actividades from './views/Actividades.jsx'
import Proyectos from './views/Proyectos.jsx'
import Dashboard from './views/Dashboard.jsx'
import ActivityModal from './components/ActivityModal.jsx'

const VIEWS = [
  { id:'semana',      label:'Semana',      icon:'▦' },
  { id:'actividades', label:'Actividades', icon:'≡' },
  { id:'proyectos',   label:'Proyectos',   icon:'▲' },
  { id:'resumen',     label:'Resumen',     icon:'◉' },
]

export default function App() {
  const [view, setView] = useState('semana')
  const [modalOpen, setModalOpen] = useState(false)
  const store = useStore()
  const {
    state, setConfig,
    addActividad, updateActividad, deleteActividad,
    addProyecto, updateProyecto, deleteProyecto,
    addFase, updateFase, deleteFase,
    addBloqueo, updateBloqueo, deleteBloqueo,
    reset,
  } = store

  // Semana view is full-height, no padding
  const isSemana = view === 'semana'

  function renderView() {
    switch (view) {
      case 'semana': return (
        <Semana
          state={state}
          setConfig={setConfig}
          updateActividad={updateActividad}
          updateProyecto={updateProyecto}
          addActividad={addActividad}
          addProyecto={addProyecto}
          addBloqueo={addBloqueo}
        />
      )
      case 'actividades': return (
        <Actividades
          state={state}
          addActividad={addActividad}
          updateActividad={updateActividad}
          deleteActividad={deleteActividad}
        />
      )
      case 'proyectos': return (
        <Proyectos
          state={state}
          addProyecto={addProyecto} updateProyecto={updateProyecto} deleteProyecto={deleteProyecto}
          addFase={addFase} updateFase={updateFase} deleteFase={deleteFase}
        />
      )
      case 'resumen': return (
        <Dashboard
          state={state}
          setConfig={setConfig}
          onNewActivity={() => setModalOpen(true)}
        />
      )
      default: return null
    }
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo">
          Ninja Tracker
          <span>Calculadora de tiempo</span>
        </div>

        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`nav-item${view === v.id ? ' active' : ''}`}
            onClick={() => setView(v.id)}
          >
            <span className="nav-icon">{v.icon}</span>
            {v.label}
          </button>
        ))}

        <div style={{ padding: '12px 10px 4px' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setModalOpen(true)}
          >
            + Nueva actividad
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--rose)', fontSize: 11 }}
            onClick={() => { if (confirm('¿Resetear todos los datos?')) reset() }}
          >
            Resetear
          </button>
        </div>
      </nav>

      <main className={isSemana ? 'main-content main-full' : 'main-content'}>
        {renderView()}
      </main>

      <ActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        addActividad={addActividad}
        addProyecto={addProyecto}
        addBloqueo={addBloqueo}
      />
    </div>
  )
}
