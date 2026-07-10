import Link from "next/link";
import { GanttChart } from "lucide-react";

export function BotonCronograma({
  href,
  compact = false,
  className = "",
}: {
  href: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      title="Cronograma del proyecto"
      aria-label={compact ? "Cronograma del proyecto" : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 text-mist-300 transition duration-200 hover:border-gold-500/60 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 ${
        compact ? "p-2" : "px-3 py-1.5 font-mono text-xs uppercase tracking-wider"
      } ${className}`}
    >
      <GanttChart className="h-4 w-4" aria-hidden="true" />
      {!compact && "Cronograma"}
    </Link>
  );
}
