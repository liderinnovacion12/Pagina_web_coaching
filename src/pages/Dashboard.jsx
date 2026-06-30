import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import Sidebar from '../components/layout/Sidebar'
import CoachMap from '../components/map/CoachMap'
import useStore from '../store/useStore'
import useTranslation from '../hooks/useTranslation'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PROGRESS = [
  { month: 'Ene', completions: 12, sessions: 34, users: 210 },
  { month: 'Feb', completions: 19, sessions: 41, users: 285 },
  { month: 'Mar', completions: 15, sessions: 38, users: 320 },
  { month: 'Abr', completions: 28, sessions: 52, users: 410 },
  { month: 'May', completions: 35, sessions: 67, users: 580 },
  { month: 'Jun', completions: 42, sessions: 78, users: 847 },
]

const MOCK_RETENTION = [
  { week: 'Sem 1', c1: 100, c2: 95, c3: 88 },
  { week: 'Sem 2', c1: 82,  c2: 78, c3: 70 },
  { week: 'Sem 3', c1: 71,  c2: 65, c3: 55 },
  { week: 'Sem 4', c1: 64,  c2: 58, c3: 47 },
]

const MOCK_RATINGS = [
  { title: 'Fundamentos Liderazgo',    rating: 4.8, reviews: 234 },
  { title: 'Comunicación Efectiva',    rating: 4.6, reviews: 187 },
  { title: 'Gestión del Cambio',       rating: 4.4, reviews: 156 },
  { title: 'Inteligencia Emocional',   rating: 4.9, reviews: 312 },
  { title: 'Equipos Alto Rendimiento', rating: 4.7, reviews: 198 },
  { title: 'Visión Estratégica',       rating: 4.5, reviews: 143 },
]

const MOCK_COMMENTS = [
  { id:1, user:'María G.',  avatar:'MG', text:'El módulo de liderazgo cambió mi perspectiva completamente. Increíble.', time:'hace 5 min',  likes:24, color:'#0EA5E9' },
  { id:2, user:'Carlos P.', avatar:'CP', text:'Los ejercicios prácticos son lo mejor. Muy aplicables al día a día.',   time:'hace 12 min', likes:18, color:'#C9A84C' },
  { id:3, user:'Ana M.',    avatar:'AM', text:'¿Podrían agregar más videos de gestión de equipos remotos?',             time:'hace 28 min', likes:31, color:'#8B5CF6' },
  { id:4, user:'Luis H.',   avatar:'LH', text:'El coach fue muy puntual y profesional. Lo recomiendo totalmente.',      time:'hace 1h',     likes:15, color:'#10B981' },
  { id:5, user:'Sofia R.',  avatar:'SR', text:'La plataforma es muy intuitiva. Los mapas de progreso me ayudan mucho.', time:'hace 2h',     likes:42, color:'#F97316' },
]

const MOCK_HELP = [
  { topic: 'Técnico',   count: 23, color: '#0EA5E9' },
  { topic: 'Contenido', count: 18, color: '#C9A84C' },
  { topic: 'Acceso',    count: 12, color: '#8B5CF6' },
  { topic: 'Coach',     count: 8,  color: '#10B981' },
  { topic: 'Otro',      count: 5,  color: '#5A6070' },
]

const MOCK_COACHES = [
  { rank:1, name:'Ana García',   initials:'AG', specialty:'Liderazgo Ejecutivo', sessions:124, rating:4.9, status:'available',  color:'#C9A84C' },
  { rank:2, name:'Carlos Ruiz',  initials:'CR', specialty:'Comunicación',        sessions:98,  rating:4.8, status:'in-session', color:'#0EA5E9' },
  { rank:3, name:'María López',  initials:'ML', specialty:'Gestión del Cambio',  sessions:87,  rating:4.7, status:'available',  color:'#8B5CF6' },
  { rank:4, name:'John Smith',   initials:'JS', specialty:'Team Performance',    sessions:76,  rating:4.6, status:'in-session', color:'#10B981' },
  { rank:5, name:'Laura Torres', initials:'LT', specialty:'Estrategia',          sessions:65,  rating:4.5, status:'available',  color:'#F97316' },
]

const MOCK_VIDEOS_INIT = [
  { id:'1', title_es:'Fundamentos del Liderazgo',     category:'Liderazgo',    views:1240, rating:4.8, progress:73, isNew:false, color:'from-blue-600 to-blue-900' },
  { id:'2', title_es:'Comunicación Efectiva',         category:'Comunicación', views:987,  rating:4.6, progress:58, isNew:false, color:'from-violet-600 to-violet-900' },
  { id:'3', title_es:'Gestión del Cambio',            category:'Gestión',      views:754,  rating:4.4, progress:45, isNew:false, color:'from-emerald-600 to-emerald-900' },
  { id:'4', title_es:'Inteligencia Emocional',        category:'Desarrollo',   views:1560, rating:4.9, progress:82, isNew:false, color:'from-orange-600 to-orange-900' },
  { id:'5', title_es:'Equipos de Alto Rendimiento',   category:'Liderazgo',    views:1120, rating:4.7, progress:67, isNew:true,  color:'from-cyan-600 to-cyan-900' },
  { id:'6', title_es:'Visión Estratégica',            category:'Estrategia',   views:890,  rating:4.5, progress:54, isNew:true,  color:'from-pink-600 to-pink-900' },
  { id:'7', title_es:'Negociación Avanzada',          category:'Negociación',  views:678,  rating:4.6, progress:38, isNew:true,  color:'from-amber-600 to-amber-900' },
  { id:'8', title_es:'Mindfulness Ejecutivo',         category:'Bienestar',    views:543,  rating:4.8, progress:29, isNew:true,  color:'from-teal-600 to-teal-900' },
  { id:'9', title_es:'Presentaciones de Impacto',     category:'Comunicación', views:432,  rating:4.5, progress:21, isNew:true,  color:'from-indigo-600 to-indigo-900' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function CircleProgress({ value, size = 80, stroke = 6, color = '#0EA5E9' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
      />
    </svg>
  )
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#C9A84C' : 'rgba(90,96,112,0.4)'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-xs ml-1 font-jetbrains" style={{color:'#5A6070'}}>{rating}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-4 py-3 text-sm">
      <p className="font-jetbrains text-xs mb-2" style={{color:'#5A6070'}}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium text-xs">
          {p.name}: <span className="font-jetbrains">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// Live Status Bar
function LiveStatusBar() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const fmt = time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <div className="sticky top-0 z-30" style={{
      background: 'rgba(8,10,15,0.92)',
      borderBottom: '1px solid rgba(14,165,233,0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: live badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full live-dot" style={{background:'#10B981'}} />
            <span className="text-xs font-jetbrains font-medium" style={{color:'#10B981'}}>LIVE</span>
          </div>
          <span className="font-jetbrains text-xs hidden sm:block" style={{color:'rgba(14,165,233,0.7)'}}>{fmt}</span>
        </div>
        {/* Right: quick stats — abbreviated on mobile */}
        <div className="flex items-center gap-3">
          {[
            { label:'activos', value:'23', color:'#0EA5E9' },
            { label:'sesiones', value:'8', color:'#8B5CF6' },
            { label:'coaches', value:'3', color:'#10B981' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <span className="font-jetbrains font-bold text-xs" style={{color:s.color}}>{s.value}</span>
              <span className="text-xs font-jetbrains hidden sm:block" style={{color:'#5A6070'}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Bento KPI Cell
function BentoKpi({ label, value, sub, colSpan = 1, color = '#0EA5E9', children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.45, delay, ease:[0.4,0,0.2,1] }}
      className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 relative overflow-hidden"
      style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined, border: `1px solid ${color}22` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(90deg, ${color}, transparent)`}} />
      <p className="text-[10px] md:text-xs font-jetbrains uppercase tracking-widest mb-2 md:mb-3" style={{color:'#5A6070'}}>{label}</p>
      {children || (
        <>
          <p className="font-syne text-xl md:text-3xl font-black mb-1" style={{color:'#E8EAF0', textShadow:`0 0 20px ${color}66`}}>{value}</p>
          {sub && <p className="text-[10px] md:text-xs font-jetbrains" style={{color}}>{sub}</p>}
        </>
      )}
    </motion.div>
  )
}

// Analytics Tab Panel
const TABS = ['Actividad','Retención','Calificaciones','Comentarios','Ayuda']

function AnalyticsPanel() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Tab nav — scrollable on mobile */}
      <div className="flex gap-1 p-3 border-b overflow-x-auto scrollbar-hide" style={{borderColor:'rgba(14,165,233,0.1)', background:'rgba(8,10,15,0.5)', WebkitOverflowScrolling:'touch'}}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className="px-3 py-1.5 rounded-lg text-xs font-jetbrains font-medium transition-all flex-shrink-0"
            style={{
              background: activeTab === i ? '#0EA5E9' : 'transparent',
              color: activeTab === i ? '#080A0F' : '#5A6070',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="act" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MOCK_PROGRESS} margin={{top:4,right:4,bottom:0,left:-20}}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="goldGradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(28,31,40,0.8)" strokeDasharray="3 3"/>
                  <XAxis dataKey="month" tick={{fill:'#5A6070',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#5A6070',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="sessions" name="Sesiones" stroke="#0EA5E9" strokeWidth={2} fill="url(#blueGrad)" dot={false} activeDot={{r:5,fill:'#0EA5E9',strokeWidth:0}}/>
                  <Area type="monotone" dataKey="completions" name="Completados" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGradA)" dot={false} activeDot={{r:5,fill:'#C9A84C',strokeWidth:0}}/>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
          {activeTab === 1 && (
            <motion.div key="ret" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_RETENTION} margin={{top:4,right:4,bottom:0,left:-20}}>
                  <CartesianGrid stroke="rgba(28,31,40,0.8)" strokeDasharray="3 3"/>
                  <XAxis dataKey="week" tick={{fill:'#5A6070',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#5A6070',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="c1" name="Cohort 1" fill="#0EA5E9" radius={[4,4,0,0]}/>
                  <Bar dataKey="c2" name="Cohort 2" fill="#8B5CF6" radius={[4,4,0,0]}/>
                  <Bar dataKey="c3" name="Cohort 3" fill="#06B6D4" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
          {activeTab === 2 && (
            <motion.div key="rat" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}} className="space-y-3">
              {MOCK_RATINGS.map((r) => (
                <div key={r.title} className="flex items-center gap-3">
                  <p className="text-xs font-jetbrains w-44 truncate" style={{color:'#E8EAF0'}}>{r.title}</p>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                    <div className="h-full rounded-full" style={{width:`${(r.rating/5)*100}%`, background:'linear-gradient(90deg,#0EA5E9,#8B5CF6)'}}/>
                  </div>
                  <div className="flex items-center gap-1 w-16">
                    <Stars rating={r.rating}/>
                  </div>
                  <span className="text-xs font-jetbrains w-12 text-right" style={{color:'#5A6070'}}>{r.reviews} reseñas</span>
                </div>
              ))}
            </motion.div>
          )}
          {activeTab === 3 && (
            <motion.div key="com" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}} className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {MOCK_COMMENTS.map((c) => (
                <div key={c.id} className="flex gap-3 p-3 rounded-xl" style={{background:'rgba(28,31,40,0.5)', border:'1px solid rgba(255,255,255,0.04)'}}>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-jetbrains font-bold" style={{background:`${c.color}22`, color:c.color, border:`1px solid ${c.color}44`}}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium" style={{color:'#E8EAF0'}}>{c.user}</p>
                      <span className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{c.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{color:'#A8C4D4'}}>{c.text}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5A6070" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      <span className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{c.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {activeTab === 4 && (
            <motion.div key="help" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_HELP} layout="vertical" margin={{top:4,right:20,bottom:0,left:10}}>
                  <XAxis type="number" tick={{fill:'#5A6070',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="topic" type="category" tick={{fill:'#E8EAF0',fontSize:11,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false} width={70}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" name="Solicitudes" radius={[0,4,4,0]}>
                    {MOCK_HELP.map((entry) => <Cell key={entry.topic} fill={entry.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Video Card (admin style)
const CAT_COLORS = {
  'Liderazgo':    '#0EA5E9',
  'Comunicación': '#8B5CF6',
  'Gestión':      '#10B981',
  'Desarrollo':   '#F97316',
  'Estrategia':   '#C9A84C',
  'Negociación':  '#06B6D4',
  'Bienestar':    '#EC4899',
}

function VideoCard({ v, onEdit, onDelete }) {
  const catColor = CAT_COLORS[v.category] || '#5A6070'
  return (
    <motion.div
      initial={{opacity:0,scale:0.95}}
      animate={{opacity:1,scale:1}}
      exit={{opacity:0,scale:0.9}}
      transition={{duration:0.3}}
      className="glass-card rounded-xl overflow-hidden relative"
      style={{border:`1px solid ${catColor}22`}}
    >
      {/* Thumbnail */}
      <div className={`h-24 bg-gradient-to-br ${v.color} relative flex items-center justify-center`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        {v.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-jetbrains font-bold" style={{background:'#06B6D4', color:'#080A0F'}}>NUEVO</span>
        )}
        <div className="absolute bottom-2 right-2">
          <Stars rating={v.rating}/>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="px-2 py-0.5 rounded text-xs font-jetbrains" style={{background:`${catColor}22`, color:catColor}}>{v.category}</span>
          <span className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{(v.views/1000).toFixed(1)}k vistas</span>
        </div>
        <p className="text-sm font-medium mb-2 leading-snug" style={{color:'#E8EAF0'}}>{v.title_es}</p>
        <div className="mb-3">
          <div className="flex justify-between text-xs font-jetbrains mb-1" style={{color:'#5A6070'}}>
            <span>Completado</span><span>{v.progress}%</span>
          </div>
          <div className="h-1 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
            <div className="h-full rounded-full" style={{width:`${v.progress}%`, background:`linear-gradient(90deg, ${catColor}, ${catColor}88)`}}/>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(v)} className="flex-1 py-1.5 rounded-lg text-xs font-medium" style={{background:`${catColor}15`, border:`1px solid ${catColor}33`, color:catColor}}>
            Editar
          </button>
          <button onClick={() => onDelete(v.id)} className="flex-1 py-1.5 rounded-lg text-xs font-medium" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444'}}>
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Coach Leaderboard Row
function CoachRow({ c }) {
  const maxSessions = 124
  return (
    <div className="flex items-center gap-3 py-2.5 border-b" style={{borderColor:'rgba(28,31,40,0.6)'}}>
      <span className="w-6 text-center font-jetbrains font-bold text-sm" style={{color: c.rank === 1 ? '#C9A84C' : '#5A6070'}}>#{c.rank}</span>
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-jetbrains font-bold" style={{background:`${c.color}22`, color:c.color, border:`1px solid ${c.color}44`}}>
        {c.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{color:'#E8EAF0'}}>{c.name}</p>
        <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{c.specialty}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1 rounded-full flex-1" style={{background:'rgba(255,255,255,0.06)'}}>
            <div className="h-full rounded-full" style={{width:`${(c.sessions/maxSessions)*100}%`, background:c.color}}/>
          </div>
          <span className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{c.sessions}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Stars rating={c.rating}/>
        <span className="text-xs px-2 py-0.5 rounded-full font-jetbrains" style={{
          background: c.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(14,165,233,0.15)',
          color:       c.status === 'available' ? '#10B981' : '#0EA5E9',
          border:     `1px solid ${c.status === 'available' ? 'rgba(16,185,129,0.3)' : 'rgba(14,165,233,0.3)'}`,
        }}>
          {c.status === 'available' ? 'Disponible' : 'En sesión'}
        </span>
      </div>
    </div>
  )
}

// Video Edit Modal
function VideoModal({ video, onClose, onSave }) {
  const [form, setForm] = useState({
    title_es: video?.title_es || '',
    category: video?.category || '',
  })
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))
  const inputStyle = {background:'rgba(8,10,15,0.8)', border:'1px solid rgba(14,165,233,0.2)', color:'#E8EAF0', fontFamily:'Inter,sans-serif', borderRadius:10, padding:'8px 12px', width:'100%', fontSize:14}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.94,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94}} className="glass-card rounded-2xl p-6 w-full max-w-sm" style={{border:'1px solid rgba(14,165,233,0.2)'}}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-syne text-lg" style={{color:'#E8EAF0'}}>{video ? 'Editar Video' : 'Agregar Video'}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'rgba(14,165,233,0.08)', color:'#5A6070'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="space-y-4">
          {[{k:'title_es',l:'Título'},{k:'category',l:'Categoría'}].map(({k,l}) => (
            <div key={k}>
              <label className="block text-xs font-jetbrains uppercase tracking-wider mb-1.5" style={{color:'#5A6070'}}>{l}</label>
              <input value={form[k]} onChange={set(k)} style={inputStyle}/>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.15)', color:'#5A6070'}}>Cancelar</button>
          <button onClick={() => onSave({...video, ...form})} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)', color:'#080A0F'}}>Guardar</button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile } = useStore()
  const { t, lang } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const [videos, setVideos] = useState(MOCK_VIDEOS_INIT)
  const [editingVideo, setEditingVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin'

  const handleLogout = async () => { await signOut(); navigate('/') }

  const handleSaveVideo = (updated) => {
    if (updated.id) {
      setVideos(v => v.map(x => x.id === updated.id ? {...x, ...updated} : x))
    } else {
      setVideos(v => [...v, { ...updated, id: String(Date.now()), views:0, rating:0, progress:0, isNew:true, color:'from-blue-600 to-blue-900' }])
    }
    setShowVideoModal(false)
    setEditingVideo(null)
  }

  const handleDeleteVideo = (id) => {
    if (window.confirm('¿Eliminar este video?')) setVideos(v => v.filter(x => x.id !== id))
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080A0F' }}>
      <div className="aurora-bg">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
        <div className="scan-line" />
      </div>

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {/* Live Status Bar */}
        <LiveStatusBar />

        {/* Topbar */}
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b gap-3" style={{borderColor:'rgba(28,31,40,0.5)', background:'rgba(8,10,15,0.5)'}}>
          <div className="min-w-0">
            <h1 className="font-syne text-base md:text-lg truncate" style={{color:'#E8EAF0'}}>
              <span className="hidden sm:inline">Misión Control — </span><span style={{color:'#0EA5E9'}}>Panel Gerencial</span>
            </h1>
            <p className="text-xs font-jetbrains mt-0.5" style={{color:'#5A6070'}}>
              Bienvenido, <span style={{color:'#C9A84C'}}>{firstName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button aria-label="Notificaciones" className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-xl text-xs md:text-sm font-medium" style={{background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.2)', color:'#0EA5E9'}}>
              {t('common.logout')}
            </button>
          </div>
        </div>

        <div className="p-3 md:p-6 space-y-6 md:space-y-8 max-w-[1600px] mx-auto w-full pb-20 md:pb-16">

          {/* ── SECTION 1: Bento KPI Grid ── */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" style={{gridAutoRows:'auto'}}>
              {/* Large: Usuarios Activos (2 cols) */}
              <div className="col-span-2">
                <BentoKpi label="Usuarios Activos" color="#0EA5E9" delay={0}>
                  <div className="flex items-end gap-4">
                    <p className="font-syne text-2xl md:text-4xl font-black" style={{color:'#E8EAF0', textShadow:'0 0 20px rgba(14,165,233,0.5)'}}>847</p>
                    <div className="pb-1">
                      <p className="text-xs font-jetbrains" style={{color:'#10B981'}}>▲ +12% este mes</p>
                      <p className="text-xs font-jetbrains mt-0.5" style={{color:'#5A6070'}}>vs. 756 prev</p>
                    </div>
                  </div>
                  <div className="mt-3 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_PROGRESS} margin={{top:2,right:0,bottom:0,left:0}}>
                        <defs>
                          <linearGradient id="sparkBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="users" stroke="#0EA5E9" strokeWidth={1.5} fill="url(#sparkBlue)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </BentoKpi>
              </div>

              {/* Horas contenido */}
              <BentoKpi label="Horas de Contenido" value="1,240h" sub="+48h esta semana" color="#C9A84C" delay={0.06}/>

              {/* Tasa completación — with ring */}
              <BentoKpi label="Tasa de Completación" color="#8B5CF6" delay={0.09}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CircleProgress value={73} size={64} stroke={5} color="#8B5CF6"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-jetbrains font-bold text-sm" style={{color:'#8B5CF6'}}>73%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>De los módulos</p>
                    <p className="text-xs font-jetbrains mt-1" style={{color:'#8B5CF6'}}>▲ +5% vs mes pasado</p>
                  </div>
                </div>
              </BentoKpi>

              {/* NPS Score */}
              <BentoKpi label="NPS Score" color="#F97316" delay={0.12}>
                <p className="font-syne text-2xl md:text-4xl font-black mb-1" style={{color:'#E8EAF0', textShadow:'0 0 20px rgba(249,115,22,0.4)'}}>94</p>
                <Stars rating={5}/>
              </BentoKpi>

              {/* Videos completados */}
              <BentoKpi label="Videos Completados" value="2,341" sub="▲ +8% completados" color="#06B6D4" delay={0.15}/>

              {/* Sesiones hoy */}
              <BentoKpi label="Sesiones Hoy" value="156" sub="▲ 23 vs ayer" color="#10B981" delay={0.18}/>

              {/* Semáforos inline */}
              {[
                {label:'Engagement',  value:87, color:'#10B981'},
                {label:'Retención',   value:64, color:'#C9A84C'},
                {label:'Contenido',   value:92, color:'#0EA5E9'},
              ].map((s, i) => (
                <BentoKpi key={s.label} label={s.label} color={s.color} delay={0.21 + i*0.03}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:s.color, boxShadow:`0 0 8px ${s.color}`}}/>
                    <p className="font-syne text-lg md:text-2xl font-bold" style={{color:'#E8EAF0'}}>{s.value}%</p>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}>
                    <div className="h-full rounded-full" style={{width:`${s.value}%`, background:s.color, transition:'width 1s ease'}}/>
                  </div>
                </BentoKpi>
              ))}
            </div>
          </section>

          {/* ── SECTION 2: Analytics Panel ── */}
          <section id="section-analytics">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="font-syne text-base md:text-lg" style={{color:'#E8EAF0'}}>Centro de <span style={{color:'#0EA5E9'}}>Analítica</span></h2>
              <span className="text-xs font-jetbrains px-3 py-1 rounded-full" style={{background:'rgba(14,165,233,0.1)', color:'#0EA5E9', border:'1px solid rgba(14,165,233,0.2)'}}>Datos en tiempo real</span>
            </div>
            <AnalyticsPanel/>
          </section>

          {/* ── SECTION 3: Two-column — Videos + Leaderboard ── */}
          <section id="section-videos" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Video Library */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne text-lg" style={{color:'#E8EAF0'}}>Biblioteca de <span style={{color:'#C9A84C'}}>Videos</span></h2>
                <button
                  onClick={() => { setEditingVideo(null); setShowVideoModal(true) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)', color:'#080A0F'}}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <AnimatePresence>
                  {videos.map(v => (
                    <VideoCard key={v.id} v={v} onEdit={vid => { setEditingVideo(vid); setShowVideoModal(true) }} onDelete={handleDeleteVideo}/>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Coach Leaderboard */}
            <div>
              <h2 className="font-syne text-lg mb-4" style={{color:'#E8EAF0'}}>Top <span style={{color:'#C9A84C'}}>Coaches</span></h2>
              <div className="glass-card rounded-2xl p-4" style={{border:'1px solid rgba(201,168,76,0.15)'}}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>Clasificado por sesiones completadas</p>
                </div>
                {MOCK_COACHES.map(c => <CoachRow key={c.rank} c={c}/>)}
                <button className="w-full mt-3 py-2 rounded-xl text-xs font-jetbrains font-medium" style={{background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', color:'#C9A84C'}}>
                  Ver todos los coaches →
                </button>
              </div>
            </div>
          </section>

          {/* ── SECTION 4: Interactive Map ── */}
          <section id="section-coaches">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne text-lg" style={{color:'#E8EAF0'}}>Red Global de <span style={{color:'#0EA5E9'}}>Coaches</span></h2>
              <div className="flex items-center gap-3 text-xs font-jetbrains">
                {[{c:'#10B981',l:'Disponible'},{c:'#0EA5E9',l:'En sesión'},{c:'#C9A84C',l:'Top rated'}].map(b => (
                  <div key={b.l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{background:b.c}}/>
                    <span style={{color:'#5A6070'}}>{b.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden" style={{height:400}}>
              <CoachMap height="400px" zoom={2}/>
            </div>
          </section>

        </div>
      </main>

      <AnimatePresence>
        {showVideoModal && (
          <VideoModal
            video={editingVideo}
            onClose={() => { setShowVideoModal(false); setEditingVideo(null) }}
            onSave={handleSaveVideo}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden" style={{background:'rgba(8,10,15,0.96)', borderTop:'1px solid rgba(201,168,76,0.15)', backdropFilter:'blur(20px)'}}>
        {[
          { label:'Inicio', sectionId:null, icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
          { label:'Videos', sectionId:'section-videos', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none"/></svg> },
          { label:'Coaches', sectionId:'section-coaches', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg> },
          { label:'Analítica', sectionId:'section-analytics', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => {
              if (item.sectionId) {
                document.getElementById(item.sectionId)?.scrollIntoView({ behavior:'smooth', block:'start' })
              } else {
                window.scrollTo({ top:0, behavior:'smooth' })
              }
            }}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1"
            style={{color:'#5A6070'}}
          >
            {item.icon}
            <span className="text-[10px] font-jetbrains">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
