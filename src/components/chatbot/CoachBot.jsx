import React, { useState, useRef, useEffect, useCallback } from 'react'
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
          system: 'Eres NEXUS, un coach de IA especializado en liderazgo y desarrollo profesional. Eres directo, inspirador y usas metáforas poderosas. Máximo 2-3 oraciones. Mezcla español e inglés solo si el usuario lo hace.',
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
    'Los líderes más efectivos aprenden más rápido que el cambio. ¿Cómo estás acelerando el tuyo?',
    'Tu progreso esta semana es un 23% mayor al promedio. Estás en el percentil 85 — sigue así.',
    'El liderazgo no se trata de tener todas las respuestas, sino de hacer las preguntas correctas.',
    'Cada sesión que completas compound — los resultados llegan exponencialmente.',
  ]
  return mocks[Math.floor(Math.random() * mocks.length)]
}

const PROACTIVE_MESSAGES = [
  { text: '¿Tienes un minuto para reflexionar sobre tu semana?', emoji: '🪞' },
  { text: 'Tengo un reto de liderazgo que creo te va a desafiar', emoji: '💪' },
  { text: '¿En qué área quieres crecer esta semana?', emoji: '📈' },
  { text: 'Pregúntame lo que quieras sobre liderazgo', emoji: '💬' },
  { text: 'He analizado tu progreso — hay algo interesante', emoji: '🔍' },
  { text: 'Tu racha de 7 días es impresionante. ¿Qué sigue?', emoji: '🔥' },
]

const QUICK_OPTIONS = [
  { key: 'lessons',   emoji: '🎯', label: 'Ver mis próximas lecciones' },
  { key: 'challenge', emoji: '💪', label: 'Dame un reto de liderazgo' },
  { key: 'progress',  emoji: '📊', label: 'Analiza mi progreso' },
  { key: 'coach',     emoji: '🤝', label: 'Conectar con un coach' },
  { key: 'free',      emoji: '💬', label: 'Hablar libremente con NEXUS' },
]

const BOT_RESPONSES = {
  lessons:  'Basado en tu progreso, continúa con **Comunicación Efectiva** (llevas 58%). Después: Gestión del Cambio. ¿Quieres un plan de 7 días? 📚',
  progress: '📊 **Tu resumen:**\n• Completación: 67%\n• Racha: 7 días 🔥\n• Percentil: Top 15%\n• Próximo hito: completar Comunicación Efectiva',
  free:     '¡Perfecto! Soy NEXUS y puedo ayudarte con estrategia de carrera, técnicas de liderazgo, o simplemente reflexionar sobre tus próximos pasos. ¿Por dónde empezamos? 🚀',
}

function now() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

// ── Avatar mejorado ────────────────────────────────────────────────────────────
function NexusAvatar({ size = 48, speaking = false, pulse = false }) {
  return (
    <div
      className={speaking ? 'speaking' : ''}
      style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}
    >
      {pulse && (
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: 'rgba(14,165,233,0.2)',
          animation: 'ripple 2s ease-out infinite',
        }}/>
      )}
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <defs>
          <linearGradient id="ng1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9"/>
            <stop offset="50%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#C9A84C"/>
          </linearGradient>
          <radialGradient id="ng2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="1"/>
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4"/>
          </radialGradient>
          <radialGradient id="ng3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.2"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Outer glow ring */}
        <circle cx="40" cy="40" r="38" fill="none" stroke="url(#ng1)" strokeWidth="1.5" opacity="0.7"/>
        {/* Inner bg */}
        <circle cx="40" cy="40" r="34" fill="#0A0C14"/>
        {/* Face plate */}
        <rect x="18" y="22" width="44" height="36" rx="12" fill="#0D1019" stroke="rgba(14,165,233,0.2)" strokeWidth="1"/>
        {/* Eyes */}
        <ellipse cx="29" cy="37" rx="5.5" ry="6.5" fill="url(#ng2)" filter="url(#glow)"/>
        <ellipse cx="51" cy="37" rx="5.5" ry="6.5" fill="url(#ng2)" filter="url(#glow)"/>
        {/* Pupils */}
        <circle cx="29" cy="38" r="2.5" fill="#04070F"/>
        <circle cx="51" cy="38" r="2.5" fill="#04070F"/>
        {/* Eye shine */}
        <circle cx="31" cy="35" r="1.2" fill="white" opacity="0.9"/>
        <circle cx="53" cy="35" r="1.2" fill="white" opacity="0.9"/>
        {/* Mouth — gold accent */}
        <path d="M 27 50 Q 40 57 53 50" stroke="url(#ng3)" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#glow)"/>
        {/* Brow lines */}
        <line x1="23" y1="28" x2="35" y2="30" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <line x1="57" y1="28" x2="45" y2="30" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        {/* Side tech accents */}
        <rect x="10" y="36" width="5" height="1.5" rx="1" fill="#0EA5E9" opacity="0.5"/>
        <rect x="65" y="36" width="5" height="1.5" rx="1" fill="#C9A84C" opacity="0.5"/>
      </svg>
    </div>
  )
}

// ── Render bold text ───────────────────────────────────────────────────────────
function RenderText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: '#0EA5E9' }}>{part}</strong>
          : part.split('\n').map((line, j) => j === 0 ? line : [<br key={j} />, line])
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CoachBot() {
  const [isOpen, setIsOpen]           = useState(false)
  const [proactive, setProactive]     = useState(PROACTIVE_MESSAGES[0])
  const [showProactive, setShowProactive] = useState(true)
  const [dismissed, setDismissed]     = useState(false)
  const [messages, setMessages]       = useState([
    { id: 1, from: 'bot', text: '¡Hola! Soy **NEXUS**, tu coach IA. Estoy aquí para impulsarte. ¿Cómo puedo ayudarte hoy? 🚀', time: now(), type: 'text' },
  ])
  const [input, setInput]             = useState('')
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [isTyping, setIsTyping]       = useState(false)
  const bottomRef = useRef(null)
  const proactiveTimer = useRef(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Proactive message cycle — fires every 30-50s when chat is closed
  const cycleProactive = useCallback(() => {
    if (!isOpen) {
      const idx = Math.floor(Math.random() * PROACTIVE_MESSAGES.length)
      setProactive(PROACTIVE_MESSAGES[idx])
      setShowProactive(false)
      setTimeout(() => setShowProactive(true), 200)
      setDismissed(false)
    }
  }, [isOpen])

  useEffect(() => {
    proactiveTimer.current = setInterval(cycleProactive, 35000 + Math.random() * 20000)
    return () => clearInterval(proactiveTimer.current)
  }, [cycleProactive])

  // When chat opens, reset proactive
  useEffect(() => {
    if (isOpen) setDismissed(true)
    else setTimeout(() => setDismissed(false), 3000)
  }, [isOpen])

  const addBotMessage = (content, type = 'text') => {
    setMessages(prev => [...prev, { id: Date.now(), from: 'bot', text: content, time: now(), type }])
  }

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: now(), type: 'text' }])
  }

  const simulateTyping = async (responseText, responseType = 'text') => {
    setIsSpeaking(true)
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 500))
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
    } else {
      await simulateTyping(BOT_RESPONSES[opt.key] || '¡Déjame analizar eso! 🤔')
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
    addBotMessage(reply || '¡Excelente reflexión! Mi recomendación: enfoca tu energía en las áreas de mayor impacto primero. 🎯')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      {/* ── Persistent pill (always visible when chat is closed) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
          >
            {/* Proactive bubble — slides in when a new message fires */}
            <AnimatePresence>
              {showProactive && !dismissed && (
                <motion.div
                  key={proactive.text}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-2 max-w-[240px] cursor-pointer"
                  onClick={() => setIsOpen(true)}
                  style={{
                    background: 'rgba(8,10,15,0.92)',
                    border: '1px solid rgba(14,165,233,0.3)',
                    borderRadius: 16,
                    padding: '10px 14px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(14,165,233,0.12)',
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{proactive.emoji}</span>
                  <p style={{ color: '#E8EAF0', fontSize: 12, lineHeight: 1.4, fontFamily: 'Inter,sans-serif' }}>
                    {proactive.text}
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); setDismissed(true) }}
                    style={{ color: '#5A6070', flexShrink: 0, lineHeight: 1, fontSize: 14 }}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main pill button */}
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Abrir NEXUS"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px 10px 10px',
                borderRadius: 50,
                background: 'rgba(8,10,15,0.95)',
                border: '1.5px solid rgba(14,165,233,0.4)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.15)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Animated ring around avatar */}
              <div style={{ position: 'relative' }}>
                <NexusAvatar size={40} speaking={isSpeaking} pulse={!dismissed} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#E8EAF0', fontSize: 13, fontFamily: 'Syne,sans-serif', fontWeight: 700, lineHeight: 1.2 }}>NEXUS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10B981',
                    display: 'inline-block',
                    animation: 'data-flash 1.5s ease-in-out infinite',
                  }}/>
                  <span style={{ color: '#10B981', fontSize: 10, fontFamily: 'JetBrains Mono,monospace' }}>Coach IA · En línea</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-50 flex flex-col overflow-hidden"
            style={{
              bottom: 16,
              right: 16,
              width: 'min(380px, calc(100vw - 24px))',
              height: 'min(580px, calc(100dvh - 80px))',
              background: 'rgba(8,10,15,0.97)',
              border: '1px solid rgba(14,165,233,0.25)',
              borderRadius: 20,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(14,165,233,0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: '1px solid rgba(14,165,233,0.12)',
                background: 'linear-gradient(180deg, rgba(14,165,233,0.07) 0%, transparent 100%)',
              }}
            >
              <NexusAvatar size={42} speaking={isSpeaking} />
              <div className="flex-1">
                <p style={{ color: '#E8EAF0', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>NEXUS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10B981',
                    display: 'inline-block',
                    animation: 'data-flash 1.5s ease-in-out infinite',
                  }}/>
                  <span style={{ color: '#10B981', fontSize: 10, fontFamily: 'JetBrains Mono,monospace' }}>
                    {isTyping ? 'Escribiendo...' : 'Tu Coach IA · En línea'}
                  </span>
                </div>
              </div>
              {/* Minimize */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: 30, height: 30, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.15)',
                  color: '#5A6070', cursor: 'pointer',
                }}
                aria-label="Minimizar"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="19 9 12 16 5 9"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.from === 'bot' && <NexusAvatar size={26} />}

                  <div style={{ maxWidth: '82%' }}>
                    {msg.type === 'challenge' ? (
                      <div style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: 16 }}>💪</span>
                          <span style={{ color: '#8B5CF6', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>RETO DE LIDERAZGO</span>
                          <span style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono,monospace' }}>Difícil</span>
                        </div>
                        <p style={{ color: '#E8EAF0', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>La conversación difícil</p>
                        <p style={{ color: '#A8C4D4', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                          Esta semana, ten UNA conversación que has estado postergando. El liderazgo real comienza donde termina tu zona de confort.
                        </p>
                        <button style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#0EA5E9)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                          ✓ Aceptar reto
                        </button>
                      </div>
                    ) : msg.type === 'coaches' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { name: 'Ana García', specialty: 'Liderazgo Ejecutivo', initials: 'AG', color: '#C9A84C' },
                          { name: 'Laura Torres', specialty: 'Estrategia', initials: 'LT', color: '#10B981' },
                        ].map(c => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(28,31,40,0.9)', border: `1px solid ${c.color}33` }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', flexShrink: 0 }}>
                              {c.initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ color: '#E8EAF0', fontSize: 12, fontWeight: 500 }}>{c.name}</p>
                              <p style={{ color: '#5A6070', fontSize: 10, fontFamily: 'JetBrains Mono,monospace' }}>{c.specialty}</p>
                            </div>
                            <button style={{ padding: '5px 10px', borderRadius: 8, background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44`, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              Agendar
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={msg.from === 'user' ? {
                          background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
                          color: '#080A0F',
                          fontWeight: 500,
                          borderRadius: '16px 16px 4px 16px',
                          padding: '10px 14px',
                          fontSize: 13,
                          lineHeight: 1.5,
                        } : {
                          background: 'rgba(20,24,36,0.9)',
                          color: '#E8EAF0',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '16px 16px 16px 4px',
                          padding: '10px 14px',
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <RenderText text={msg.text} />
                      </div>
                    )}
                    <p style={{ color: 'rgba(90,96,112,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', marginTop: 3, textAlign: msg.from === 'user' ? 'right' : 'left' }}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <NexusAvatar size={26} speaking={true} />
                  <div style={{ display: 'flex', gap: 5, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(20,24,36,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span key={i}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#0EA5E9', display: 'block' }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{ borderTop: '1px solid rgba(14,165,233,0.1)', flexShrink: 0 }}>
              {showOptions ? (
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ color: '#5A6070', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', marginBottom: 2 }}>OPCIONES RÁPIDAS</p>
                  {QUICK_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleOption(opt)}
                      style={{
                        textAlign: 'left', fontSize: 12, padding: '8px 12px', borderRadius: 10,
                        background: 'rgba(20,24,36,0.8)', border: '1px solid rgba(14,165,233,0.12)',
                        color: '#A8C4D4', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.45)'; e.currentTarget.style.color = '#0EA5E9' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.12)'; e.currentTarget.style.color = '#A8C4D4' }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe algo a NEXUS..."
                      style={{
                        flex: 1, borderRadius: 14, padding: '10px 14px', fontSize: 13,
                        background: 'rgba(20,24,36,0.9)',
                        border: '1px solid rgba(14,165,233,0.2)',
                        color: '#E8EAF0', outline: 'none',
                        fontFamily: 'Inter,sans-serif',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#0EA5E9,#06B6D4)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: (!input.trim() || isTyping) ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080A0F" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowOptions(true)}
                    style={{ marginTop: 6, fontSize: 11, fontFamily: 'JetBrains Mono,monospace', color: 'rgba(90,96,112,0.6)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}
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
