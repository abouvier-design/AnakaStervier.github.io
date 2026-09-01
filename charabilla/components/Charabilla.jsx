"use client";

// Application Charabilla — portage fidèle de prototype/charabilla.jsx.
// Adaptations DEMARRAGE.md : window.storage -> lib/storage.js (localStorage),
// polices -> next/font (app/layout.tsx), styles d'impression -> app/globals.css.
// Le reste (design, textes, logique) est repris tel quel.

import { useState, useEffect, useMemo, useRef } from "react";
import storage from "@/lib/storage";
import {
  THEMES, MAX_WORDS, INK, CTA, normalize, keyify, toEnglish, gridFor, FORMATS, FRAMES,
} from "@/lib/themes";
import { ART, SVG_MAP, SVG_LIBRARY, SVG_NAMES, EMOJI_PICKER_LIST, starPath } from "@/lib/art";

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

  // Chargement initial : projets + index bibliothèque
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
      } catch (e) { /* première visite */ }
      try {
        const idx = await storage.get("charabilla-lib-index");
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
          const r = await storage.get(`charabilla-img-${themeKey}-${k}`);
          if (r && r.value) add[`${themeKey}:${k}`] = r.value;
        } catch (e) { /* image absente */ }
      }
      if (Object.keys(add).length) setImgCache((c) => ({ ...c, ...add }));
    })();
  }, [loaded, words, themeKey, pickerFor, libIndex]);

  const persistLibIndex = async (next) => {
    setLibIndex(next);
    try { await storage.set("charabilla-lib-index", JSON.stringify(next)); } catch (e) { console.error(e); }
  };
  const saveLibImage = async (univers, wordKey, dataUrl) => {
    try {
      await storage.set(`charabilla-img-${univers}-${wordKey}`, dataUrl);
      const list = libIndex[univers] || [];
      const next = { ...libIndex, [univers]: list.includes(wordKey) ? list : [...list, wordKey].sort() };
      await persistLibIndex(next);
      setImgCache((c) => ({ ...c, [`${univers}:${wordKey}`]: dataUrl }));
      return true;
    } catch (e) { console.error(e); return false; }
  };
  const deleteLibImage = async (univers, wordKey) => {
    try { await storage.delete(`charabilla-img-${univers}-${wordKey}`); } catch (e) { /* déjà absente */ }
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
