"use server";

import { createClient } from "@/lib/supabase/server";
import {
  crearTransaccionPSE,
  crearTransaccionNequi,
  getTransaccion,
  generateIntegritySignature,
  makeReference,
  toCopCents,
  CHECKOUT_BASE,
} from "@/lib/wompi/client";

export type PagoResult =
  | { ok: false; error: string }
  | { ok: true; redirectUrl: string }
  | { ok: true; transactionId: string; pendingNequi: true };

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://coaching.team100.co"
    : "http://localhost:3000");

async function resolverMonto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tipo: string,
  cursoId: string,
  leccionId?: string
): Promise<{ amountInCents: number; description: string } | { error: string }> {
  if (tipo === "membresia") {
    return {
      amountInCents: toCopCents(100),
      description: "Plan Ilimitado Team 100% — 1 mes",
    };
  }
  if (tipo === "leccion") {
    if (!leccionId) return { error: "No se especificó la lección." };
    const { data: leccion } = await supabase
      .from("lecciones")
      .select("titulo, precio")
      .eq("id", leccionId)
      .single();
    if (!leccion) return { error: "Lección no encontrada." };
    if (Number(leccion.precio) <= 0) return { error: "Esta lección no tiene precio configurado." };
    return {
      amountInCents: toCopCents(Number(leccion.precio)),
      description: `Video: ${leccion.titulo}`,
    };
  }
  if (!cursoId) return { error: "No se especificó el curso." };
  const { data: curso } = await supabase
    .from("cursos")
    .select("titulo, precio")
    .eq("id", cursoId)
    .single();
  if (!curso) return { error: "Curso no encontrado." };
  return {
    amountInCents: toCopCents(Number(curso.precio)),
    description: `Curso: ${curso.titulo}`,
  };
}

function resultadoUrl(tipo: string, cursoId?: string, leccionId?: string): string {
  let url = `${BASE_URL}/pago/resultado?tipo=${tipo}`;
  if (cursoId) url += `&cursoId=${cursoId}`;
  if (leccionId) url += `&leccionId=${leccionId}`;
  return url;
}

// ── PSE ──────────────────────────────────────────────────────────────────────

export async function iniciarPagoPSE(
  _prev: PagoResult | null,
  formData: FormData
): Promise<PagoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Inicia sesión de nuevo." };

  const tipo = String(formData.get("tipo") ?? "");
  const cursoId = String(formData.get("curso_id") ?? "");
  const leccionId = String(formData.get("leccion_id") ?? "") || undefined;
  const banco = String(formData.get("banco") ?? "");
  const tipoPersona = String(formData.get("tipo_persona") ?? "");
  const tipoDoc = String(formData.get("tipo_doc") ?? "");
  const numDoc = String(formData.get("num_doc") ?? "").trim();
  const emailPago = String(formData.get("email_pago") ?? "").trim();

  if (!banco || !tipoPersona || !tipoDoc || !numDoc || !emailPago) {
    return { ok: false, error: "Completa todos los campos antes de continuar." };
  }

  const monto = await resolverMonto(supabase, tipo, cursoId, leccionId);
  if ("error" in monto) return { ok: false, error: monto.error };

  const refPrefix = tipo === "membresia" ? `memb-${user.id.slice(0, 6)}` : tipo === "leccion" ? `lec-${(leccionId ?? "").slice(0, 6)}` : `curso-${cursoId.slice(0, 6)}`;
  const reference = makeReference(refPrefix);

  try {
    const tx = await crearTransaccionPSE({
      amountInCents: monto.amountInCents,
      customerEmail: emailPago,
      userType: tipoPersona === "juridica" ? 1 : 0,
      userLegalIdType: tipoDoc,
      userLegalId: numDoc,
      financialInstitutionCode: banco,
      reference,
      description: monto.description,
      redirectUrl: resultadoUrl(tipo, cursoId || undefined, leccionId),
    });

    const redirectUrl = tx.payment_method?.extra?.async_payment_url;
    if (!redirectUrl)
      return {
        ok: false,
        error: "El banco no devolvió una URL de pago. Intenta de nuevo.",
      };

    return { ok: true, redirectUrl };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al conectar con PSE.",
    };
  }
}

// ── Nequi / Daviplata ─────────────────────────────────────────────────────────

export async function iniciarPagoNequi(
  _prev: PagoResult | null,
  formData: FormData
): Promise<PagoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Inicia sesión de nuevo." };

  const tipo = String(formData.get("tipo") ?? "");
  const cursoId = String(formData.get("curso_id") ?? "");
  const leccionId = String(formData.get("leccion_id") ?? "") || undefined;
  const celular = String(formData.get("celular") ?? "")
    .trim()
    .replace(/\D/g, "");
  const emailPago = String(formData.get("email_pago") ?? "").trim();

  if (celular.length < 10)
    return { ok: false, error: "Ingresa un número de celular Nequi válido (10 dígitos)." };
  if (!emailPago) return { ok: false, error: "El correo es requerido." };

  const monto = await resolverMonto(supabase, tipo, cursoId, leccionId);
  if ("error" in monto) return { ok: false, error: monto.error };

  const refPrefix = tipo === "membresia" ? `memb-nequi-${user.id.slice(0, 6)}` : tipo === "leccion" ? `lec-nequi-${(leccionId ?? "").slice(0, 6)}` : `curso-nequi-${cursoId.slice(0, 6)}`;
  const reference = makeReference(refPrefix);

  try {
    const tx = await crearTransaccionNequi({
      amountInCents: monto.amountInCents,
      customerEmail: emailPago,
      phoneNumber: celular,
      reference,
      description: monto.description,
      redirectUrl: resultadoUrl(tipo, cursoId || undefined, leccionId),
    });

    return { ok: true, transactionId: tx.id, pendingNequi: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al conectar con Nequi.",
    };
  }
}

// ── Tarjeta (genera URL de checkout Wompi) ────────────────────────────────────

export async function generarUrlTarjeta(
  _prev: PagoResult | null,
  formData: FormData
): Promise<PagoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey)
    return { ok: false, error: "Pasarela de tarjetas no configurada aún." };

  const tipo = String(formData.get("tipo") ?? "");
  const cursoId = String(formData.get("curso_id") ?? "");
  const leccionId = String(formData.get("leccion_id") ?? "") || undefined;

  const monto = await resolverMonto(supabase, tipo, cursoId, leccionId);
  if ("error" in monto) return { ok: false, error: monto.error };

  const refPrefix = tipo === "membresia" ? `memb-card-${user.id.slice(0, 6)}` : tipo === "leccion" ? `lec-card-${(leccionId ?? "").slice(0, 6)}` : `curso-card-${cursoId.slice(0, 6)}`;
  const reference = makeReference(refPrefix);

  const signature = generateIntegritySignature(
    reference,
    monto.amountInCents,
    "COP"
  );

  const redirectUrl = encodeURIComponent(resultadoUrl(tipo, cursoId || undefined, leccionId));
  const checkoutUrl =
    `${CHECKOUT_BASE}/?public-key=${publicKey}` +
    `&currency=COP` +
    `&amount-in-cents=${monto.amountInCents}` +
    `&reference=${reference}` +
    `&signature:integrity=${signature}` +
    `&redirect-url=${redirectUrl}`;

  return { ok: true, redirectUrl: checkoutUrl };
}

// ── Confirmar pago al regresar de Wompi ───────────────────────────────────────

export async function confirmarPago(
  transactionId: string,
  tipo: string,
  cursoId?: string,
  leccionId?: string
): Promise<{ status: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "ERROR", error: "No autenticado." };

  let tx;
  try {
    tx = await getTransaccion(transactionId);
  } catch {
    return { status: "ERROR", error: "No se pudo verificar el pago." };
  }

  if (tx.status !== "APPROVED") return { status: tx.status };

  if (tipo === "membresia") {
    const periodoFin = new Date();
    periodoFin.setDate(periodoFin.getDate() + 30);
    await supabase.from("membresia").upsert(
      {
        usuario_id: user.id,
        estado: "activa",
        periodo_fin: periodoFin.toISOString(),
      },
      { onConflict: "usuario_id" }
    );
  } else if (tipo === "leccion" && leccionId) {
    await supabase
      .from("leccion_accesos")
      .upsert({ usuario_id: user.id, leccion_id: leccionId }, { onConflict: "usuario_id,leccion_id" });
  } else if (tipo === "curso" && cursoId) {
    const { data: yaInscrito } = await supabase
      .from("inscripciones")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("curso_id", cursoId)
      .maybeSingle();

    if (!yaInscrito) {
      await supabase.from("inscripciones").insert({
        usuario_id: user.id,
        curso_id: cursoId,
        origen: "compra_individual",
      });
    }
  }

  return { status: "APPROVED" };
}
