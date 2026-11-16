"use client";
import type { Analise } from "@/lib/calc";
import { fmt0, fmtPct, mesLongo } from "@/lib/format";
import { Barra, Card, Kpi, Nota } from "../ui";
import { COR } from "../charts";

const arred = (n: number) => Math.ceil(n / 10) * 10;

export function QuantoGuardar({ a }: { a: Analise }) {
  const renda = a.rendaTrabalho;
  const passos = [
    { nome: "Renda do trabalho", v: renda, cor: COR.entrada },
    { nome: "Custo de vida médio", v: -a.custoVidaMedia, cor: COR.gasto },
    { nome: "Impostos médios (DAS/DARF)", v: -a.impostosMedios, cor: "#A66518" },
  ];
  const sobra = a.capacidade;
  const faltaReserva = Math.max(0, a.metaReserva - a.reservaAtual);
  const paraReserva = Math.max(0, Math.min(sobra, faltaReserva));
  const paraLongo = Math.max(0, sobra - paraReserva);
  const orc = a.stats.filter((s) => s.media > 1).map((s) => ({ ...s, teto: arred(s.media) }));
  const totalTeto = orc.reduce((s, x) => s + x.teto, 0);
  const totalFoco = orc.reduce((s, x) => s + x.foco, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Dá pra guardar / mês" value={fmt0(sobra)} tone={sobra >= 0 ? "bom" : "ruim"} hint={`${fmtPct(renda ? sobra / renda : null)} da renda do trabalho`} />
        <Kpi label="Orçamento total" value={fmt0(totalTeto)} hint="soma dos tetos por categoria" tone="mel" />
        <Kpi label="Para a reserva" value={fmt0(paraReserva)} hint={faltaReserva ? `faltam ${fmt0(faltaReserva)} para a meta` : "meta batida"} />
        <Kpi label="Para o longo prazo" value={fmt0(paraLongo)} hint="o que sobra depois da reserva" />
      </div>

      <Card title="Da renda à sobra" subtitle="Como a conta fecha num mês típico">
        <div className="space-y-3">
          {passos.map((p) => (
            <div key={p.nome} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[220px_1fr_110px]">
              <span className="text-sm text-cacau-700">{p.nome}</span>
              <div className="hidden h-3 rounded-full bg-mel-50 sm:block">
                <div className="h-3 rounded-full" style={{ width: `${renda ? (Math.abs(p.v) / renda) * 100 : 0}%`, background: p.cor }} />
              </div>
              <span className="text-right text-sm tabular-nums">{p.v < 0 ? "−" : ""}{fmt0(Math.abs(p.v))}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-linha pt-3 sm:grid-cols-[220px_1fr_110px]">
            <span className="text-sm font-semibold text-cacau-700">Sobra para guardar</span>
            <div className="hidden h-3 rounded-full bg-mel-50 sm:block">
              <div className="h-3 rounded-full" style={{ width: `${renda ? (Math.max(0, sobra) / renda) * 100 : 0}%`, background: COR.sobraPos }} />
            </div>
            <span className={`text-right text-sm font-semibold tabular-nums ${sobra >= 0 ? "text-salvia-700" : "text-coral-700"}`}>{fmt0(sobra)}</span>
          </div>
        </div>
      </Card>

      <Card title="Orçamento por categoria" subtitle={`Teto = sua média recorrente, arredondada. Barra = quanto já foi em ${mesLongo(a.foco.mes)}.`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-cacau-400">
              <tr><th className="pb-2">Categoria</th><th className="pb-2 text-right">Média</th><th className="pb-2 text-right">Teto</th><th className="w-2/5 pb-2 pl-6">No mês</th><th className="pb-2 text-right">Resta</th></tr>
            </thead>
            <tbody className="divide-y divide-linha">
              {orc.map((s) => {
                const resta = s.teto - s.foco;
                return (
                  <tr key={s.categoria}>
                    <td className="py-2 text-cacau-700">{s.categoria}</td>
                    <td className="py-2 text-right tabular-nums text-cacau-500">{fmt0(s.media)}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{fmt0(s.teto)}</td>
                    <td className="py-2 pl-6"><Barra valor={s.foco} max={Math.max(s.teto, s.foco)} cor={resta < 0 ? COR.gasto : COR.sobraPos} /></td>
                    <td className={`py-2 text-right tabular-nums ${resta < 0 ? "text-coral-700" : "text-cacau-500"}`}>{fmt0(resta)}</td>
                  </tr>
                );
              })}
              <tr className="font-semibold">
                <td className="pt-3">Total</td><td /><td className="pt-3 text-right tabular-nums">{fmt0(totalTeto)}</td>
                <td className="pl-6 pt-3"><Barra valor={totalFoco} max={Math.max(totalTeto, totalFoco)} cor={totalFoco > totalTeto ? COR.gasto : COR.mel} /></td>
                <td className="pt-3 text-right tabular-nums">{fmt0(totalTeto - totalFoco)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Nota>Ordem sugerida: primeiro completar a reserva ({a.metaMeses} meses de custo de vida, em liquidez diária), depois longo prazo. Gastos extraordinários (batidas, viagens, Apple Watch) ficam fora do teto. Vale ter uma “caixinha” para eles. Isso é organização, não recomendação de investimento.</Nota>
    </div>
  );
}
