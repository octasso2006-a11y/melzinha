"use client";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projetar, type Analise } from "@/lib/calc";
import type { MelData } from "@/lib/types";
import { fmt0, fmtPct, mesCurto, mesLongo } from "@/lib/format";
import { Card, Kpi, Nota } from "../ui";
import { COR, Dica, Legenda, eixo, grade, tickK } from "../charts";

const FIXAS = new Set(["Custos da PJ", "Contas (celular)", "Juros e multas"]);

export function Simulador({ a, data }: { a: Analise; data: MelData }) {
  const alavancas = a.stats.filter((s) => s.media >= 20 && !FIXAS.has(s.categoria)).slice(0, 12);
  const [cortes, setCortes] = useState<Record<string, number>>({});
  const [extra, setExtra] = useState(0);
  const [meta, setMeta] = useState(Math.max(5000, Math.ceil((a.investBruto - a.reservaAtual + a.metaReserva) / 1000) * 1000));
  const [horiz, setHoriz] = useState(24);

  const economia = alavancas.reduce((s, c) => s + c.media * ((cortes[c.categoria] || 0) / 100), 0);
  const custoNovo = a.custoVidaMedia - economia;
  const sobraBase = a.capacidade;
  const sobraNova = a.rendaTrabalho + extra - custoNovo - a.impostosMedios;

  const base = useMemo(() => projetar(data.produtos, a.cdi, a.hoje, horiz, Math.max(0, sobraBase), a.metaReserva), [data.produtos, a, horiz, sobraBase]);
  const sim = useMemo(() => projetar(data.produtos, a.cdi, a.hoje, horiz, Math.max(0, sobraNova), a.metaReserva), [data.produtos, a, horiz, sobraNova]);
  const serie = base.map((b, i) => ({ mes: b.mes, "Como está hoje": b.bruto, "Com as mudanças": sim[i]?.bruto }));
  const quando = (p: typeof base) => { const i = p.findIndex((x) => x.bruto >= meta); return i < 0 ? null : i; };
  const qBase = quando(base), qSim = quando(sim);

  const set = (c: string, v: number) => setCortes((o) => ({ ...o, [c]: v }));
  const preset = (fn: (c: string) => number) => setCortes(Object.fromEntries(alavancas.map((c) => [c.categoria, fn(c.categoria)])));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Economia por mês" value={fmt0(economia)} tone="bom" hint={`${fmt0(economia * 12)} em 12 meses`} />
        <Kpi label="Novo custo de vida" value={fmt0(custoNovo)} hint={`hoje ${fmt0(a.custoVidaMedia)}`} />
        <Kpi label="Guardaria por mês" value={fmt0(sobraNova)} tone={sobraNova >= 0 ? "bom" : "ruim"} hint={`hoje ${fmt0(sobraBase)} · ${fmtPct(a.rendaTrabalho + extra ? sobraNova / (a.rendaTrabalho + extra) : null)} da renda`} />
        <Kpi label={`Chega em ${fmt0(meta)}`} value={qSim === null ? "fora do horizonte" : qSim === 0 ? "já chegou" : `${qSim} meses`} tone="mel" hint={qBase === null ? "sem mudanças: fora do horizonte" : `sem mudanças: ${qBase} meses`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2" title="Alavancas" subtitle="Quanto cortar em cada categoria (sobre a média recorrente)"
          right={<button onClick={() => { setCortes({}); setExtra(0); }} className="rounded-full px-2 py-1 text-xs text-cacau-400 hover:bg-mel-50">zerar</button>}>
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => preset(() => 10)} className="rounded-full bg-mel-50 px-3 py-1 text-xs font-medium text-mel-700 hover:bg-mel-100">Formiguinha: −10% em tudo</button>
            <button onClick={() => preset((c) => (["Comida", "Lazer", "Compras", "Pessoas"].includes(c) ? 25 : 0))} className="rounded-full bg-mel-50 px-3 py-1 text-xs font-medium text-mel-700 hover:bg-mel-100">Rolês e delivery −25%</button>
          </div>
          <div className="space-y-3.5">
            {alavancas.map((c) => {
              const v = cortes[c.categoria] || 0;
              return (
                <label key={c.categoria} className="block">
                  <div className="flex justify-between text-sm">
                    <span className="text-cacau-700">{c.categoria} <span className="text-xs text-cacau-400">· {fmt0(c.media)}/mês</span></span>
                    <span className={`tabular-nums ${v ? "font-medium text-salvia-700" : "text-cacau-400"}`}>{v ? `−${v}% · ${fmt0((c.media * v) / 100)}` : "—"}</span>
                  </div>
                  <input type="range" min={0} max={60} step={5} value={v} onChange={(e) => set(c.categoria, Number(e.target.value))} className="w-full accent-mel-500" />
                </label>
              );
            })}
            <label className="block border-t border-linha pt-3">
              <div className="flex justify-between text-sm"><span className="text-cacau-700">Renda extra (freelas)</span><span className="tabular-nums font-medium text-salvia-700">{extra ? `+${fmt0(extra)}` : "—"}</span></div>
              <input type="range" min={0} max={4000} step={50} value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="w-full accent-mel-500" />
            </label>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card title="Patrimônio investido" subtitle="Guardando toda a sobra todo mês, rendendo no BMG">
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-cacau-500">Meta: <b className="text-cacau-700">{fmt0(meta)}</b>
                <input type="range" min={5000} max={150000} step={1000} value={meta} onChange={(e) => setMeta(Number(e.target.value))} className="mt-2 w-full accent-mel-500" />
              </label>
              <label className="text-sm text-cacau-500">Horizonte: <b className="text-cacau-700">{horiz} meses</b>
                <input type="range" min={6} max={60} step={6} value={horiz} onChange={(e) => setHoriz(Number(e.target.value))} className="mt-2 w-full accent-mel-500" />
              </label>
            </div>
            <Legenda itens={[{ nome: "Com as mudanças", cor: COR.sobraPos, tipo: "linha" }, { nome: "Como está hoje", cor: COR.eixo, tipo: "linha" }, { nome: "Meta", cor: COR.mel, tipo: "tracejado" }]} />
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={serie}>
                  <CartesianGrid {...grade} />
                  <XAxis dataKey="mes" tickFormatter={mesCurto} {...eixo} minTickGap={24} />
                  <YAxis tickFormatter={tickK} {...eixo} width={44} />
                  <Tooltip content={<Dica titulo={(l) => mesLongo(String(l))} />} />
                  <ReferenceLine y={meta} stroke={COR.mel} strokeDasharray="5 4" />
                  <Line dataKey="Como está hoje" stroke={COR.eixo} strokeWidth={2} dot={false} />
                  <Line dataKey="Com as mudanças" stroke={COR.sobraPos} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-cacau-500">Em {horiz} meses: <b className="text-cacau-700">{fmt0(sim[sim.length - 1]?.bruto || 0)}</b> com as mudanças vs. {fmt0(base[base.length - 1]?.bruto || 0)} hoje (<b className="text-salvia-700">+{fmt0((sim[sim.length - 1]?.bruto || 0) - (base[base.length - 1]?.bruto || 0))}</b>).</p>
          </Card>

          <Card title="Onde cada 10% rende mais" subtitle="Economia mensal se você cortar 10% em cada categoria">
            <ul className="grid gap-2 sm:grid-cols-2">
              {alavancas.slice(0, 8).map((c) => (
                <li key={c.categoria} className="flex items-center justify-between rounded-xl bg-mel-50 px-3 py-2 text-sm">
                  <span className="text-cacau-700">{c.categoria}</span>
                  <span className="tabular-nums font-medium text-salvia-700">+{fmt0(c.media * 0.1)}/mês</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Nota>Simulação: renda do trabalho = mediana dos 3 últimos meses fechados; custo = média recorrente da janela de referência; sobra aplicada integralmente todo mês ao CDI das Premissas. Extraordinários não entram — se eles se repetirem, a sobra real será menor.</Nota>
    </div>
  );
}
