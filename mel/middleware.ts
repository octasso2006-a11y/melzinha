import { NextResponse, type NextRequest } from "next/server";

/** Proteção simples por senha (HTTP Basic). Usuário: qualquer um. Senha: MEL_PASSWORD. */
export function middleware(req: NextRequest) {
  const senha = process.env.MEL_PASSWORD;
  if (!senha) return NextResponse.next();
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const [, pass] = atob(auth.slice(6)).split(":");
      if (pass === senha) return NextResponse.next();
    } catch {}
  }
  return new NextResponse("A Mel só abre a porta pra quem sabe a senha. 🐾", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mel", charset="UTF-8"', "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|icon.svg).*)"] };
