import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function askNexus(userMessage) {
  if (ANTHROPIC_KEY && ANTHROPIC_KEY !== '') {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: 'Eres NEXUS, un coach de inteligencia artificial especializado en liderazgo y desarrollo profesional. Eres directo, inspirador y usas metáforas poderosas. Máximo 2-3 oraciones por respuesta. Mezcla español e inglés solo si el usuario lo hace.',
          messages: [{ role: 'user', content: userMessage }],
        }),
      })
      const data = await res.json()
      return data.content?.[0]?.text || null
    } catch {
      return null
    }
  }
  const mocks = [
    'Tu potencial está limitado solo por tu disposición a crecer. ¿Qué barrera quieres romper hoy? 🚀',
    'Los líderes más efectivos que he analizado tienen una cosa en común: aprenden más rápido que el cambio.',
    'Dato interesante: el 73% de los usuarios que completan este módulo reportan mejoras en 30 días.',
    'Tu progreso esta semana es un 23% mayor al promedio. Sigue así — estás en el percentil 85.',
    'El liderazgo no se trata de tener todas las respuestas, sino de hacer las preguntas correctas.',
    'Cada sesión de coaching que completas es una inversión que compound — los resultados llegan exponencialmente.',
  ]
  return mocks[Math.floor(Math.random() * mocks.length)]
}

function now() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

// NEXUS Avatar SVG
function NexusAvatar({ size = 48, speaking = false }) {
  return (
    <div className={speaking ? 'speaking' : ''} style={{width:size, height:size, flexShrink:0}}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <defs>
          <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9"/>
            <stop offset="50%" stopColor="#C9A84C"/>
            <stop offset="100%" stopColor="#8B5CF6"/>
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3"/>
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="38" fill="none" stroke="url(#avatarGrad)" strokeWidth="2"/>
        <circle cx="40" cy="40" r="35" fill="#0D1019"/>
        <ellipse cx="28" cy="35" rx="6" ry="7" fill="url(#eyeGlow)" opacity="0.9"/>
        <ellipse cx="52" cy="35" rx="6" ry="7" fill="url(#eyeGlow)" opacity="0.9"/>
        <circle cx="28" cy="36" r="3" fill="#080A0F"/>
        <circle cx="52" cy="36" r="3" fill="#080A0F"/>
        <circle cx="30" cy="33" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="54" cy="33" r="1.5" fill="white" opacity="0.8"/>
        <path d="M 28 52 Q 40 60 52 52" stroke="#C9A84C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="22" y1="27" x2="34" y2="29" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="58" y1="27" x2="46" y2="29" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// Quick option buttons
const QUICK_OPTIONS = [
  { key:'lessons',   emoji:'🎯', label:'Ver mis próximas lecciones' },
  { key:'challenge', emoji:'💪', label:'Dame un reto de liderazgo' },
  { key:'progress',  emoji:'📊', label:'Analiza mi progreso' },
  { key:'coach',     emoji:'🤝', label:'Conectar con un coach' },
  { key:'free',      emoji:'💬', label:'Hablar libremente con NEXUS' },
]

const BOT_RESPONSES = {
  lessons: 'Basado en tu progreso, te recomiendo continuar con **Comunicación Efectiva** (llevas 58%). Después: Gestión del Cambio. ¿Quieres que te prepare un plan de estudio de 7 días? 📚',
  challenge: null, // special card
  progress: '📊 **Tu resumen de esta semana:**\n• Completación general: 67%\n• Racha: 7 días consecutivos 🔥\n• Percentil: Top 15% de usuarios\n• Recomendación: completar Comunicación Efectiva primero',
  coach: null, // coach cards
  free: '¡Perfecto! Estoy aquí para escucharte. Soy NEXUS y puedo ayudarte con estrategia de carrera, técnicas de liderazgo, o simplemente reflexionar sobre tus próximos pasos. ¿Por dónde empezamos? 🚀',
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CoachBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id:1, from:'bot', text:'¡Hola! Soy **NEXUS**, tu coach de inteligencia artificial. Estoy aquí para ayudarte a alcanzar tu máximo potencial. ¿Cómo puedo impulsarte hoy? 🚀', time:now(), type:'text' }
  ])
  const [input, setInput] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, isTyping])

  const addBotMessage = (content, type = 'text') => {
    setMessages(prev => [...prev, { id:Date.now(), from:'bot', text:content, time:now(), type }])
  }

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id:Date.now(), from:'user', text, time:now(), type:'text' }])
  }

  const simulateTyping = async (responseText, responseType = 'text') => {
    setIsSpeaking(true)
    setIsTyping(true)
    const delay = 800 + Math.random() * 600
    await new Promise(r => setTimeout(r, delay))
    setIsTyping(false)
    setIsSpeaking(false)
    addBotMessage(responseText, responseType)
  }

  const handleOption = async (opt) => {
    setShowOptions(false)
    addUserMessage(opt.emoji + ' ' + opt.label)
    if (opt.key === 'challenge') {
      await simulateTyping('challenge_card', 'challenge')
    } else if (opt.key === 'coach') {
      await simulateTyping('coach_cards', 'coaches')
    } else if (opt.key === 'free') {
      addBotMessage(BOT_RESPONSES.free)
      setIsSpeaking(false)
    } else {
      await simulateTyping(BOT_RESPONSES[opt.key] || '')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const msg = input.trim()
    setInput('')
    addUserMessage(msg)
    setIsSpeaking(true)
    setIsTyping(true)
    const reply = await askNexus(msg)
    setIsTyping(false)
    setIsSpeaking(false)
    addBotMessage(reply || '¡Excelente pregunta! Permíteme analizar eso... 🤔 Mi recomendación es que enfoques tu energía en las áreas de mayor impacto primero.')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Render message content with basic bold support
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{color:'#0EA5E9'}}>{part}</strong>
        : part.split('\n').map((line, j) => j === 0 ? line : [<br key={j}/>, line])
    )
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        aria-label="Abrir NEXUS Coach IA"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #080A0F, #0D1019)',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 0 0 2px transparent',
        }}
      >
        {/* Animated gradient ring */}
        <div className="absolute inset-0 rounded-full animated-border" style={{padding:2}}>
          <div className="w-full h-full rounded-full" style={{background:'#080A0F'}}/>
        </div>
        {/* Avatar */}
        <div className="relative z-10">
          <NexusAvatar size={40} speaking={isSpeaking && !isOpen}/>
        </div>
        {/* Notification badge */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-jetbrains font-bold z-20" style={{background:'#F97316', color:'#080A0F'}}>
            3
          </div>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity:0, y:20, scale:0.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.95 }}
            transition={{ duration:0.2 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width:380,
              height:560,
              background:'rgba(8,10,15,0.95)',
              border:'1px solid rgba(14,165,233,0.2)',
              borderRadius:20,
              backdropFilter:'blur(20px)',
              boxShadow:'0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(14,165,233,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{borderColor:'rgba(14,165,233,0.12)', background:'rgba(13,16,25,0.8)'}}>
              <NexusAvatar size={44} speaking={isSpeaking}/>
              <div className="flex-1">
                <p className="font-syne font-bold text-sm" style={{color:'#E8EAF0'}}>NEXUS</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full live-dot" style={{background:'#10B981'}}/>
                  <span className="text-xs font-jetbrains" style={{color:'#10B981'}}>Tu Coach IA • En línea</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{background:'rgba(14,165,233,0.08)', color:'#5A6070'}}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{minHeight:0}}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.from === 'bot' && <NexusAvatar size={28} speaking={false}/>}

                  <div className="max-w-[80%]">
                    {msg.type === 'challenge' ? (
                      <div className="rounded-xl p-3" style={{background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)'}}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">💪</span>
                          <p className="text-xs font-jetbrains font-bold" style={{color:'#8B5CF6'}}>RETO DE LIDERAZGO</p>
                          <span className="px-2 py-0.5 rounded text-xs font-jetbrains" style={{background:'rgba(249,115,22,0.2)', color:'#F97316'}}>Difícil</span>
                        </div>
                        <p className="text-sm font-medium mb-1.5" style={{color:'#E8EAF0'}}>La conversación difícil</p>
                        <p className="text-xs leading-relaxed mb-3" style={{color:'#A8C4D4'}}>Esta semana, ten UNA conversación que has estado postergando. Ya sea con un colaborador, tu jefe, o contigo mismo. El liderazgo real comienza donde termina tu zona de confort.</p>
                        <button className="w-full py-2 rounded-lg text-xs font-semibold" style={{background:'linear-gradient(135deg,#8B5CF6,#0EA5E9)', color:'white'}}>
                          ✓ Aceptar reto
                        </button>
                      </div>
                    ) : msg.type === 'coaches' ? (
                      <div className="space-y-2">
                        {[
                          {name:'Ana García', specialty:'Liderazgo Ejecutivo', initials:'AG', color:'#C9A84C', avail:true},
                          {name:'Laura Torres', specialty:'Estrategia', initials:'LT', color:'#10B981', avail:true},
                        ].map(c => (
                          <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'rgba(28,31,40,0.8)', border:`1px solid ${c.color}22`}}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-jetbrains font-bold flex-shrink-0" style={{background:`${c.color}22`, color:c.color, border:`1px solid ${c.color}44`}}>
                              {c.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium" style={{color:'#E8EAF0'}}>{c.name}</p>
                              <p className="text-xs font-jetbrains" style={{color:'#5A6070'}}>{c.specialty}</p>
                            </div>
                            <button className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{background:`${c.color}22`, color:c.color, border:`1px solid ${c.color}44`}}>
                              Agendar
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                        style={msg.from === 'user' ? {
                          background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
                          color: '#080A0F',
                          fontWeight: 500,
                        } : {
                          background: 'rgba(28,31,40,0.8)',
                          color: '#E8EAF0',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {renderText(msg.text)}
                      </div>
                    )}
                    <p className="text-xs font-jetbrains mt-1" style={{color:'rgba(90,96,112,0.6)', textAlign: msg.from === 'user' ? 'right' : 'left'}}>{msg.time}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start gap-2">
                  <NexusAvatar size={28} speaking={true}/>
                  <div className="px-4 py-3 rounded-xl flex items-center gap-1.5" style={{background:'rgba(28,31,40,0.8)', border:'1px solid rgba(255,255,255,0.04)'}}>
                    {[0,1,2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{background:'#0EA5E9'}}
                        animate={{y:[0,-4,0]}} transition={{duration:0.6, delay:i*0.15, repeat:Infinity}}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef}/>
            </div>

            {/* Quick options or input */}
            <div className="border-t flex-shrink-0" style={{borderColor:'rgba(14,165,233,0.12)'}}>
              {showOptions ? (
                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-jetbrains mb-2" style={{color:'#5A6070'}}>Selecciona una opción:</p>
                  {QUICK_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleOption(opt)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                      style={{background:'rgba(28,31,40,0.6)', border:'1px solid rgba(14,165,233,0.1)', color:'#A8C4D4'}}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.4)'; e.currentTarget.style.color='#0EA5E9' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(14,165,233,0.1)'; e.currentTarget.style.color='#A8C4D4' }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex gap-2 items-center">
                    <button className="text-lg" aria-label="emoji">😊</button>
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Habla con NEXUS..."
                      className="flex-1 rounded-xl px-3 py-2 text-xs"
                      style={{
                        background:'rgba(28,31,40,0.8)',
                        border:'1px solid rgba(14,165,233,0.15)',
                        color:'#E8EAF0',
                        outline:'none',
                      }}
                      onFocus={e => e.target.style.borderColor='rgba(14,165,233,0.4)'}
                      onBlur={e => e.target.style.borderColor='rgba(14,165,233,0.15)'}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                      style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)'}}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#080A0F" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowOptions(true)}
                    className="mt-2 text-xs font-jetbrains w-full text-center"
                    style={{color:'rgba(90,96,112,0.7)'}}
                  >
                    ← Ver opciones rápidas
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
