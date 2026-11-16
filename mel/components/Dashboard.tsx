"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MelData } from "@/lib/types";
import { analisar } from "@/lib/calc";
import { cap, mesCurto, mesLongo } from "@/lib/format";
import { MelLogo, Pegada } from "./MelLogo";
import { VisaoGeral } from "./tabs/VisaoGeral";
import { MesFoco } from "./tabs/MesFoco";
import { Recebimentos } from "./tabs/Recebimentos";
import { Investimentos } from "./tabs/Investimentos";
import { QuantoGuardar } from "./tabs/QuantoGuardar";
import { Simulador } from "./tabs/Simulador";
import { Lancamentos } from "./tabs/Lancamentos";

const ABAS = [
  { id: "geral", nome: "Visão geral" },
  { id: "mes", nome: "Mês em foco" },
  { id: "receb", nome: "Recebimentos" },
  { id: "inv", nome: "Investimentos" },
  { id: "guardar", nome: "Quanto guardar" },
  { id: "sim", nome: "Simulador" },
  { id: "lanc", nome: "Lançamentos" },
] as const;
type AbaId = (typeof ABAS)[number]["id"];

export function Dashboard({ data }: { data: MelData }) {
  const router = useRouter();
  const meses = useMemo(() => [...new Set(data.lancamentos.map((l) => l.mes))].sort(), [data]);
  const hoje = new Date().toISOString().slice(0, 10);
  const padrao = String(data.premissas.mes_foco || "").slice(0, 7);
  const [mesFoco, setMesFoco] = useState(meses.includes(padrao) ? padrao : meses.includes(hoje.slice(0, 7)) ? hoje.slice(0, 7) : meses[meses.length - 1]);
  const [aba, setAba] = useState<AbaId>("geral");
  const [atualizando, setAtualizando] = useState(false);
  const a = useMemo(() => analisar(data, mesFoco, hoje), [data, mesFoco, hoje]);

  const idx = meses.indexOf(mesFoco);

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-20 border-b border-linha bg-creme/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MelLogo size={42} />
            <div>
              <h1 className="font-display text-2xl font-semibold leading-none text-cacau-700">Mel</h1>
              <p className="text-xs text-cacau-400">suas finanças, farejadas de perto</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-full border border-linha bg-papel p-1 shadow-card">
              <button className="rounded-full px-2 py-1 text-cacau-500 hover:bg-mel-50 disabled:opacity-30" disabled={idx <= 0} onClick={() => setMesFoco(meses[idx - 1])} aria-label="Mês anterior">‹</button>
              <select value={mesFoco} onChange={(e) => setMesFoco(e.target.value)} className="bg-transparent px-1 text-sm font-medium text-cacau-700 outline-none" aria-label="Mês em foco">
                {meses.map((m) => (
                  <option key={m} value={m}>{cap(mesLongo(m))}</option>
                ))}
              </select>
              <button className="rounded-full px-2 py-1 text-cacau-500 hover:bg-mel-50 disabled:opacity-30" disabled={idx >= meses.length - 1} onClick={() => setMesFoco(meses[idx + 1])} aria-label="Próximo mês">›</button>
            </div>
            <button
              onClick={() => { setAtualizando(true); router.refresh(); setTimeout(() => setAtualizando(false), 1200); }}
              className="rounded-full border border-linha bg-papel px-3 py-2 text-xs font-medium text-cacau-500 shadow-card hover:bg-mel-50"
              title="Buscar de novo na planilha"
            >
              {atualizando ? "Farejando…" : "↻ Atualizar"}
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {ABAS.map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${aba === t.id ? "bg-cacau-700 text-mel-50" : "text-cacau-500 hover:bg-mel-100"}`}
            >
              {t.nome}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {aba === "geral" && <VisaoGeral a={a} data={data} irPara={(m) => { setMesFoco(m); setAba("mes"); }} />}
        {aba === "mes" && <MesFoco a={a} data={data} />}
        {aba === "receb" && <Recebimentos a={a} />}
        {aba === "inv" && <Investimentos a={a} data={data} />}
        {aba === "guardar" && <QuantoGuardar a={a} />}
        {aba === "sim" && <Simulador a={a} data={data} />}
        {aba === "lanc" && <Lancamentos data={data} mesFoco={mesFoco} />}
      </main>

      <footer className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-8 text-xs text-cacau-400 sm:px-6">
        <Pegada className="h-3.5 w-3.5 text-mel-400" />
        Dados: {data.fonte === "sheets" ? "Google Sheets" : "arquivo local"} · {data.lancamentos.length} lançamentos · referência de custo de vida: {a.janela.length ? `${mesCurto(a.janela[0].mes)} a ${mesCurto(a.janela[a.janela.length - 1].mes)}` : "—"}
      </footer>
    </div>
  );
}
