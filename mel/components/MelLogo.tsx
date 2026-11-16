/** Mel — vira-lata caramelo. Ilustração original, feita à mão em SVG. */
export function MelLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Mel">
      {/* orelha esquerda caída */}
      <path d="M14 18c-6 1-9 9-8 18 1 6 4 9 7 8 3-1 4-6 5-11 1-6 1-12-4-15z" fill="#7F4C16" />
      {/* orelha direita meio levantada (charme de vira-lata) */}
      <path d="M48 14c5-4 11-2 12 4 1 7-3 13-7 15-3 1-5-2-6-6-1-5-2-10 1-13z" fill="#7F4C16" />
      {/* cabeça */}
      <path d="M32 12c-12 0-19 8-19 20 0 13 8 22 19 22s19-9 19-22c0-12-7-20-19-20z" fill="#DF9D36" />
      {/* mancha clara na testa */}
      <path d="M32 15c-2 0-3 3-3 7s1 9 3 9 3-5 3-9-1-7-3-7z" fill="#F9E6C2" />
      {/* focinho */}
      <ellipse cx="32" cy="41" rx="11" ry="9" fill="#FDF5E6" />
      {/* olhos */}
      <ellipse cx="24" cy="30" rx="2.4" ry="2.8" fill="#24190F" />
      <ellipse cx="40" cy="30" rx="2.4" ry="2.8" fill="#24190F" />
      <circle cx="24.8" cy="29" r=".8" fill="#fff" />
      <circle cx="40.8" cy="29" r=".8" fill="#fff" />
      {/* sobrancelhas */}
      <path d="M21 25.5c1.5-1.4 4-1.6 5.6-.4" stroke="#A66518" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M37.4 25.1c1.6-1.2 4.1-1 5.6.4" stroke="#A66518" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* nariz */}
      <path d="M28 37.5c0-2 2-2.8 4-2.8s4 .8 4 2.8c0 1.8-2.2 3.3-4 3.3s-4-1.5-4-3.3z" fill="#24190F" />
      {/* boca */}
      <path d="M32 41v2.5M32 43.5c-1.2 1.6-3.4 1.8-4.8.6M32 43.5c1.2 1.6 3.4 1.8 4.8.6" stroke="#24190F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* linguinha */}
      <path d="M30.6 45.2c0 2.2.7 3.6 1.4 3.6s1.4-1.4 1.4-3.6" fill="#E46F6F" />
    </svg>
  );
}

export function Pegada({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="16" rx="5" ry="4.2" fill="currentColor" />
      <ellipse cx="5.5" cy="10" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="9.5" cy="6.2" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="14.5" cy="6.2" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="18.5" cy="10" rx="2.1" ry="2.7" fill="currentColor" />
    </svg>
  );
}
