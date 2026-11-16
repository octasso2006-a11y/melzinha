"use client";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FONTES, median, type Analise } from "@/lib/calc";
import { fmt0, fmtPct, mesCurto, mesLongo } from "@/lib/format";
import { Card, Kpi, Nota } from "../ui";
import { CAT, COR, Dica, Legenda, eixo, grade, tickK } from "../charts";

export function Recebimentos({ a }: { a: Analise }) {
  const fontes = FONTES.filter((f) => a.meses.some((m) => m.porFonte[f]));
  const serie = a.meses.map((m) => ({ mes: m.mes, ...Object.fromEntries(fontes.map((f) => [f, Math.max(0, m.porFonte[f] || 0)])) }));
  const tot = fontes.map((f) => ({ f, v: a.meses.reduce((s, m) => s + (m.porFonte[f] || 0), 0) }));
  const total = tot.reduce((s, x) => s + x.v, 0);
  const trabalhoAno = a.meses.reduce((s, m) => s + m.entradasTrabalho, 0);
  const ult = a.janela.slice(-3);
  const v4 = ult.reduce((s, m) => s + (m.porFonte["Salário V4"] || 0), 0);
  const trab = ult.reduce((s, m) => s + m.entradasTrabalho, 0);
  const freelaMed = median(ult.map((m) => m.porFonte["Freela"] || 0));

  const cor = (f: string) => CAT[FONTES.indexOf(f as (typeof FONTES)[number])] ?? COR.eixo;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Renda do trabalho / mês" value={fmt0(a.rendaTrabalho)} hint="mediana, 3 últimos meses fechados" tone="mel" />
        <Kpi label="Freela / mês" value={fmt0(freelaMed)} hint="mediana, 3 últimos meses" />
        <Kpi label="Dependência da V4" value={fmtPct(trab ? v4 / trab : null)} hint="parte da renda do trabalho" />
        <Kpi label="Trabalho no ano" value={fmt0(trabalhoAno)} hint={`de ${fmt0(total)} recebidos no total`} />
      </div>

      <Card title="De onde vem o dinheiro" subtitle="Entradas por fonte. A venda do imóvel já aparece descontada do repasse ao Fabio.">
        <Legenda itens={fontes.map((f) => ({ nome: f, cor: cor(f) }))} />
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={serie}>
              <CartesianGrid {...grade} />
              <XAxis dataKey="mes" tickFormatter={mesCurto} {...eixo} />
              <YAxis tickFormatter={tickK} {...eixo} width={44} />
              <Tooltip content={<Dica titulo={(l) => mesLongo(String(l))} />} cursor={{ fill: "rgba(223,157,54,.08)" }} />
              <ReferenceLine y={0} stroke={COR.eixo} />
              {fontes.map((f, i) => (
                <Bar key={f} dataKey={f} stackId="e" fill={cor(f)} stroke="#FFFDF9" strokeWidth={1.5} maxBarSize={34} radius={i === fontes.length - 1 ? [4, 4, 0, 0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Resumo por fonte (ano)">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-cacau-400">
            <tr><th className="pb-2">Fonte</th><th className="pb-2 text-right">Total</th><th className="pb-2 text-right">Parte</th><th className="pb-2 text-right">Meses</th></tr>
          </thead>
          <tbody className="divide-y divide-linha">
            {tot.sort((x, y) => y.v - x.v).map(({ f, v }) => (
              <tr key={f}>
                <td className="py-2"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: cor(f) }} />{f}</td>
                <td className="py-2 text-right tabular-nums">{fmt0(v)}</td>
                <td className="py-2 text-right tabular-nums text-cacau-500">{fmtPct(total ? v / total : null)}</td>
                <td className="py-2 text-right tabular-nums text-cacau-500">{a.meses.filter((m) => m.porFonte[f]).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Nota>“Renda (outras contas)” são transferências da sua conta MEI e da XP PF que entravam como renda antes da V4. A venda do imóvel já aparece líquida do repasse ao Fabio.</Nota>
    </div>
  );
}
