import { createClient } from "@supabase/supabase-js";

const PILARES_SISTEMA_100 = [
  {
    titulo: "Mentalidad de Líder 100+",
    lecciones: ["Bienvenida al Sistema 100+", "Los 4 hábitos del top producer", "Plan de acción semanal"],
  },
  {
    titulo: "Prospección y Generación de Leads",
    lecciones: ["Fuentes de leads en 2026", "Guion de llamada en frío", "Seguimiento efectivo", "Automatiza tu prospección"],
  },
  {
    titulo: "Negociación y Cierre",
    lecciones: ["Psicología de la negociación", "Manejo de objeciones de precio", "Técnicas de cierre"],
  },
  {
    titulo: "Marca Personal del Agente",
    lecciones: ["Construye tu marca en redes", "Contenido que atrae clientes", "Testimonios y prueba social"],
  },
  {
    titulo: "Escalar tu Equipo",
    lecciones: ["Cuándo contratar tu primer agente", "Sistemas y procesos de equipo", "Cultura y retención de talento"],
  },
];

const CLASES = [
  {
    titulo: "Fundamentos de Bienes Raíces Comerciales",
    lecciones: ["Tipos de propiedad comercial", "Cap rate y valuación", "Tu primer deal comercial"],
  },
  {
    titulo: "Marketing Digital para Agentes",
    lecciones: ["Meta Ads para agentes", "Email marketing inmobiliario"],
  },
  {
    titulo: "Manejo de Objeciones en Preconstrucción",
    lecciones: ["Objeciones frecuentes", "Cierre en preconstrucción", "Casos reales"],
  },
  {
    titulo: "Finanzas Personales para Agentes Inmobiliarios",
    lecciones: ["Presupuesto con ingreso variable", "Impuestos del agente", "Ahorro e inversión"],
  },
  {
    titulo: "Servicio al Cliente de Alto Nivel",
    lecciones: ["La experiencia del cliente premium", "Postventa que genera referidos"],
  },
  {
    titulo: "Redes Sociales para Vender Más",
    lecciones: ["Instagram para agentes", "TikTok inmobiliario", "Reels que convierten", "Calendario de contenido"],
  },
];

export async function seedContenido({ supabaseUrl, serviceRoleKey }) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await seedGrupo(supabase, PILARES_SISTEMA_100, "sistema_100");
  await seedGrupo(supabase, CLASES, "clases");
}

async function seedGrupo(supabase, grupo, categoria) {
  for (const curso of grupo) {
    const { data: existente, error: buscarError } = await supabase
      .from("cursos")
      .select("id")
      .eq("titulo", curso.titulo)
      .maybeSingle();

    if (buscarError) {
      throw new Error(`No se pudo verificar el curso "${curso.titulo}": ${buscarError.message}`);
    }

    if (existente) {
      console.log(`Ya existe: ${curso.titulo}`);
      continue;
    }

    const { data: nuevoCurso, error: cursoError } = await supabase
      .from("cursos")
      .insert({ titulo: curso.titulo, categoria, publicado: true, precio: 0 })
      .select("id")
      .single();

    if (cursoError) {
      throw new Error(`No se pudo crear el curso "${curso.titulo}": ${cursoError.message}`);
    }

    const lecciones = curso.lecciones.map((tituloLeccion, indice) => ({
      curso_id: nuevoCurso.id,
      titulo: tituloLeccion,
      tipo_contenido: "video",
      orden: indice + 1,
    }));

    const { error: leccionesError } = await supabase.from("lecciones").insert(lecciones);

    if (leccionesError) {
      throw new Error(`No se pudieron crear las lecciones de "${curso.titulo}": ${leccionesError.message}`);
    }

    console.log(`Creado: ${curso.titulo} (${lecciones.length} lecciones)`);
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Faltan variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  await seedContenido({ supabaseUrl, serviceRoleKey });
  console.log("Seed de contenido completo.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
