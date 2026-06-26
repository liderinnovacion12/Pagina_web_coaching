import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const CONFIG = {
  green:  { dot: '#22c55e', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.22)',  textColor: '#86efac', pulse: 'pulse-green' },
  yellow: { dot: '#C9A84C', bg: 'rgba(201,168,76,0.07)', border: 'rgba(201,168,76,0.22)', textColor: '#E8C97A', pulse: 'pulse-yellow' },
  red:    { dot: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.22)',  textColor: '#fca5a5', pulse: 'pulse-red' },
}

export default function Semaforo({ status = 'green', label = '', value = '' }) {
  const reduced = useReducedMotion()
  const c = CONFIG[status] || CONFIG.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 glass-card"
      style={{ border: `1px solid ${c.border}`, background: c.bg }}
    >
      {/* Ambient glow top-right */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${c.dot}1A 0%, transparent 70%)`,
          transform: 'translate(35%, -35%)',
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-jetbrains uppercase tracking-widest mb-3" style={{ color: '#5A6070' }}>
            {label}
          </p>
          <p className="font-syne text-3xl font-black" style={{ color: c.textColor, textShadow: `0 0 24px ${c.dot}55` }}>
            {value}
          </p>
        </div>

        {/* Concentric rings + pulse dot */}
        <div className="relative flex items-center justify-center w-14 h-14">
          <div className="absolute w-12 h-12 rounded-full" style={{ border: `1px solid ${c.dot}22` }} />
          <div className="absolute w-8 h-8 rounded-full"  style={{ border: `1px solid ${c.dot}44` }} />
          <div
            className={`w-4 h-4 rounded-full z-10 ${!reduced ? c.pulse : ''}`}
            style={{ background: c.dot }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-0.5 rounded-full relative z-10" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: value }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ background: `linear-gradient(90deg, ${c.dot}88, ${c.dot})` }}
        />
      </div>
    </motion.div>
  )
}
