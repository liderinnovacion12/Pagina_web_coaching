import { createHash } from "crypto";

const IS_PROD = process.env.NODE_ENV === "production";

const BASE_URL = IS_PROD
  ? "https://api.wompi.co/v1"
  : "https://sandbox.wompi.co/v1";

export const CHECKOUT_BASE = "https://checkout.wompi.co/p";

// ── Types ────────────────────────────────────────────────────────────────────

export type WompiStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export type WompiTransaction = {
  id: string;
  status: WompiStatus;
  amount_in_cents: number;
  reference: string;
  payment_method?: {
    type: string;
    extra?: { async_payment_url?: string };
  };
};

export type PseBanco = {
  financial_institution_code: string;
  financial_institution_name: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** SHA-256 integrity signature required by Wompi */
export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET ?? "";
  const raw = `${reference}${amountInCents}${currency}${secret}`;
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

/** Convert USD to COP cents (replace with a real exchange rate API in production) */
export const USD_TO_COP = 4_200;
export function toCopCents(usd: number): number {
  return Math.round(usd * USD_TO_COP) * 100;
}

/** Generate a unique idempotent reference */
export function makeReference(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── API client ───────────────────────────────────────────────────────────────

async function wompiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.WOMPI_PRIVATE_KEY;
  if (!key) throw new Error("WOMPI_PRIVATE_KEY no está configurada.");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...init?.headers,
    },
  });

  const json = await res.json() as { data?: T; error?: { type: string; messages: Record<string, string[]> } };
  if (!res.ok) {
    const msg = json.error?.messages
      ? Object.values(json.error.messages).flat().join(", ")
      : `Error Wompi ${res.status}`;
    throw new Error(msg);
  }
  return json.data as T;
}

// ── Bancos PSE ───────────────────────────────────────────────────────────────

/** Cached fallback list — refreshed each cold start via getBancosPSE() */
export const BANCOS_PSE_FALLBACK: PseBanco[] = [
  { financial_institution_code: "1007", financial_institution_name: "Bancolombia" },
  { financial_institution_code: "1051", financial_institution_name: "Davivienda" },
  { financial_institution_code: "1023", financial_institution_name: "Banco de Bogotá" },
  { financial_institution_code: "1017", financial_institution_name: "Banco de Occidente" },
  { financial_institution_code: "1002", financial_institution_name: "Banco Popular" },
  { financial_institution_code: "1052", financial_institution_name: "AV Villas" },
  { financial_institution_code: "1040", financial_institution_name: "Banco Agrario" },
  { financial_institution_code: "1013", financial_institution_name: "BBVA Colombia" },
  { financial_institution_code: "1006", financial_institution_name: "Itaú Corpbanca" },
  { financial_institution_code: "1069", financial_institution_name: "Scotiabank Colpatria" },
  { financial_institution_code: "1009", financial_institution_name: "Citibank" },
  { financial_institution_code: "1011", financial_institution_name: "Banco de Colombia" },
  { financial_institution_code: "1032", financial_institution_name: "Caja Social" },
  { financial_institution_code: "1019", financial_institution_name: "Colpatria" },
  { financial_institution_code: "1066", financial_institution_name: "Coopcentral" },
];

export async function getBancosPSE(): Promise<PseBanco[]> {
  try {
    return await wompiRequest<PseBanco[]>("/pse/financial_institutions");
  } catch {
    return BANCOS_PSE_FALLBACK;
  }
}

// ── Transactions ─────────────────────────────────────────────────────────────

type PseParams = {
  amountInCents: number;
  customerEmail: string;
  userType: 0 | 1;
  userLegalIdType: string;
  userLegalId: string;
  financialInstitutionCode: string;
  reference: string;
  description: string;
  redirectUrl: string;
};

export async function crearTransaccionPSE(p: PseParams): Promise<WompiTransaction> {
  const integrity = generateIntegritySignature(p.reference, p.amountInCents, "COP");
  return wompiRequest<WompiTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      amount_in_cents: p.amountInCents,
      currency: "COP",
      customer_email: p.customerEmail,
      payment_method: {
        type: "PSE",
        user_type: p.userType,
        user_legal_id_type: p.userLegalIdType,
        user_legal_id: p.userLegalId,
        financial_institution_code: p.financialInstitutionCode,
        payment_description: p.description,
      },
      reference: p.reference,
      customer_data: {
        phone_number: "0000000000",
        full_name: "Cliente Team100",
        legal_id: p.userLegalId,
        legal_id_type: p.userLegalIdType,
      },
      redirect_url: p.redirectUrl,
      signature: { integrity },
    }),
  });
}

type NequiParams = {
  amountInCents: number;
  customerEmail: string;
  phoneNumber: string;
  reference: string;
  description: string;
  redirectUrl: string;
};

export async function crearTransaccionNequi(p: NequiParams): Promise<WompiTransaction> {
  const integrity = generateIntegritySignature(p.reference, p.amountInCents, "COP");
  return wompiRequest<WompiTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      amount_in_cents: p.amountInCents,
      currency: "COP",
      customer_email: p.customerEmail,
      payment_method: {
        type: "NEQUI",
        phone_number: p.phoneNumber,
      },
      reference: p.reference,
      customer_data: {
        phone_number: p.phoneNumber,
        full_name: "Cliente Team100",
        legal_id: "0000000000",
        legal_id_type: "CC",
      },
      redirect_url: p.redirectUrl,
      signature: { integrity },
    }),
  });
}

export async function getTransaccion(id: string): Promise<WompiTransaction> {
  return wompiRequest<WompiTransaction>(`/transactions/${id}`);
}
