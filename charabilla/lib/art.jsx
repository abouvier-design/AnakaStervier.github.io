// Croquis SVG intégrés — copiés tels quels depuis prototype/charabilla.jsx.
// Ils sont recolorés automatiquement par la palette de l'univers choisi.

// ============ CROQUIS INTÉGRÉS (SVG, en attendant la bibliothèque) ============
export const eye = (x, y, c, k) => <path key={k} d={`M ${x - 3} ${y} q 3 3 6 0`} stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
export const smile = (x, y, c, k) => <path key={k} d={`M ${x - 3.5} ${y} q 3.5 3 7 0`} stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />;
export const starPath = (cx, cy, r) => {
  let p = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    p += (i === 0 ? "M" : "L") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1) + " ";
  }
  return p + "Z";
};

export const ART = {
  chat: (p) => (<g>
    <path d="M70 76 q16 -2 13 -16" stroke={p.m} strokeWidth="7" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="70" rx="23" ry="17" fill={p.d} />
    <ellipse cx="50" cy="74" rx="11" ry="10" fill={p.l} />
    <path d="M37 27 l5 -11 l9 7 z M63 27 l-5 -11 l-9 7 z" fill={p.d} stroke={p.d} strokeWidth="5" strokeLinejoin="round" />
    <circle cx="50" cy="39" r="18" fill={p.d} />
    <ellipse cx="50" cy="45" rx="11" ry="7.5" fill={p.l} />
    {eye(43, 37, p.ink, "e1")}{eye(57, 37, p.ink, "e2")}
    <circle cx="50" cy="43.5" r="1.8" fill={p.ink} />{smile(50, 46.5, p.ink, "s")}
  </g>),
  chien: (p) => (<g>
    <ellipse cx="50" cy="70" rx="22" ry="16" fill={p.m} />
    <ellipse cx="50" cy="74" rx="10" ry="9" fill={p.l} />
    <circle cx="50" cy="38" r="18" fill={p.m} />
    <ellipse cx="32" cy="42" rx="6.5" ry="12" fill={p.d} />
    <ellipse cx="68" cy="42" rx="6.5" ry="12" fill={p.d} />
    <ellipse cx="50" cy="46" rx="10" ry="7.5" fill={p.l} />
    {eye(43, 36, p.ink, "e1")}{eye(57, 36, p.ink, "e2")}
    <ellipse cx="50" cy="44" rx="3" ry="2.4" fill={p.ink} />{smile(50, 48, p.ink, "s")}
  </g>),
  lapin: (p) => (<g>
    <ellipse cx="38" cy="22" rx="6" ry="15" fill={p.m} />
    <ellipse cx="62" cy="22" rx="6" ry="15" fill={p.m} />
    <ellipse cx="38" cy="23" rx="2.7" ry="10" fill={p.l} />
    <ellipse cx="62" cy="23" rx="2.7" ry="10" fill={p.l} />
    <ellipse cx="50" cy="72" rx="20" ry="15" fill={p.m} />
    <circle cx="50" cy="45" r="17" fill={p.m} />
    {eye(43.5, 44, p.ink, "e1")}{eye(56.5, 44, p.ink, "e2")}
    <circle cx="50" cy="50" r="1.8" fill={p.ink} />{smile(50, 53, p.ink, "s")}
    <ellipse cx="50" cy="77" rx="8" ry="7" fill={p.l} />
  </g>),
  ours: (p) => (<g>
    <circle cx="35" cy="26" r="8.5" fill={p.d} /><circle cx="65" cy="26" r="8.5" fill={p.d} />
    <circle cx="35" cy="26" r="4" fill={p.m} /><circle cx="65" cy="26" r="4" fill={p.m} />
    <ellipse cx="50" cy="70" rx="23" ry="17" fill={p.d} />
    <ellipse cx="50" cy="73" rx="12" ry="10" fill={p.m} />
    <circle cx="50" cy="40" r="19" fill={p.d} />
    <ellipse cx="50" cy="47" rx="10" ry="8" fill={p.m} />
    {eye(43, 38, p.ink, "e1")}{eye(57, 38, p.ink, "e2")}
    <ellipse cx="50" cy="45" rx="3" ry="2.4" fill={p.ink} />{smile(50, 49.5, p.ink, "s")}
  </g>),
  oiseau: (p) => (<g>
    <ellipse cx="48" cy="55" rx="24" ry="19" fill={p.m} />
    <path d="M44 55 q-16 4 -20 16 q14 2 24 -6" fill={p.d} />
    <path d="M70 48 l12 -4 l-9 9 z" fill={p.nat} stroke={p.nat} strokeWidth="3" strokeLinejoin="round" />
    <path d="M26 62 l-11 8 l13 2 z" fill={p.d} stroke={p.d} strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="52" cy="60" rx="10" ry="8" fill={p.l} />
    {eye(58, 47, p.ink, "e1")}
    <path d="M40 74 l0 8 M52 74 l0 8" stroke={p.ink} strokeWidth="2.6" strokeLinecap="round" />
  </g>),
  poisson: (p) => (<g>
    <ellipse cx="46" cy="52" rx="25" ry="17" fill={p.m} />
    <path d="M68 52 l16 -11 l-4 11 l4 11 z" fill={p.d} stroke={p.d} strokeWidth="3" strokeLinejoin="round" />
    <path d="M42 36 q6 -8 12 0" fill={p.d} />
    <path d="M30 52 q8 -7 16 0 q-8 7 -16 0" fill={p.l} />
    {eye(36, 49, p.ink, "e1")}{smile(34, 56, p.ink, "s")}
    <circle cx="55" cy="49" r="3" fill={p.d} opacity="0.5" /><circle cx="60" cy="55" r="2.4" fill={p.d} opacity="0.5" />
  </g>),
  canard: (p) => (<g>
    <ellipse cx="52" cy="62" rx="24" ry="17" fill={p.nat} />
    <path d="M52 60 q-14 2 -18 12 q12 3 22 -4" fill={p.m} />
    <circle cx="36" cy="38" r="13" fill={p.nat} />
    <path d="M24 38 q-8 0 -9 4 q4 4 11 2 z" fill={p.d} />
    {eye(38, 36, p.ink, "e1")}
    <path d="M70 66 q6 -2 6 -8" stroke={p.m} strokeWidth="5" fill="none" strokeLinecap="round" />
  </g>),
  escargot: (p) => (<g>
    <circle cx="58" cy="52" r="20" fill={p.d} />
    <circle cx="58" cy="52" r="13" fill={p.m} />
    <path d="M58 52 a7 7 0 0 1 7 7" stroke={p.l} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M22 60 q-2 -18 8 -20 M34 58 q-1 -14 6 -16" stroke={p.m} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="38" r="3.2" fill={p.m} /><circle cx="41" cy="40" r="3.2" fill={p.m} />
    <path d="M16 72 q10 -12 26 -8 q22 6 40 4 q-4 8 -18 8 l-40 0 q-8 0 -8 -4" fill={p.m} />
    {eye(26, 62, p.ink, "e1")}{smile(24, 67, p.ink, "s")}
  </g>),
  papillon: (p) => (<g>
    <ellipse cx="32" cy="38" rx="15" ry="13" fill={p.m} />
    <ellipse cx="68" cy="38" rx="15" ry="13" fill={p.m} />
    <ellipse cx="34" cy="62" rx="12" ry="10" fill={p.d} />
    <ellipse cx="66" cy="62" rx="12" ry="10" fill={p.d} />
    <circle cx="32" cy="38" r="5" fill={p.l} /><circle cx="68" cy="38" r="5" fill={p.l} />
    <ellipse cx="50" cy="52" rx="5" ry="16" fill={p.ink} opacity="0.85" />
    <path d="M46 34 q-3 -8 -8 -10 M54 34 q3 -8 8 -10" stroke={p.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </g>),
  voiture: (p) => (<g>
    <path d="M20 62 q0 -12 12 -12 l6 -10 q2 -3 6 -3 l14 0 q4 0 6 3 l6 10 q12 0 12 12 l0 6 q0 4 -4 4 l-54 0 q-4 0 -4 -4 z" fill={p.d} />
    <path d="M42 42 l12 0 q2 0 3 2 l4 6 l-24 0 l3 -6 q1 -2 2 -2" fill={p.l} />
    <circle cx="33" cy="72" r="7.5" fill={p.ink} /><circle cx="67" cy="72" r="7.5" fill={p.ink} />
    <circle cx="33" cy="72" r="3.2" fill={p.l} /><circle cx="67" cy="72" r="3.2" fill={p.l} />
    <circle cx="23" cy="60" r="2.6" fill={p.nat} />
  </g>),
  camion: (p) => (<g>
    <rect x="14" y="38" width="42" height="28" rx="5" fill={p.m} />
    <path d="M56 46 l14 0 q3 0 4 2 l6 10 q1 2 1 4 l0 4 l-25 0 z" fill={p.d} />
    <rect x="60" y="49" width="9" height="8" rx="2" fill={p.l} />
    <circle cx="28" cy="70" r="7" fill={p.ink} /><circle cx="66" cy="70" r="7" fill={p.ink} />
    <circle cx="28" cy="70" r="3" fill={p.l} /><circle cx="66" cy="70" r="3" fill={p.l} />
  </g>),
  train: (p) => (<g>
    <rect x="16" y="40" width="34" height="26" rx="6" fill={p.d} />
    <rect x="22" y="30" width="10" height="12" rx="3" fill={p.d} />
    <rect x="36" y="46" width="10" height="9" rx="2.5" fill={p.l} />
    <rect x="56" y="48" width="28" height="18" rx="5" fill={p.m} />
    <circle cx="26" cy="70" r="6" fill={p.ink} /><circle cx="42" cy="70" r="6" fill={p.ink} />
    <circle cx="64" cy="70" r="5" fill={p.ink} /><circle cx="78" cy="70" r="5" fill={p.ink} />
    <circle cx="27" cy="22" r="4" fill={p.l} opacity="0.9" />
  </g>),
  avion: (p) => (<g transform="rotate(-8 50 50)">
    <ellipse cx="50" cy="52" rx="30" ry="11" fill={p.m} />
    <path d="M46 48 l-14 -18 l10 0 l14 14 z" fill={p.d} />
    <path d="M46 58 l-12 16 l9 0 l13 -13 z" fill={p.d} />
    <path d="M76 46 l8 -10 l2 10 z" fill={p.d} />
    <circle cx="42" cy="50" r="3" fill={p.l} /><circle cx="52" cy="50" r="3" fill={p.l} /><circle cx="62" cy="50" r="3" fill={p.l} />
  </g>),
  bateau: (p) => (<g>
    <path d="M22 62 l56 0 l-8 14 q-1 2 -4 2 l-32 0 q-3 0 -4 -2 z" fill={p.d} />
    <rect x="48.5" y="24" width="3" height="38" rx="1.5" fill={p.ink} opacity="0.85" />
    <path d="M46 28 l-20 28 l20 0 z" fill={p.m} />
    <path d="M54 24 l22 32 l-22 0 z" fill={p.l} />
    <path d="M14 84 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0" stroke={p.m} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </g>),
  ballon: (p) => (<g>
    <path d="M50 68 q-2 8 2 12 M50 68 q2 6 -1 12" stroke={p.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="42" rx="22" ry="26" fill={p.d} />
    <path d="M46 64 l8 0 l-4 6 z" fill={p.d} />
    <ellipse cx="42" cy="32" rx="6" ry="9" fill={p.l} opacity="0.6" transform="rotate(-20 42 32)" />
  </g>),
  balle: (p) => (<g>
    <circle cx="50" cy="52" r="26" fill={p.m} />
    <path d="M24 52 q26 -14 52 0" stroke={p.l} strokeWidth="7" fill="none" />
    <path d="M24 52 q26 14 52 0" stroke={p.d} strokeWidth="7" fill="none" />
    <circle cx="40" cy="38" r="5" fill={p.l} opacity="0.7" />
  </g>),
  livre: (p) => (<g>
    <path d="M50 34 q-14 -8 -28 -4 l0 40 q14 -4 28 4 z" fill={p.m} />
    <path d="M50 34 q14 -8 28 -4 l0 40 q-14 -4 -28 4 z" fill={p.d} />
    <path d="M28 42 q11 -3 18 1 M28 50 q11 -3 18 1 M54 43 q11 -4 18 -1 M54 51 q11 -4 18 -1" stroke={p.l} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </g>),
  biberon: (p) => (<g>
    <ellipse cx="50" cy="18" rx="5" ry="6" fill={p.m} />
    <rect x="38" y="24" width="24" height="9" rx="4" fill={p.d} />
    <rect x="34" y="33" width="32" height="46" rx="10" fill={p.l} />
    <rect x="34" y="52" width="32" height="27" rx="10" fill={p.m} opacity="0.55" />
    <path d="M60 40 l0 8 M60 52 l0 8" stroke={p.d} strokeWidth="2.6" strokeLinecap="round" />
  </g>),
  tetine: (p) => (<g>
    <ellipse cx="50" cy="46" rx="22" ry="16" fill={p.m} />
    <circle cx="50" cy="42" r="8" fill={p.d} />
    <path d="M36 60 a16 12 0 0 0 28 0" stroke={p.d} strokeWidth="7" fill="none" strokeLinecap="round" />
    <circle cx="38" cy="42" r="3" fill={p.l} /><circle cx="62" cy="42" r="3" fill={p.l} />
  </g>),
  banane: (p) => (<g>
    <path d="M26 34 q4 34 34 40 q10 2 14 -4 q-2 8 -12 10 q-34 4 -42 -38 q-1 -6 3 -8 z" fill={p.nat} />
    <path d="M24 30 l6 -3 l3 6 l-6 3 z" fill={p.d} />
    <path d="M72 72 l6 2" stroke={p.d} strokeWidth="4" strokeLinecap="round" />
  </g>),
  pomme: (p) => (<g>
    <path d="M50 34 q-4 -10 -12 -12" stroke={p.d} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <ellipse cx="60" cy="26" rx="8" ry="5" fill={p.m} transform="rotate(-25 60 26)" />
    <path d="M50 36 q-6 -6 -14 -4 q-14 4 -12 22 q2 20 18 24 q4 1 8 -1 q4 2 8 1 q16 -4 18 -24 q2 -18 -12 -22 q-8 -2 -14 4 z" fill={p.d} />
    <ellipse cx="40" cy="48" rx="5" ry="8" fill={p.l} opacity="0.5" transform="rotate(15 40 48)" />
  </g>),
  compote: (p) => (<g>
    <path d="M28 34 l44 0 q4 0 4 4 l0 4 l-52 0 l0 -4 q0 -4 4 -4" fill={p.d} />
    <path d="M30 42 l40 0 l-3 34 q-1 6 -7 6 l-20 0 q-6 0 -7 -6 z" fill={p.m} />
    <ellipse cx="50" cy="60" rx="13" ry="11" fill={p.l} />
    <circle cx="50" cy="61" r="6.5" fill={p.d} />
    <path d="M50 55 q-1 -4 -4 -5" stroke={p.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>),
  fromage: (p) => (<g>
    <path d="M16 62 q34 -28 68 -14 l0 22 q0 4 -4 4 l-60 0 q-4 0 -4 -4 z" fill={p.nat} />
    <path d="M16 62 q34 -28 68 -14 l0 6 q-34 -12 -68 14 z" fill={p.d} opacity="0.85" />
    <circle cx="38" cy="66" r="4.5" fill={p.d} opacity="0.55" />
    <circle cx="56" cy="62" r="3.5" fill={p.d} opacity="0.55" />
    <circle cx="68" cy="68" r="4" fill={p.d} opacity="0.55" />
  </g>),
  gateau: (p) => (<g>
    <rect x="47.5" y="18" width="5" height="12" rx="2.5" fill={p.nat} />
    <ellipse cx="50" cy="17" rx="3" ry="4" fill={p.d} />
    <path d="M26 46 l48 0 q4 0 4 4 l0 26 q0 4 -4 4 l-48 0 q-4 0 -4 -4 l0 -26 q0 -4 4 -4" fill={p.m} />
    <path d="M22 50 q0 -6 6 -6 l44 0 q6 0 6 6 l0 4 q-4 6 -9 0 q-5 8 -10 0 q-5 8 -10 0 q-5 8 -10 0 q-5 6 -9 0 q-5 6 -8 -1 z" fill={p.l} />
    <circle cx="36" cy="68" r="2.6" fill={p.d} /><circle cx="50" cy="70" r="2.6" fill={p.d} /><circle cx="64" cy="68" r="2.6" fill={p.d} />
  </g>),
  glace: (p) => (<g>
    <circle cx="42" cy="38" r="13" fill={p.l} />
    <circle cx="58" cy="38" r="13" fill={p.m} />
    <circle cx="50" cy="30" r="13" fill={p.d} />
    <path d="M32 48 l36 0 l-15 34 q-3 5 -6 0 z" fill={p.nat} />
    <path d="M38 54 l24 0 M42 62 l16 0" stroke={p.d} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </g>),
  soleil: (p) => (<g>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return <line key={i} x1={50 + 30 * Math.cos(a)} y1={50 + 30 * Math.sin(a)} x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)} stroke={p.d} strokeWidth="6" strokeLinecap="round" />;
    })}
    <circle cx="50" cy="50" r="21" fill={p.nat} />
    <circle cx="44" cy="44" r="5" fill={p.l} opacity="0.6" />
  </g>),
  lune: (p) => (<g>
    <path d="M62 16 a36 36 0 1 0 22 62 a30 30 0 0 1 -22 -62" fill={p.nat} />
    <circle cx="42" cy="40" r="4" fill={p.l} opacity="0.6" /><circle cx="50" cy="60" r="3" fill={p.l} opacity="0.6" />
  </g>),
  etoile: (p) => (<g>
    <path d={starPath(50, 52, 32)} fill={p.nat} strokeLinejoin="round" stroke={p.nat} strokeWidth="6" />
    <circle cx="44" cy="44" r="4" fill={p.l} opacity="0.6" />
  </g>),
  nuage: (p) => (<g>
    <circle cx="38" cy="52" r="15" fill={p.l} />
    <circle cx="56" cy="46" r="18" fill={p.l} />
    <circle cx="70" cy="56" r="12" fill={p.l} />
    <rect x="26" y="52" width="54" height="14" rx="7" fill={p.l} />
  </g>),
  pluie: (p) => (<g>
    <circle cx="38" cy="42" r="13" fill={p.m} />
    <circle cx="55" cy="37" r="15" fill={p.m} />
    <circle cx="68" cy="45" r="10" fill={p.m} />
    <rect x="26" y="42" width="52" height="12" rx="6" fill={p.m} />
    <path d="M36 64 q-3 6 0 10 M52 64 q-3 6 0 10 M68 64 q-3 6 0 10" stroke={p.d} strokeWidth="4" fill="none" strokeLinecap="round" />
  </g>),
  fleur: (p) => (<g>
    <path d="M50 62 l0 24 M50 74 q8 -2 12 -8 M50 78 q-8 -2 -12 -8" stroke={p.d} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {Array.from({ length: 5 }).map((_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return <circle key={i} cx={50 + 13 * Math.cos(a)} cy={40 + 13 * Math.sin(a)} r="9.5" fill={p.m} />;
    })}
    <circle cx="50" cy="40" r="8" fill={p.nat} />
  </g>),
  arbre: (p) => (<g>
    <path d="M46 66 l8 0 l-1 20 l-6 0 z" fill={p.d} />
    <circle cx="36" cy="48" r="15" fill={p.m} />
    <circle cx="64" cy="48" r="15" fill={p.m} />
    <circle cx="50" cy="34" r="17" fill={p.m} />
    <circle cx="50" cy="50" r="14" fill={p.m} />
    <circle cx="42" cy="38" r="4" fill={p.l} opacity="0.55" /><circle cx="60" cy="50" r="3.4" fill={p.l} opacity="0.55" />
  </g>),
  maison: (p) => (<g>
    <path d="M50 18 l32 24 l-6 0 l0 32 q0 4 -4 4 l-44 0 q-4 0 -4 -4 l0 -32 l-6 0 z" fill={p.m} />
    <path d="M50 18 l32 24 l-8 0 l-24 -18 l-24 18 l-8 0 z" fill={p.d} />
    <rect x="43" y="56" width="14" height="22" rx="4" fill={p.d} />
    <rect x="28" y="50" width="10" height="10" rx="2.5" fill={p.l} />
    <rect x="62" y="50" width="10" height="10" rx="2.5" fill={p.l} />
  </g>),
  chaussure: (p) => (<g>
    <path d="M24 40 l0 24 l52 0 q6 0 6 -6 q0 -8 -12 -10 q-10 -2 -14 -8 q-2 -3 -6 -3 l-22 0 q-4 0 -4 3" fill={p.d} />
    <path d="M22 64 l60 0 q2 0 2 3 q0 5 -6 5 l-50 0 q-6 0 -6 -5 q0 -3 0 -3" fill={p.ink} opacity="0.85" />
    <path d="M42 42 l6 6 M50 40 l6 6" stroke={p.l} strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="30" cy="48" r="2.2" fill={p.l} />
  </g>),
  bonnet: (p) => (<g>
    <circle cx="50" cy="20" r="6.5" fill={p.l} />
    <path d="M26 62 q0 -30 24 -30 q24 0 24 30 z" fill={p.m} />
    <path d="M34 40 l0 18 M42 34 l0 24 M50 32 l0 26 M58 34 l0 24 M66 40 l0 18" stroke={p.d} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <rect x="24" y="60" width="52" height="12" rx="6" fill={p.l} />
  </g>),
};
export const SVG_MAP = {
  chat: "chat", chaton: "chat", chien: "chien", chiot: "chien", toutou: "chien",
  lapin: "lapin", ours: "ours", nounours: "ours", doudou: "ours",
  oiseau: "oiseau", poussin: "oiseau", poisson: "poisson", canard: "canard",
  escargot: "escargot", papillon: "papillon",
  voiture: "voiture", auto: "voiture", camion: "camion", train: "train",
  avion: "avion", bateau: "bateau", ballon: "ballon", balle: "balle", livre: "livre",
  biberon: "biberon", tetine: "tetine", sucette: "tetine",
  banane: "banane", pomme: "pomme", compote: "compote", fromage: "fromage",
  gateau: "gateau", glace: "glace",
  soleil: "soleil", lune: "lune", etoile: "etoile", nuage: "nuage", pluie: "pluie",
  fleur: "fleur", arbre: "arbre", maison: "maison",
  chaussure: "chaussure", basket: "chaussure", botte: "chaussure", bonnet: "bonnet", chapeau: "bonnet",
};
export const SVG_LIBRARY = Object.keys(ART);
export const SVG_NAMES = { chat: "chat", chien: "chien", lapin: "lapin", ours: "ours / doudou", oiseau: "oiseau", canard: "canard", poisson: "poisson", escargot: "escargot", papillon: "papillon", voiture: "voiture", camion: "camion", train: "train", avion: "avion", bateau: "bateau", ballon: "ballon", balle: "balle", livre: "livre", biberon: "biberon", tetine: "tétine", banane: "banane", pomme: "pomme", compote: "compote", fromage: "fromage", gateau: "gâteau", glace: "glace", soleil: "soleil", lune: "lune", etoile: "étoile", nuage: "nuage", pluie: "pluie", fleur: "fleur", arbre: "arbre", maison: "maison", chaussure: "chaussure", bonnet: "bonnet" };
export const EMOJI_PICKER_LIST = ["💧", "🥛", "🥖", "🍓", "🍊", "🥕", "🍬", "🍫", "🍝", "🥚", "🐮", "🐴", "🐷", "🐑", "🐔", "🐭", "🦁", "🐘", "🐵", "🐸", "🐢", "🐝", "👨", "👩", "👶", "👴", "👵", "🚲", "🚜", "🚌", "🛏️", "🛁", "🔑", "📱", "❄️", "🌊"];
