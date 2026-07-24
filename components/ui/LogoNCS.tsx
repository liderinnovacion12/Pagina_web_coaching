// CSS classes logo-ncs-dark / logo-ncs-light are toggled via :root.light in globals.css
// No client-side JS needed — switches at first paint via the anti-flash class.
interface LogoNCSProps {
  height?: number;
  className?: string;
}

export function LogoNCS({ height = 44, className }: LogoNCSProps) {
  // Dark logo: 644×732 (portrait, green glow, transparent bg)
  const darkWidth = Math.round(height * (644 / 732));
  // Light logo: 1024×1024 (square, blue glow, transparent bg)
  const lightWidth = height;

  return (
    <span
      className={`inline-flex items-center${className ? ` ${className}` : ""}`}
      style={{ height, flexShrink: 0 }}
    >
      <img
        src="/images/logo-ncs-dark.png"
        alt="NCS Realty Hub"
        width={darkWidth}
        height={height}
        className="logo-ncs-dark"
        style={{ width: darkWidth, height }}
      />
      <img
        src="/images/logo-ncs-light.png"
        alt="NCS Realty Hub"
        width={lightWidth}
        height={height}
        className="logo-ncs-light"
        style={{ width: lightWidth, height }}
      />
    </span>
  );
}
