import { useState, useEffect, useMemo, useRef } from "react";

// ============ THEMES ============
const THEMES = {
  terracotta: {
    label: "Terre de sienne", desc: "Bohème argile & sable",
    bg: "#F7EDE2", wash: "#F0DCC9", washEdge: "#E4C3A6",
    title: "#B96A45", word: "#6E4632", accent: "#D89B78",
    titleFont: "'Baloo 2', sans-serif", titleItalic: false,
    pal: { d: "#C67B52", m: "#DFA57F", l: "#F3DFC9", ink: "#6E4632", nat: "#E8B04B" },
    deco: "arches",
    prompt: (obj) => `Flat boho illustration of ${obj}, warm terracotta and sand palette (#B96A45, #D89B78, #F7EDE2), matte grainy texture, soft rounded organic shapes, thick simple forms, no outline, single centered subject, plain warm beige background (#F7EDE2), no text, no border, no white outline, no sticker effect. Natural object colors softened to harmonize with the palette. Animals and characters have closed happy eyes; objects have no face. Style: modern bohemian nursery art, warm and cozy. Square format.`,
  },
  botanique: {
    label: "Jardin botanique", desc: "Aquarelle sauge & crème",
    bg: "#F5F2E9", wash: "#E2EAD8", washEdge: "#C6D5B9",
    title: "#57704F", word: "#41503C", accent: "#8FA982",
    titleFont: "'Cormorant Garamond', serif", titleItalic: true,
    pal: { d: "#7C976F", m: "#A8BF97", l: "#EAEFDD", ink: "#41503C", nat: "#D3B36A" },
    deco: "leaves",
    prompt: (obj) => `Soft watercolor children's book illustration of ${obj}, sage green and cream palette (#57704F, #8FA982, #F5F2E9), delicate hand-painted texture with subtle watercolor edges, gentle rounded shapes, minimal details, no outline, single centered subject, plain cream background (#F5F2E9) identical on every image, no text, no border, no white outline, no sticker effect. Natural object colors softened into muted earthy watercolor tones that harmonize with the palette. Animals and characters have closed happy eyes; objects have no face. Style: vintage French imagier, tender and calm. Square format.`,
  },
  celeste: {
    label: "Nuit céleste", desc: "Bleu profond & or",
    bg: "#1F2A4D", wash: "#2C3A66", washEdge: "#44548F",
    title: "#E8C87A", word: "#F4EFE2", accent: "#E8C87A",
    titleFont: "'Comfortaa', sans-serif", titleItalic: false,
    pal: { d: "#E8C87A", m: "#C9A75E", l: "#F4EFE2", ink: "#1F2A4D", nat: "#E8C87A" },
    deco: "stars",
    prompt: (obj) => `Dreamy night-sky illustration of ${obj}, deep navy blue background (#1F2A4D) identical on every image, gold and cream palette (#E8C87A, #F4EFE2), soft glowing highlights as if lit by moonlight, matte grainy texture, rounded gentle shapes, no outline, single centered subject, exactly three tiny gold stars scattered around the subject (always three, same size), no text, no border, no white outline, no sticker effect. Natural object colors softened into muted moonlit tones that harmonize with the navy and gold palette. Animals and characters have closed sleepy happy eyes; objects have no face. Style: celestial nursery art, magical and soothing. Square format.`,
  },
};

const MAX_WORDS = 16;
const INK = "#33324E";
const CTA = "#E4589B";
const normalize = (s) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const keyify = (s) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ============ FR -> EN pour les prompts ============
const FR2EN = {
  chat: "a cat", chien: "a dog", lapin: "a rabbit", oiseau: "a little bird", poisson: "a fish",
  canard: "a duck", vache: "a cow", cheval: "a horse", cochon: "a pig", mouton: "a sheep",
  poule: "a hen", poussin: "a chick", ours: "a bear", souris: "a mouse", elephant: "an elephant",
  lion: "a lion", singe: "a monkey", grenouille: "a frog", tortue: "a turtle", papillon: "a butterfly",
  escargot: "a snail", abeille: "a bee", crocodile: "a crocodile", girafe: "a giraffe", loup: "a wolf",
  eau: "a glass of water", lait: "a glass of milk", biberon: "a baby bottle", pain: "a bread loaf",
  pomme: "an apple", banane: "a banana", fraise: "a strawberry", orange: "an orange fruit",
  compote: "an apple sauce pot", yaourt: "a yogurt pot with a spoon", fromage: "a cheese wedge",
  gateau: "a small birthday cake", biscuit: "a round cookie", chocolat: "a chocolate bar",
  bonbon: "a wrapped candy", glace: "an ice cream cone", pates: "a bowl of pasta", oeuf: "an egg",
  carotte: "a carrot", tomate: "a tomato", tetine: "a baby pacifier", cuillere: "a spoon",
  assiette: "a plate", verre: "a small cup", bol: "a bowl", couche: "a baby diaper",
  chaussure: "a small child shoe", chaussette: "a sock", manteau: "a child coat",
  bonnet: "a beanie hat with a pompom", pyjama: "child pajamas", doudou: "a soft baby comforter toy",
  nounours: "a teddy bear", ballon: "a balloon on a string", balle: "a ball", poupee: "a rag doll",
  livre: "an open picture book", cube: "three stacked building blocks", velo: "a child tricycle",
  bulles: "soap bubbles with a bubble wand", voiture: "a car", camion: "a truck", bus: "a bus",
  train: "a small train with one wagon", avion: "an airplane", bateau: "a sailboat",
  tracteur: "a tractor", lit: "a child bed", chaise: "a chair", table: "a table", porte: "a door",
  bain: "a bathtub with bubbles", pot: "a baby potty", cle: "a key", telephone: "a phone",
  television: "a television", lampe: "a bedside lamp", soleil: "the sun", lune: "a crescent moon",
  etoile: "a star", nuage: "a cloud", pluie: "a cloud with rain drops", fleur: "a flower",
  arbre: "a tree", feuille: "a leaf", neige: "a snowman", mer: "sea waves", maison: "a house",
  parc: "a playground slide", ecole: "a small school building", papa: "a dad character",
  maman: "a mom character", bebe: "a baby", papi: "a grandpa character", mamie: "a grandma character",
  musique: "a music note", "pate a modeler": "a playdough pot",
};
const toEnglish = (fr) => FR2EN[normalize(fr)] || `a ${normalize(fr)}`;

// ============ CROQUIS INTÉGRÉS (SVG, en attendant la bibliothèque) ============
const eye = (x, y, c, k) => <path key={k} d={`M ${x - 3} ${y} q 3 3 6 0`} stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
const smile = (x, y, c, k) => <path key={k} d={`M ${x - 3.5} ${y} q 3.5 3 7 0`} stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />;
const starPath = (cx, cy, r) => {
  let p = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    p += (i === 0 ? "M" : "L") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1) + " ";
  }
  return p + "Z";
};

const ART = {
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
const SVG_MAP = {
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
const SVG_LIBRARY = Object.keys(ART);
const SVG_NAMES = { chat: "chat", chien: "chien", lapin: "lapin", ours: "ours / doudou", oiseau: "oiseau", canard: "canard", poisson: "poisson", escargot: "escargot", papillon: "papillon", voiture: "voiture", camion: "camion", train: "train", avion: "avion", bateau: "bateau", ballon: "ballon", balle: "balle", livre: "livre", biberon: "biberon", tetine: "tétine", banane: "banane", pomme: "pomme", compote: "compote", fromage: "fromage", gateau: "gâteau", glace: "glace", soleil: "soleil", lune: "lune", etoile: "étoile", nuage: "nuage", pluie: "pluie", fleur: "fleur", arbre: "arbre", maison: "maison", chaussure: "chaussure", bonnet: "bonnet" };
const EMOJI_PICKER_LIST = ["💧", "🥛", "🥖", "🍓", "🍊", "🥕", "🍬", "🍫", "🍝", "🥚", "🐮", "🐴", "🐷", "🐑", "🐔", "🐭", "🦁", "🐘", "🐵", "🐸", "🐢", "🐝", "👨", "👩", "👶", "👴", "👵", "🚲", "🚜", "🚌", "🛏️", "🛁", "🔑", "📱", "❄️", "🌊"];

// ============ Grille ============
function gridFor(n) {
  if (n <= 1) return { tier: 1, cols: 1 };
  if (n <= 4) return { tier: 4, cols: 2 };
  if (n <= 8) return { tier: 8, cols: 2 };
  if (n <= 12) return { tier: 12, cols: 3 };
  return { tier: 16, cols: 4 };
}
const FORMATS = [
  { id: "carte", label: "Carte postale · 10 × 15 cm", price: 5, frame: false },
  { id: "a4", label: "A4 · 21 × 29,7 cm", price: 14, frame: true },
  { id: "a3", label: "A3 · 29,7 × 42 cm", price: 19, frame: true },
  { id: "3040", label: "30 × 40 cm", price: 24, frame: true },
  { id: "5070", label: "50 × 70 cm", price: 29, frame: true },
];
const FRAMES = [
  { id: "none", label: "Sans cadre", price: 0 },
  { id: "oak", label: "Cadre bois chêne", price: 25 },
  { id: "black", label: "Cadre bois noir", price: 25 },
];

function PosterDeco({ theme }) {
  if (theme.deco === "arches")
    return (
      <svg className="absolute top-0 right-0 pointer-events-none" width="90" height="60" style={{ opacity: 0.4 }}>
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          <path d="M 20 58 A 25 25 0 0 1 70 58" stroke={theme.washEdge} />
          <path d="M 30 58 A 15 15 0 0 1 60 58" stroke={theme.accent} />
          <path d="M 40 58 A 5 5 0 0 1 50 58" stroke={theme.title} />
        </g>
      </svg>
    );
  if (theme.deco === "leaves")
    return (
      <svg className="absolute top-0 left-0 pointer-events-none" width="80" height="70" style={{ opacity: 0.35 }}>
        <g stroke={theme.accent} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M 16 60 q 14 -26 38 -34" />
          <path d="M 22 50 q 8 1 11 7 M 31 40 q 8 1 11 7 M 41 31 q 7 1 10 6" />
        </g>
      </svg>
    );
  return (
    <svg className="absolute top-0 left-0 w-full h-16 pointer-events-none" style={{ opacity: 0.6 }} viewBox="0 0 400 60" preserveAspectRatio="none">
      <path d={starPath(30, 24, 6)} fill={THEMES.celeste.accent} />
      <path d={starPath(370, 18, 5)} fill={THEMES.celeste.accent} />
    </svg>
  );
}
function CellStars({ color }) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      <path d={starPath(14, 20, 4.5)} fill={color} />
      <path d={starPath(87, 32, 4.5)} fill={color} />
      <path d={starPath(22, 84, 4.5)} fill={color} />
    </svg>
  );
}

// Redimensionne une image uploadée en carré 512px (JPEG compact pour le stockage)
function resizeImage(file, size = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============ APP ============
export default function Charabilla() {
  const [childName, setChildName] = useState("");
  const [ageLine, setAgeLine] = useState("");
  const [titleStyle, setTitleStyle] = useState("dico");
  const [themeKey, setThemeKey] = useState("terracotta");
  const [words, setWords] = useState([]);
  const [realWord, setRealWord] = useState("");
  const [childWord, setChildWord] = useState("");
  const [pickerFor, setPickerFor] = useState(null);
  const [pendingArt, setPendingArt] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editReal, setEditReal] = useState("");
  const [editChild, setEditChild] = useState("");
  const [projects, setProjects] = useState({});
  const [notice, setNotice] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderFormat, setOrderFormat] = useState("a3");
  const [orderFrame, setOrderFrame] = useState("none");
  const [orderDone, setOrderDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Bibliothèque personnelle
  const [libIndex, setLibIndex] = useState({ terracotta: [], botanique: [], celeste: [] });
  const [imgCache, setImgCache] = useState({});
  const [uploading, setUploading] = useState(false);
  // Génération IA (flux avec validation)
  const [genOpen, setGenOpen] = useState(false);
  const [genWord, setGenWord] = useState("");
  const [genEn, setGenEn] = useState("");
  const [genImg, setGenImg] = useState(null);
  const [genTarget, setGenTarget] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const genFileRef = useRef(null);

  const theme = THEMES[themeKey];
  const libSet = useMemo(() => new Set(libIndex[themeKey] || []), [libIndex, themeKey]);

  // Priorité : bibliothèque perso > croquis intégré > emoji provisoire
  const suggestArt = (word) => {
    const w = normalize(word); const k = keyify(word);
    if (!w) return { type: "svg", id: "etoile" };
    if (libSet.has(k)) return { type: "lib", word: k };
    for (const key of libSet) { if (w.length >= 3 && (key.startsWith(k) || k.startsWith(key))) return { type: "lib", word: key }; }
    if (SVG_MAP[w]) return { type: "svg", id: SVG_MAP[w] };
    for (const key of Object.keys(SVG_MAP)) { if (w.length >= 3 && (key.startsWith(w) || w.startsWith(key))) return { type: "svg", id: SVG_MAP[key] }; }
    return null; // rien trouvé → proposera la génération
  };
  const autoArt = useMemo(() => suggestArt(realWord) || { type: "svg", id: "etoile" }, [realWord, libSet]);
  const newArt = pendingArt || autoArt;
  const noMatch = realWord.trim() && !pendingArt && !suggestArt(realWord);

  const { tier, cols } = gridFor(words.length);
  const rows = Math.ceil(tier / cols);
  const slots = [...words, ...Array(Math.max(0, tier - words.length)).fill(null)];
  const SIZES = {
    1: { art: "30cqw", word: "6.2cqw", blob: "40cqw" },
    4: { art: "16cqw", word: "4.6cqw", blob: "21cqw" },
    8: { art: "11cqw", word: "3.6cqw", blob: "14cqw" },
    12: { art: "9.5cqw", word: "3cqw", blob: "12.5cqw" },
    16: { art: "8cqw", word: "2.5cqw", blob: "10.5cqw" },
  };
  const S = SIZES[tier];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@1,600&family=Baloo+2:wght@600&family=Comfortaa:wght@600&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #poster, #poster * { visibility: visible !important; }
        #poster { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Chargement initial : projets + index bibliothèque
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("charabilla-projects");
        if (res && res.value) {
          const all = JSON.parse(res.value);
          setProjects(all.projects || {});
          if (all.last && all.projects && all.projects[all.last]) {
            const d = all.projects[all.last];
            setChildName(d.childName || ""); setAgeLine(d.ageLine || "");
            setTitleStyle(d.titleStyle || "dico");
            setThemeKey(THEMES[d.themeKey] ? d.themeKey : "terracotta");
            setWords((d.words || []).filter((w) => w.art));
          }
        }
      } catch (e) { /* première visite */ }
      try {
        const idx = await window.storage.get("charabilla-lib-index");
        if (idx && idx.value) setLibIndex({ terracotta: [], botanique: [], celeste: [], ...JSON.parse(idx.value) });
      } catch (e) { /* pas encore de bibliothèque */ }
      setLoaded(true);
    })();
  }, []);

  // Charge en cache les images de bibliothèque nécessaires (affiche + univers courant)
  useEffect(() => {
    if (!loaded) return;
    const needed = new Set();
    words.forEach((w) => { if (w.art.type === "lib" && libSet.has(w.art.word)) needed.add(w.art.word); });
    if (pickerFor !== null) (libIndex[themeKey] || []).slice(0, 40).forEach((k) => needed.add(k));
    const missing = [...needed].filter((k) => !imgCache[`${themeKey}:${k}`]);
    if (missing.length === 0) return;
    (async () => {
      const add = {};
      for (const k of missing) {
        try {
          const r = await window.storage.get(`charabilla-img-${themeKey}-${k}`);
          if (r && r.value) add[`${themeKey}:${k}`] = r.value;
        } catch (e) { /* image absente */ }
      }
      if (Object.keys(add).length) setImgCache((c) => ({ ...c, ...add }));
    })();
  }, [loaded, words, themeKey, pickerFor, libIndex]);

  const persistLibIndex = async (next) => {
    setLibIndex(next);
    try { await window.storage.set("charabilla-lib-index", JSON.stringify(next)); } catch (e) { console.error(e); }
  };
  const saveLibImage = async (univers, wordKey, dataUrl) => {
    try {
      await window.storage.set(`charabilla-img-${univers}-${wordKey}`, dataUrl);
      const list = libIndex[univers] || [];
      const next = { ...libIndex, [univers]: list.includes(wordKey) ? list : [...list, wordKey].sort() };
      await persistLibIndex(next);
      setImgCache((c) => ({ ...c, [`${univers}:${wordKey}`]: dataUrl }));
      return true;
    } catch (e) { console.error(e); return false; }
  };
  const deleteLibImage = async (univers, wordKey) => {
    try { await window.storage.delete(`charabilla-img-${univers}-${wordKey}`); } catch (e) { /* déjà absente */ }
    await persistLibIndex({ ...libIndex, [univers]: (libIndex[univers] || []).filter((k) => k !== wordKey) });
  };

  // Upload en masse : le nom du fichier = le mot (chat.png → chat)
  const handleBulkUpload = async (files) => {
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      const wordKey = keyify(file.name.replace(/\.[^.]+$/, ""));
      if (!wordKey) continue;
      try {
        const dataUrl = await resizeImage(file);
        if (await saveLibImage(themeKey, wordKey, dataUrl)) ok++;
      } catch (e) { console.error("Upload raté :", file.name, e); }
    }
    setUploading(false);
    flash(`${ok} illustration${ok > 1 ? "s" : ""} ajoutée${ok > 1 ? "s" : ""} à ${THEMES[themeKey].label} ✓`);
  };

  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(""), 2400); };
  const persist = async (nextProjects, last) => {
    try { await window.storage.set("charabilla-projects", JSON.stringify({ projects: nextProjects, last })); } catch (e) { console.error(e); }
  };
  const saveProject = async () => {
    const key = childName.trim() || "Sans prénom";
    const next = { ...projects, [key]: { childName, ageLine, titleStyle, themeKey, words } };
    setProjects(next); await persist(next, key); flash(`Dico de ${key} sauvegardé ✓`);
  };
  const loadProject = (key) => {
    const d = projects[key]; if (!d) return;
    setChildName(d.childName || ""); setAgeLine(d.ageLine || "");
    setTitleStyle(d.titleStyle || "dico");
    setThemeKey(THEMES[d.themeKey] ? d.themeKey : "terracotta");
    setWords((d.words || []).filter((w) => w.art));
    flash(`Dico de ${key} chargé`);
  };
  const deleteProject = async (key) => {
    const next = { ...projects }; delete next[key];
    setProjects(next); await persist(next, null);
  };

  const addWord = () => {
    if (!realWord.trim() || !childWord.trim() || words.length >= MAX_WORDS) return;
    setWords([...words, { real: realWord.trim(), child: childWord.trim(), art: newArt }]);
    setRealWord(""); setChildWord(""); setPendingArt(null);
  };
  const openEdit = (i) => { setEditIdx(i); setEditReal(words[i].real); setEditChild(words[i].child); };
  const saveEdit = () => {
    setWords(words.map((w, i) => (i === editIdx ? { ...w, real: editReal.trim() || w.real, child: editChild.trim() || w.child } : w)));
    setEditIdx(null);
  };
  const deleteEdit = () => { setWords(words.filter((_, i) => i !== editIdx)); setEditIdx(null); };
  const moveEdit = (dir) => {
    const j = editIdx + dir;
    if (j < 0 || j >= words.length) return;
    const next = [...words];
    [next[editIdx], next[j]] = [next[j], next[editIdx]];
    setWords(next); setEditIdx(j);
  };
  const setArtAt = (art) => {
    if (pickerFor === "new") setPendingArt(art);
    else setWords(words.map((w, i) => (i === pickerFor ? { ...w, art } : w)));
    setPickerFor(null);
  };

  // Flux de génération IA (prototype : toi + ChatGPT ; version finale : appel API automatique)
  const openGen = (word, target) => {
    setGenWord(word); setGenEn(toEnglish(word)); setGenImg(null);
    setGenTarget(target); setGenOpen(true); setPickerFor(null); setCopied(false);
  };
  const copyPrompt = async () => {
    try { await navigator.clipboard.writeText(theme.prompt(genEn)); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { flash("Copie impossible — sélectionne le texte à la main"); }
  };
  const handleGenUpload = async (file) => {
    try { setGenImg(await resizeImage(file)); } catch (e) { flash("Image illisible, réessaie"); }
  };
  const validateGen = async () => {
    const k = keyify(genWord);
    const saved = await saveLibImage(themeKey, k, genImg);
    if (!saved) { flash("Sauvegarde impossible, réessaie"); return; }
    const art = { type: "lib", word: k };
    if (genTarget === "new") setPendingArt(art);
    else if (typeof genTarget === "number") setWords(words.map((w, i) => (i === genTarget ? { ...w, art } : w)));
    setGenOpen(false);
    flash(`« ${genWord} » ajouté à ta bibliothèque ${theme.label} ✓`);
  };

  const posterTitle = childName.trim()
    ? (titleStyle === "dico" ? `Le dico de ${childName.trim()}` : `L'imagier de ${childName.trim()}`)
    : (titleStyle === "dico" ? "Le dico de…" : "L'imagier de…");
  const ui = { fontFamily: "'Nunito', sans-serif" };
  const uiDisplay = { fontFamily: "'Fredoka', sans-serif" };
  const fmt = FORMATS.find((f) => f.id === orderFormat);
  const frm = FRAMES.find((f) => f.id === orderFrame);
  const total = fmt.price + (fmt.frame ? frm.price : 0);
  const blobRadius = "46% 54% 52% 48% / 52% 46% 54% 48%";

  const Art = ({ art, size }) => {
    if (art.type === "lib") {
      const img = imgCache[`${themeKey}:${art.word}`];
      if (img) return <img src={img} alt="" style={{ width: size, height: size, objectFit: "cover", borderRadius: blobRadius, display: "block" }} />;
      const fb = SVG_MAP[art.word] || "etoile";
      return <svg viewBox="0 0 100 100" style={{ width: size, height: size, opacity: 0.4 }}>{ART[fb](theme.pal)}</svg>;
    }
    if (art.type === "svg" && ART[art.id]) return <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: "block" }}>{ART[art.id](theme.pal)}</svg>;
    return <span style={{ fontSize: `calc(${size} * 0.7)`, lineHeight: 1 }}>{art.e || "✨"}</span>;
  };

  if (!loaded) return <div className="min-h-screen" style={{ background: "#EEF1F8" }} />;

  return (
    <div className="min-h-screen" style={{ background: "#EEF1F8", ...ui, color: INK }}>
      <header className="no-print px-5 pt-8 pb-4 max-w-5xl mx-auto flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm" style={{ background: CTA }}>💬</div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={uiDisplay}>charabilla</h1>
          <p className="text-sm opacity-75">Leurs premiers mots méritent une affiche.</p>
        </div>
      </header>

      {notice && (
        <div className="no-print fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{notice}</div>
      )}

      <main className="max-w-5xl mx-auto px-5 pb-16 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* ============ FORMULAIRE ============ */}
        <section className="no-print flex flex-col gap-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Étape 1 · L'enfant</div>
            <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Prénom de l'enfant"
              className="w-full rounded-2xl border-2 px-4 py-3 text-lg outline-none" style={{ borderColor: "#DCE2F0", ...uiDisplay }} />
            <div className="flex gap-2 mt-3">
              {[["dico", "Le dico de…"], ["imagier", "L'imagier de…"]].map(([k, label]) => (
                <button key={k} onClick={() => setTitleStyle(k)}
                  className="flex-1 rounded-2xl px-3 py-2 text-sm font-bold transition-all"
                  style={{ background: titleStyle === k ? INK : "#F0F3FA", color: titleStyle === k ? "#fff" : INK }}>{label}</button>
              ))}
            </div>
            <input value={ageLine} onChange={(e) => setAgeLine(e.target.value)} placeholder="Sous-titre (optionnel) — ex : à 20 mois"
              className="w-full mt-3 rounded-2xl border-2 px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Étape 2 · Ses mots</div>
              <div className="text-xs font-bold rounded-full px-3 py-1" style={{ background: "#F0F3FA" }}>{words.length} / {MAX_WORDS}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold opacity-70">Le vrai mot</label>
                <input value={realWord} onChange={(e) => { setRealWord(e.target.value); setPendingArt(null); }} placeholder="compote"
                  className="w-full mt-1 rounded-2xl border-2 px-3 py-3 outline-none" style={{ borderColor: "#DCE2F0" }} />
              </div>
              <div>
                <label className="text-xs font-bold opacity-70">Sa version</label>
                <input value={childWord} onChange={(e) => setChildWord(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addWord()}
                  placeholder="amaka" className="w-full mt-1 rounded-2xl border-2 px-3 py-3 outline-none" style={{ borderColor: "#F6C9DE" }} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setPickerFor("new")}
                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 hover:scale-105 transition-transform flex-shrink-0 overflow-hidden"
                style={{ borderColor: newArt.type === "lib" ? CTA : "#DCE2F0", background: theme.bg }}>
                <Art art={newArt} size="52px" />
              </button>
              <div className="text-xs opacity-70 flex-1">
                {newArt.type === "lib" ? "✓ Trouvée dans ta bibliothèque" : noMatch ? "Pas d'illustration trouvée — génère-la !" : "Croquis provisoire — touche pour changer ou générer."}
              </div>
              <button onClick={addWord} disabled={!realWord.trim() || !childWord.trim() || words.length >= MAX_WORDS}
                className="rounded-2xl px-5 py-3 font-bold text-white shadow-sm disabled:opacity-40" style={{ background: CTA, ...uiDisplay }}>Ajouter</button>
            </div>
            {noMatch && (
              <button onClick={() => openGen(realWord, "new")}
                className="w-full mt-3 rounded-2xl px-4 py-2.5 text-sm font-bold border-2 transition-all"
                style={{ borderColor: CTA, color: CTA, background: "#FDF1F7" }}>
                ✨ Générer l'illustration « {realWord.trim()} » avec l'IA
              </button>
            )}
          </div>

          {/* Ma bibliothèque */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Ma bibliothèque · {theme.label}</div>
              <div className="text-xs font-bold rounded-full px-3 py-1" style={{ background: "#F0F3FA" }}>{(libIndex[themeKey] || []).length} images</div>
            </div>
            <p className="text-[11px] opacity-60 mb-3">Dépose ici les illustrations générées dans ChatGPT. Le nom du fichier = le mot (ex. <b>chat.png</b>, <b>compote.png</b>).</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleBulkUpload([...e.target.files]); e.target.value = ""; }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full rounded-2xl px-4 py-3 font-bold border-2 border-dashed transition-all disabled:opacity-50"
              style={{ borderColor: "#C9D4E8", background: "#F7F9FD" }}>
              {uploading ? "Ajout en cours…" : "📥 Ajouter des illustrations"}
            </button>
            {(libIndex[themeKey] || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(libIndex[themeKey] || []).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: theme.bg, color: INK }}>
                    {k}
                    <button onClick={() => deleteLibImage(themeKey, k)} className="opacity-50 hover:opacity-100" title="Retirer">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Étape 3 · L'univers</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THEMES).map(([k, t]) => (
                <button key={k} onClick={() => setThemeKey(k)}
                  className="rounded-2xl p-3 text-left border-2 transition-all"
                  style={{ borderColor: themeKey === k ? INK : "#E8ECF5", background: t.bg }}>
                  <div className="w-10 h-10 mb-1"><svg viewBox="0 0 100 100" className="w-full h-full">{ART.chat(t.pal)}</svg></div>
                  <div className="text-xs font-bold" style={{ color: t.deco === "stars" ? t.word : INK }}>{t.label}</div>
                  <div className="text-[10px] opacity-70" style={{ color: t.deco === "stars" ? t.word : INK }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Mon compte · mes dicos</div>
            {Object.keys(projects).length === 0 ? (
              <p className="text-xs opacity-70">Aucun dico sauvegardé pour l'instant.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.keys(projects).map((key) => (
                  <div key={key} className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "#F7F9FD" }}>
                    <span className="flex-1 text-sm font-bold">Dico de {key} <span className="font-normal opacity-60">· {(projects[key].words || []).length} mots</span></span>
                    <button onClick={() => loadProject(key)} className="text-xs font-bold rounded-full px-3 py-1 text-white" style={{ background: INK }}>Ouvrir</button>
                    <button onClick={() => deleteProject(key)} className="text-xs font-bold rounded-full px-2 py-1" style={{ color: CTA }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={saveProject} className="flex-1 rounded-2xl px-4 py-3 font-bold border-2 bg-white" style={{ borderColor: INK, ...uiDisplay }}>Sauvegarder</button>
            <button onClick={() => { setOrderOpen(true); setOrderDone(false); }} disabled={words.length === 0}
              className="flex-1 rounded-2xl px-4 py-3 font-bold text-white shadow-md disabled:opacity-40" style={{ background: INK, ...uiDisplay }}>Commander l'affiche</button>
          </div>
          <button onClick={() => window.print()} disabled={words.length === 0}
            className="no-print rounded-2xl px-4 py-2 text-sm font-bold opacity-70 disabled:opacity-30 underline">ou imprimer un aperçu PDF chez soi</button>
        </section>

        {/* ============ AFFICHE ============ */}
        <section className="flex flex-col gap-3">
          <div className="no-print text-xs font-bold uppercase tracking-widest opacity-60">Aperçu · grille de {tier} {tier > 1 ? "mots" : "mot"}</div>
          <div id="poster" className="relative rounded-2xl shadow-xl overflow-hidden flex flex-col"
            style={{ background: theme.bg, aspectRatio: "1 / 1.414", padding: "8%", containerType: "inline-size" }}>
            <PosterDeco theme={theme} />
            <div className="text-center relative" style={{ marginBottom: "5%" }}>
              <div className="text-[9px] font-bold uppercase" style={{ color: theme.accent, letterSpacing: "0.4em" }}>ses premiers mots</div>
              <h2 className="leading-tight" style={{ color: theme.title, fontSize: "7cqw", fontFamily: theme.titleFont, fontWeight: 600, fontStyle: theme.titleItalic ? "italic" : "normal" }}>{posterTitle}</h2>
              {ageLine.trim() && (
                <div style={{ color: theme.word, fontSize: "3cqw", opacity: 0.75, fontFamily: theme.titleFont, fontStyle: theme.titleItalic ? "italic" : "normal" }}>{ageLine.trim()}</div>
              )}
              <div className="mx-auto mt-2 rounded-full" style={{ width: "16%", height: 3, background: theme.accent, opacity: 0.6 }} />
            </div>

            {words.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 relative">
                <div style={{ width: "34cqw", opacity: 0.9 }}><svg viewBox="0 0 100 100" className="w-full">{ART.chat(theme.pal)}</svg></div>
                <p className="text-sm font-semibold px-6" style={{ color: theme.word, opacity: 0.7 }}>Ajoute un premier mot — il apparaîtra ici.</p>
              </div>
            ) : (
              <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: "1cqw", minHeight: 0 }}>
                {slots.map((w, i) =>
                  w ? (
                    <button key={i} onClick={() => openEdit(i)}
                      className="relative flex flex-col items-center justify-center text-center hover:scale-[1.03] transition-transform"
                      style={{ minHeight: 0, overflow: "hidden", background: "none" }}>
                      <div className="relative flex items-center justify-center flex-shrink"
                        style={{
                          height: S.blob, maxHeight: "65%", aspectRatio: "1",
                          background: w.art.type === "lib" ? "none" : `radial-gradient(circle at 38% 32%, ${theme.wash}, ${theme.washEdge})`,
                          borderRadius: blobRadius,
                        }}>
                        {theme.deco === "stars" && w.art.type !== "lib" && <CellStars color={theme.accent} />}
                        <Art art={w.art} size={w.art.type === "lib" ? "100%" : S.art} />
                      </div>
                      <div className="leading-tight break-words w-full flex-shrink-0"
                        style={{ color: theme.word, fontSize: S.word, marginTop: "1.2cqw", fontFamily: theme.titleFont, fontWeight: 600, fontStyle: theme.titleItalic ? "italic" : "normal" }}>
                        {w.child}
                      </div>
                    </button>
                  ) : (
                    <div key={i} className="flex flex-col items-center justify-center" style={{ minHeight: 0 }}>
                      <div style={{ height: S.blob, maxHeight: "60%", aspectRatio: "1", border: "2px dashed", borderColor: theme.washEdge, opacity: 0.5, borderRadius: blobRadius }} />
                      <div style={{ fontSize: S.word, marginTop: "1.2cqw", visibility: "hidden" }}>·</div>
                    </div>
                  )
                )}
              </div>
            )}
            <div className="text-center pt-3 text-[9px] font-bold uppercase relative" style={{ color: theme.accent, letterSpacing: "0.35em" }}>charabilla</div>
          </div>
          <p className="no-print text-xs opacity-60 text-center">Les images de ta bibliothèque remplacent les croquis dès qu'elles existent.</p>
        </section>
      </main>

      {/* ============ MODALE ÉDITION ============ */}
      {editIdx !== null && words[editIdx] && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setEditIdx(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 overflow-hidden" style={{ borderColor: "#E8ECF5", background: theme.bg }}>
                <Art art={words[editIdx].art} size="52px" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight" style={uiDisplay}>« {words[editIdx].child} »</h3>
                <div className="flex gap-3">
                  <button onClick={() => { setPickerFor(editIdx); setEditIdx(null); }} className="text-xs font-bold underline" style={{ color: CTA }}>Changer</button>
                  <button onClick={() => { openGen(words[editIdx].real, editIdx); setEditIdx(null); }} className="text-xs font-bold underline" style={{ color: CTA }}>✨ Générer</button>
                </div>
              </div>
              <button onClick={() => setEditIdx(null)} className="w-8 h-8 rounded-full font-bold flex-shrink-0" style={{ background: "#F0F3FA" }}>✕</button>
            </div>
            <label className="text-xs font-bold opacity-70">Le vrai mot</label>
            <input value={editReal} onChange={(e) => setEditReal(e.target.value)} className="w-full mt-1 mb-3 rounded-2xl border-2 px-3 py-2.5 outline-none" style={{ borderColor: "#DCE2F0" }} />
            <label className="text-xs font-bold opacity-70">Sa version</label>
            <input value={editChild} onChange={(e) => setEditChild(e.target.value)} className="w-full mt-1 mb-4 rounded-2xl border-2 px-3 py-2.5 outline-none" style={{ borderColor: "#F6C9DE" }} />
            <div className="flex gap-2 mb-3">
              <button onClick={() => moveEdit(-1)} disabled={editIdx === 0} className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold disabled:opacity-30" style={{ background: "#F0F3FA" }}>◀ Avancer</button>
              <button onClick={() => moveEdit(1)} disabled={editIdx === words.length - 1} className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold disabled:opacity-30" style={{ background: "#F0F3FA" }}>Reculer ▶</button>
            </div>
            <div className="flex gap-2">
              <button onClick={deleteEdit} className="rounded-2xl px-4 py-3 font-bold" style={{ color: CTA, background: "#FDF1F7" }}>Supprimer</button>
              <button onClick={saveEdit} className="flex-1 rounded-2xl px-4 py-3 font-bold text-white" style={{ background: INK, ...uiDisplay }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SÉLECTEUR D'ILLUSTRATION ============ */}
      {pickerFor !== null && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setPickerFor(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg" style={uiDisplay}>Choisis une illustration</h3>
              <button onClick={() => setPickerFor(null)} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button>
            </div>

            <button onClick={() => openGen(pickerFor === "new" ? (realWord.trim() || "nouveau mot") : words[pickerFor]?.real || "", pickerFor)}
              className="w-full mb-4 rounded-2xl px-4 py-3 font-bold border-2" style={{ borderColor: CTA, color: CTA, background: "#FDF1F7" }}>
              ✨ Générer une nouvelle illustration avec l'IA
            </button>

            <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Ta bibliothèque · {theme.label} ({(libIndex[themeKey] || []).length})</div>
            {(libIndex[themeKey] || []).length === 0 ? (
              <p className="text-xs opacity-60 mb-4">Vide pour l'instant — ajoute tes images générées dans « Ma bibliothèque » ou génère-les ici.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-5">
                {(libIndex[themeKey] || []).slice(0, 40).map((k) => {
                  const img = imgCache[`${themeKey}:${k}`];
                  return (
                    <button key={k} onClick={() => setArtAt({ type: "lib", word: k })}
                      className="rounded-2xl overflow-hidden flex flex-col items-center gap-0.5 hover:scale-105 transition-transform border p-1"
                      style={{ background: theme.bg, borderColor: "#EEF1F8" }}>
                      {img ? <img src={img} alt={k} className="w-full aspect-square object-cover rounded-xl" /> : <div className="w-full aspect-square rounded-xl animate-pulse" style={{ background: theme.wash }} />}
                      <span className="text-[9px] font-bold truncate w-full text-center" style={{ color: INK, opacity: 0.7 }}>{k}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Croquis intégrés (provisoires)</div>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {SVG_LIBRARY.map((id) => (
                <button key={id} onClick={() => setArtAt({ type: "svg", id })}
                  className="rounded-2xl p-1.5 flex flex-col items-center gap-0.5 hover:scale-105 transition-transform border"
                  style={{ background: theme.bg, borderColor: "#EEF1F8" }} title={SVG_NAMES[id]}>
                  <svg viewBox="0 0 100 100" className="w-10 h-10">{ART[id](theme.pal)}</svg>
                  <span className="text-[9px] font-bold truncate w-full" style={{ color: INK, opacity: 0.7 }}>{SVG_NAMES[id]}</span>
                </button>
              ))}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Emojis (dépannage)</div>
            <div className="grid grid-cols-7 gap-1">
              {EMOJI_PICKER_LIST.map((e) => (
                <button key={e} onClick={() => setArtAt({ type: "emoji", e })} className="text-2xl p-1.5 rounded-xl hover:bg-pink-50">{e}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ GÉNÉRATION IA (avec validation) ============ */}
      {genOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.55)" }} onClick={() => setGenOpen(false)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg" style={uiDisplay}>✨ Générer « {genWord} »</h3>
              <button onClick={() => setGenOpen(false)} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button>
            </div>
            <p className="text-[11px] opacity-60 mb-4">Univers {theme.label} · Dans la version finale, cette génération sera automatique (API). Ici, ChatGPT est ton atelier : l'app te prépare le prompt exact et garde le résultat validé.</p>

            {!genImg ? (
              <>
                <label className="text-xs font-bold opacity-70">1 · L'objet à illustrer (en anglais, modifiable)</label>
                <input value={genEn} onChange={(e) => setGenEn(e.target.value)}
                  className="w-full mt-1 mb-3 rounded-2xl border-2 px-3 py-2.5 outline-none text-sm" style={{ borderColor: "#DCE2F0" }} />
                <label className="text-xs font-bold opacity-70">2 · Le prompt verrouillé — copie-le dans ta conversation ChatGPT {theme.label}</label>
                <textarea readOnly value={theme.prompt(genEn)} rows={6}
                  className="w-full mt-1 rounded-2xl border-2 px-3 py-2.5 outline-none text-[11px] leading-relaxed" style={{ borderColor: "#DCE2F0", background: "#F7F9FD" }} />
                <button onClick={copyPrompt} className="w-full mt-2 mb-4 rounded-2xl px-4 py-2.5 font-bold text-white" style={{ background: INK, ...uiDisplay }}>
                  {copied ? "✓ Copié !" : "📋 Copier le prompt"}
                </button>
                <label className="text-xs font-bold opacity-70">3 · Dépose l'image générée</label>
                <input ref={genFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleGenUpload(e.target.files[0]); e.target.value = ""; }} />
                <button onClick={() => genFileRef.current?.click()}
                  className="w-full mt-1 rounded-2xl px-4 py-6 font-bold border-2 border-dashed" style={{ borderColor: "#C9D4E8", background: "#F7F9FD" }}>
                  📥 Choisir l'image
                </button>
              </>
            ) : (
              <>
                <div className="rounded-3xl overflow-hidden mb-4 mx-auto" style={{ maxWidth: 260 }}>
                  <img src={genImg} alt={genWord} className="w-full aspect-square object-cover" />
                </div>
                <p className="text-sm font-bold text-center mb-3">Cette illustration convient-elle ?</p>
                <div className="flex gap-2">
                  <button onClick={() => setGenImg(null)}
                    className="flex-1 rounded-2xl px-4 py-3 font-bold border-2" style={{ borderColor: "#DCE2F0" }}>
                    ↻ Régénérer
                  </button>
                  <button onClick={validateGen}
                    className="flex-1 rounded-2xl px-4 py-3 font-bold text-white" style={{ background: CTA, ...uiDisplay }}>
                    ✓ Oui, l'utiliser
                  </button>
                </div>
                <p className="text-[10px] opacity-50 mt-3 text-center">« Régénérer » : redemande dans ChatGPT (« reprends exactement le style ») puis redépose la nouvelle image. Une fois validée, elle rejoint ta bibliothèque pour toujours.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ COMMANDE (simulée) ============ */}
      {orderOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setOrderOpen(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!orderDone ? (
              <>
                <h3 className="font-bold text-xl mb-1" style={uiDisplay}>Commander « {posterTitle} »</h3>
                <p className="text-xs opacity-60 mb-4">Impression fine art mat 200 g · expédiée sous 3 à 5 jours.</p>
                <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Format</div>
                <div className="flex flex-col gap-2 mb-4">
                  {FORMATS.map((f) => (
                    <button key={f.id} onClick={() => { setOrderFormat(f.id); if (!f.frame) setOrderFrame("none"); }}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 border-2 font-bold text-sm"
                      style={{ borderColor: orderFormat === f.id ? INK : "#E8ECF5", background: orderFormat === f.id ? "#F7F9FD" : "#fff" }}>
                      <span>{f.label}</span><span style={{ color: CTA }}>{f.price} €</span>
                    </button>
                  ))}
                </div>
                {fmt.frame && (
                  <>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Encadrement</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {FRAMES.map((f) => (
                        <button key={f.id} onClick={() => setOrderFrame(f.id)}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 border-2 font-bold text-sm"
                          style={{ borderColor: orderFrame === f.id ? INK : "#E8ECF5", background: orderFrame === f.id ? "#F7F9FD" : "#fff" }}>
                          <span>{f.label}</span><span style={{ color: CTA }}>{f.price > 0 ? `+ ${f.price} €` : "inclus"}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => setOrderDone(true)}
                  className="w-full rounded-2xl px-4 py-3 font-bold text-white shadow-md" style={{ background: CTA, ...uiDisplay }}>
                  Commander · {total} € (démo)
                </button>
                <p className="text-[10px] opacity-50 mt-3">Version finale : paiement Stripe puis envoi automatique du fichier HD à Gelato (impression locale dans 30+ pays, cadre bois avec plexiglas et kit d'accrochage, livraison suivie).</p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">📦</div>
                <h3 className="font-bold text-xl mb-2" style={uiDisplay}>Commande simulée !</h3>
                <p className="text-sm opacity-70 mb-4">Dans la vraie plateforme, « {posterTitle} » partirait en impression {fmt.label}{fmt.frame && orderFrame !== "none" ? ` avec ${frm.label.toLowerCase()}` : ""}, livraison directe chez toi.</p>
                <button onClick={() => setOrderOpen(false)} className="rounded-2xl px-6 py-3 font-bold text-white" style={{ background: INK, ...uiDisplay }}>Fermer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
