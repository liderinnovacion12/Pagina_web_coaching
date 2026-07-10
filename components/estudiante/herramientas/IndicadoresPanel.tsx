export function IndicadoresPanel({ totalGrupos }: { totalGrupos: number }) {
  const indicadores = [
    { valor: String(totalGrupos), etiqueta: "Grupos" },
    { valor: "1", etiqueta: "Oficial" },
    { valor: "100%", etiqueta: "Privado" },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      {indicadores.map((indicador) => (
        <div key={indicador.etiqueta} className="flex flex-col items-center gap-1 px-2 text-center">
          <span className="font-display text-2xl font-bold text-white">{indicador.valor}</span>
          <span className="text-xs text-mist-400">{indicador.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
