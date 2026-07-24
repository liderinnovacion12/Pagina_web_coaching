// CSS classes logo-ncs-dark / logo-ncs-light are toggled via :root.light in globals.css
// No client-side JS needed — switches happen at first paint with the anti-flash class.
interface LogoNCSProps {
  height?: number;
  className?: string;
}

export function LogoNCS({ height = 44, className }: LogoNCSProps) {
  // Dark logo: 644×732 (portrait, transparent background)
  const darkWidth = Math.round(height * (644 / 732));
  // Light logo: right half of combined JPEG, 919×443 total → each half 459.5×443
  const lightWidth = Math.round(height * (919 / 886));

  return (
    <span
      className={`inline-flex items-center${className ? ` ${className}` : ""}`}
      style={{ height, flexShrink: 0 }}
    >
      {/* Dark mode: standalone PNG with green glow + transparent bg */}
      <img
        src="/images/logo-ncs-dark.png"
        alt="NCS Realty Hub"
        width={darkWidth}
        height={height}
        className="logo-ncs-dark"
        style={{ width: darkWidth, height }}
      />
      {/* Light mode: right half of combined JPEG via CSS sprite */}
      <span
        aria-hidden="true"
        className="logo-ncs-light"
        style={{
          width: lightWidth,
          height,
          backgroundImage: "url(/images/logo-ncs.jpg)",
          backgroundSize: "auto 100%",
          backgroundPosition: "right 0",
          backgroundRepeat: "no-repeat",
        }}
      />
    </span>
  );
}
