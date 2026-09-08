"use client";

// Application utilisateur Charabilla — issue de prototype/charabilla.jsx, avec les décisions
// de la fondatrice : bibliothèque réservée au back-office, illustrations posées directement
// sur le fond de l'affiche (ni cercle ni fond), génération d'illustration dans l'outil,
// filigrane sur l'aperçu.

import { useState, useEffect, useMemo } from "react";
import storage from "@/lib/storage";
import { THEMES, MAX_WORDS, INK, CTA, normalize, keyify, gridFor, FORMATS, FRAMES } from "@/lib/themes";
import { ART, SVG_MAP, starPath } from "@/lib/art";
import { creerClient } from "@/lib/api-client";
import Illustration, { enPreparation } from "./Illustration";
import ModaleGeneration from "./ModaleGeneration";
import { calculerTotal } from "@/lib/commandes-communs";

const CLE_MES_GENERATIONS = "charabilla-mes-generations";

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

// Filigrane de l'aperçu : rend une capture d'écran inutilisable pour l'impression.
function Filigrane({ theme }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='150'><text x='10' y='90' font-family='Helvetica, Arial, sans-serif' font-size='17' font-weight='700' letter-spacing='2' fill='${theme.word}' fill-opacity='0.15' transform='rotate(-22 130 75)'>charabilla · aperçu</text></svg>`;
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
      style={{ zIndex: 5, backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, backgroundSize: "260px 150px" }} />
  );
}

export default function Charabilla() {
  const client = useMemo(() => creerClient(), []);
  const [childName, setChildName] = useState("");
  const [ageLine, setAgeLine] = useState("");
  const [titleStyle, setTitleStyle] = useState("dico");
  const [themeKey, setThemeKey] = useState("terracotta");
  const [words, setWords] = useState([]);
  const [realWord, setRealWord] = useState("");
  const [childWord, setChildWord] = useState("");
  const [pickerFor, setPickerFor] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [pendingArt, setPendingArt] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editReal, setEditReal] = useState("");
  const [editChild, setEditChild] = useState("");
  const [projects, setProjects] = useState({});
  const [notice, setNotice] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderFormat, setOrderFormat] = useState("a3");
  const [orderFrame, setOrderFrame] = useState("none");
  const [orderEtape, setOrderEtape] = useState("format"); // format | coordonnees
  const [coord, setCoord] = useState({ prenom: "", nom: "", email: "", adresse1: "", adresse2: "", codePostal: "", ville: "", pays: "France" });
  const [commandeEnCours, setCommandeEnCours] = useState(false);
  const [erreurCommande, setErreurCommande] = useState("");
  const [loaded, setLoaded] = useState(false);
  // Bibliothèque de l'univers courant (gérée par le back-office) + mes propres générations
  const [items, setItems] = useState([]);
  const [mesGenerations, setMesGenerations] = useState([]);
  const [gen, setGen] = useState(null); // { mot, target }

  const theme = THEMES[themeKey];

  // Un utilisateur voit les illustrations validées, plus celles qu'il a générées lui-même.
  const visibles = useMemo(
    () => items.filter((it) => it.statut === "valide" || mesGenerations.includes(it.key)),
    [items, mesGenerations]
  );

  const chargerBibliotheque = async (univers) => {
    try { setItems(await client.listerBibliotheque(univers)); } catch { setItems([]); }
  };

  // Priorité : bibliothèque > croquis intégré > rien (proposera la génération)
  // Toutes les façons de nommer une illustration : identifiant + noms dans chaque langue.
  const clesDe = (it) => [it.key, ...Object.values(it.noms || {}).map(keyify)].filter(Boolean);
  const suggestArt = (word) => {
    const w = normalize(word); const k = keyify(word);
    if (!w) return { type: "svg", id: "etoile" };
    const exact = visibles.find((it) => clesDe(it).includes(k));
    if (exact) return { type: "lib", word: exact.key };
    for (const it of visibles) { if (w.length >= 3 && clesDe(it).some((c) => c.startsWith(k) || k.startsWith(c))) return { type: "lib", word: it.key }; }
    if (SVG_MAP[w]) return { type: "svg", id: SVG_MAP[w] };
    for (const key of Object.keys(SVG_MAP)) { if (w.length >= 3 && (key.startsWith(w) || w.startsWith(key))) return { type: "svg", id: SVG_MAP[key] }; }
    return null;
  };
  const autoArt = useMemo(() => suggestArt(realWord) || { type: "svg", id: "etoile" }, [realWord, visibles]); // eslint-disable-line react-hooks/exhaustive-deps
  const newArt = pendingArt || autoArt;
  const noMatch = realWord.trim() && !pendingArt && !suggestArt(realWord);
  const suggestions = useMemo(() => {
    const k = keyify(realWord);
    if (k.length < 2) return [];
    return visibles
      .filter((it) => clesDe(it).some((c) => c.includes(k) || k.startsWith(c)))
      .sort((a, b) => (clesDe(a).some((c) => c.startsWith(k)) ? 0 : 1) - (clesDe(b).some((c) => c.startsWith(k)) ? 0 : 1))
      .slice(0, 8);
  }, [realWord, visibles]);

  const { tier, cols } = gridFor(words.length);
  const rows = Math.ceil(tier / cols);
  const slots = [...words, ...Array(Math.max(0, tier - words.length)).fill(null)];
  const SIZES = {
    1: { art: "40cqw", word: "6.2cqw" },
    4: { art: "22cqw", word: "4.6cqw" },
    8: { art: "15cqw", word: "3.6cqw" },
    12: { art: "13cqw", word: "3cqw" },
    16: { art: "11cqw", word: "2.5cqw" },
  };
  const S = SIZES[tier];

  // Chargement initial : projets sauvegardés + mes générations
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("charabilla-projects");
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
      } catch { /* première visite */ }
      try {
        const g = await storage.get(CLE_MES_GENERATIONS);
        if (g && g.value) setMesGenerations(JSON.parse(g.value));
      } catch { /* rien encore */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    let actif = true;
    client.listerBibliotheque(themeKey)
      .then((liste) => { if (actif) setItems(liste); })
      .catch(() => { if (actif) setItems([]); });
    return () => { actif = false; };
  }, [client, themeKey]);

  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(""), 2400); };
  const persist = async (nextProjects, last) => {
    try { await storage.set("charabilla-projects", JSON.stringify({ projects: nextProjects, last })); } catch (e) { console.error(e); }
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
  const setArtAt = (art, target = pickerFor) => {
    if (target === "new") setPendingArt(art);
    else if (typeof target === "number") setWords((ws) => ws.map((w, i) => (i === target ? { ...w, art } : w)));
    setPickerFor(null);
  };

  // Génération d'une illustration dans l'outil
  const openGen = (mot, target) => { setGen({ mot: mot.trim(), target }); setPickerFor(null); setEditIdx(null); };
  const surIllustrationValidee = async (item) => {
    const next = mesGenerations.includes(item.key) ? mesGenerations : [...mesGenerations, item.key];
    setMesGenerations(next);
    try { await storage.set(CLE_MES_GENERATIONS, JSON.stringify(next)); } catch { /* sans gravité */ }
    await chargerBibliotheque(themeKey);
    setArtAt({ type: "lib", word: item.key }, gen.target);
    setGen(null);
    flash(`Illustration « ${item.mot} » ajoutée à ton affiche ✓`);
  };
  const surSignalement = () => {
    // Le mot garde sa place : son illustration se mettra en place quand elle existera.
    setArtAt({ type: "lib", word: keyify(gen.mot) }, gen.target);
    setGen(null);
  };

  const posterTitle = childName.trim()
    ? (titleStyle === "dico" ? `Le dico de ${childName.trim()}` : `L'imagier de ${childName.trim()}`)
    : (titleStyle === "dico" ? "Le dico de…" : "L'imagier de…");
  const ui = { fontFamily: "var(--font-nunito), sans-serif" };
  const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };
  const fmt = FORMATS.find((f) => f.id === orderFormat);
  const frm = FRAMES.find((f) => f.id === orderFrame);
  const { total } = calculerTotal(orderFormat, orderFrame);

  const passerCommande = async () => {
    setCommandeEnCours(true); setErreurCommande("");
    try {
      const r = await client.creerCommande({
        affiche: { childName, ageLine, titleStyle, themeKey, words }, formatId: orderFormat, cadreId: orderFrame, client: coord,
      });
      window.location.href = r.url || client.lienSuivi(r.id);
    } catch (e) {
      setErreurCommande(e.message || "La commande n'a pas pu être enregistrée"); setCommandeEnCours(false);
    }
  };

  const motPourPicker = pickerFor === "new" ? realWord.trim() : (typeof pickerFor === "number" ? words[pickerFor]?.real || "" : "");
  const rechercheNorm = keyify(recherche);
  const itemsFiltres = visibles.filter((it) => !rechercheNorm || clesDe(it).some((c) => c.includes(rechercheNorm)));

  if (!loaded) return <div className="min-h-screen" style={{ background: "#EEF1F8" }} />;

  return (
    <div className="min-h-screen" style={{ background: "#EEF1F8", ...ui, color: INK }}>
      <header className="px-5 pt-8 pb-4 max-w-5xl mx-auto flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm" style={{ background: CTA }}>💬</div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={uiDisplay}>charabilla</h1>
          <p className="text-sm opacity-75">Leurs premiers mots méritent une affiche.</p>
        </div>
      </header>

      {notice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{notice}</div>
      )}

      <main className="max-w-5xl mx-auto px-5 pb-16 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* ============ FORMULAIRE ============ */}
        <section className="flex flex-col gap-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Étape 1 · L&apos;enfant</div>
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
              <button onClick={() => { setRecherche(""); setPickerFor("new"); }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 hover:scale-105 transition-transform flex-shrink-0 overflow-hidden"
                style={{ borderColor: newArt.type === "lib" ? CTA : "#DCE2F0", background: theme.bg }}>
                <Illustration art={newArt} univers={themeKey} items={visibles} size="52px" />
              </button>
              <div className="text-xs opacity-70 flex-1">
                {newArt.type === "lib" ? "✓ Illustration de la bibliothèque" : noMatch ? "Pas encore d'illustration pour ce mot." : "Croquis provisoire en attendant la vraie illustration."}
                <button onClick={() => { setRecherche(""); setPickerFor("new"); }} className="block mt-0.5 font-bold underline" style={{ color: CTA }}>
                  Parcourir la bibliothèque ({visibles.length})
                </button>
              </div>
              <button onClick={addWord} disabled={!realWord.trim() || !childWord.trim() || words.length >= MAX_WORDS}
                className="rounded-2xl px-5 py-3 font-bold text-white shadow-sm disabled:opacity-40" style={{ background: CTA, ...uiDisplay }}>Ajouter</button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-bold opacity-60 mb-1.5">Illustrations trouvées pour « {realWord.trim()} »</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {suggestions.map((it) => (
                    <button key={it.key} onClick={() => setPendingArt({ type: "lib", word: it.key })}
                      className="flex-shrink-0 w-16 rounded-2xl border-2 p-1 flex flex-col items-center gap-0.5 hover:scale-105 transition-transform"
                      style={{ background: theme.bg, borderColor: newArt.type === "lib" && newArt.word === it.key ? CTA : "#EEF1F8" }}>
                      <img src={it.url} alt={it.mot} className="w-full aspect-square object-contain rounded-xl" draggable={false} />
                      <span className="text-[9px] font-bold truncate w-full text-center" style={{ color: INK, opacity: 0.7 }}>{it.mot}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {realWord.trim() && newArt.type !== "lib" && (
              <button onClick={() => openGen(realWord, "new")}
                className="w-full mt-3 rounded-2xl px-4 py-2.5 text-sm font-bold border-2 transition-all"
                style={{ borderColor: CTA, color: CTA, background: "#FDF1F7" }}>
                ✨ Générer une illustration pour « {realWord.trim()} »
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Étape 3 · L&apos;univers</div>
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
              <p className="text-xs opacity-70">Aucun dico sauvegardé pour l&apos;instant.</p>
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
            <button onClick={() => { setOrderOpen(true); setOrderEtape("format"); setErreurCommande(""); }} disabled={words.length === 0}
              className="flex-1 rounded-2xl px-4 py-3 font-bold text-white shadow-md disabled:opacity-40" style={{ background: INK, ...uiDisplay }}>Commander l&apos;affiche</button>
          </div>
        </section>

        {/* ============ AFFICHE ============ */}
        <section className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-widest opacity-60">Aperçu · grille de {tier} {tier > 1 ? "mots" : "mot"}</div>
          <div id="poster" className="relative rounded-2xl shadow-xl overflow-hidden flex flex-col select-none"
            style={{ background: theme.bg, aspectRatio: "1 / 1.414", padding: "8%", containerType: "inline-size", WebkitTouchCallout: "none" }}>
            <PosterDeco theme={theme} />
            <Filigrane theme={theme} />
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
                      <div className="relative flex items-center justify-center flex-shrink" style={{ height: S.art, maxHeight: "68%", aspectRatio: "1" }}>
                        {theme.deco === "stars" && w.art.type !== "lib" && <CellStars color={theme.accent} />}
                        <Illustration art={w.art} univers={themeKey} items={visibles} size="100%" />
                      </div>
                      <div className="leading-tight break-words w-full flex-shrink-0"
                        style={{ color: theme.word, fontSize: S.word, marginTop: "1.2cqw", fontFamily: theme.titleFont, fontWeight: 600, fontStyle: theme.titleItalic ? "italic" : "normal" }}>
                        {w.child}
                      </div>
                    </button>
                  ) : (
                    <div key={i} className="flex flex-col items-center justify-center" style={{ minHeight: 0 }}>
                      <div style={{ height: S.art, maxHeight: "60%", aspectRatio: "1", border: "2px dashed", borderColor: theme.washEdge, opacity: 0.5, borderRadius: "46% 54% 52% 48% / 52% 46% 54% 48%" }} />
                      <div style={{ fontSize: S.word, marginTop: "1.2cqw", visibility: "hidden" }}>·</div>
                    </div>
                  )
                )}
              </div>
            )}
            <div className="text-center pt-3 text-[9px] font-bold uppercase relative" style={{ color: theme.accent, letterSpacing: "0.35em" }}>charabilla</div>
          </div>
          <p className="text-xs opacity-60 text-center">Aperçu filigrané — l&apos;affiche imprimée est livrée sans filigrane.</p>
        </section>
      </main>

      {/* ============ MODALE ÉDITION ============ */}
      {editIdx !== null && words[editIdx] && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setEditIdx(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 overflow-hidden" style={{ borderColor: "#E8ECF5", background: theme.bg }}>
                <Illustration art={words[editIdx].art} univers={themeKey} items={visibles} size="52px" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight" style={uiDisplay}>« {words[editIdx].child} »</h3>
                {enPreparation(words[editIdx].art, visibles) ? (
                  <p className="text-[11px] opacity-60">Illustration en préparation — elle apparaîtra ici dès qu&apos;elle sera prête.</p>
                ) : null}
                <div className="flex gap-3">
                  <button onClick={() => { setRecherche(""); setPickerFor(editIdx); setEditIdx(null); }} className="text-xs font-bold underline" style={{ color: CTA }}>Changer</button>
                  <button onClick={() => openGen(words[editIdx].real, editIdx)} className="text-xs font-bold underline" style={{ color: CTA }}>✨ Générer</button>
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

      {/* ============ SÉLECTEUR D'ILLUSTRATION (bibliothèque) ============ */}
      {pickerFor !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setPickerFor(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg" style={uiDisplay}>Choisis une illustration</h3>
              <button onClick={() => setPickerFor(null)} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button>
            </div>
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Chercher un mot (ex. chat, compote…)"
              className="w-full mb-3 rounded-2xl border-2 px-3 py-2.5 outline-none text-sm" style={{ borderColor: "#DCE2F0" }} autoFocus />
            {motPourPicker && (
              <button onClick={() => openGen(motPourPicker, pickerFor)}
                className="w-full mb-4 rounded-2xl px-4 py-3 font-bold border-2" style={{ borderColor: CTA, color: CTA, background: "#FDF1F7" }}>
                ✨ Générer une illustration pour « {motPourPicker} »
              </button>
            )}
            <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Bibliothèque · {theme.label} ({itemsFiltres.length})</div>
            {itemsFiltres.length === 0 ? (
              <p className="text-xs opacity-60 mb-2">
                {visibles.length === 0 ? "La bibliothèque de cet univers est encore vide — génère l'illustration de ton mot." : "Aucune illustration ne correspond à cette recherche."}
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {itemsFiltres.map((it) => (
                  <button key={it.key} onClick={() => setArtAt({ type: "lib", word: it.key })}
                    className="rounded-2xl overflow-hidden flex flex-col items-center gap-0.5 hover:scale-105 transition-transform border p-1"
                    style={{ background: theme.bg, borderColor: "#EEF1F8" }}>
                    <img src={it.url} alt={it.mot} className="w-full aspect-square object-contain rounded-xl" draggable={false} />
                    <span className="text-[9px] font-bold truncate w-full text-center" style={{ color: INK, opacity: 0.7 }}>{it.mot}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ GÉNÉRATION D'ILLUSTRATION ============ */}
      {gen && (
        <ModaleGeneration client={client} mot={gen.mot} univers={themeKey}
          onClose={() => setGen(null)} onValide={surIllustrationValidee} onSignale={surSignalement} />
      )}

      {/* ============ COMMANDE ============ */}
      {orderOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => !commandeEnCours && setOrderOpen(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-1" style={uiDisplay}>Commander « {posterTitle} »</h3>
            <p className="text-xs opacity-60 mb-4">Impression fine art mat 200 g · expédiée sous 3 à 5 jours.</p>

            {orderEtape === "format" ? (
              <>
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
                <button onClick={() => setOrderEtape("coordonnees")}
                  className="w-full rounded-2xl px-4 py-3 font-bold text-white shadow-md" style={{ background: CTA, ...uiDisplay }}>
                  Continuer · {total} €
                </button>
              </>
            ) : (
              <>
                <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Vos coordonnées</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={coord.prenom} onChange={(e) => setCoord({ ...coord, prenom: e.target.value })} placeholder="Prénom" className="rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                  <input value={coord.nom} onChange={(e) => setCoord({ ...coord, nom: e.target.value })} placeholder="Nom" className="rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                </div>
                <input type="email" value={coord.email} onChange={(e) => setCoord({ ...coord, email: e.target.value })} placeholder="E-mail (pour le suivi de commande)" className="w-full mb-2 rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#F6C9DE" }} />
                <div className="text-xs font-bold uppercase tracking-widest mb-2 mt-3 opacity-60">Adresse de livraison</div>
                <input value={coord.adresse1} onChange={(e) => setCoord({ ...coord, adresse1: e.target.value })} placeholder="Adresse" className="w-full mb-2 rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                <input value={coord.adresse2} onChange={(e) => setCoord({ ...coord, adresse2: e.target.value })} placeholder="Complément (optionnel)" className="w-full mb-2 rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input value={coord.codePostal} onChange={(e) => setCoord({ ...coord, codePostal: e.target.value })} placeholder="Code postal" className="rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                  <input value={coord.ville} onChange={(e) => setCoord({ ...coord, ville: e.target.value })} placeholder="Ville" className="col-span-2 rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                </div>
                <input value={coord.pays} onChange={(e) => setCoord({ ...coord, pays: e.target.value })} placeholder="Pays" className="w-full mb-4 rounded-2xl border-2 px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />

                <div className="rounded-2xl px-4 py-3 mb-4 text-sm flex items-center justify-between" style={{ background: "#F7F9FD" }}>
                  <span>{fmt.label}{fmt.frame && orderFrame !== "none" ? ` · ${frm.label}` : ""}</span><b>{total} €</b>
                </div>
                {erreurCommande && <p className="text-xs font-bold mb-2" style={{ color: "#B5443A" }}>{erreurCommande}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setOrderEtape("format")} disabled={commandeEnCours} className="rounded-2xl px-4 py-3 font-bold border-2 disabled:opacity-40" style={{ borderColor: "#DCE2F0" }}>Retour</button>
                  <button onClick={passerCommande} disabled={commandeEnCours}
                    className="flex-1 rounded-2xl px-4 py-3 font-bold text-white shadow-md disabled:opacity-40" style={{ background: CTA, ...uiDisplay }}>
                    {commandeEnCours ? "Un instant…" : `Valider et payer · ${total} €`}
                  </button>
                </div>
                <p className="text-[10px] opacity-50 mt-3">Vous recevrez un e-mail de confirmation avec un lien de suivi, puis un e-mail à chaque étape (production, expédition, livraison).</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
