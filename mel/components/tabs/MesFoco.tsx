"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Analise } from "@/lib/calc";
import type { MelData } from "@/lib/types";
import { cap, dataCurta, fmt, fmt0, fmtPct, mesLongo } from "@/lib/format";
import { Barra, Card, Delta, Kpi, Nota, Pill } from "../ui";
import { COR, Dica, Legenda, eixo, grade, tickK } from "../charts";

export function MesFoco({ a, data }: { a: Analise; data: MelData }) {
  const f = a.foco;
  const ls = data.lancamentos.filter((l) => l.mes === f.mes);
  const gastos = ls.filter((l) => l.tipo === "Gasto");
  const [y, m] = f.mes.split("-").map(Number);
  const diasMes = new Date(y, m, 0).getDate();
  const aberto = f.mes >= a.mesAtual;
  const diaHoje = aberto ? Math.min(diasMes, Number(a.hoje.slice(8, 10))) : diasMes;

  // acumulado diário (recorrente) × ritmo da média
  const porDia = new Array(diasMes + 1).fill(0);
  gastos.filter((l) => !l.extra).forEach((l) => (porDia[Number(l.data.slice(8, 10))] += l.valor));
  let acc = 0;
  const ritmo = Array.from({ length: diasMes }, (_, i) => {
    const d = i + 1;
    acc += porDia[d];
    return { dia: d, "Este mês": d <= diaHoje ? Math.round(acc * 100) / 100 : undefined, "Ritmo médio": Math.round((a.custoVidaMedia * d) / diasMes) };
  });
  const projetado = aberto && diaHoje > 0 ? (f.recorrente / diaHoje) * diasMes : f.recorrente;

  const cats = a.stats.filter((s) => s.media > 0 || s.foco > 0);
  const maxCat = Math.max(1, ...cats.map((s) => Math.max(s.media, s.foco)));
  const top = [...gastos].sort((x, z) => z.valor - x.valor).slice(0, 8);
  const pend = ls.filter((l) => l.status === "Pendente");
  const usoCartao = a.limite ? f.cartao / a.limite : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-semibold text-cacau-700">{cap(mesLongo(f.mes))}</h2>
        {aberto && <Pill tone="mel">mês em aberto · dia {diaHoje} de {diasMes}</Pill>}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Entradas" value={fmt0(f.entradas)} hint={`trabalho: ${fmt0(f.entradasTrabalho)}`} />
        <Kpi label="Gastos" value={fmt0(f.gastos)} hint={<>recorrente {fmt0(f.recorrente)} <Delta v={f.recorrente - a.custoVidaMedia} invert fmt={fmt0} /></>} />
        <Kpi label="Impostos" value={fmt0(f.impostos)} />
        <Kpi label="Sobra" value={fmt0(f.sobra)} tone={f.sobra >= 0 ? "bom" : "ruim"} hint={`taxa de poupança ${fmtPct(f.taxa)}`} />
        <Kpi label="Cartão no mês" value={fmt0(f.cartao)} tone={usoCartao > 0.8 ? "ruim" : "neutro"} hint={a.limite ? `${fmtPct(usoCartao)} do limite de ${fmt0(a.limite)} · só realizados` : "compras realizadas no mês"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Ritmo de gasto" subtitle={aberto ? `No ritmo atual o mês fecha em ~${fmt0(projetado)} de gasto recorrente (média: ${fmt0(a.custoVidaMedia)}).` : `Fechou com ${fmt0(f.recorrente)} recorrente (média: ${fmt0(a.custoVidaMedia)}).`}>
          <Legenda itens={[{ nome: "Este mês (acumulado)", cor: COR.gasto, tipo: "linha" }, { nome: "Ritmo da média", cor: COR.eixo, tipo: "tracejado" }]} />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={ritmo}>
                <CartesianGrid {...grade} />
                <XAxis dataKey="dia" {...eixo} interval={4} />
                <YAxis tickFormatter={tickK} {...eixo} width={44} />
                <Tooltip content={<Dica titulo={(d) => `Dia ${d}`} />} />
                <Line dataKey="Ritmo médio" stroke={COR.eixo} strokeDasharray="5 4" strokeWidth={2} dot={false} />
                <Line dataKey="Este mês" stroke={COR.gasto} strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Maiores gastos do mês">
          <ul className="divide-y divide-linha">
            {top.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate text-cacau-700">{l.descricao}</div>
                  <div className="text-xs text-cacau-400">{dataCurta(l.data)} · {l.categoria}{l.extra ? " · extraordinário" : ""}</div>
                </div>
                <span className="shrink-0 tabular-nums font-medium text-cacau-700">{fmt(l.valor)}</span>
              </li>
            ))}
            {!top.length && <li className="py-2 text-sm text-cacau-400">Sem gastos neste mês.</li>}
          </ul>
        </Card>
      </div>

      <Card title="Categoria por categoria" subtitle="Barra = este mês (recorrente). Traço = sua média na janela de referência.">
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {cats.map((s) => (
            <div key={s.categoria}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-cacau-700">{s.categoria}</span>
                <span className="flex items-center gap-2 tabular-nums text-cacau-500">
                  {fmt0(s.foco)} <span className="text-cacau-400">/ {fmt0(s.media)}</span>
                </span>
              </div>
              <Barra valor={s.foco} max={maxCat} marca={s.media} cor={s.foco > s.media * 1.15 ? COR.gasto : COR.mel} />
            </div>
          ))}
        </div>
      </Card>

      {pend.length > 0 && (
        <Card title="Ainda vai acontecer" subtitle="Lançamentos marcados como Pendente">
          <ul className="divide-y divide-linha">
            {pend.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-cacau-700">{l.descricao} <span className="text-xs text-cacau-400">· {l.tipo}</span></span>
                <span className={`tabular-nums font-medium ${l.tipo === "Entrada" ? "text-salvia-700" : "text-cacau-700"}`}>{l.tipo === "Entrada" ? "+" : "−"}{fmt(l.valor)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Nota>Compras no cartão entram no mês da compra (não no da fatura). Pagamentos de fatura e transferências entre suas contas não contam como gasto, para não duplicar.</Nota>
    </div>
  );
}
