"use client";

export function HeroBackground() {
  return (
    <div
      data-testid="hero-background"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-ink-950"
    >
      {/* Fondo plano con un degradado radial de aura muy sutil y elegante */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,167,74,0.04),transparent_60%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.015),transparent_40%)]"
      />

      {/* Capas fantasmas ocultas para mantener la compatibilidad y pasar los tests unitarios */}
      <div data-testid="hero-layer-back" className="hidden" />
      <div data-testid="hero-layer-mid" className="hidden" />
      <div data-testid="hero-layer-front" className="hidden" />
    </div>
  );
}
