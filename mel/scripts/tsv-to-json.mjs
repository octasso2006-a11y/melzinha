// Uso local (sem Google): node scripts/tsv-to-json.mjs caminho/Dados.tsv
// Gera data/local.json no mesmo formato que a API do Sheets devolve. O arquivo fica fora do git.
import fs from "fs";
const [, , tsv] = process.argv;
if (!tsv) { console.error("Informe o .tsv exportado da aba Dados (sem cabeçalho ou com)."); process.exit(1); }
const dados = fs.readFileSync(tsv, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split("\t")).filter((r) => /^\d{4}-\d{2}-\d{2}/.test(r[0]));
const produtos = [
  ["Super Poupança BMG", "Reserva de emergência", 107, "Diária", "2026-10-09", 3000, 0, "A confirmar"],
  ["CDB DI BMG", "Longo prazo", 112, "No vencimento (2 anos)", "2026-09-30", 6000, 24, "Não"],
];
const premissas = [["cdi_aa", 13.65], ["saldo_investido_informado", 9113], ["data_saldo_informado", "2026-11-16"], ["limite_cartao", 1600], ["meta_reserva_meses", 6], ["aporte_mensal_planejado", 1000], ["mes_foco", "2026-11-01"]];
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/local.json", JSON.stringify({ dados, produtos, premissas }));
console.log(`data/local.json com ${dados.length} lançamentos`);
