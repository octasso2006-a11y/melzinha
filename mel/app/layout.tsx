import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mel · finanças",
  description: "Painel financeiro pessoal do Octávio, alimentado pela planilha.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#FBF6EE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
