"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateComposition, evaluateExpression, getInverseDescription, validateExpression } from "@/lib/function-expression";

type Mode = "composition" | "inverse" | "both";
type Order = "fog" | "gof";
type LabApi = {
  evalCommand: (command: string) => boolean;
  remove?: () => void;
  setColor?: (name: string, red: number, green: number, blue: number) => void;
  setCoordSystem?: (xmin: number, xmax: number, ymin: number, ymax: number) => void;
  setPerspective?: (perspective: string) => void;
  setSize?: (width: number, height: number) => void;
  setVisible?: (name: string, visible: boolean) => void;
};
type LabAppletConstructor = new (parameters: Record<string, unknown>, useWebSimple?: boolean) => { inject: (id: string) => void };
declare global { interface Window { GGBApplet?: LabAppletConstructor } }

let labLoader: Promise<void> | null = null;
function loadLabApi() {
  if (window.GGBApplet) return Promise.resolve();
  if (labLoader) return labLoader;
  labLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    const script = existing ?? document.createElement("script");
    if (!existing) { script.src = "https://www.geogebra.org/apps/deployggb.js"; script.async = true; document.head.appendChild(script); }
    script.addEventListener("load", () => window.GGBApplet ? resolve() : reject(new Error("API tidak tersedia")), { once: true });
    script.addEventListener("error", () => reject(new Error("API gagal dimuat")), { once: true });
    if (window.GGBApplet) resolve();
  }).catch((error) => { labLoader = null; throw error; });
  return labLoader;
}

type GraphConfig = { f: string; g: string; mode: Mode; order: Order; showF: boolean; showG: boolean; showResult: boolean; showInverse: boolean; showDiagonal: boolean };
function renderLabGraph(api: LabApi, config: GraphConfig) {
  api.evalCommand(`f(x)=${config.f}`); api.evalCommand(`g(x)=${config.g}`);
  api.evalCommand(config.order === "fog" ? "h(x)=f(g(x))" : "h(x)=g(f(x))");
  const fInverse = getInverseDescription(config.f); const gInverse = getInverseDescription(config.g);
  if (fInverse.formula) api.evalCommand(`fi(x)=${fInverse.formula}`);
  if (gInverse.formula) api.evalCommand(`gi(x)=${gInverse.formula}`);
  api.evalCommand("diag:y=x");
  api.setColor?.("f", 111, 38, 210); api.setColor?.("g", 34, 139, 230); api.setColor?.("h", 244, 63, 154);
  api.setColor?.("fi", 141, 85, 210); api.setColor?.("gi", 31, 138, 110); api.setColor?.("diag", 105, 115, 135);
  const showComposition = config.mode !== "inverse";
  const showInverses = config.mode !== "composition" && config.showInverse;
  api.setVisible?.("f", config.showF); api.setVisible?.("g", config.showG);
  api.setVisible?.("h", showComposition && config.showResult);
  api.setVisible?.("fi", showInverses && Boolean(fInverse.formula)); api.setVisible?.("gi", showInverses && Boolean(gInverse.formula));
  api.setVisible?.("diag", config.showDiagonal && config.mode !== "composition");
}

const tabs = ["Penjelasan", "Keterkaitan", "Contoh", "Latihan Cepat"] as const;
type LearningTab = (typeof tabs)[number];
function graphHeight(width: number) {
  if (width < 480) return 390;
  if (width < 650) return 440;
  return Math.max(470, Math.min(530, Math.round(width * .68)));
}

export function FunctionExplorationLab({ onBack }: { onBack: () => void }) {
  const [draftF, setDraftF] = useState("2x+1"); const [draftG, setDraftG] = useState("x-3");
  const [applied, setApplied] = useState({ f: "2x+1", g: "x-3" });
  const [errors, setErrors] = useState<{ f?: string; g?: string }>({});
  const [mode, setMode] = useState<Mode>("composition"); const [order, setOrder] = useState<Order>("fog"); const [x, setX] = useState(2);
  const [display, setDisplay] = useState({ f: true, g: true, result: true, inverse: true, diagonal: true });
  const [activeTab, setActiveTab] = useState<LearningTab>("Penjelasan"); const [status, setStatus] = useState("Memuat GeoGebra…");
  const [retryKey, setRetryKey] = useState(0); const [readyVersion, setReadyVersion] = useState(0); const [answer, setAnswer] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null); const apiRef = useRef<LabApi | null>(null); const graphConfig = useRef<GraphConfig>({ f: applied.f, g: applied.g, mode, order, showF: true, showG: true, showResult: true, showInverse: true, showDiagonal: true });
  graphConfig.current = { f: applied.f, g: applied.g, mode, order, showF: display.f, showG: display.g, showResult: display.result, showInverse: display.inverse, showDiagonal: display.diagonal };

  const calculations = useMemo(() => {
    try {
      const fValue = evaluateExpression(applied.f, x); const gValue = evaluateExpression(applied.g, x);
      const composition = order === "fog" ? evaluateComposition(applied.f, applied.g, x) : evaluateComposition(applied.g, applied.f, x);
      return { fValue, gValue, intermediate: composition.intermediate, result: composition.result, error: null };
    } catch (error) { return { fValue: null, gValue: null, intermediate: null, result: null, error: error instanceof Error ? error.message : "Nilai tidak terdefinisi." }; }
  }, [applied, order, x]);
  const fInverse = useMemo(() => getInverseDescription(applied.f), [applied.f]); const gInverse = useMemo(() => getInverseDescription(applied.g), [applied.g]);

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    let disposed = false; const target = document.createElement("div"); target.id = `function-exploration-ggb-${retryKey}`; root.replaceChildren(target); setStatus("Memuat GeoGebra…");
    void loadLabApi().then(() => {
      if (disposed || !window.GGBApplet) return;
      const width = Math.max(300, Math.floor(root.getBoundingClientRect().width || 680));
      const applet = new window.GGBApplet({ appName: "graphing", width, height: graphHeight(width), perspective: "G", showToolBar: false, showAlgebraInput: false, showMenuBar: false, showResetIcon: false, showFullscreenButton: false, enableShiftDragZoom: true, language: "id", appletOnLoad: (api: LabApi) => { if (disposed) { api.remove?.(); return; } apiRef.current = api; api.setPerspective?.("G"); api.setCoordSystem?.(-5, 5, -5, 5); renderLabGraph(api, graphConfig.current); setStatus("GeoGebra aktif"); setReadyVersion((value) => value + 1); } }, true);
      applet.inject(target.id);
    }).catch(() => { if (!disposed) setStatus("GeoGebra gagal dimuat. Periksa internet lalu coba lagi."); });
    const observer = new ResizeObserver(() => { const width = Math.max(300, Math.floor(root.getBoundingClientRect().width)); apiRef.current?.setSize?.(width, graphHeight(width)); }); observer.observe(root);
    return () => { disposed = true; observer.disconnect(); apiRef.current?.remove?.(); apiRef.current = null; target.replaceChildren(); };
  }, [retryKey]);
  useEffect(() => { if (apiRef.current) renderLabGraph(apiRef.current, graphConfig.current); }, [applied, display, mode, order, readyVersion]);

  const applyFunctions = () => {
    const f = validateExpression(draftF); const g = validateExpression(draftG); const nextErrors = { f: f.ok ? undefined : f.error, g: g.ok ? undefined : g.error }; setErrors(nextErrors);
    if (!f.ok || !g.ok) return; setApplied({ f: f.normalized, g: g.normalized }); setAnswer(null);
  };
  const reset = () => { setDraftF("2x+1"); setDraftG("x-3"); setApplied({ f: "2x+1", g: "x-3" }); setMode("composition"); setOrder("fog"); setX(2); setDisplay({ f: true, g: true, result: true, inverse: true, diagonal: true }); setErrors({}); setAnswer(null); apiRef.current?.setCoordSystem?.(-5, 5, -5, 5); };
  const applyPreset = (f: string, g: string, nextMode: Mode) => { setDraftF(f); setDraftG(g); setApplied({ f, g }); setMode(nextMode); setErrors({}); };
  const adjustZoom = (factor: number) => apiRef.current?.setCoordSystem?.(-5 * factor, 5 * factor, -5 * factor, 5 * factor);

  return <div className="exploration-lab">
    <div className="exploration-title"><span aria-hidden="true">⚗</span><div><h2>Lab Eksplorasi Fungsi: Komposisi &amp; Invers</h2><p>Eksplorasi hubungan antara dua fungsi, komposisinya, dan fungsi inversnya melalui grafik interaktif.</p></div><button type="button" className="exploration-back" onClick={onBack}>← Delapan simulasi</button></div>
    <div className="exploration-grid">
      <aside className="exploration-sidebar">
        <section className="exploration-card"><h3><i>ƒ(x)</i> Masukkan Fungsi</h3><p>Tentukan dua fungsi untuk dieksplorasi.</p><label>f(x)<input value={draftF} onChange={(event) => setDraftF(event.target.value)} aria-invalid={Boolean(errors.f)} /></label>{errors.f && <small className="exploration-error">{errors.f}</small>}<label>g(x)<input value={draftG} onChange={(event) => setDraftG(event.target.value)} aria-invalid={Boolean(errors.g)} /></label>{errors.g && <small className="exploration-error">{errors.g}</small>}<small>Format: 2x+1, x^2, sqrt(x), 1/(x-2)</small></section>
        <section className="exploration-card"><h3>◫ Pilih Operasi</h3><p>Pilih operasi yang ingin ditampilkan.</p><div className="exploration-mode">{(["composition", "inverse", "both"] as Mode[]).map((item) => <button type="button" key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item === "composition" ? "Komposisi" : item === "inverse" ? "Invers" : "Keduanya"}</button>)}</div>{mode !== "inverse" && <label>Urutan<select value={order} onChange={(event) => setOrder(event.target.value as Order)}><option value="fog">f ∘ g</option><option value="gof">g ∘ f</option></select></label>}<label>Nilai x<input type="number" value={x} step="0.5" onChange={(event) => setX(Number(event.target.value))} /></label><div className="exploration-actions"><button type="button" className="btn-primary" onClick={applyFunctions}>Perbarui</button><button type="button" className="btn-ghost" onClick={reset}>Reset</button></div></section>
        <section className="exploration-card"><h3>◉ Opsi Tampilan</h3>{([['f','Grafik f(x)'],['g','Grafik g(x)'],['result','Grafik hasil komposisi'],['inverse','Grafik invers yang valid'],['diagonal','Garis y=x']] as const).map(([key, label]) => <label className="exploration-check" key={key}><input type="checkbox" checked={display[key]} onChange={(event) => setDisplay((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}</section>
      </aside>
      <section className="exploration-graph-card"><header><h3>⌁ Grafik Fungsi</h3><div><button type="button" onClick={() => apiRef.current?.setCoordSystem?.(-5, 5, -5, 5)} aria-label="Reset tampilan">⌂</button><button type="button" onClick={() => adjustZoom(.65)} aria-label="Perbesar">＋</button><button type="button" onClick={() => adjustZoom(1.5)} aria-label="Perkecil">−</button><button type="button" onClick={() => rootRef.current?.requestFullscreen?.()} aria-label="Layar penuh">⛶</button></div></header><div ref={rootRef} className="exploration-applet" /><p className={status === "GeoGebra aktif" ? "exploration-status ready" : "exploration-status"}>{status}{status.startsWith("GeoGebra gagal") && <button type="button" onClick={() => setRetryKey((value) => value + 1)}>Coba lagi</button>}</p><div className="exploration-legend"><span><i className="legend-purple" />f(x)={applied.f}</span><span><i className="legend-blue" />g(x)={applied.g}</span>{mode !== "inverse" && <span><i className="legend-pink" />{order === "fog" ? "f∘g" : "g∘f"}</span>}</div></section>
      <aside className="exploration-summary"><h3>▣ Ringkasan Hasil</h3>{mode !== "inverse" && <section><h4>Komposisi Fungsi</h4><p><b>{order === "fog" ? "(f∘g)(x)=f(g(x))" : "(g∘f)(x)=g(f(x))"}</b></p><p>x={x} → nilai antara={calculations.intermediate ?? "—"} → hasil={calculations.result ?? "—"}</p>{calculations.error && <p className="exploration-error">{calculations.error}</p>}</section>}<section><h4>Fungsi Invers</h4><p>f⁻¹(x): <b>{fInverse.formula ?? "belum tersedia"}</b></p><small>{fInverse.note}</small><p>g⁻¹(x): <b>{gInverse.formula ?? "belum tersedia"}</b></p><small>{gInverse.note}</small></section><section><h4>Evaluasi x={x}</h4><p>f(x)={calculations.fValue ?? "—"}</p><p>g(x)={calculations.gValue ?? "—"}</p></section></aside>
      <section className="exploration-learning"><div className="exploration-learning-tabs" role="tablist">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><div className="exploration-tab-content">{activeTab === "Penjelasan" && <><h3>Penjelasan</h3><p>Komposisi memasukkan hasil satu fungsi ke fungsi berikutnya. Pada urutan {order === "fog" ? "f∘g, g dikerjakan lebih dahulu lalu f" : "g∘f, f dikerjakan lebih dahulu lalu g"}. Invers mengembalikan keluaran ke input jika fungsi bijektif pada domain dan kodomain yang sesuai.</p></>}{activeTab === "Keterkaitan" && <><h3>Jalur maju dan balik</h3><p>Maju: x → fungsi pertama → fungsi kedua. Saat membalik, fungsi terakhir harus dibatalkan lebih dahulu. Karena itu (f∘g)⁻¹=g⁻¹∘f⁻¹ ketika kedua invers sah.</p></>}{activeTab === "Contoh" && <><h3>Preset tervalidasi</h3><div className="exploration-presets"><button type="button" onClick={() => applyPreset("2x+1", "x-3", "both")}>Dua fungsi linear</button><button type="button" onClick={() => applyPreset("x^2", "x+1", "inverse")}>Kuadrat</button><button type="button" onClick={() => applyPreset("1/(x-2)", "x+1", "both")}>Rasional</button></div></>}{activeTab === "Latihan Cepat" && <><h3>Latihan cepat</h3><p>Untuk f∘g, fungsi mana yang dikerjakan lebih dahulu?</p><div className="exploration-presets"><button type="button" onClick={() => setAnswer("correct")}>g</button><button type="button" onClick={() => setAnswer("wrong")}>f</button></div>{answer && <p className={answer === "correct" ? "exploration-feedback correct" : "exploration-feedback"}>{answer === "correct" ? "Benar. Nilai g(x) menjadi input bagi f." : "Belum tepat. Pada f∘g, kerjakan g terlebih dahulu."}</p>}</>}</div></section>
    </div>
  </div>;
}
