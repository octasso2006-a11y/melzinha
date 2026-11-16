"use client";
import type { ReactNode } from "react";
import { fmt } from "@/lib/format";

/** Paleta categórica (ordem fixa — nunca reciclar). Do 8º em diante vira "Outros". */
export const CAT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6"];
export const OUTROS_COR = "#B8AA9A";
export const COR = {
  entrada: "#2a78d6",
  gasto: "#eb6834",
  extra: "#F2CF8B",
  mel: "#DF9D36",
  sobraPos: "#4F8A5F",
  sobraNeg: "#D2573A",
  grade: "#EDE3D4",
  eixo: "#8C7466",
};

export const eixo = { stroke: COR.eixo, fontSize: 12, tickLine: false, axisLine: false } as const;
export const grade = { stroke: COR.grade, strokeDasharray: "0", vertical: false } as const;
export const tickK = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : `${Math.round(v)}`);

type Item = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number; payload?: Record<string, unknown> };

export function Dica({ active, payload, label, titulo }: {
  active?: boolean; payload?: Item[]; label?: string | number; titulo?: (l: string | number | undefined) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-xl border border-linha bg-papel/95 px-3 py-2 text-xs shadow-card backdrop-blur">
      <div className="mb-1 font-semibold text-cacau-700">{titulo ? titulo(label) : label}</div>
      {payload
        .filter((p) => p.value !== undefined && p.value !== null && Number(p.value) !== 0)
        .map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-cacau-500">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-medium tabular-nums text-cacau-700">{fmt(Number(p.value))}</span>
          </div>
        ))}
    </div>
  );
}

export function Legenda({ itens }: { itens: { nome: string; cor: string; tipo?: "linha" | "bloco" | "tracejado" }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cacau-500">
      {itens.map((i) => (
        <span key={i.nome} className="flex items-center gap-1.5">
          {i.tipo === "linha" || i.tipo === "tracejado" ? (
            <span className="inline-block w-4 border-t-2" style={{ borderColor: i.cor, borderStyle: i.tipo === "tracejado" ? "dashed" : "solid" }} />
          ) : (
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: i.cor }} />
          )}
          {i.nome}
        </span>
      ))}
    </div>
  );
}
