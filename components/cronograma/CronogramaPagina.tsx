type FilaTiempo = {
  fecha: string;
  ventana: string;
  horas: string;
  detalle: string;
};

const TIEMPO_INVERTIDO: FilaTiempo[] = [
  {
    fecha: "Lun 06/07",
    ventana: "14:08–16:54",
    horas: "2h46",
    detalle:
      "Scaffold Next.js, clientes Supabase, esquema de BD completo con RLS, seed de admin.",
  },
  {
    fecha: "Mar 07/07",
    ventana: "05:15–23:36 (5 ventanas)",
    horas: "9h34",
    detalle:
      "Auth completo (login, registro+Google OAuth, recuperar/actualizar password), rol coach + RLS, landing, catálogo.",
  },
  {
    fecha: "Mié 08/07",
    ventana: "08:41–17:00",
    horas: "8h19",
    detalle:
      "Núcleo de aprendizaje: queries, dashboard, nav shell, curso/lección, reproductor Mux, tracking de progreso.",
  },
  {
    fecha: "Jue 09/07",
    ventana: "07:46–16:39",
    horas: "8h53",
    detalle:
      "Dashboard de bienvenida (equipo/galería), motion en landing/auth, stubs de herramientas/calendario/marketing/soporte.",
  },
  {
    fecha: "Vie 10/07",
    ventana: "08:16–14:03",
    horas: "5h47",
    detalle:
      "Iteración de partículas, limpieza de documentación, módulo de calendario completo (spec → producción).",
  },
];

const VELOCIDAD = [
  {
    horas: "~4h",
    label: "Stack de autenticación",
    desc: "Login, registro+OAuth, recuperar/actualizar password, control de acceso por rol.",
  },
  {
    horas: "2h51",
    label: "Sección de contenido estático",
    desc: "Tarjetas de equipo, misión/visión/valores, galería con Supabase Storage.",
  },
  {
    horas: "~3h",
    label: "Módulo nuevo completo",
    desc: "Tabla + RLS, lógica pura, UI multi-componente y CRUD en admin — patrón calendario.",
  },
  {
    horas: "8h19",
    label: "Sistema multi-pantalla",
    desc: "Núcleo de aprendizaje: catálogo, detalle, reproductor con progreso y navegación.",
  },
];

type FilaEpica = {
  epica: string;
  horas: string;
  conMargen: string;
  nota: string;
  riesgo?: string;
};

const BACKLOG: FilaEpica[] = [
  {
    epica: "A. Control de acceso real a cursos comprados",
    horas: "3h",
    conMargen: "3.6h",
    nota: "Solo lógica de aplicación; tablas y RLS ya existen.",
  },
  {
    epica: "B. Cobro / Stripe",
    horas: "14h",
    conMargen: "16.8h",
    nota: "Checkout, webhooks, sincronización con inscripciones/membresía.",
    riesgo: "Bloqueo externo",
  },
  {
    epica: "C. Panel de coach (cursos/lecciones propios)",
    horas: "8h",
    conMargen: "9.6h",
    nota: "CRUD de cursos + lecciones, subida/enlace a Mux.",
  },
  {
    epica: "D. Panel de admin completo",
    horas: "9h",
    conMargen: "10.8h",
    nota: "Usuarios/roles, cursos, equipo/galería (hoy editados a mano por SQL).",
  },
  {
    epica: "E. 13 módulos de paridad con el sitio de referencia",
    horas: "35.5h",
    conMargen: "42.6h",
    nota: "Proyectos Aliados, Eventos, Aceleradores, Curso de Rentas, CRM, Marketing, Transacciones, Soporte, Oficinas, Herramientas.",
  },
  {
    epica: "F. Gamificación (quiz, XP, insignias)",
    horas: "11h",
    conMargen: "13.2h",
    nota: "UI de quiz, eventos de XP, insignias en dashboard/perfil.",
  },
  {
    epica: "G. Edge Functions + dominio de correo",
    horas: "10h",
    conMargen: "12h",
    nota: "Widget de nexus-chat, disparo de send-email, dominio real de envío.",
  },
  {
    epica: "I. QA final y regresión integral",
    horas: "6h",
    conMargen: "6h",
    nota: "Recorrido end-to-end de los tres roles antes de producción.",
  },
];

const DIAS = [
  { fecha: "13/07", dow: "Lun", finSemana: false },
  { fecha: "14/07", dow: "Mar", finSemana: false },
  { fecha: "15/07", dow: "Mié", finSemana: false },
  { fecha: "16/07", dow: "Jue", finSemana: false },
  { fecha: "17/07", dow: "Vie", finSemana: true },
  { fecha: "20/07", dow: "Lun", finSemana: false },
  { fecha: "21/07", dow: "Mar", finSemana: false },
  { fecha: "22/07", dow: "Mié", finSemana: false },
  { fecha: "23/07", dow: "Jue", finSemana: false },
  { fecha: "24/07", dow: "Vie", finSemana: true },
  { fecha: "27/07", dow: "Lun", finSemana: false },
  { fecha: "28/07", dow: "Mar", finSemana: false },
  { fecha: "29/07", dow: "Mié", finSemana: false },
  { fecha: "30/07", dow: "Jue", finSemana: false },
  { fecha: "31/07", dow: "Vie", finSemana: true },
  { fecha: "03/08", dow: "Lun", finSemana: false },
  { fecha: "04/08", dow: "Mar", finSemana: false },
  { fecha: "05/08", dow: "Mié", finSemana: false },
  { fecha: "06/08", dow: "Jue", finSemana: false },
];

type Barra = {
  label: string;
  colStart: number;
  colSpan: number;
  rango: string;
  tono: "critico" | "final" | "paralelo";
};

const CRONOGRAMA: Barra[] = [
  { label: "A · Acceso a cursos", colStart: 1, colSpan: 1, rango: "13/07", tono: "critico" },
  { label: "B · Stripe", colStart: 2, colSpan: 3, rango: "14–16/07", tono: "critico" },
  { label: "C · Panel de coach", colStart: 5, colSpan: 2, rango: "17, 20/07", tono: "critico" },
  { label: "D · Panel de admin", colStart: 7, colSpan: 2, rango: "21–22/07", tono: "critico" },
  { label: "E · 13 módulos contenido", colStart: 9, colSpan: 6, rango: "23–30/07", tono: "critico" },
  { label: "F · Gamificación", colStart: 15, colSpan: 2, rango: "31/07, 03/08", tono: "critico" },
  { label: "G · Edge Functions", colStart: 17, colSpan: 2, rango: "04–05/08", tono: "critico" },
  { label: "I · QA final", colStart: 19, colSpan: 1, rango: "06/08", tono: "final" },
  { label: "H1 · Datos placeholder", colStart: 1, colSpan: 19, rango: "en paralelo — depende del cliente", tono: "paralelo" },
];

const RIESGOS = [
  {
    titulo: "Stripe es un bloqueo externo, no de desarrollo.",
    detalle:
      "Si la cuenta, productos/precios y datos fiscales del negocio no están listos para el 14/07, la Épica B se retrasa día por día sin importar el ritmo de código.",
  },
  {
    titulo: "El ritmo asumido (7.5h/día, Lun–Vie) es más sostenible que el pico observado.",
    detalle:
      "El 09/07 y el 08/07 llegaron a 8h19–8h53; la sesión del 07/07 incluyó horas nocturnas (21:57–23:36) que no se proyectan hacia adelante.",
  },
  {
    titulo: "El trabajo visual/subjetivo es el mayor riesgo de desviación.",
    detalle:
      'La animación de partículas iteró ~15 commits en dos días sin un criterio de "terminado" claro. La Épica E (13 módulos con contenido real) es la más expuesta a este mismo patrón.',
  },
  {
    titulo: "Datos placeholder y dominio de correo dependen del cliente.",
    detalle:
      "Teléfono/correo reales de los Team Leaders y el dominio de envío verificado deben llegar antes de producción, pero no están en el camino crítico de desarrollo.",
  },
  {
    titulo: "No se asume tiempo de revisión/aprobación entre épicas.",
    detalle:
      "Si cada entregable requiere aprobación humana antes de continuar, sumar ese tiempo de espera a las fechas de este cronograma.",
  },
];

export function CronogramaPagina() {
  return (
    <div className="flex flex-col gap-14 pb-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
          Hoja de ruta interna
        </p>
        <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
          Cronograma de entrega
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-mist-400">
          Tiempo invertido, velocidad observada y fecha estimada de entrega, a partir del
          historial real de commits del repositorio.
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Tiempo invertido</h2>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          Ventanas de commits reales del 6 al 10 de julio (fundación del proyecto en Next.js
          hasta hoy). Se excluye el prototipo previo en Vite, descartado el 06/07.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-mono text-xs uppercase tracking-wider text-mist-500">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Ventana activa</th>
                <th className="px-5 py-3 font-medium">Horas</th>
                <th className="px-5 py-3 font-medium">Qué se entregó</th>
              </tr>
            </thead>
            <tbody>
              {TIEMPO_INVERTIDO.map((fila) => (
                <tr key={fila.fecha} className="border-b border-white/[0.06] last:border-b-0">
                  <td className="whitespace-nowrap px-5 py-3 text-mist-300">{fila.fecha}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-mist-400">
                    {fila.ventana}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-mist-300">
                    {fila.horas}
                  </td>
                  <td className="px-5 py-3 text-mist-400">{fila.detalle}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-gold-500/5">
                <td
                  colSpan={2}
                  className="px-5 py-3 font-mono text-xs uppercase tracking-wider text-gold-300"
                >
                  Total — 5 días, 100% laborables
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-gold-300">35h19</td>
                <td className="px-5 py-3 text-xs text-mist-400">
                  Promedio 7h04 activas/día · pico 8h53 · mínimo 2h46
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Velocidad observada</h2>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          Cuatro referencias, medidas de spec a producción, como base para estimar el trabajo
          restante.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VELOCIDAD.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className="font-mono text-2xl font-semibold text-gold-400">{stat.horas}</span>
              <span className="text-sm font-medium text-mist-300">{stat.label}</span>
              <span className="text-xs text-mist-500">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Alcance restante</h2>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          8 épicas hasta el objetivo de negocio, con 20% de margen por imprevistos — el mismo
          patrón de sobrecosto que mostró el pulido visual de la animación de partículas.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-mono text-xs uppercase tracking-wider text-mist-500">
                <th className="px-5 py-3 font-medium">Épica</th>
                <th className="px-5 py-3 font-medium">Horas netas</th>
                <th className="px-5 py-3 font-medium">Con margen</th>
                <th className="px-5 py-3 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {BACKLOG.map((fila) => (
                <tr key={fila.epica} className="border-b border-white/[0.06] last:border-b-0">
                  <td className="px-5 py-3 text-mist-300">
                    {fila.epica}
                    {fila.riesgo && (
                      <span className="ml-2 inline-block rounded-full border border-rose-400/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-rose-400">
                        {fila.riesgo}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-mist-400">
                    {fila.horas}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-gold-300">
                    {fila.conMargen}
                  </td>
                  <td className="px-5 py-3 text-mist-400">{fila.nota}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-gold-500/5">
                <td className="px-5 py-3 font-mono text-xs uppercase tracking-wider text-gold-300">
                  Total
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-gold-300">96.5h</td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-gold-300">114.6h</td>
                <td className="px-5 py-3 text-xs text-mist-400">≈ 15.3 días de 7.5h netas</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Cronograma</h2>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          19 días hábiles desde el lunes 13/07. Los datos placeholder de Team Leaders corren en
          paralelo — dependen de un insumo del cliente, no bloquean el camino crítico.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="min-w-[880px] p-4">
            <div
              className="grid items-stretch"
              style={{ gridTemplateColumns: `180px repeat(19, minmax(34px, 1fr))` }}
            >
              <div />
              {DIAS.map((dia, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center border-b border-white/10 py-2 font-mono text-[10px] text-mist-500 ${
                    dia.finSemana ? "border-r-2 border-r-white/20" : "border-r border-r-white/[0.06]"
                  }`}
                >
                  <span className="text-mist-400">{dia.fecha}</span>
                  <span className="opacity-70">{dia.dow}</span>
                </div>
              ))}

              {CRONOGRAMA.map((barra) => (
                <div key={barra.label} className="contents">
                  <div className="flex items-center border-b border-white/[0.06] px-2 py-3 font-display text-xs font-semibold text-mist-300">
                    {barra.label}
                  </div>
                  <div
                    className="relative border-b border-white/[0.06]"
                    style={{ gridColumn: `2 / span 19` }}
                  >
                    <div
                      className={`my-2 flex h-6 items-center overflow-hidden rounded px-2 font-mono text-[10px] whitespace-nowrap ${
                        barra.tono === "critico"
                          ? "bg-gold-500 text-ink-950"
                          : barra.tono === "final"
                            ? "bg-gold-300 text-ink-950"
                            : "border border-dashed border-mist-500 text-mist-400"
                      }`}
                      style={{
                        marginLeft: `calc((100% / 19) * ${barra.colStart - 1})`,
                        width: `calc((100% / 19) * ${barra.colSpan})`,
                      }}
                    >
                      {barra.rango}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-mist-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gold-500" /> Camino crítico
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gold-300" /> QA final
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-mist-500" />
            Paralelo / bloqueado por insumo externo
          </span>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Riesgos y supuestos</h2>
        <div className="mt-5 flex flex-col gap-4">
          {RIESGOS.map((riesgo, i) => (
            <div
              key={riesgo.titulo}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className="font-mono text-sm font-semibold text-rose-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-mist-400">
                <strong className="font-medium text-mist-200">{riesgo.titulo}</strong>{" "}
                {riesgo.detalle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
              Fecha de entrega estimada
            </p>
            <p className="text-gradient-gold mt-2 font-display text-4xl font-bold sm:text-5xl">
              06 de agosto, 2026
            </p>
          </div>
          <p className="max-w-sm font-mono text-xs text-mist-400">
            Rango: <span className="text-mist-200">31 jul</span> (piso, sin margen) —{" "}
            <span className="text-mist-200">06 ago</span> (con margen del 20%) · 19 días hábiles
            desde el 13/07.
          </p>
        </div>
      </section>
    </div>
  );
}
