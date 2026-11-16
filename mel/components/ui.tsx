"use client";
import type { ReactNode } from "react";

export function Card({ title, subtitle, right, children, className = "" }: {
  title?: ReactNode; subtitle?: ReactNode; right?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-linha bg-papel p-5 shadow-card ${className}`}>
      {(title || right) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-cacau-700">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-cacau-400">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

type Tone = "neutro" | "bom" | "ruim" | "mel";
const toneCls: Record<Tone, string> = {
  neutro: "text-cacau-700",
  bom: "text-salvia-700",
  ruim: "text-coral-700",
  mel: "text-mel-600",
};

export function Kpi({ label, value, hint, tone = "neutro", icon }: {
  label: string; value: ReactNode; hint?: ReactNode; tone?: Tone; icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-linha bg-papel p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-cacau-400">
        {icon}
        {label}
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold tabular-nums ${toneCls[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-cacau-400">{hint}</div>}
    </div>
  );
}

export function Delta({ v, invert = false, fmt }: { v: number; invert?: boolean; fmt: (n: number) => string }) {
  const good = invert ? v < 0 : v > 0;
  if (Math.abs(v) < 0.005) return <span className="text-cacau-400">=</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${good ? "bg-salvia-100 text-salvia-700" : "bg-coral-100 text-coral-700"}`}>
      {v > 0 ? "▲" : "▼"} {fmt(Math.abs(v))}
    </span>
  );
}

export function Barra({ valor, max, cor = "#DF9D36", marca }: { valor: number; max: number; cor?: string; marca?: number }) {
  const pct = max > 0 ? Math.min(100, (valor / max) * 100) : 0;
  const pm = marca !== undefined && max > 0 ? Math.min(100, (marca / max) * 100) : undefined;
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-mel-50">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
      {pm !== undefined && <div className="absolute top-0 h-full w-0.5 bg-cacau-700/70" style={{ left: `${pm}%` }} />}
    </div>
  );
}

export function Pill({ children, tone = "neutro" }: { children: ReactNode; tone?: Tone }) {
  const cls = {
    neutro: "bg-mel-50 text-cacau-500",
    bom: "bg-salvia-100 text-salvia-700",
    ruim: "bg-coral-100 text-coral-700",
    mel: "bg-mel-100 text-mel-700",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Nota({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-mel-50 px-3 py-2 text-xs leading-relaxed text-cacau-500">{children}</p>;
}
