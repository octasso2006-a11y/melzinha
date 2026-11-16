"use client";
import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projetar, taxaAnual, type Analise } from "@/lib/calc";
import type { MelData } from "@/lib/types";
import { dataCurta, fmt, fmt0, fmtPct, mesCurto, mesLongo } from "@/lib/format";
import { Barra, Card, Kpi, Nota, Pill } from "../ui";
import { COR, Dica, Legenda, eixo, grade, tickK } from "../charts";

export function Investimentos({ a, data }: { a: Analise; data: MelData }) {
  const [aporte, setAporte] = useState(a.aportePlanejado);
  const [meses, setMeses] = useState(24);
  const [cdi, setCdi] = useState(a.cdi);

  const proj = useMemo(
    () => projetar(data.produtos, cdi, a.hoje, meses, aporte, a.metaReserva),
    [data.produtos, cdi, a.hoje, meses, aporte, a.metaReserva],
  );
  const fim = proj[proj.length - 1];
  const serie = proj.map((p) => ({ mes: p.mes, "Com aportes": p.bruto, "Sem novos aportes": p.semAporte, "Dinheiro colocado": p.aportado }));
  const mesesMeta = proj.findIndex((p) => p.bruto >= a.metaReserva + (a.investBruto - a.reservaAtual));
  const pctReserva = a.metaReserva ? a.reservaAtual / a.metaReserva : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Valor estimado hoje" value={fmt(a.investBruto)} hint={`bruto · CDI ${a.cdi.toLocaleString("pt-BR")}% a.a.`} tone="mel" />
        <Kpi label="Se resgatasse hoje" value={fmt(a.investLiq)} hint="líquido de IR regressivo" />
        <Kpi label="Rendimento até aqui" value={fmt(a.investBruto - a.invest.reduce((s, i) => s + i.prod.aplicado, 0))} tone="bom" />
        <Kpi label="Saldo que você informou" value={a.informado ? fmt(a.informado) : "—"} hint={a.informado ? `diferença: ${fmt(a.investBruto - a.informado)}` : "preencha em Premissas"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {a.invest.map((i) => (
          <Card key={i.prod.produto} title={i.prod.produto} subtitle={i.prod.funcao} right={<Pill tone="mel">{i.prod.pctCdi}% do CDI</Pill>}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-cacau-400">Aplicado</dt><dd className="text-right tabular-nums">{fmt(i.prod.aplicado)} <span className="text-xs text-cacau-400">em {dataCurta(i.prod.dataAplicacao)}</span></dd>
              <dt className="text-cacau-400">Taxa efetiva</dt><dd className="text-right tabular-nums">{fmtPct(taxaAnual(i.prod, a.cdi))} a.a.</dd>
              <dt className="text-cacau-400">Liquidez</dt><dd className="text-right">{i.prod.liquidez}</dd>
              <dt className="text-cacau-400">Dias aplicado</dt><dd className="text-right tabular-nums">{i.dias}</dd>
              <dt className="text-cacau-400">Valor bruto</dt><dd className="text-right tabular-nums font-medium">{fmt(i.bruto)}</dd>
              <dt className="text-cacau-400">IR ({fmtPct(i.aliquota)})</dt><dd className="text-right tabular-nums text-coral-700">−{fmt(i.ir)}</dd>
              <dt className="text-cacau-400">Líquido</dt><dd className="text-right tabular-nums font-semibold text-salvia-700">{fmt(i.liquido)}</dd>
            </dl>
            {i.prod.isentoIr.toLowerCase().includes("confirmar") && <p className="mt-3 text-xs text-mel-700">IR considerado por segurança — confirme com o BMG se a Super Poupança é tributada.</p>}
          </Card>
        ))}
      </div>

      <Card title="Reserva de emergência" subtitle={`Meta: ${a.metaMeses} meses de custo de vida médio = ${fmt0(a.metaReserva)}`}>
        <div className="mb-2 flex justify-between text-sm"><span className="text-cacau-700">{fmt0(a.reservaAtual)} na reserva</span><span className="tabular-nums text-cacau-500">{fmtPct(pctReserva)}</span></div>
        <Barra valor={a.reservaAtual} max={a.metaReserva} cor={COR.sobraPos} />
        <p className="mt-2 text-xs text-cacau-400">Faltam {fmt0(Math.max(0, a.metaReserva - a.reservaAtual))}. {a.reservaAtual >= a.metaReserva ? "Meta batida — novos aportes podem ir para o longo prazo." : `Hoje a reserva cobre ${(a.reservaAtual / (a.custoVidaMedia || 1)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses.`}</p>
      </Card>

      <Card title="Simulação de crescimento" subtitle="Aportes mensais vão para a reserva até a meta e depois para o produto de maior taxa.">
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-cacau-500">Aporte mensal: <b className="text-cacau-700">{fmt0(aporte)}</b>
            <input type="range" min={0} max={5000} step={50} value={aporte} onChange={(e) => setAporte(Number(e.target.value))} className="mt-2 w-full accent-mel-500" />
          </label>
          <label className="text-sm text-cacau-500">Horizonte: <b className="text-cacau-700">{meses} meses</b>
            <input type="range" min={6} max={60} step={6} value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="mt-2 w-full accent-mel-500" />
          </label>
          <label className="text-sm text-cacau-500">CDI: <b className="text-cacau-700">{cdi.toLocaleString("pt-BR")}% a.a.</b>
            <input type="range" min={8} max={16} step={0.25} value={cdi} onChange={(e) => setCdi(Number(e.target.value))} className="mt-2 w-full accent-mel-500" />
          </label>
        </div>
        <Legenda itens={[{ nome: "Com aportes", cor: COR.mel }, { nome: "Sem novos aportes", cor: COR.entrada, tipo: "linha" }, { nome: "Dinheiro colocado", cor: COR.eixo, tipo: "tracejado" }]} />
        <div className="h-72">
          <ResponsiveContainer>
            <ComposedChart data={serie}>
              <defs>
                <linearGradient id="gMel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COR.mel} stopOpacity={0.35} /><stop offset="100%" stopColor={COR.mel} stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid {...grade} />
              <XAxis dataKey="mes" tickFormatter={mesCurto} {...eixo} minTickGap={24} />
              <YAxis tickFormatter={tickK} {...eixo} width={44} />
              <Tooltip content={<Dica titulo={(l) => mesLongo(String(l))} />} />
              <Area dataKey="Com aportes" stroke={COR.mel} strokeWidth={2} fill="url(#gMel)" />
              <Line dataKey="Sem novos aportes" stroke={COR.entrada} strokeWidth={2} dot={false} />
              <Line dataKey="Dinheiro colocado" stroke={COR.eixo} strokeDasharray="5 4" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {fim && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Kpi label={`Em ${meses} meses`} value={fmt0(fim.bruto)} hint={`líquido aprox. ${fmt0(fim.liquido)}`} tone="mel" />
            <Kpi label="Juros ganhos" value={fmt0(fim.bruto - fim.aportado)} tone="bom" hint={`sobre ${fmt0(fim.aportado)} colocados`} />
            <Kpi label="Reserva completa em" value={a.reservaAtual >= a.metaReserva ? "já está" : mesesMeta > 0 ? `${mesesMeta} meses` : "fora do horizonte"} hint={aporte === 0 ? "sem aportes a meta depende só dos juros" : undefined} />
          </div>
        )}
      </Card>

      <Nota>Estimativa: CDI constante, juros compostos por dias corridos, IR regressivo (22,5% até 180 dias → 15% após 720). Não considera IOF de resgates com menos de 30 dias. Ajuste CDI, datas e valores nas abas Premissas e Produtos da planilha.</Nota>
    </div>
  );
}
