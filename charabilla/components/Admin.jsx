"use client";

// Back-office Charabilla : constitution de la bibliothèque d'illustrations par univers,
// validation des illustrations générées par les utilisateurs, mots signalés.

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { THEMES, INK, CTA, keyify, toEnglish, LEXIQUE } from "@/lib/themes";
import { ART, SVG_MAP } from "@/lib/art";
import { creerClient, lireFichierImage, MOT_DE_PASSE_DEMO } from "@/lib/api-client";
import ModaleGeneration from "./ModaleGeneration";
import ModaleNoms from "./ModaleNoms";
import AdminCommandes from "./AdminCommandes";
import AdminChiffres from "./AdminChiffres";

const ui = { fontFamily: "var(--font-nunito), sans-serif" };
const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };
const dateCourte = (t) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function Admin() {
  const client = useMemo(() => creerClient(), []);
  const [session, setSession] = useState(null); // { connecte, configure, generation, demo }
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurConnexion, setErreurConnexion] = useState("");
  const [univers, setUnivers] = useState("terracotta");
  const [items, setItems] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [nouveauMot, setNouveauMot] = useState("");
  const [gen, setGen] = useState(null); // { mot, en }
  const [notice, setNotice] = useState("");
  const [depotEnCours, setDepotEnCours] = useState(false);
  const fichiersRef = useRef(null);
  const remplacerRef = useRef(null);
  const [remplacerKey, setRemplacerKey] = useState(null);
  const [onglet, setOnglet] = useState("bibliotheque"); // bibliotheque | commandes | chiffres
  const [nomsPour, setNomsPour] = useState(null);

  const theme = THEMES[univers];
  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(""), 2600); };

  const rafraichir = async (u = univers) => {
    try {
      const [liste, sig] = await Promise.all([client.listerBibliotheque(u), client.listerSignalements()]);
      setItems(liste); setSignalements(sig);
    } catch (e) { flash(e.message); }
  };

  useEffect(() => {
    let actif = true;
    client.admin.session()
      .then((s) => { if (actif) setSession(s); })
      .catch(() => { if (actif) setSession({ connecte: false }); });
    return () => { actif = false; };
  }, [client]);
  const connecte = !!session?.connecte;
  useEffect(() => {
    if (!connecte) return;
    let actif = true;
    Promise.all([client.listerBibliotheque(univers), client.listerSignalements()])
      .then(([liste, sig]) => { if (actif) { setItems(liste); setSignalements(sig); } })
      .catch(() => {});
    return () => { actif = false; };
  }, [client, connecte, univers]);

  const connexion = async (e) => {
    e.preventDefault(); setErreurConnexion("");
    try { setSession({ ...(await client.admin.connexion(motDePasse)), configure: true }); setMotDePasse(""); }
    catch (err) { setErreurConnexion(err.message); }
  };
  const deconnexion = async () => { await client.admin.deconnexion(); setSession({ connecte: false, configure: session?.configure }); };

  const parKey = useMemo(() => Object.fromEntries(items.map((it) => [it.key, it])), [items]);
  const valides = items.filter((it) => it.statut === "valide");
  const aValider = items.filter((it) => it.statut !== "valide");
  const lexiqueManquant = LEXIQUE.filter((m) => !parKey[m.key]);
  const horsLexique = items.filter((it) => !LEXIQUE.some((m) => m.key === it.key));
  const filtre = keyify(recherche);
  const lexiqueFiltre = LEXIQUE.filter((m) => !filtre || m.key.includes(filtre) || keyify(m.categorie).includes(filtre));

  const deposer = async (files, keyForcee = null) => {
    setDepotEnCours(true);
    let ok = 0;
    for (const file of files) {
      const key = keyForcee || keyify(file.name.replace(/\.[^.]+$/, ""));
      if (!key) continue;
      try {
        const image = await lireFichierImage(file, client.mode === "local" ? 512 : 0);
        const mot = (LEXIQUE.find((m) => m.key === key) || {}).mot || key;
        await client.enregistrer({ univers, key, mot, en: toEnglish(mot), image, source: "admin", statut: "valide" });
        ok++;
      } catch (e) { flash(`« ${key} » : ${e.message}`); }
    }
    setDepotEnCours(false);
    await rafraichir();
    if (ok) flash(`${ok} illustration${ok > 1 ? "s" : ""} ajoutée${ok > 1 ? "s" : ""} à ${theme.label} ✓`);
  };

  const supprimer = async (key) => {
    if (!window.confirm(`Supprimer l'illustration « ${parKey[key]?.mot || key} » de ${theme.label} ?`)) return;
    await client.supprimer(univers, key); await rafraichir();
  };
  const valider = async (key) => { await client.valider(univers, key); await rafraichir(); flash("Illustration validée ✓"); };
  const rayer = async (id) => { await client.supprimerSignalement(id); await rafraichir(); };

  const ouvrirGen = (mot, en) => setGen({ mot, en: en || toEnglish(mot) });
  const surEnregistre = async () => { setGen(null); setNouveauMot(""); await rafraichir(); flash("Illustration enregistrée dans la bibliothèque ✓"); };

  // ---------- Écran de connexion ----------
  if (!session) return <div className="min-h-screen" style={{ background: "#EEF1F8" }} />;
  if (!session.connecte) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ background: "#EEF1F8", ...ui, color: INK }}>
        <form onSubmit={connexion} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: CTA }}>💬</div>
            <div>
              <h1 className="text-xl font-semibold" style={uiDisplay}>charabilla · back-office</h1>
              <p className="text-xs opacity-60">Réservé à l&apos;administration</p>
            </div>
          </div>
          {session.configure === false ? (
            <p className="text-sm font-bold" style={{ color: "#B5443A" }}>Le back-office n&apos;est pas configuré : il faut définir le mot de passe (variable ADMIN_PASSWORD) dans les réglages du site.</p>
          ) : (
            <>
              <label htmlFor="mot-de-passe-admin" className="text-xs font-bold opacity-70">Mot de passe</label>
              <input id="mot-de-passe-admin" type="password" autoComplete="current-password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                onTouchEnd={(e) => e.currentTarget.focus()}
                className="w-full mt-1 mb-3 rounded-2xl border-2 px-3 py-2.5 outline-none" style={{ borderColor: "#DCE2F0" }} />
              {erreurConnexion && <p className="text-xs font-bold mb-2" style={{ color: "#B5443A" }}>{erreurConnexion}</p>}
              <button type="submit" className="w-full rounded-2xl px-4 py-3 font-bold text-white" style={{ background: INK, ...uiDisplay }}>Entrer</button>
              {session.demo && <p className="text-[11px] opacity-50 mt-3 text-center">Version de démonstration — mot de passe : <b>{MOT_DE_PASSE_DEMO}</b></p>}
            </>
          )}
          <Link href="/" className="block text-center text-xs underline opacity-60 mt-4">← retour au site</Link>
        </form>
      </div>
    );
  }

  // ---------- Back-office ----------
  const Carte = ({ key_, mot, en, categorie, item }) => (
    <div className="rounded-2xl border p-2 flex flex-col gap-1" style={{ borderColor: item ? "#E8ECF5" : "#F0D3DF", background: "#fff" }}>
      <div className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden" style={{ background: theme.bg }}>
        {item ? (
          <img src={item.url} alt={mot} className="w-full h-full object-contain" draggable={false} />
        ) : (
          <svg viewBox="0 0 100 100" className="w-2/3 h-2/3" style={{ opacity: 0.3 }}>{ART[SVG_MAP[key_] || "etoile"](theme.pal)}</svg>
        )}
      </div>
      <div className="px-1">
        <div className="text-xs font-bold truncate">{mot}</div>
        <div className="text-[10px] opacity-60 truncate">{item ? (item.en || en) : (categorie || en)}</div>
        {item && item.statut !== "valide" && <div className="text-[10px] font-bold" style={{ color: CTA }}>à valider</div>}
      </div>
      <div className="flex gap-1 px-1 pb-1 flex-wrap">
        <button onClick={() => ouvrirGen(mot, item?.en || en)} className="text-[11px] font-bold rounded-full px-2.5 py-1 text-white" style={{ background: CTA }}>{item ? "Regénérer" : "Générer"}</button>
        <button onClick={() => { setRemplacerKey(key_); remplacerRef.current?.click(); }} className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F0F3FA" }}>{item ? "Remplacer" : "Déposer"}</button>
        {item && <button onClick={() => setNomsPour(item)} className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F0F3FA" }} title="Noms dans d'autres langues">Noms{Object.keys(item.noms || {}).length > 1 ? ` · ${Object.keys(item.noms).length}` : ""}</button>}
        {item && <button onClick={() => supprimer(key_)} className="text-[11px] font-bold rounded-full px-2 py-1" style={{ color: CTA }}>✕</button>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#EEF1F8", ...ui, color: INK }}>
      <header className="px-5 pt-8 pb-4 max-w-6xl mx-auto flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm" style={{ background: CTA }}>💬</div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight" style={uiDisplay}>charabilla <span className="opacity-50 text-xl">· back-office</span></h1>
          <p className="text-sm opacity-75">Bibliothèque d&apos;illustrations, validation, mots signalés.</p>
        </div>
        <Link href="/" className="text-xs font-bold underline opacity-70">Voir le site</Link>
        <button onClick={deconnexion} className="text-xs font-bold rounded-full px-3 py-1.5" style={{ background: "#F0F3FA" }}>Déconnexion</button>
      </header>

      {notice && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{notice}</div>}

      <main className="max-w-6xl mx-auto px-5 pb-16 flex flex-col gap-5">
        <nav className="flex gap-2 flex-wrap">
          {[["bibliotheque", "Bibliothèque"], ["commandes", "Commandes"], ["chiffres", "Chiffre d'affaires"]].map(([k, l]) => (
            <button key={k} onClick={() => setOnglet(k)} className="rounded-2xl px-4 py-2 text-sm font-bold" style={{ background: onglet === k ? INK : "#fff", color: onglet === k ? "#fff" : INK, ...uiDisplay }}>{l}</button>
          ))}
        </nav>

        {onglet === "commandes" && <AdminCommandes client={client} flash={flash} />}
        {onglet === "chiffres" && <AdminChiffres client={client} />}

        {onglet === "bibliotheque" && <>
        <div className="rounded-2xl px-4 py-2.5 text-xs font-bold flex items-center gap-2" style={{ background: session.generation === "ia" ? "#E6F4EA" : "#FFF4D6", color: INK }}>
          {session.generation === "ia"
            ? "Génération d'illustrations : IA active (OpenAI, prompt verrouillé par univers)."
            : "Génération en mode démonstration : « générer » renvoie le croquis provisoire. Pour activer l'IA, ajouter la clé OPENAI_API_KEY dans les réglages du site."}
        </div>

        {/* Univers */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(THEMES).map(([k, t]) => (
            <button key={k} onClick={() => setUnivers(k)} className="rounded-2xl p-3 text-left border-2 transition-all" style={{ borderColor: univers === k ? INK : "#E8ECF5", background: t.bg }}>
              <div className="text-sm font-bold" style={{ color: t.deco === "stars" ? t.word : INK }}>{t.label}</div>
              <div className="text-[11px] opacity-70" style={{ color: t.deco === "stars" ? t.word : INK }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Chiffres */}
        <div className="grid grid-cols-3 gap-3">
          {[[valides.length, "illustrations validées"], [aValider.length, "à valider"], [lexiqueManquant.length, "mots du lexique sans image"]].map(([n, l]) => (
            <div key={l} className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold" style={uiDisplay}>{n}</div>
              <div className="text-xs opacity-60">{l}</div>
            </div>
          ))}
        </div>

        {/* Signalements */}
        {signalements.length > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Mots signalés par les utilisateurs · {signalements.length}</div>
            <div className="flex flex-col gap-2">
              {signalements.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-2 flex-wrap" style={{ background: "#F7F9FD" }}>
                  <span className="text-sm font-bold">« {s.mot} »</span>
                  <span className="text-xs opacity-60">{THEMES[s.univers]?.label} · {s.nombre > 1 ? `${s.nombre} signalements` : "1 signalement"} · {dateCourte(s.date)}</span>
                  <span className="flex-1" />
                  <button onClick={() => { setUnivers(s.univers); ouvrirGen(s.mot, s.en); }} className="text-xs font-bold rounded-full px-3 py-1 text-white" style={{ background: CTA }}>Générer</button>
                  <button onClick={() => rayer(s.id)} className="text-xs font-bold rounded-full px-3 py-1" style={{ background: "#F0F3FA" }}>Rayer</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* À valider */}
        {aValider.length > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: CTA }}>Générées par des utilisateurs · à valider ({aValider.length})</div>
            <p className="text-[11px] opacity-60 mb-3">Validée, l&apos;illustration devient visible par tout le monde. Supprimée, l&apos;utilisateur retrouve le croquis provisoire.</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
              {aValider.map((it) => (
                <div key={it.key} className="rounded-2xl border p-2 flex flex-col gap-1" style={{ borderColor: "#F6C9DE" }}>
                  <div className="w-full aspect-square rounded-xl overflow-hidden" style={{ background: theme.bg }}><img src={it.url} alt={it.mot} className="w-full h-full object-contain" draggable={false} /></div>
                  <div className="text-xs font-bold truncate px-1">{it.mot}</div>
                  <div className="flex gap-1 px-1 pb-1">
                    <button onClick={() => valider(it.key)} className="flex-1 text-[11px] font-bold rounded-full px-2 py-1 text-white" style={{ background: INK }}>Valider</button>
                    <button onClick={() => supprimer(it.key)} className="text-[11px] font-bold rounded-full px-2 py-1" style={{ color: CTA }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajouter */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Ajouter à la bibliothèque · {theme.label}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold opacity-70">Un mot (du lexique ou nouveau)</label>
              <div className="flex gap-2 mt-1">
                <input value={nouveauMot} onChange={(e) => setNouveauMot(e.target.value)} placeholder="ex. tracteur"
                  onKeyDown={(e) => e.key === "Enter" && nouveauMot.trim() && ouvrirGen(nouveauMot.trim())}
                  className="flex-1 rounded-2xl border-2 px-3 py-2.5 outline-none text-sm" style={{ borderColor: "#DCE2F0" }} />
                <button onClick={() => ouvrirGen(nouveauMot.trim())} disabled={!nouveauMot.trim()} className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: CTA, ...uiDisplay }}>Générer</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold opacity-70">Des fichiers (le nom du fichier = le mot : chat.png, compote.png)</label>
              <input ref={fichiersRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) deposer([...e.target.files]); e.target.value = ""; }} />
              <button onClick={() => fichiersRef.current?.click()} disabled={depotEnCours}
                className="w-full mt-1 rounded-2xl px-4 py-2.5 text-sm font-bold border-2 border-dashed disabled:opacity-50" style={{ borderColor: "#C9D4E8", background: "#F7F9FD" }}>
                {depotEnCours ? "Ajout en cours…" : "📥 Déposer des illustrations"}
              </button>
            </div>
          </div>
          <details className="mt-3">
            <summary className="text-xs font-bold opacity-60 cursor-pointer">Prompt verrouillé de l&apos;univers {theme.label}</summary>
            <textarea readOnly value={theme.prompt("{OBJECT}")} rows={5} className="w-full mt-2 rounded-2xl border-2 px-3 py-2.5 outline-none text-[11px] leading-relaxed" style={{ borderColor: "#DCE2F0", background: "#F7F9FD" }} />
          </details>
        </div>

        {/* Lexique */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Les 100 mots du lexique · {LEXIQUE.length - lexiqueManquant.length} / {LEXIQUE.length} illustrés</div>
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Filtrer (mot ou catégorie)"
              className="rounded-2xl border-2 px-3 py-2 outline-none text-sm" style={{ borderColor: "#DCE2F0" }} />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
            {lexiqueFiltre.map((m) => <Carte key={m.key} key_={m.key} mot={m.mot} en={m.en} categorie={m.categorie} item={parKey[m.key]} />)}
          </div>
        </div>

        {horsLexique.length > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Autres mots · {horsLexique.length}</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
              {horsLexique.map((it) => <Carte key={it.key} key_={it.key} mot={it.mot} en={it.en} item={it} />)}
            </div>
          </div>
        )}
        </>}
      </main>

      {nomsPour && (
        <ModaleNoms item={nomsPour} onClose={() => setNomsPour(null)}
          onSave={async (noms) => { await client.mettreAJourNoms(univers, nomsPour.key, noms); setNomsPour(null); await rafraichir(); flash("Noms enregistrés ✓"); }} />
      )}

      <input ref={remplacerRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0] && remplacerKey) deposer([e.target.files[0]], remplacerKey); e.target.value = ""; setRemplacerKey(null); }} />

      {gen && (
        <ModaleGeneration client={client} mot={gen.mot} en={gen.en} univers={univers} admin
          onClose={() => setGen(null)} onValide={surEnregistre} />
      )}
    </div>
  );
}
