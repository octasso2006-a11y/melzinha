"use client";
import { useMemo, useState } from "react";
import type { MelData } from "@/lib/types";
import { dataCurta, fmt, mesLongo } from "@/lib/format";
import { Card, Pill } from "../ui";

const TIPOS = ["Todos", "Gasto", "Entrada", "Imposto", "Investimento", "Pagamento de fatura", "Transferência interna"];

export function Lancamentos({ data, mesFoco }: { data: MelData; mesFoco: string }) {
  const [mes, setMes] = useState<string>(mesFoco);
  const [tipo, setTipo] = useState("Gasto");
  const [cat, setCat] = useState("Todas");
  const [q, setQ] = useState("");
  const meses = useMemo(() => [...new Set(data.lancamentos.map((l) => l.mes))].sort().reverse(), [data]);
  const cats = useMemo(() => ["Todas", ...[...new Set(data.lancamentos.map((l) => l.categoria))].sort()], [data]);

  const lista = data.lancamentos
    .filter((l) => (mes === "todos" || l.mes === mes) && (tipo === "Todos" || l.tipo === tipo) && (cat === "Todas" || l.categoria === cat))
    .filter((l) => !q || `${l.descricao} ${l.obs} ${l.categoria}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.data < b.data ? 1 : -1));
  const total = lista.reduce((s, l) => s + l.valor, 0);

  const sel = "rounded-xl border border-linha bg-papel px-3 py-2 text-sm text-cacau-700 outline-none focus:border-mel-300";
  return (
    <Card title="Lançamentos" subtitle="Para corrigir algo, edite a aba Dados na planilha e clique em Atualizar.">
      <div className="mb-4 flex flex-wrap gap-2">
        <select className={sel} value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="todos">Todos os meses</option>
          {meses.map((m) => <option key={m} value={m}>{mesLongo(m)}</option>)}
        </select>
        <select className={sel} value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
        <select className={sel} value={cat} onChange={(e) => setCat(e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <input className={`${sel} min-w-48 flex-1`} placeholder="Buscar descrição…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-2 text-sm text-cacau-500">{lista.length} lançamentos · total <b className="tabular-nums text-cacau-700">{fmt(total)}</b></div>
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-linha">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-mel-50 text-left text-xs uppercase tracking-wider text-cacau-400">
            <tr><th className="px-3 py-2">Data</th><th className="px-3 py-2">Descrição</th><th className="px-3 py-2">Categoria</th><th className="px-3 py-2">Conta</th><th className="px-3 py-2 text-right">Valor</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-linha">
            {lista.map((l) => (
              <tr key={l.id} className={l.status === "Realizado" ? "bg-salvia-100/30" : ""}>
                <td className="px-3 py-2 tabular-nums text-cacau-500">{dataCurta(l.data)}</td>
                <td className="px-3 py-2 text-cacau-700">{l.descricao}{l.extra && <span className="ml-2"><Pill tone="mel">extra</Pill></span>}{l.obs && <div className="text-xs text-cacau-400">{l.obs}</div>}</td>
                <td className="px-3 py-2 text-cacau-500">{l.categoria}</td>
                <td className="px-3 py-2 text-cacau-500">{l.conta}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${l.valor < 0 ? "text-salvia-700" : "text-cacau-700"}`}>{fmt(l.valor)}</td>
                <td className="px-3 py-2"><Pill tone={l.status === "Realizado" ? "bom" : "neutro"}>{l.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
