"use client";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Analise } from "@/lib/calc";
import type { MelData } from "@/lib/types";
import { fmt, fmt0, fmtPct, mesCurto, mesLongo } from "@/lib/format";
import { Card, Kpi, Pill } from "../ui";
import { COR, Dica, Legenda, eixo, grade, tickK } from "../charts";

export function VisaoGeral({ a, data, irPara }: { a: Analise; data: MelData; irPara: (m: string) => void }) {
  const serie = a.meses.map((m) => ({
    mes: m.mes,
    Entradas: m.entradas,
    Gastos: m.gastos,
    Impostos: m.impostos,
    Sobra: m.sobra,
    Recorrente: m.recorrente,
    Extraordinário: m.extra,
    parcial: m.mes >= a.mesAtual,
  }));

  const aClassificar = data.lancamentos.filter((l) => l.tipo === "Gasto" && l.categoria === "A classificar");
  const pendentes = data.lancamentos.filter((l) => l.status === "Pendente");
  const negativos = a.meses.filter((m) => m.sobra < 0 && m.mes < a.mesAtual);
  const difInv = a.informado ? a.investBruto - a.informado : 0;
  const usoCartao = a.limite ? a.foco.cartao / a.limite : 0;

  const alertas: { tom: "ruim" | "mel" | "neutro"; texto: string }[] = [];
  if (aClassificar.length)
    alertas.push({ tom: "mel", texto: `${aClassificar.length} gastos “A classificar” somando ${fmt(aClassificar.reduce((s, l) => s + l.valor, 0))} — classifique para o custo de vida ficar fiel.` });
  if (pendentes.length) alertas.push({ tom: "neutro", texto: `${pendentes.length} lançamentos pendentes (ainda não aconteceram).` });
  if (negativos.length) alertas.push({ tom: "ruim", texto: `Mês no vermelho: ${negativos.map((m) => mesCurto(m.mes)).join(", ")}.` });
  if (a.limite && usoCartao > 0.8) alertas.push({ tom: "ruim", texto: `Cartão em ${fmtPct(usoCartao)} do limite em ${mesCurto(a.foco.mes)} (${fmt(a.foco.cartao)} de ${fmt(a.limite)}).` });
  if (a.informado && Math.abs(difInv) > 50)
    alertas.push({ tom: "mel", texto: `Investimentos estimados (${fmt(a.investBruto)}) diferem do saldo informado (${fmt(a.informado)}) em ${fmt(difInv)} — confira datas e valores na aba Produtos.` });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Custo de vida" value={fmt0(a.custoVidaMediana)} hint={`mediana mensal, sem extraordinários · média ${fmt0(a.custoVidaMedia)}`} tone="mel" />
        <Kpi label="Renda do trabalho" value={fmt0(a.rendaTrabalho)} hint="mediana dos 3 últimos meses fechados" />
        <Kpi label="Dá pra guardar" value={fmt0(a.capacidade)} hint="renda − custo de vida médio − impostos" tone={a.capacidade >= 0 ? "bom" : "ruim"} />
        <Kpi label="Investido hoje" value={fmt0(a.investBruto)} hint={`estimado · líquido de IR ${fmt0(a.investLiq)}`} />
      </div>

      <Card title="Entra × sai, mês a mês" subtitle="Clique numa barra para abrir o mês. O mês atual ainda está em aberto.">
        <Legenda itens={[{ nome: "Entradas", cor: COR.entrada }, { nome: "Gastos", cor: COR.gasto }, { nome: "Sobra", cor: COR.sobraPos, tipo: "linha" }]} />
        <div className="h-72">
          <ResponsiveContainer>
            <ComposedChart data={serie} barGap={2} onClick={(e) => { const m = (e as { activeLabel?: string } | null)?.activeLabel; if (m) irPara(String(m)); }}>
              <CartesianGrid {...grade} />
              <XAxis dataKey="mes" tickFormatter={mesCurto} {...eixo} />
              <YAxis tickFormatter={tickK} {...eixo} width={44} />
              <Tooltip content={<Dica titulo={(l) => mesLongo(String(l))} />} cursor={{ fill: "rgba(223,157,54,.08)" }} />
              <ReferenceLine y={0} stroke={COR.eixo} />
              <Bar dataKey="Entradas" fill={COR.entrada} radius={[4, 4, 0, 0]} maxBarSize={22} className="cursor-pointer" />
              <Bar dataKey="Gastos" fill={COR.gasto} radius={[4, 4, 0, 0]} maxBarSize={22} className="cursor-pointer" />
              <Line dataKey="Sobra" stroke={COR.sobraPos} strokeWidth={2} dot={{ r: 4, fill: COR.sobraPos, stroke: "#FFFDF9", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Custo de vida" subtitle={`Gasto recorrente + extraordinário. Linha: mediana ${fmt0(a.custoVidaMediana)}.`}>
          <Legenda itens={[{ nome: "Recorrente", cor: COR.mel }, { nome: "Extraordinário", cor: COR.extra }, { nome: "Mediana", cor: COR.eixo, tipo: "tracejado" }]} />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={serie}>
                <CartesianGrid {...grade} />
                <XAxis dataKey="mes" tickFormatter={mesCurto} {...eixo} />
                <YAxis tickFormatter={tickK} {...eixo} width={44} />
                <Tooltip content={<Dica titulo={(l) => mesLongo(String(l))} />} cursor={{ fill: "rgba(223,157,54,.08)" }} />
                <Bar dataKey="Recorrente" stackId="c" fill={COR.mel} maxBarSize={30} stroke="#FFFDF9" strokeWidth={1}>
                  {serie.map((s) => <Cell key={s.mes} fillOpacity={s.parcial ? 0.55 : 1} />)}
                </Bar>
                <Bar dataKey="Extraordinário" stackId="c" fill={COR.extra} radius={[4, 4, 0, 0]} maxBarSize={30} stroke="#FFFDF9" strokeWidth={1} />
                <ReferenceLine y={a.custoVidaMediana} stroke={COR.eixo} strokeDasharray="5 4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Onde o dinheiro vai" subtitle="Média mensal recorrente na janela de referência">
          <ul className="space-y-2.5">
            {a.stats.slice(0, 8).map((s) => {
              const max = a.stats[0]?.media || 1;
              return (
                <li key={s.categoria}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-cacau-700">{s.categoria}</span>
                    <span className="tabular-nums text-cacau-500">{fmt0(s.media)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-mel-50">
                    <div className="h-2 rounded-full bg-mel-400" style={{ width: `${(s.media / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card title="Farejando furos" subtitle="O que a Mel encontrou e merece sua atenção">
        {alertas.length ? (
          <ul className="space-y-2">
            {alertas.map((x, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cacau-700">
                <Pill tone={x.tom}>{x.tom === "ruim" ? "atenção" : x.tom === "mel" ? "conferir" : "info"}</Pill>
                <span>{x.texto}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-cacau-500">Nada fora do lugar. Boa garota. 🐾</p>
        )}
      </Card>
    </div>
  );
}
