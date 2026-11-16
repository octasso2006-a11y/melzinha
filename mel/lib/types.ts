export type Tipo =
  | "Entrada"
  | "Gasto"
  | "Imposto"
  | "Investimento"
  | "Pagamento de fatura"
  | "Transferência interna";

export interface Lancamento {
  id: string;
  data: string; // YYYY-MM-DD
  mes: string; // YYYY-MM
  descricao: string;
  tipo: Tipo | string;
  categoria: string;
  conta: string;
  valor: number;
  status: "Realizado" | "Pendente" | string;
  extra: boolean;
  obs: string;
}

export interface Produto {
  produto: string;
  funcao: string;
  pctCdi: number; // ex.: 107
  liquidez: string;
  dataAplicacao: string; // YYYY-MM-DD
  aplicado: number;
  prazoMeses: number;
  isentoIr: string;
}

export interface MelData {
  lancamentos: Lancamento[];
  produtos: Produto[];
  premissas: Record<string, string | number>;
  fonte: "sheets" | "local";
  atualizadoEm: string;
}
