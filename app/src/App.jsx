import { useState } from 'react'
import { useStore } from './store.js'
import Semana from './views/Semana.jsx'
import Actividades from './views/Actividades.jsx'
import Proyectos from './views/Proyectos.jsx'
import Dashboard from './views/Dashboard.jsx'
import Mes from './views/Mes.jsx'
import Año from './views/Año.jsx'
import ActivityModal from './components/ActivityModal.jsx'

const STORAGE_KEY = 'ninja_tracker_v2'

const VIEWS = [
  { id: 'semana',      label: 'Semana',      icon: '▦' },
  { id: 'mes',         label: 'Mes',         icon: '▣' },
  { id: 'año',         label: 'Año',         icon: '◈' },
  { id: 'actividades', label: 'Actividades', icon: '≡' },
  { id: 'proyectos',   label: 'Proyectos',   icon: '▲' },
  { id: 'resumen',     label: 'Resumen',     icon: '◉' },
]

function exportData() {
  const raw = localStorage.getItem(STORAGE_KEY) || '{}'
  const blob = new Blob([raw], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ninja-tracker-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(callback) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = async e => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      JSON.parse(text) // validate
      localStorage.setItem(STORAGE_KEY, text)
      callback?.()
      window.location.reload()
    } catch {
      alert('Archivo inválido. Asegúrate de importar un JSON exportado por Ninja Tracker.')
    }
  }
  input.click()
}

export default function App() {
  const [view, setView] = useState('semana')
  const [modalOpen, setModalOpen] = useState(false)
  const [hiddenCats, setHiddenCats] = useState(new Set())

  const store = useStore()
  const {
    state, setConfig,
    addActividad, updateActividad, deleteActividad,
    addProyecto, updateProyecto, deleteProyecto,
    addFase, updateFase, deleteFase,
    addBloqueo, updateBloqueo, deleteBloqueo,
    reset,
  } = store

  function toggleFilter(catId) {
    setHiddenCats(prev => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  const isFullHeight = view === 'semana' || view === 'mes' || view === 'año'

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
          hiddenCats={hiddenCats}
          onToggleFilter={toggleFilter}
        />
      )
      case 'mes': return (
        <Mes
          state={state}
          hiddenCats={hiddenCats}
          onToggleFilter={toggleFilter}
        />
      )
      case 'año': return (
        <Año
          state={state}
          hiddenCats={hiddenCats}
          onToggleFilter={toggleFilter}
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

        {/* Export / Import */}
        <div style={{ padding: '6px 10px', display: 'flex', gap: 4 }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}
            onClick={exportData}
            title="Exportar datos como JSON"
          >
            ↓ Exportar
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}
            onClick={() => importData()}
            title="Importar datos desde JSON"
          >
            ↑ Importar
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

      <main className={isFullHeight ? 'main-content main-full' : 'main-content'}>
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
