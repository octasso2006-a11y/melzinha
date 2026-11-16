import "server-only";
import { JWT } from "google-auth-library";
import { promises as fs } from "fs";
import path from "path";
import type { Lancamento, MelData, Produto } from "./types";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const RANGES = ["Dados!A2:J", "Produtos!A2:H", "Premissas!A2:B"];

type Cell = string | number | boolean | null | undefined;

function num(v: Cell): number {
  if (typeof v === "number") return v;
  if (v === null || v === undefined || v === "") return 0;
  const s = String(v).replace(/R\$\s?/g, "").trim();
  // aceita "1.234,56" (pt-BR) e "1234.56"
  const norm = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(norm);
  return Number.isFinite(n) ? n : 0;
}

/** Converte data vinda do Sheets (texto ISO, dd/mm/aaaa ou número serial) para YYYY-MM-DD. */
function isoDate(v: Cell): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") {
    const ms = Math.round((v - 25569) * 86400 * 1000);
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return s;
}

export function parseRows(dados: Cell[][], produtos: Cell[][], premissas: Cell[][]) {
  const lancamentos: Lancamento[] = [];
  dados.forEach((r, i) => {
    const data = isoDate(r[0]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
    lancamentos.push({
      id: `L${String(i + 2).padStart(4, "0")}`,
      data,
      mes: data.slice(0, 7),
      descricao: String(r[2] ?? "").trim(),
      tipo: String(r[3] ?? "").trim(),
      categoria: String(r[4] ?? "").trim() || "A classificar",
      conta: String(r[5] ?? "").trim(),
      valor: num(r[6]),
      status: String(r[7] ?? "Realizado").trim() || "Realizado",
      extra: String(r[8] ?? "").trim().toLowerCase() === "sim",
      obs: String(r[9] ?? "").trim(),
    });
  });

  const prods: Produto[] = produtos
    .filter((r) => r[0])
    .map((r) => ({
      produto: String(r[0]),
      funcao: String(r[1] ?? ""),
      pctCdi: num(r[2]),
      liquidez: String(r[3] ?? ""),
      dataAplicacao: isoDate(r[4]),
      aplicado: num(r[5]),
      prazoMeses: num(r[6]),
      isentoIr: String(r[7] ?? ""),
    }));

  const prem: Record<string, string | number> = {};
  premissas.forEach((r) => {
    if (!r[0]) return;
    const k = String(r[0]).trim();
    const v = r[1];
    prem[k] = k.startsWith("data") || k === "mes_foco" ? isoDate(v) : typeof v === "number" ? v : num(v) || String(v ?? "");
  });

  return { lancamentos, produtos: prods, premissas: prem };
}

async function fromSheets(): Promise<MelData> {
  const sheetId = process.env.SHEET_ID!;
  const client = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
  const qs = new URLSearchParams({
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  RANGES.forEach((r) => qs.append("ranges", r));
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${qs}`;
  const res = await client.request<{ valueRanges: { values?: Cell[][] }[] }>({ url });
  const [d, p, pr] = res.data.valueRanges.map((v) => v.values ?? []);
  return { ...parseRows(d, p, pr), fonte: "sheets", atualizadoEm: new Date().toISOString() };
}

async function fromLocal(): Promise<MelData | null> {
  try {
    const file = path.join(process.cwd(), "data", "local.json");
    const raw = JSON.parse(await fs.readFile(file, "utf8"));
    return { ...parseRows(raw.dados, raw.produtos, raw.premissas), fonte: "local", atualizadoEm: new Date().toISOString() };
  } catch {
    return null;
  }
}

export function sheetsConfigured() {
  return Boolean(process.env.SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

export async function getMelData(): Promise<{ data: MelData | null; erro?: string }> {
  if (sheetsConfigured()) {
    try {
      return { data: await fromSheets() };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { data: null, erro: msg };
    }
  }
  return { data: await fromLocal() };
}
