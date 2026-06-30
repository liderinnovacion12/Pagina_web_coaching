import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import CoachBot from '../components/chatbot/CoachBot'
import useStore from '../store/useStore'
import useTranslation from '../hooks/useTranslation'

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_VIDEOS = [
  { id:'1', title_es:'Fundamentos del Liderazgo',     category:'Liderazgo',    duration:'24 min', instructor:'Ana García',   progress:100, rating:4.8, isNew:false, color:'from-blue-700 to-blue-950',    icon:'👑', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Aprende los principios fundamentales del liderazgo moderno. Técnicas probadas por CEOs de Fortune 500.' },
  { id:'2', title_es:'Comunicación Efectiva',         category:'Comunicación', duration:'31 min', instructor:'Carlos Ruiz',  progress:58,  rating:4.6, isNew:false, color:'from-violet-700 to-violet-950', icon:'💬', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Domina el arte de comunicarte con claridad, impacto y empatía en cualquier contexto profesional.' },
  { id:'3', title_es:'Gestión del Cambio',            category:'Gestión',      duration:'28 min', instructor:'María López',  progress:30,  rating:4.4, isNew:false, color:'from-emerald-700 to-emerald-950',icon:'🔄', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Estrategias para liderar transformaciones organizacionales con confianza y mínima resistencia.' },
  { id:'4', title_es:'Inteligencia Emocional',        category:'Desarrollo',   duration:'36 min', instructor:'Ana García',   progress:0,   rating:4.9, isNew:false, color:'from-orange-700 to-orange-950', icon:'🧠', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Desarrolla tu cociente emocional y transforma cómo gestionas el estrés, las relaciones y la presión.' },
  { id:'5', title_es:'Equipos de Alto Rendimiento',   category:'Liderazgo',    duration:'42 min', instructor:'John Smith',   progress:0,   rating:4.7, isNew:true,  color:'from-cyan-700 to-cyan-950',    icon:'🚀', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Crea y mantén equipos que logran resultados extraordinarios. Metodologías ágiles para líderes.' },
  { id:'6', title_es:'Visión Estratégica',            category:'Estrategia',   duration:'29 min', instructor:'Laura Torres', progress:0,   rating:4.5, isNew:true,  color:'from-pink-700 to-pink-950',    icon:'🎯', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Aprende a pensar a largo plazo y tomar decisiones estratégicas que crean ventajas competitivas.' },
  { id:'7', title_es:'Negociación Avanzada',          category:'Negociación',  duration:'33 min', instructor:'Carlos Ruiz',  progress:0,   rating:4.6, isNew:true,  color:'from-amber-700 to-amber-950',  icon:'🤝', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Técnicas de negociación de nivel experto para alcanzar acuerdos ganar-ganar en situaciones complejas.' },
  { id:'8', title_es:'Mindfulness Ejecutivo',         category:'Bienestar',    duration:'21 min', instructor:'María López',  progress:0,   rating:4.8, isNew:true,  color:'from-teal-700 to-teal-950',    icon:'🧘', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Práctica de mindfulness diseñada para ejecutivos que necesitan claridad mental bajo presión.' },
  { id:'9', title_es:'Presentaciones de Impacto',     category:'Comunicación', duration:'27 min', instructor:'Ana García',   progress:0,   rating:4.5, isNew:true,  color:'from-indigo-700 to-indigo-950', icon:'📊', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', desc:'Domina el arte de presentar ideas de forma memorable. TED-style frameworks para profesionales.' },
]

const LEARNING_PATH = [
  { num:1, title:'Fundamentos del Liderazgo', videos:3, state:'done' },
  { num:2, title:'Comunicación y Presencia',  videos:4, state:'active' },
  { num:3, title:'Gestión de Equipos',         videos:5, state:'locked' },
  { num:4, title:'Estrategia Avanzada',         videos:3, state:'locked' },
  { num:5, title:'Certificación Final',         videos:2, state:'locked' },
]

const LEADERBOARD = [
  { rank:1, name:'María G.',  pts:2840, color:'#C9A84C' },
  { rank:2, name:'Carlos P.', pts:2650, color:'#A8C4D4' },
  { rank:3, name:'Ana R.',    pts:2410, color:'#8B5CF6' },
  { rank:4, name:'Luis H.',   pts:2200, color:'#10B981' },
  { rank:5, name:'Sofia M.',  pts:1980, color:'#F97316' },
]

const CATEGORIES = ['Todos', 'Liderazgo', 'Comunicación', 'Gestión', 'Desarrollo', 'Estrategia', 'Negociación', 'Bienestar']

const CAT_COLORS = {
  'Liderazgo':    '#0EA5E9',
  'Comunicación': '#8B5CF6',
  'Gestión':      '#10B981',
  'Desarrollo':   '#F97316',
  'Estrategia':   '#C9A84C',
  'Negociación':  '#06B6D4',
  'Bienestar':    '#EC4899',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CircleProgress({ value, size = 72, stroke = 5, color = '#0EA5E9' }) {
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

// Video Player Modal
function VideoPlayer({ video, onClose }) {
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState('')
  const related = MOCK_VIDEOS.filter(v => v.id !== video.id && v.category === video.category).slice(0,3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div
        initial={{opacity:0,scale:0.95,y:20}}
        animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:20}}
        transition={{duration:0.25}}
        className="glass-card rounded-2xl overflow-hidden w-full max-w-3xl mx-4"
        style={{border:'1px solid rgba(14,165,233,0.2)', maxHeight:'90vh', overflowY:'auto'}}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:'1px solid rgba(28,31,40,0.8)', background:'rgba(8,10,15,0.6)'}}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{video.icon}</span>
            <div>
              <h3 className="font-syne text-base" style={{color:'#E8EAF0'}}>{video.title_es}</h3>
              <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{video.instructor} · {video.duration}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(14,165,233,0.08)', color:'#5A6070'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {/* Video */}
        <div className="aspect-video">
          <iframe src={video.url} title={video.title_es} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
        </div>
        {/* Description + rating */}
        <div className="p-5">
          <p className="text-sm leading-relaxed mb-4" style={{color:'#A8C4D4'}}>{video.desc}</p>
          <div className="flex items-center gap-4 mb-5">
            <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>Tu calificación:</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setUserRating(s)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={s <= userRating ? '#C9A84C' : 'rgba(90,96,112,0.3)'}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Deja un comentario sobre esta lección..."
              className="flex-1 rounded-xl px-3 py-2.5 text-sm"
              style={{background:'rgba(8,10,15,0.8)', border:'1px solid rgba(14,165,233,0.15)', color:'#E8EAF0'}}
            />
            <button className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)', color:'#080A0F'}}>
              Enviar
            </button>
          </div>

          {/* Related videos */}
          {related.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-jetbrains uppercase tracking-widest mb-3" style={{color:'#5A6070'}}>Relacionados</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map(r => (
                  <div key={r.id} className="rounded-xl overflow-hidden cursor-pointer" style={{border:'1px solid rgba(28,31,40,0.8)'}}>
                    <div className={`h-16 bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl`}>{r.icon}</div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate" style={{color:'#E8EAF0'}}>{r.title_es}</p>
                      <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{r.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Portal Video Card
function PortalVideoCard({ video, onWatch, delay }) {
  const [hovered, setHovered] = useState(false)
  const catColor = CAT_COLORS[video.category] || '#5A6070'
  const actionLabel = video.progress === 100 ? '✓ Completado' : video.progress > 0 ? '▶ Continuar' : '▶ Comenzar'

  return (
    <motion.div
      initial={{opacity:0,y:20}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true}}
      transition={{duration:0.4, delay}}
      className="rounded-2xl overflow-hidden cursor-pointer relative"
      style={{border:`1px solid ${catColor}22`, background:'rgba(13,16,25,0.7)'}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onWatch(video)}
    >
      {/* Thumbnail */}
      <div className={`relative h-36 bg-gradient-to-br ${video.color} flex items-center justify-center`}>
        <span className="text-4xl">{video.icon}</span>
        {video.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-jetbrains font-bold" style={{background:'#06B6D4', color:'#080A0F'}}>NUEVO</span>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-jetbrains" style={{background:'rgba(8,10,15,0.7)', color:'#E8EAF0'}}>{video.duration}</span>
        {video.progress === 100 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{background:'rgba(16,185,129,0.9)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && video.progress !== 100 && (
            <motion.div
              initial={{opacity:0}}
              animate={{opacity:1}}
              exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center"
              style={{background:'rgba(8,10,15,0.75)'}}
            >
              <div className="px-5 py-2.5 rounded-full font-syne font-bold text-sm" style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)', color:'#080A0F'}}>
                {actionLabel}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs px-2 py-0.5 rounded font-jetbrains" style={{background:`${catColor}22`, color:catColor}}>{video.category}</span>
          <Stars rating={video.rating}/>
        </div>
        <p className="font-syne text-sm font-bold leading-snug mb-1" style={{color:'#E8EAF0'}}>{video.title_es}</p>
        <p className="text-xs mb-2 font-jetbrains" style={{color:'#5A6070'}}>{video.instructor}</p>
        {video.progress > 0 && (
          <>
            <div className="h-1 rounded-full mb-1" style={{background:'rgba(255,255,255,0.06)'}}>
              <motion.div
                initial={{width:0}}
                animate={{width:`${video.progress}%`}}
                transition={{duration:0.8, ease:'easeOut'}}
                className="h-full rounded-full"
                style={{background:'linear-gradient(90deg,#C9A84C,#E8C97A)'}}
              />
            </div>
            <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{video.progress}% completado</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Portal ───────────────────────────────────────────────────────────────
export default function Portal() {
  const { profile } = useStore()
  const { t, lang } = useTranslation()
  const [activeVideo, setActiveVideo] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Todos')

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario'

  const completed = MOCK_VIDEOS.filter(v => v.progress === 100).length
  const inProgress = MOCK_VIDEOS.filter(v => v.progress > 0 && v.progress < 100).length
  const overallProgress = Math.round(MOCK_VIDEOS.reduce((s, v) => s + v.progress, 0) / MOCK_VIDEOS.length)

  const nextVideo = MOCK_VIDEOS.find(v => v.progress > 0 && v.progress < 100) || MOCK_VIDEOS.find(v => v.progress === 0)

  const filteredVideos = activeCategory === 'Todos'
    ? MOCK_VIDEOS
    : MOCK_VIDEOS.filter(v => v.category === activeCategory)

  return (
    <div className="min-h-screen" style={{background:'#080A0F'}}>
      {/* Aurora bg */}
      <div className="aurora-bg">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
        <div className="scan-line" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* ── Hero Welcome Strip ── */}
        <section className="pt-20 pb-8 px-4 border-b" style={{borderColor:'rgba(14,165,233,0.1)', background:'rgba(13,16,25,0.5)', backdropFilter:'blur(10px)'}}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{opacity:0,y:16}}
              animate={{opacity:1,y:0}}
              transition={{duration:0.5}}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
            >
              {/* Left: Welcome */}
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative flex-shrink-0">
                  <CircleProgress value={overallProgress} size={72} stroke={5} color="#0EA5E9"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-jetbrains font-bold text-sm" style={{color:'#0EA5E9'}}>{overallProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-jetbrains uppercase tracking-widest mb-1" style={{color:'#5A6070'}}>Portal de Aprendizaje</p>
                  <h1 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-black">
                    <span style={{color:'#E8EAF0'}}>Hola, </span>
                    <span style={{background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>{firstName}</span>
                  </h1>
                  <p className="text-xs sm:text-sm font-jetbrains mt-1" style={{color:'#5A6070'}}>
                    {completed} completados · {inProgress} en progreso · 🔥 7 días
                  </p>
                </div>
              </div>

              {/* Quick stats — inline on mobile */}
              <div className="flex gap-4 lg:gap-6">
                {[
                  {label:'Completados', val:completed, color:'#10B981'},
                  {label:'Horas', val:'12.4h',  color:'#C9A84C'},
                  {label:'Racha', val:'7d',        color:'#F97316'},
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-syne text-xl sm:text-2xl font-black" style={{color:s.color}}>{s.val}</p>
                    <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Next class — hidden on small, shown on lg */}
              {nextVideo && (
                <motion.div
                  whileHover={{scale:1.02}}
                  onClick={() => setActiveVideo(nextVideo)}
                  className="cursor-pointer rounded-2xl overflow-hidden hidden sm:flex items-center gap-4 p-4 lg:min-w-72"
                  style={{background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.25)'}}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${nextVideo.color} flex-shrink-0 flex items-center justify-center text-2xl`}>
                    {nextVideo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-jetbrains mb-1" style={{color:'#0EA5E9'}}>▶ Tu próxima clase</p>
                    <p className="font-syne font-bold text-sm truncate" style={{color:'#E8EAF0'}}>{nextVideo.title_es}</p>
                    <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{nextVideo.duration} · {nextVideo.instructor}</p>
                    {nextVideo.progress > 0 && (
                      <div className="mt-2 h-1 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                        <div className="h-full rounded-full" style={{width:`${nextVideo.progress}%`, background:'#0EA5E9'}}/>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Main Content: Two Panel ── */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col xl:flex-row gap-8">

            {/* LEFT: Video Grid (65%) */}
            <div className="flex-1 min-w-0">
              {/* Category filter tabs */}
              <div className="flex gap-2 flex-wrap mb-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-jetbrains font-medium transition-all"
                    style={{
                      background: activeCategory === cat ? '#0EA5E9' : 'rgba(28,31,40,0.8)',
                      color: activeCategory === cat ? '#080A0F' : '#5A6070',
                      border: `1px solid ${activeCategory === cat ? '#0EA5E9' : 'rgba(28,31,40,0.8)'}`,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-10}}
                  transition={{duration:0.2}}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {filteredVideos.map((video, i) => (
                    <PortalVideoCard
                      key={video.id}
                      video={video}
                      onWatch={setActiveVideo}
                      delay={i * 0.05}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT: Sidebar (35%) */}
            <div className="xl:w-80 flex-shrink-0 space-y-5">

              {/* Learning Path */}
              <div className="glass-card rounded-2xl p-5" style={{border:'1px solid rgba(201,168,76,0.15)'}}>
                <h3 className="font-syne text-base font-bold mb-4" style={{color:'#E8EAF0'}}>Tu Ruta de <span style={{color:'#C9A84C'}}>Aprendizaje</span></h3>
                <div className="space-y-0">
                  {LEARNING_PATH.map((mod, i) => {
                    const isDone   = mod.state === 'done'
                    const isActive = mod.state === 'active'
                    const isLocked = mod.state === 'locked'
                    const lineColor = isDone ? '#C9A84C' : isActive ? '#0EA5E9' : 'rgba(28,31,40,0.8)'
                    return (
                      <div key={mod.num} className="flex gap-3 relative">
                        {/* Timeline line */}
                        {i < LEARNING_PATH.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-full" style={{background:lineColor, opacity:0.4}}/>
                        )}
                        {/* Circle */}
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 text-xs font-jetbrains font-bold mt-0.5"
                          style={{
                            background: isDone ? '#C9A84C' : isActive ? '#0EA5E9' : 'rgba(28,31,40,0.8)',
                            color: isDone || isActive ? '#080A0F' : '#5A6070',
                            border: isActive ? '2px solid #0EA5E9' : 'none',
                            boxShadow: isActive ? '0 0 12px rgba(14,165,233,0.4)' : 'none',
                          }}
                        >
                          {isDone ? '✓' : mod.num}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium" style={{color: isLocked ? '#5A6070' : '#E8EAF0'}}>{mod.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{mod.videos} videos</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full live-dot" style={{background:'#0EA5E9'}}/>}
                            {isLocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5A6070" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="glass-card rounded-2xl p-5" style={{border:'1px solid rgba(14,165,233,0.12)'}}>
                <h3 className="font-syne text-base font-bold mb-4" style={{color:'#E8EAF0'}}>Top <span style={{color:'#0EA5E9'}}>Aprendices</span> esta semana</h3>
                <div className="space-y-2.5">
                  {LEADERBOARD.map(l => (
                    <div key={l.rank} className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-jetbrains font-bold" style={{color: l.rank === 1 ? '#C9A84C' : '#5A6070'}}>#{l.rank}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-jetbrains font-bold" style={{background:`${l.color}22`, color:l.color}}>
                        {l.name[0]}
                      </div>
                      <p className="flex-1 text-xs" style={{color:'#E8EAF0'}}>{l.name}</p>
                      <span className="text-xs font-jetbrains font-bold" style={{color:l.color}}>{l.pts.toLocaleString()} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Available Card */}
              <div className="glass-card rounded-2xl p-5" style={{border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.03)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-jetbrains font-bold text-sm" style={{background:'rgba(201,168,76,0.2)', color:'#C9A84C', border:'2px solid rgba(201,168,76,0.4)'}}>
                    AG
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{color:'#E8EAF0'}}>Ana García</p>
                    <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>Liderazgo Ejecutivo</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full live-dot" style={{background:'#10B981'}}/>
                      <span className="text-xs font-jetbrains" style={{color:'#10B981'}}>Disponible ahora</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{background:'linear-gradient(135deg,#10B981,#06B6D4)', color:'#080A0F'}}>
                  Agendar sesión →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)}/>
        )}
      </AnimatePresence>

      {/* Floating CoachBot */}
      <CoachBot />
    </div>
  )
}
