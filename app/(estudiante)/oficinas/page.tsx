import { Calendar, Clock, MapPin } from "lucide-react";

type Oficina = {
  ciudad: string;
  direccion: string;
  horario: string;
  urlCalendly: string;
};

const OFICINAS: Oficina[] = [
  {
    ciudad: "Miami",
    direccion: "7791 NW 46 St, Suite 417, Doral, FL 33166",
    horario: "Lun - Vie: 9:00 AM - 6:00 PM",
    urlCalendly: "https://calendly.com/myrealtygroupapp/conference-room-miami?month=2026-04",
  },
  {
    ciudad: "Orlando",
    direccion: "8810 Commodity Circle #4, Orlando, FL 32819",
    horario: "Lun - Vie: 9:00 AM - 6:00 PM",
    urlCalendly: "https://calendly.com/corporaterelations-teammyrealty/30min?month=2025-12",
  },
  {
    ciudad: "Tampa",
    direccion: "2014 Drew Street, Clearwater, FL 33765",
    horario: "Lun - Vie: 9:00 AM - 6:00 PM",
    urlCalendly: "https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04",
  },
  {
    ciudad: "West Palm Beach",
    direccion: "6685 Forest Hill Blvd, Suite 206, Greenacres, FL 33413",
    horario: "Lun - Vie: 9:00 AM - 6:00 PM",
    urlCalendly: "https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04",
  },
];

export default function OficinasPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Nuestras Oficinas
        </h1>
        <p className="mt-2 text-lg text-mist-400">Ubicaciones del equipo en Florida</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {OFICINAS.map((oficina) => (
          <div
            key={oficina.ciudad}
            className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="h-5 w-5 text-gold-300" aria-hidden="true" />
              <h3 className="font-display text-lg font-bold text-white">{oficina.ciudad}</h3>
            </div>

            <div className="aspect-video overflow-hidden rounded-xl border border-white/[0.08]">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(oficina.direccion)}&output=embed`}
                title={`Mapa de la oficina de ${oficina.ciudad}`}
                className="h-full w-full"
                loading="lazy"
              />
            </div>

            <p className="flex items-start gap-2 text-sm text-mist-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
              {oficina.direccion}
            </p>

            <p className="flex items-center gap-2 text-sm text-mist-300">
              <Clock className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
              {oficina.horario}
            </p>

            <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-300" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Reserva de Sala de Juntas</p>
              </div>
              <p className="mt-1.5 text-sm text-mist-300">
                Los agentes del equipo pueden reservar gratuitamente la sala de juntas.
              </p>
              <a
                href={oficina.urlCalendly}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-gold-500 px-5 text-sm font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 active:scale-[0.98]"
              >
                Reservar sala de juntas
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
