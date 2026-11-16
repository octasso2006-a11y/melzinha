import { getMelData, sheetsConfigured } from "@/lib/sheets";
import { Dashboard } from "@/components/Dashboard";
import { MelLogo } from "@/components/MelLogo";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data, erro } = await getMelData();
  if (data && data.lancamentos.length) return <Dashboard data={data} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <MelLogo size={96} />
      <h1 className="font-display text-3xl font-semibold">A Mel ainda não achou a planilha</h1>
      {erro ? (
        <p className="rounded-xl bg-coral-100 px-4 py-3 text-sm text-coral-700">Erro ao ler o Google Sheets: {erro}</p>
      ) : (
        <p className="text-cacau-500">
          {sheetsConfigured() ? "A planilha está vazia." : "Configure as variáveis de ambiente (SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) — o passo a passo está no README."}
        </p>
      )}
      <p className="text-xs text-cacau-400">Lembre de compartilhar a planilha com o e-mail da conta de serviço como Leitor.</p>
    </main>
  );
}
