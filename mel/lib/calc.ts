import type { Lancamento, MelData, Produto } from "./types";

export const FONTES = [
  "Salário V4",
  "Salário (estágio)",
  "Freela",
  "Venda de imóvel",
  "Renda (outras contas)",
  "Família",
  "Outras entradas",
] as const;

export const FONTES_TRABALHO = ["Salário V4", "Salário (estágio)", "Freela"];

export interface MesResumo {
  mes: string;
  entradas: number;
  entradasTrabalho: number;
  gastos: number;
  extra: number;
  recorrente: number;
  impostos: number;
  investido: number;
  sobra: number;
  taxa: number | null;
  cartao: number;
  pendentes: number;
  porCat: Record<string, number>;
  porCatRec: Record<string, number>;
  porFonte: Record<string, number>;
}

export interface CatStat {
  categoria: string;
  media: number;
  mediana: number;
  max: number;
  foco: number;
  mesesComGasto: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
const r2 = (n: number) => Math.round(n * 100) / 100;

export function addMonths(mes: string, n: number) {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export function monthRange(a: string, b: string) {
  const out: string[] = [];
  for (let m = a; m <= b; m = addMonths(m, 1)) out.push(m);
  return out;
}

export function resumoMensal(ls: Lancamento[]): MesResumo[] {
  if (!ls.length) return [];
  const meses = monthRange(
    ls.reduce((a, l) => (l.mes < a ? l.mes : a), ls[0].mes),
    ls.reduce((a, l) => (l.mes > a ? l.mes : a), ls[0].mes),
  );
  const base = (mes: string): MesResumo => ({
    mes, entradas: 0, entradasTrabalho: 0, gastos: 0, extra: 0, recorrente: 0, impostos: 0,
    investido: 0, sobra: 0, taxa: null, cartao: 0, pendentes: 0, porCat: {}, porCatRec: {}, porFonte: {},
  });
  const map = new Map(meses.map((m) => [m, base(m)]));
  for (const l of ls) {
    const r = map.get(l.mes)!;
    if (l.status === "Pendente") r.pendentes += 1;
    switch (l.tipo) {
      case "Entrada":
        r.entradas += l.valor;
        r.porFonte[l.categoria] = (r.porFonte[l.categoria] || 0) + l.valor;
        if (FONTES_TRABALHO.includes(l.categoria)) r.entradasTrabalho += l.valor;
        break;
      case "Gasto":
        r.gastos += l.valor;
        r.porCat[l.categoria] = (r.porCat[l.categoria] || 0) + l.valor;
        if (l.extra) r.extra += l.valor;
        else r.porCatRec[l.categoria] = (r.porCatRec[l.categoria] || 0) + l.valor;
        if (l.conta.toLowerCase().includes("cartão") && l.status !== "Pendente") r.cartao += l.valor;
        break;
      case "Imposto":
        r.impostos += l.valor;
        break;
      case "Investimento":
        r.investido += l.valor;
        break;
    }
  }
  for (const r of map.values()) {
    r.recorrente = r.gastos - r.extra;
    r.sobra = r.entradas - r.gastos - r.impostos;
    r.taxa = r.entradas > 0 ? r.sobra / r.entradas : null;
  }
  return meses.map((m) => map.get(m)!);
}

export function categoriasGasto(ls: Lancamento[]) {
  const tot: Record<string, number> = {};
  ls.filter((l) => l.tipo === "Gasto").forEach((l) => (tot[l.categoria] = (tot[l.categoria] || 0) + l.valor));
  return Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

/** Meses fechados usados como referência (antes do mês atual), limitados a `n`. */
export function janelaReferencia(meses: MesResumo[], mesAtual: string, n: number) {
  return meses.filter((m) => m.mes < mesAtual).slice(-n);
}

export function catStats(janela: MesResumo[], foco: MesResumo | undefined, cats: string[], recorrente = true): CatStat[] {
  return cats
    .map((c) => {
      const vals = janela.map((m) => (recorrente ? m.porCatRec[c] : m.porCat[c]) || 0);
      return {
        categoria: c,
        media: mean(vals),
        mediana: median(vals),
        max: Math.max(0, ...vals),
        foco: (foco && (recorrente ? foco.porCatRec[c] : foco.porCat[c])) || 0,
        mesesComGasto: vals.filter((v) => v > 0).length,
      };
    })
    .sort((a, b) => b.media - a.media);
}

// ---------- Investimentos ----------

export function aliquotaIR(dias: number) {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.2;
  if (dias <= 720) return 0.175;
  return 0.15;
}

const DAY = 86400000;
export const diasEntre = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / DAY));

export function taxaAnual(p: Produto, cdiAA: number) {
  return (cdiAA / 100) * (p.pctCdi / 100);
}

export function valorProduto(p: Produto, cdiAA: number, ate: string) {
  const dias = diasEntre(p.dataAplicacao, ate);
  const bruto = p.aplicado * Math.pow(1 + taxaAnual(p, cdiAA), dias / 365);
  const rend = bruto - p.aplicado;
  const isento = p.isentoIr.toLowerCase().startsWith("sim");
  const ir = isento ? 0 : rend * aliquotaIR(dias);
  return { dias, bruto, rend, ir, liquido: bruto - ir, aliquota: isento ? 0 : aliquotaIR(dias) };
}

export interface PontoProj {
  mes: string;
  aportado: number;
  bruto: number;
  liquido: number;
  semAporte: number;
}

/**
 * Projeção mês a mês: cada produto rende no próprio % do CDI; aportes mensais vão
 * para o produto de liquidez diária (reserva) até a meta e depois para o de maior taxa.
 */
export function projetar(
  produtos: Produto[], cdiAA: number, inicio: string, meses: number, aporteMensal: number, metaReserva: number,
): PontoProj[] {
  if (!produtos.length) return [];
  const reserva = produtos.find((p) => p.liquidez.toLowerCase().includes("diária")) ?? produtos[0];
  const melhor = [...produtos].sort((a, b) => b.pctCdi - a.pctCdi)[0];
  const saldos = produtos.map((p) => valorProduto(p, cdiAA, inicio).bruto);
  const saldosSem = [...saldos];
  const custo = produtos.map((p) => p.aplicado);
  let aportado = sum(custo);
  const out: PontoProj[] = [];
  const mes0 = inicio.slice(0, 7);
  for (let i = 0; i <= meses; i++) {
    if (i > 0) {
      produtos.forEach((p, k) => {
        const tm = Math.pow(1 + taxaAnual(p, cdiAA), 1 / 12) - 1;
        saldos[k] *= 1 + tm;
        saldosSem[k] *= 1 + tm;
      });
      const kRes = produtos.indexOf(reserva);
      const alvo = saldos[kRes] < metaReserva ? kRes : produtos.indexOf(melhor);
      saldos[alvo] += aporteMensal;
      custo[alvo] += aporteMensal;
      aportado += aporteMensal;
    }
    const bruto = sum(saldos);
    const rend = bruto - sum(custo);
    out.push({ mes: addMonths(mes0, i), aportado: r2(aportado), bruto: r2(bruto), liquido: r2(bruto - rend * 0.175), semAporte: r2(sum(saldosSem)) });
  }
  return out;
}

// ---------- Visão consolidada ----------

export function analisar(data: MelData, mesFoco: string, hoje = new Date().toISOString().slice(0, 10)) {
  const p = data.premissas;
  const cdi = Number(p.cdi_aa) || 13.65;
  const janelaN = Number(p.janela_meses) || 8;
  const metaMeses = Number(p.meta_reserva_meses) || 6;
  const limite = Number(p.limite_cartao) || 0;

  const meses = resumoMensal(data.lancamentos);
  const mesAtual = hoje.slice(0, 7);
  const janela = janelaReferencia(meses, mesAtual, janelaN);
  const foco = meses.find((m) => m.mes === mesFoco) ?? meses[meses.length - 1];
  const cats = categoriasGasto(data.lancamentos);
  const stats = catStats(janela, foco, cats, true);

  const custoVidaMediana = median(janela.map((m) => m.recorrente));
  const custoVidaMedia = mean(janela.map((m) => m.recorrente));
  const ult3 = janela.slice(-3);
  const rendaTrabalho = median(ult3.map((m) => m.entradasTrabalho));
  const impostosMedios = mean(janela.slice(-6).map((m) => m.impostos));
  const capacidade = rendaTrabalho - custoVidaMedia - impostosMedios;

  const invest = data.produtos.map((prod) => ({ prod, ...valorProduto(prod, cdi, hoje) }));
  const investBruto = sum(invest.map((i) => i.bruto));
  const investLiq = sum(invest.map((i) => i.liquido));
  const informado = Number(p.saldo_investido_informado) || 0;
  const reservaAtual = invest.filter((i) => i.prod.liquidez.toLowerCase().includes("diária")).reduce((a, i) => a + i.bruto, 0);
  const metaReserva = metaMeses * custoVidaMedia;

  return {
    meses, janela, foco, cats, stats, cdi, limite, mesAtual, hoje,
    custoVidaMediana, custoVidaMedia, rendaTrabalho, impostosMedios, capacidade,
    invest, investBruto, investLiq, informado, reservaAtual, metaReserva, metaMeses,
    aportePlanejado: Number(p.aporte_mensal_planejado) || Math.max(0, Math.round(capacidade / 50) * 50),
  };
}

export type Analise = ReturnType<typeof analisar>;
