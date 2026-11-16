const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const fmt = (n: number) => brl.format(n || 0);
export const fmt0 = (n: number) => brl0.format(Math.round(n || 0));
export const fmtPct = (n: number | null | undefined) => (n === null || n === undefined || !isFinite(n) ? "—" : pct.format(n));
export const fmtK = (n: number) =>
  Math.abs(n) >= 1000 ? `R$ ${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : `R$ ${Math.round(n)}`;

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const mesCurto = (m: string) => `${MESES[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`;
export const mesLongo = (m: string) => `${MESES_LONGOS[Number(m.slice(5, 7)) - 1]} de ${m.slice(0, 4)}`;
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const dataCurta = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
