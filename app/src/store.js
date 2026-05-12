import { useReducer, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ninja_tracker_v2'

export const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
export const DIAS_LABEL = { lunes:'Lu',martes:'Ma',miercoles:'Mi',jueves:'Ju',viernes:'Vi',sabado:'Sá',domingo:'Do' }
export const ESCENARIOS = ['base','vacaciones','pico','bloqueo_parcial']
export const ESCENARIO_LABEL = { base:'Base', vacaciones:'Vacaciones', pico:'Pico', bloqueo_parcial:'Parcial' }

export const CATEGORIAS = [
  { id:'basico',    label:'Básicos',     color:'#5b8fd4', icon:'■' },
  { id:'habito',    label:'Hábitos',     color:'#6ab187', icon:'◆' },
  { id:'diversion', label:'Diversiones', color:'#c46b7a', icon:'◉' },
  { id:'estudio',   label:'Estudio',     color:'#9b8fd4', icon:'▲' },
  { id:'no_hacer',  label:'No hacer',    color:'#d4843a', icon:'✕' },
]

const LV = ['lunes','martes','miercoles','jueves','viernes']

function act(id, nombre, categoria, colorTag, franjas, escenarios=['base','pico'], tipo='recurrente', extra={}) {
  return { id, nombre, categoria, tipo, colorTag, franjas, escenarios, activo:true, subtareas:[], notas:'', ...extra }
}

const DEFAULT_ACTIVIDADES = [
  // ── BÁSICOS ──────────────────────────────────────────────────
  act('DEF-b1','Sueño','basico','#5b8fd4',
    DIAS.map(d => ({ dia:d, inicio:'00:00', fin:'07:00' })),
    ['base','vacaciones','pico','bloqueo_parcial'],'basico'),
  act('DEF-b2','Comidas e higiene','basico','#5b8fd4',
    DIAS.flatMap(d => [
      { dia:d, inicio:'07:00', fin:'07:30' },
      { dia:d, inicio:'13:00', fin:'13:30' },
      { dia:d, inicio:'19:30', fin:'20:00' },
    ]),
    ['base','vacaciones','pico','bloqueo_parcial'],'basico'),
  // ── HÁBITOS ──────────────────────────────────────────────────
  act('DEF-h1','Trabajo','habito','#d4a843',
    LV.flatMap(d => [{ dia:d, inicio:'08:00', fin:'12:00' },{ dia:d, inicio:'14:00', fin:'18:00' }])),
  act('DEF-h2','Meditar','habito','#9b8fd4',
    DIAS.map(d => ({ dia:d, inicio:'07:30', fin:'08:10' })),
    ['base','vacaciones','pico','bloqueo_parcial']),
  act('DEF-h3','Jiujitsu','habito','#c46b7a',
    ['lunes','miercoles','jueves'].map(d => ({ dia:d, inicio:'19:00', fin:'21:00' }))),
  act('DEF-h4','Muay Thai / MMA','habito','#c46b7a',
    [{ dia:'martes', inicio:'19:00', fin:'21:00' }]),
  act('DEF-h5','Fuerza y Calistenia','habito','#6ab187',
    ['martes','jueves','viernes'].map(d => ({ dia:d, inicio:'07:00', fin:'08:00' }))),
  act('DEF-h6','Movilidad / Estirar','habito','#6ab187',
    ['lunes','miercoles','domingo'].map(d => ({ dia:d, inicio:'08:00', fin:'08:30' }))),
  act('DEF-h7','Yoga / Hipopresivos','habito','#6ab187',
    [{ dia:'martes', inicio:'08:00', fin:'08:45' }]),
  act('DEF-h8','Nadar','habito','#5b8fd4',
    ['lunes','miercoles','viernes','sabado'].map(d => ({ dia:d, inicio:'07:00', fin:'08:00' }))),
  act('DEF-h9','Leer','habito','#9b8fd4',
    ['martes','miercoles','jueves','domingo'].map(d => ({ dia:d, inicio:'21:00', fin:'22:00' })),
    ['base','vacaciones','pico','bloqueo_parcial']),
  act('DEF-h10','Buena alimentación','habito','#6ab187',[],['base','pico']),
  act('DEF-h11','Auto observación','habito','#9b8fd4',[],['base','vacaciones','pico','bloqueo_parcial']),
  // ── DIVERSIONES ───────────────────────────────────────────────
  act('DEF-d1','Longboard','diversion','#d4843a',
    ['miercoles','viernes','domingo'].map(d => ({ dia:d, inicio:'17:00', fin:'17:30' })),['base','vacaciones']),
  act('DEF-d2','Piano','diversion','#c46b7a',
    ['miercoles','domingo'].map(d => ({ dia:d, inicio:'20:00', fin:'21:00' })),['base','vacaciones']),
  act('DEF-d3','Ilustración / Animación','diversion','#c46b7a',
    ['martes','sabado'].map(d => ({ dia:d, inicio:'20:00', fin:'22:00' })),['base','vacaciones']),
  act('DEF-d4','Hiking','diversion','#6ab187',
    [{ dia:'sabado', inicio:'08:00', fin:'11:00' }],['base','vacaciones']),
  act('DEF-d5','Show Standup','diversion','#d4843a',
    [{ dia:'sabado', inicio:'20:00', fin:'22:00' }],['base']),
  act('DEF-d6','Acrobacia','diversion','#c46b7a',[],['base']),
  // ── ESTUDIO ───────────────────────────────────────────────────
  act('DEF-e1','Aprender programación','estudio','#5b8fd4',[]),
  act('DEF-e2','Aprender Blender','estudio','#5b8fd4',
    ['martes','miercoles','jueves'].map(d => ({ dia:d, inicio:'22:00', fin:'23:00' }))),
  act('DEF-e3','Finanzas e inversiones','estudio','#d4a843',[],['base','pico']),
  act('DEF-e4','Mkt y Copywriting','estudio','#d4843a',[]),
  // ── NO HACER ──────────────────────────────────────────────────
  act('DEF-n1','No fumar','no_hacer','#d4843a',[],['base','vacaciones','pico','bloqueo_parcial'],'no_hacer'),
  act('DEF-n2','Sin bebidas energéticas','no_hacer','#d4843a',[],['base','pico'],'no_hacer'),
  act('DEF-n3','Sin alcohol','no_hacer','#c46b7a',[],['base','pico'],'no_hacer'),
  act('DEF-n4','Sin TV/Redes excesivas','no_hacer','#d4843a',[],['base','pico'],'no_hacer'),
]

const DEFAULT_PROYECTOS = [
  { id:'DEF-p1',nombre:'Paisare y mejoras',   estado:'en_progreso', horasTotalesEstimadas:200, avance:0.3,  inicio:'2026-01-01', finFijo:null, colorTag:'#d4a843', franjas:[], escenarios:['base','pico'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p2',nombre:'Trading - Inversiones', estado:'en_progreso', horasTotalesEstimadas:100, avance:0.4, inicio:'2026-01-01', finFijo:null, colorTag:'#6ab187', franjas:[], escenarios:['base','pico'], dependeDe:null, activo:true, subtareas:[], notas:'Cumplir reto semanal'},
  { id:'DEF-p3',nombre:'App Construcción',    estado:'en_progreso', horasTotalesEstimadas:300, avance:0.1,  inicio:'2026-01-01', finFijo:null, colorTag:'#5b8fd4', franjas:[], escenarios:['base','pico'], dependeDe:null, activo:true, subtareas:[], notas:'Apps para Paisare'},
  { id:'DEF-p4',nombre:'App Parke',           estado:'no_iniciado', horasTotalesEstimadas:400, avance:0,    inicio:'2026-04-01', finFijo:'2026-08-01', colorTag:'#9b8fd4', franjas:[], escenarios:['base'], dependeDe:'DEF-p3', activo:true, subtareas:[], notas:''},
  { id:'DEF-p5',nombre:'Atemporal',           estado:'no_iniciado', horasTotalesEstimadas:200, avance:0,    inicio:'2026-05-01', finFijo:'2026-07-04', colorTag:'#c46b7a', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p6',nombre:'Cabañas',             estado:'no_iniciado', horasTotalesEstimadas:150, avance:0,    inicio:'2026-03-01', finFijo:'2026-05-30', colorTag:'#d4843a', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p7',nombre:'App Jiujitsu / OpenMate', estado:'no_iniciado', horasTotalesEstimadas:300, avance:0, inicio:'2025-12-01', finFijo:'2026-02-16', colorTag:'#5b8fd4', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p8',nombre:'Torneo Jiujitsu',     estado:'no_iniciado', horasTotalesEstimadas:50,  avance:0,    inicio:'2026-01-01', finFijo:'2026-03-16', colorTag:'#c46b7a', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p9',nombre:'Festival anual',      estado:'no_iniciado', horasTotalesEstimadas:100, avance:0,    inicio:'2026-01-01', finFijo:'2026-04-04', colorTag:'#d4a843', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p10',nombre:'Vivero el Quelite',  estado:'en_progreso', horasTotalesEstimadas:80,  avance:0.2,  inicio:'2025-10-01', finFijo:null, colorTag:'#6ab187', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
  { id:'DEF-p11',nombre:'Venta en línea (plantas)',estado:'no_iniciado',horasTotalesEstimadas:120,avance:0,  inicio:'2025-11-01', finFijo:null, colorTag:'#6ab187', franjas:[], escenarios:['base'], dependeDe:'DEF-p10', activo:true, subtareas:[], notas:'Macetas, fertilizantes, pesticidas orgánicos'},
  { id:'DEF-p12',nombre:'Cursos en línea',    estado:'no_iniciado', horasTotalesEstimadas:60,  avance:0,    inicio:'2025-11-01', finFijo:null, colorTag:'#9b8fd4', franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:''},
]

const DEFAULT_STATE = {
  config: { horasDia:17, bufferSeguridad:0.5, escenarioActivo:'base' },
  actividades: DEFAULT_ACTIVIDADES,
  proyectos: DEFAULT_PROYECTOS,
  fases: [],
  bloqueos: [
    { id:'DEF-blq1', nombre:'Vacaciones Japón 2026', tipo:'vacaciones', inicio:'2026-03-28', fin:'2026-04-12', activo:true },
  ],
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const saved = JSON.parse(raw)
    return { ...DEFAULT_STATE, ...saved, bloqueos: saved.bloqueos || [] }
  } catch { return DEFAULT_STATE }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

let _id = Date.now()
function genId(p) { return `${p}-${++_id}` }

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONFIG': return { ...state, config: { ...state.config, ...action.payload } }

    case 'ADD_ACTIVIDAD': return {
      ...state, actividades: [...state.actividades, {
        id:genId('ACT'), nombre:'', categoria:'habito', tipo:'recurrente',
        colorTag:'#6ab187', franjas:[], escenarios:['base'], activo:true, subtareas:[], notas:'',
        ...action.payload,
      }]
    }
    case 'UPDATE_ACTIVIDAD': return { ...state, actividades: state.actividades.map(a => a.id===action.id ? {...a,...action.payload} : a) }
    case 'DELETE_ACTIVIDAD': return { ...state, actividades: state.actividades.filter(a => a.id!==action.id) }

    case 'ADD_PROYECTO': return {
      ...state, proyectos: [...state.proyectos, {
        id:genId('PRJ'), nombre:'', estado:'no_iniciado', horasTotalesEstimadas:0, avance:0,
        inicio:new Date().toISOString().slice(0,10), finFijo:null, colorTag:'#d4a843',
        franjas:[], escenarios:['base'], dependeDe:null, activo:true, subtareas:[], notas:'',
        ...action.payload,
      }]
    }
    case 'UPDATE_PROYECTO': return { ...state, proyectos: state.proyectos.map(p => p.id===action.id ? {...p,...action.payload} : p) }
    case 'DELETE_PROYECTO': return { ...state, proyectos: state.proyectos.filter(p=>p.id!==action.id), fases: state.fases.filter(f=>f.proyectoId!==action.id) }

    case 'ADD_FASE': return {
      ...state, fases: [...state.fases, {
        id:genId('FAS'), proyectoId:action.proyectoId, nombre:'', horasEstimadas:0,
        franjas:[], dependeDe:null, finFijo:null, ...action.payload,
      }]
    }
    case 'UPDATE_FASE': return { ...state, fases: state.fases.map(f => f.id===action.id ? {...f,...action.payload} : f) }
    case 'DELETE_FASE': return { ...state, fases: state.fases.filter(f=>f.id!==action.id) }

    case 'ADD_BLOQUEO': return {
      ...state, bloqueos: [...(state.bloqueos||[]), {
        id:genId('BLQ'), nombre:'', tipo:'vacaciones',
        inicio:new Date().toISOString().slice(0,10), fin:new Date().toISOString().slice(0,10), activo:true,
        ...action.payload,
      }]
    }
    case 'UPDATE_BLOQUEO': return { ...state, bloqueos: (state.bloqueos||[]).map(b => b.id===action.id ? {...b,...action.payload} : b) }
    case 'DELETE_BLOQUEO': return { ...state, bloqueos: (state.bloqueos||[]).filter(b=>b.id!==action.id) }

    case 'RESET': return DEFAULT_STATE
    default: return state
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => { saveState(state) }, [state])

  return {
    state,
    setConfig:       useCallback(p => dispatch({type:'SET_CONFIG',payload:p}), []),
    addActividad:    useCallback(p => dispatch({type:'ADD_ACTIVIDAD',payload:p}), []),
    updateActividad: useCallback((id,p) => dispatch({type:'UPDATE_ACTIVIDAD',id,payload:p}), []),
    deleteActividad: useCallback(id => dispatch({type:'DELETE_ACTIVIDAD',id}), []),
    addProyecto:     useCallback(p => dispatch({type:'ADD_PROYECTO',payload:p}), []),
    updateProyecto:  useCallback((id,p) => dispatch({type:'UPDATE_PROYECTO',id,payload:p}), []),
    deleteProyecto:  useCallback(id => dispatch({type:'DELETE_PROYECTO',id}), []),
    addFase:         useCallback((pid,p) => dispatch({type:'ADD_FASE',proyectoId:pid,payload:p}), []),
    updateFase:      useCallback((id,p) => dispatch({type:'UPDATE_FASE',id,payload:p}), []),
    deleteFase:      useCallback(id => dispatch({type:'DELETE_FASE',id}), []),
    addBloqueo:      useCallback(p => dispatch({type:'ADD_BLOQUEO',payload:p}), []),
    updateBloqueo:   useCallback((id,p) => dispatch({type:'UPDATE_BLOQUEO',id,payload:p}), []),
    deleteBloqueo:   useCallback(id => dispatch({type:'DELETE_BLOQUEO',id}), []),
    reset:           useCallback(() => dispatch({type:'RESET'}), []),
  }
}
