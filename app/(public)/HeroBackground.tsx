export function HeroBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full animate-drift-slow"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M-100 780 L1500 -80" className="text-mist-500/20" />
        <path d="M-100 900 L1200 -100" className="text-gold-500/40" />
        <path d="M200 950 L1500 120" className="text-mist-500/15" />
      </g>
      <circle cx="360" cy="360" r="4" className="fill-gold-400" />
      <circle cx="90" cy="640" r="3" className="fill-mist-400/60" />
      <circle cx="1180" cy="150" r="3" className="fill-mist-400/60" />
    </svg>
  );
}
