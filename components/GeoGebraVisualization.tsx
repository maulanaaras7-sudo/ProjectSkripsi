"use client";

import { useEffect, useRef, useState } from "react";
import { FunctionExplorationLab } from "@/components/FunctionExplorationLab";
import {
  type CompositionProperty, type InverseDomain, type SimulationModuleId,
  compositionProperty, compositionValues, contextualFunction, graphCommands,
  inverseComposition, inverseReflection, inverseRequirement, mappingTable, operationValues,
} from "@/lib/simulation-lab-math";

type GeoGebraApi = { evalCommand: (command: string) => boolean; setColor?: (name: string, red: number, green: number, blue: number) => void; setLineStyle?: (name: string, style: number) => void; setPerspective?: (perspective: string) => void; setSize?: (width: number, height: number) => void; remove?: () => void };
type GeoGebraConstructor = new (parameters: Record<string, unknown>, useWebSimple?: boolean) => { inject: (id: string) => void };
declare global { interface Window { GGBApplet?: GeoGebraConstructor } }

let geoGebraLoader: Promise<void> | null = null;
function loadGeoGebra() {
  if (window.GGBApplet) return Promise.resolve();
  if (geoGebraLoader) return geoGebraLoader;
  geoGebraLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.geogebra.org/apps/deployggb.js"; script.async = true;
    script.onload = () => window.GGBApplet ? resolve() : reject(new Error("GeoGebra Apps API tidak tersedia."));
    script.onerror = () => reject(new Error("GeoGebra Apps API gagal dimuat.")); document.head.appendChild(script);
  }).catch((error) => { geoGebraLoader = null; throw error; });
  return geoGebraLoader;
}

const modules: Array<{ id: SimulationModuleId; title: string; short: string; question: string; discussion: string; presets: Array<{ value: string; label: string }> }> = [
  { id: "SIM-01", title: "Pemetaan Fungsi", short: "Domain, kodomain, dan range", question: "Mengapa 1 dan −1 boleh mempunyai keluaran yang sama pada contoh ini?", discussion: "Pemetaan x² tetap fungsi karena setiap masukan hanya memiliki satu keluaran; fungsi tidak harus satu-satu.", presets: [{ value: "square", label: "x²" }] },
  { id: "SIM-02", title: "Operasi Fungsi", short: "Tambah, kurang, kali, bagi", question: "Mengapa pembagian tidak terdefinisi saat x = 2?", discussion: "Karena g(2)=0 dan pembagian oleh nol tidak didefinisikan.", presets: [{ value: "sum", label: "Penjumlahan: f+g" }, { value: "difference", label: "Pengurangan: f−g" }, { value: "product", label: "Perkalian: f×g" }, { value: "quotient", label: "Pembagian: f/g" }] },
  { id: "SIM-03", title: "Mesin Komposisi", short: "Urutan masukan dan keluaran", question: "Mengapa f∘g dan g∘f memberi hasil berbeda?", discussion: "Urutan fungsi menentukan keluaran antara yang diproses fungsi berikutnya.", presets: [{ value: "machine", label: "f=2x+1, g=x+3" }] },
  { id: "SIM-04", title: "Sifat Komposisi", short: "Komutatif, asosiatif, identitas", question: "Sifat mana yang selalu berlaku untuk komposisi fungsi?", discussion: "Komposisi bersifat asosiatif dan memiliki identitas, tetapi tidak selalu komutatif.", presets: [{ value: "noncommutative", label: "Tidak komutatif" }, { value: "commutative", label: "Contoh komutatif" }, { value: "associative", label: "Asosiatif" }, { value: "identity", label: "Identitas" }] },
  { id: "SIM-05", title: "Syarat Fungsi Invers", short: "Domain menentukan invers", question: "Mengapa membatasi domain membuat x² memiliki invers?", discussion: "Pembatasan domain memilih satu cabang sehingga setiap keluaran kembali ke tepat satu masukan.", presets: [{ value: "all", label: "ℝ → ℝ" }, { value: "nonnegative", label: "x ≥ 0" }, { value: "nonpositive", label: "x ≤ 0" }] },
  { id: "SIM-06", title: "Refleksi Invers", short: "Tukar koordinat terhadap y=x", question: "Apa yang terjadi pada koordinat titik ketika direfleksikan terhadap y=x?", discussion: "Koordinatnya bertukar: (x,y) menjadi (y,x).", presets: [{ value: "reflection", label: "f(x)=2x+3" }] },
  { id: "SIM-07", title: "Invers Komposisi", short: "Balik urutan fungsi", question: "Mengapa urutan invers dibalik?", discussion: "Untuk membatalkan f∘g, pembatalan terakhir dilakukan oleh g⁻¹: (f∘g)⁻¹=g⁻¹∘f⁻¹.", presets: [{ value: "inverse-composition", label: "f=2x+3, g=x+2" }] },
  { id: "SIM-08", title: "Fungsi Kontekstual", short: "Diskon dan biaya tetap", question: "Bagaimana harga awal diperoleh kembali dari harga akhir?", discussion: "Kurangi biaya tetap, lalu bagi dengan faktor sisa harga setelah diskon.", presets: [{ value: "20-5", label: "Diskon 20% + Rp5.000" }] },
];
const defaults: Record<SimulationModuleId, { preset: string; x: number }> = {
  "SIM-01": { preset: "square", x: 2 }, "SIM-02": { preset: "sum", x: 2 }, "SIM-03": { preset: "machine", x: 2 }, "SIM-04": { preset: "noncommutative", x: 2 }, "SIM-05": { preset: "all", x: 4 }, "SIM-06": { preset: "reflection", x: 1 }, "SIM-07": { preset: "inverse-composition", x: 11 }, "SIM-08": { preset: "20-5", x: 100 },
};
const formatNumber = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
const formatRupiah = (value: number) => `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;

export function GeoGebraVisualization() {
  const [showExploration, setShowExploration] = useState(false);
  const [moduleId, setModuleId] = useState<SimulationModuleId>("SIM-01");
  const [preset, setPreset] = useState(defaults["SIM-01"].preset);
  const [x, setX] = useState(defaults["SIM-01"].x);
  const [status, setStatus] = useState("Memuat GeoGebra…");
  const rootRef = useRef<HTMLDivElement>(null); const apiRef = useRef<GeoGebraApi | null>(null); const generationRef = useRef(0);
  const active = modules.find((item) => item.id === moduleId)!;
  const selectModule = (id: SimulationModuleId) => { const initial = defaults[id]; setShowExploration(false); setModuleId(id); setPreset(initial.preset); setX(initial.x); };
  const reset = () => { const initial = defaults[moduleId]; setPreset(initial.preset); setX(initial.x); };

  useEffect(() => { if (new URLSearchParams(window.location.search).get("lab") === "1") setShowExploration(true); }, []);

  useEffect(() => {
    if (showExploration) return;
    const root = rootRef.current; if (!root) return;
    let disposed = false; const generation = ++generationRef.current; const target = document.createElement("div"); target.id = `geogebra-simulation-${generation}`; root.replaceChildren(target); setStatus("Memuat applet GeoGebra…");
    const inject = async () => {
      try {
        await loadGeoGebra(); if (disposed || !window.GGBApplet) return;
        const width = Math.max(280, Math.floor(root.getBoundingClientRect().width || 560));
        const applet = new window.GGBApplet({ appName: "graphing", width, height: Math.max(360, Math.min(480, Math.round(width * 0.7))), perspective: "G", showToolBar: false, showAlgebraInput: false, showMenuBar: false, showResetIcon: false, enableLabelDrags: false, enableShiftDragZoom: true, showFullscreenButton: true, language: "id", appletOnLoad: (api: GeoGebraApi) => { if (disposed || generation !== generationRef.current) { api.remove?.(); return; } apiRef.current = api; api.setPerspective?.("G"); applyGraph(api, moduleId, x, preset); setStatus("Applet GeoGebra siap digunakan."); } }, true);
        applet.inject(target.id);
      } catch { if (!disposed) setStatus("Gagal memuat GeoGebra. Periksa koneksi internet, lalu muat ulang halaman."); }
    };
    void inject();
    return () => { disposed = true; apiRef.current?.remove?.(); apiRef.current = null; target.replaceChildren(); };
    // A module/preset replacement deliberately disposes all previous graph objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, preset, showExploration]);
  useEffect(() => { if (!showExploration && apiRef.current) applyGraph(apiRef.current, moduleId, x, preset); }, [moduleId, preset, showExploration, x]);
  useEffect(() => {
    if (showExploration) return;
    const root = rootRef.current; if (!root || !window.ResizeObserver) return;
    const observer = new ResizeObserver(() => { const api = apiRef.current; if (!api?.setSize) return; const width = Math.max(280, Math.floor(root.getBoundingClientRect().width)); api.setSize(width, Math.max(360, Math.min(480, Math.round(width * 0.7)))); });
    observer.observe(root); return () => observer.disconnect();
  }, [showExploration]);

  return <section className="simulation-lab" aria-label="GeoGebra Simulation Lab">
    {!showExploration && <div className="simulation-lab-intro"><p className="simulation-kicker">Delapan modul interaktif</p><h2>Eksplorasi fungsi dengan GeoGebra</h2><p>Pilih satu modul, ubah kontrol yang relevan, lalu bandingkan hasil aljabar dengan grafik nyata.</p></div>}
    <div className="simulation-module-tabs" role="tablist" aria-label="Modul simulasi">{modules.map((item) => <button key={item.id} type="button" role="tab" aria-selected={!showExploration && moduleId === item.id} className={!showExploration && moduleId === item.id ? "active" : ""} onClick={() => selectModule(item.id)}><small>{item.id}</small>{item.title}</button>)}<button type="button" role="tab" aria-selected={showExploration} className={showExploration ? "active exploration-tab" : "exploration-tab"} onClick={() => setShowExploration(true)}><small>LAB</small>Lab Eksplorasi</button></div>
    {showExploration ? <FunctionExplorationLab /> : <div className="simulation-workspace">
      {moduleId === "SIM-01" ? <Sim01Controls x={x} onChange={setX} onReset={reset} /> : moduleId === "SIM-02" ? <Sim02Controls x={x} preset={preset} onChange={setX} onPresetChange={setPreset} onReset={reset} /> : moduleId === "SIM-03" ? <Sim03Controls x={x} onChange={setX} onReset={reset} /> : moduleId === "SIM-04" ? <Sim04Controls x={x} preset={preset} onChange={setX} onPresetChange={setPreset} onReset={reset} /> : moduleId === "SIM-05" ? <Sim05Controls b={x} preset={preset} onChange={setX} onPresetChange={setPreset} onReset={reset} /> : moduleId === "SIM-06" ? <Sim06Controls x={x} onChange={setX} onReset={reset} /> : moduleId === "SIM-07" ? <Sim07Controls output={x} onChange={setX} onReset={reset} /> : <Sim08Controls priceThousands={x} preset={preset} onChange={setX} onPresetChange={setPreset} onReset={reset} />}
      <div className="geogebra-wrap simulation-graph">
        <div className="simulation-graph-heading"><div><p className="simulation-kicker">Grafik GeoGebra</p><h2>Grafik yang berubah otomatis</h2></div><span className={status.startsWith("Applet") ? "geo-status-badge ready" : "geo-status-badge"}>{status.startsWith("Applet") ? "GeoGebra aktif" : "Memuat GeoGebra"}</span></div>
        <div ref={rootRef} className="geogebra-applet" aria-label={`Grafik GeoGebra ${active.title}`} /><p className="geogebra-status" role="status" aria-live="polite">{status}</p><div className="graph-guide"><p className="simulation-kicker">Pertanyaan refleksi</p><h3>{active.question}</h3><p><strong>Pembahasan:</strong> {active.discussion}</p></div>
      </div>
    </div>}
  </section>;
}

function applyGraph(api: GeoGebraApi, moduleId: SimulationModuleId, x: number, preset: string) {
  for (const command of graphCommands(moduleId, x, preset)) api.evalCommand(command);
  for (const name of ["f", "h", "k", "P", "A", "B", "C", "D", "E"]) api.setColor?.(name, 47, 93, 187);
  for (const name of ["g", "Q"]) api.setColor?.(name, 194, 78, 46);
  if (moduleId === "SIM-01") api.setColor?.("P", 194, 78, 46);
  if (moduleId === "SIM-02") { api.setColor?.("g", 31, 138, 110); api.setColor?.("h", 230, 144, 40); api.setColor?.("P", 230, 102, 28); }
  if (moduleId === "SIM-03") { api.setColor?.("g", 31, 138, 110); api.setColor?.("h", 230, 144, 40); api.setColor?.("k", 165, 87, 200); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
  if (moduleId === "SIM-04") { api.setColor?.("g", 31, 138, 110); api.setColor?.("h", 230, 144, 40); api.setColor?.("k", 165, 87, 200); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
  if (moduleId === "SIM-05") { api.setColor?.("l", 205, 82, 70); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
  if (moduleId === "SIM-06") { api.setColor?.("g", 31, 138, 110); api.setLineStyle?.("diag", 1); api.setColor?.("diag", 100, 112, 130); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
  if (moduleId === "SIM-07") { api.setColor?.("f", 110, 110, 110); api.setColor?.("g", 31, 138, 110); api.setColor?.("h", 230, 144, 40); api.setColor?.("k", 165, 87, 200); api.setLineStyle?.("diag", 1); api.setColor?.("diag", 100, 112, 130); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
  if (moduleId === "SIM-08") { api.setColor?.("h", 230, 144, 40); api.setColor?.("k", 165, 87, 200); api.setLineStyle?.("diag", 1); api.setColor?.("diag", 100, 112, 130); api.setColor?.("P", 230, 102, 28); api.setColor?.("Q", 31, 138, 110); }
}
function Sim01Controls({ x, onChange, onReset }: { x: number; onChange: (value: number) => void; onReset: () => void }) {
  const mapping = mappingTable(); const output = x * x;
  return <aside className="algebra-card simulation-controls sim01-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Pemetaan Fungsi</h3><p className="control-summary">Pilih satu anggota domain. Amati panah pasangan, tabel nilai, range, dan titiknya pada grafik.</p>
    <label className="field sim01-slider"><span>Pilih anggota domain <output>{x}</output></span><input type="range" min={-2} max={2} step={1} value={x} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−2</i><i>0</i><i>2</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim01-stat-grid"><div><span>Input x</span><strong>{x}</strong></div><div><span>f(x)=x²</span><strong>{output}</strong></div><div><span>Status</span><strong>Fungsi</strong></div></div>
      <div className="mapping-diagram"><strong>Diagram pemetaan f(x)=x²</strong><div className="mapping-values">{mapping.pairs.map((pair) => <div key={pair.x} className={pair.x === x ? "selected" : ""}><span>{pair.x}</span><i>→</i><b>{pair.y}</b></div>)}</div><p>Domain: {`{${mapping.domain.join(", ")}}`}; kodomain: {`{${mapping.codomain.join(", ")}}`}; range: {`{${mapping.range.join(", ")}}`}.</p></div>
    </div><p className="sim01-explanation">Output boleh berulang: −2 dan 2 sama-sama dipetakan ke 4. Relasi ini tetap fungsi karena setiap input hanya punya satu output.</p>
  </aside>;
}
function Sim02Controls({ x, preset, onChange, onPresetChange, onReset }: { x: number; preset: string; onChange: (value: number) => void; onPresetChange: (value: string) => void; onReset: () => void }) {
  const values = operationValues(x);
  const operations: Record<string, { label: string; expression: string; formula: string; value: number | null; domain: string }> = {
    sum: { label: "Penjumlahan: f+g", expression: "f(x)+g(x)", formula: "3x−1", value: values.sum, domain: "Semua bilangan real" },
    difference: { label: "Pengurangan: f−g", expression: "f(x)−g(x)", formula: "x+3", value: values.difference, domain: "Semua bilangan real" },
    product: { label: "Perkalian: f×g", expression: "f(x)×g(x)", formula: "2x²−3x−2", value: values.product, domain: "Semua bilangan real" },
    quotient: { label: "Pembagian: f/g", expression: "f(x)/g(x)", formula: "(2x+1)/(x−2)", value: values.quotient, domain: "x ≠ 2" },
  };
  const selected = operations[preset] ?? operations.sum;
  return <aside className="algebra-card simulation-controls sim01-controls sim02-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Operasi Fungsi</h3><p className="control-summary">Gunakan f(x)=2x+1 dan g(x)=x−2 untuk membandingkan operasi fungsi serta domain sahnya.</p>
    <label className="field sim02-select"><span>Pilih operasi</span><select value={preset} onChange={(event) => onPresetChange(event.target.value)}>{Object.entries(operations).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label>
    <label className="field sim01-slider"><span>Nilai input <output>{x}</output></span><input type="range" min={-4} max={4} step={1} value={x} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−4</i><i>0</i><i>4</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim02-summary"><strong>f(x)=2x+1 dan g(x)=x−2</strong><span>Operasi: <b>{selected.formula}</b></span><span>Domain: <b>{selected.domain}</b></span></div><div className="sim01-stat-grid"><div><span>x</span><strong>{x}</strong></div><div><span>f(x)</span><strong>{values.f}</strong></div><div><span>Hasil</span><strong>{selected.value === null ? "—" : formatNumber(selected.value)}</strong></div></div></div><p className="sim01-explanation">{selected.value === null ? "Pada x=2, penyebut g(x)=0 sehingga hasil pembagian tidak terdefinisi dan titik P tidak muncul pada grafik." : "Grafik oranye adalah hasil operasi yang dipilih."}</p>
  </aside>;
}
function Sim03Controls({ x, onChange, onReset }: { x: number; onChange: (value: number) => void; onReset: () => void }) {
  const values = compositionValues(x);
  return <aside className="algebra-card simulation-controls sim01-controls sim03-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Mesin Komposisi</h3><p className="control-summary">Ikuti urutan x → g(x) → f(g(x)), lalu bandingkan dengan urutan kebalikannya.</p>
    <label className="field sim01-slider"><span>Nilai input <output>{x}</output></span><input type="range" min={-4} max={4} step={1} value={x} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−4</i><i>0</i><i>4</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim01-stat-grid"><div><span>Input</span><strong>{x}</strong></div><div><span>g(x)=x+3</span><strong>{values.gx}</strong></div><div><span>f(g(x))</span><strong>{values.fog}</strong></div></div><div className="sim03-summary"><strong>f(x)=2x+1 dan g(x)=x+3</strong><span>(f ∘ g) ({x}) = <b>{values.fog}</b></span><span>(g ∘ f) ({x}) = <b>{values.gof}</b></span></div></div><p className="sim01-explanation">Penting: (f ∘ g)(x) berarti kerjakan g lebih dahulu, baru f.</p>
  </aside>;
}
function Sim04Controls({ x, preset, onChange, onPresetChange, onReset }: { x: number; preset: string; onChange: (value: number) => void; onPresetChange: (value: string) => void; onReset: () => void }) {
  const selected = compositionProperty(preset as CompositionProperty, x);
  const options = [{ value: "noncommutative", label: "Tidak selalu komutatif" }, { value: "commutative", label: "Contoh khusus komutatif" }, { value: "associative", label: "Sifat asosiatif" }, { value: "identity", label: "Fungsi identitas" }];
  return <aside className="algebra-card simulation-controls sim01-controls sim04-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Sifat Komposisi</h3><p className="control-summary">Bandingkan contoh yang tidak komutatif, contoh khusus yang komutatif, sifat asosiatif, dan identitas.</p>
    <label className="field sim02-select"><span>Pilih sifat atau contoh</span><select value={preset} onChange={(event) => onPresetChange(event.target.value)}>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label className="field sim01-slider"><span>Nilai input <output>{x}</output></span><input type="range" min={-4} max={4} step={1} value={x} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−4</i><i>0</i><i>4</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim01-stat-grid"><div><span>x</span><strong>{x}</strong></div><div><span>Jalur A</span><strong>{selected.left}</strong></div><div><span>Jalur B</span><strong>{selected.right}</strong></div></div><div className="sim03-summary"><strong>{preset === "noncommutative" ? "f(x)=2x+1 dan g(x)=x+3" : selected.label}</strong><span>(f ∘ g)({x}) = <b>{selected.left}</b></span><span>(g ∘ f)({x}) = <b>{selected.right}</b></span></div></div><p className="sim01-explanation">{selected.conclusion}</p>
  </aside>;
}
function Sim05Controls({ b, preset, onChange, onPresetChange, onReset }: { b: number; preset: string; onChange: (value: number) => void; onPresetChange: (value: string) => void; onReset: () => void }) {
  const choice: Record<string, { label: string; domain: string; codomain: string; bijective: boolean; inverse: string | null }> = {
    all: { label: "Domain ℝ, kodomain ℝ", domain: "ℝ", codomain: "ℝ", bijective: false, inverse: null },
    nonnegative: { label: "Domain x ≥ 0", domain: "x ≥ 0", codomain: "y ≥ 0", bijective: true, inverse: "√x" },
    nonpositive: { label: "Domain x ≤ 0", domain: "x ≤ 0", codomain: "y ≥ 0", bijective: true, inverse: "−√x" },
  };
  const selected = choice[preset] ?? choice.all; const root = b >= 0 ? Math.sqrt(b) : null;
  return <aside className="algebra-card simulation-controls sim01-controls sim05-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Syarat Fungsi Invers</h3><p className="control-summary">Batasi domain fungsi kuadrat dan periksa kapan relasi kebalikannya menjadi fungsi.</p>
    <label className="field sim02-select"><span>Pilih pembatasan domain</span><select value={preset} onChange={(event) => onPresetChange(event.target.value)}>{Object.entries(choice).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label>
    <label className="field sim01-slider"><span>Tinggi garis horizontal <output>{b}</output></span><input type="range" min={-1} max={9} step={1} value={b} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−1</i><i>4</i><i>9</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim05-summary"><strong>f(x)=x²</strong><span>Domain: <b>{selected.domain}</b></span><span>Kodomain: <b>{selected.codomain}</b></span><span>Bijektif? <b>{selected.bijective ? "YA" : "TIDAK"}</b></span>{selected.inverse ? <span>Invers: <b>{selected.inverse}</b></span> : <span>Tidak ada invers berupa fungsi pada domain dan kodomain ini.</span>}{root === null ? <p>Garis y={b} tidak berpotongan dengan parabola.</p> : preset === "all" ? <><small>f(−{root}) = f({root}) = {b}</small><hr /><p>Garis y={b} memiliki 2 perpotongan: −√{b} dan √{b}.</p></> : <p>Cabang yang dipilih memiliki satu perpotongan pada x={preset === "nonpositive" ? "−" : ""}√{b}.</p>}</div></div><p className="sim01-explanation">Jika domain dibatasi menjadi x ≥ 0 atau x ≤ 0, kodomain y ≥ 0 membuat fungsi kuadrat dapat dibalik.</p>
  </aside>;
}
function Sim06Controls({ x, onChange, onReset }: { x: number; onChange: (value: number) => void; onReset: () => void }) {
  const point = inverseReflection(x);
  return <aside className="algebra-card simulation-controls sim01-controls sim06-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Pencerminan Fungsi Invers</h3><p className="control-summary">Gerakkan titik pada f(x)=2x+3 dan lihat pasangan titiknya pada fungsi invers.</p>
    <label className="field sim01-slider"><span>Nilai input <output>{x}</output></span><input type="range" min={-4} max={4} step={1} value={x} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−4</i><i>0</i><i>4</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim06-summary"><strong>f(x)=2x+3</strong><strong>f⁻¹(x)=(x−3)/2</strong></div><div className="sim01-stat-grid"><div><span>Input</span><strong>{x}</strong></div><div><span>f(x)</span><strong>{point.y}</strong></div><div><span>f⁻¹(f(x))</span><strong>{point.inverseAtY}</strong></div></div><div className="sim03-summary"><span>Titik fungsi: <b>({point.point.join(", ")})</b></span><span>Titik invers: <b>({point.reflected.join(", ")})</b></span></div></div><p className="sim01-explanation">Koordinat titik bertukar: (a,b) pada f berpasangan dengan (b,a) pada f⁻¹ terhadap garis y=x.</p>
  </aside>;
}
function Sim07Controls({ output, onChange, onReset }: { output: number; onChange: (value: number) => void; onReset: () => void }) {
  const input = (output - 7) / 2;
  return <aside className="algebra-card simulation-controls sim01-controls sim07-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Invers Komposisi</h3><p className="control-summary">Amati bahwa invers komposisi membalik urutan: (f∘g)⁻¹=g⁻¹∘f⁻¹.</p>
    <label className="field sim01-slider"><span>Nilai keluaran <output>{output}</output></span><input type="range" min={-1} max={15} step={1} value={output} onChange={(event) => onChange(Number(event.target.value))} /><small><i>−1</i><i>7</i><i>15</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim07-summary"><strong>f(x)=2x+1, g(x)=x+3</strong><span>(f ∘ g)(x)=2x+7</span><span>(f ∘ g)⁻¹(x)=(x−7)/2</span></div><div className="sim01-stat-grid"><div><span>Nilai keluaran</span><strong>{output}</strong></div><div><span>Input asal</span><strong>{formatNumber(input)}</strong></div><div><span>Invers</span><strong>{formatNumber(input)}</strong></div></div><div className="sim03-summary"><span>g⁻¹(f⁻¹({output})) = <b>{formatNumber(input)}</b></span></div></div><p className="sim01-explanation">Untuk membalik f∘g, lakukan invers f dahulu, baru invers g: g⁻¹∘f⁻¹.</p>
  </aside>;
}
function Sim08Controls({ priceThousands, preset, onChange, onPresetChange, onReset }: { priceThousands: number; preset: string; onChange: (value: number) => void; onPresetChange: (value: string) => void; onReset: () => void }) {
  const [discountValue, feeValue] = preset.split("-").map(Number);
  const discountPercent = Number.isFinite(discountValue) ? discountValue : 20;
  const feeThousands = Number.isFinite(feeValue) ? feeValue : 5;
  const factor = 1 - discountPercent / 100;
  const price = priceThousands * 1000;
  const result = contextualFunction(price, discountPercent / 100, feeThousands * 1000);
  const afterDiscount = price * factor;
  const discounts = [10, 20, 25, 30]; const fees = [0, 5, 10];
  return <aside className="algebra-card simulation-controls sim01-controls sim08-controls">
    <p className="simulation-kicker">Langkah 1 · Pilih dan ubah</p><h3>Fungsi Kontekstual</h3><p className="control-summary">Modelkan diskon, lalu biaya layanan. Semua harga pada grafik dibaca dalam ribuan rupiah.</p>
    <div className="sim08-select-grid"><label className="field sim02-select"><span>Diskon</span><select value={discountPercent} onChange={(event) => onPresetChange(`${event.target.value}-${feeThousands}`)}>{discounts.map((value) => <option key={value} value={value}>{value}%</option>)}</select></label><label className="field sim02-select"><span>Biaya layanan</span><select value={feeThousands} onChange={(event) => onPresetChange(`${discountPercent}-${event.target.value}`)}>{fees.map((value) => <option key={value} value={value}>{formatRupiah(value * 1000)}</option>)}</select></label></div>
    <label className="field sim01-slider"><span>Harga awal (ribuan rupiah) <output>{priceThousands}</output></span><input type="range" min={0} max={200} step={5} value={priceThousands} onChange={(event) => onChange(Number(event.target.value))} /><small><i>0</i><i>100</i><i>200</i></small></label>
    <button type="button" className="btn-ghost" onClick={onReset}>↻ Ulangi contoh</button>
    <div className="sim01-result"><p className="simulation-kicker">Langkah 2 · Amati hasil</p><div className="sim08-summary"><strong>H(x)={factor.toFixed(2)}x+{formatRupiah(feeThousands * 1000)}</strong><span>Harga awal <b>{formatRupiah(price)}</b></span></div><div className="sim01-stat-grid"><div><span>Setelah diskon</span><strong>{formatRupiah(afterDiscount)}</strong></div><div><span>Harga akhir</span><strong>{formatRupiah(result.finalPrice)}</strong></div><div><span>Invers H⁻¹</span><strong>{formatRupiah(result.reversed)}</strong></div></div><p className="sim08-process">Diskon {discountPercent}% diterapkan lebih dahulu, kemudian biaya layanan {formatRupiah(feeThousands * 1000)} ditambahkan.</p></div><p className="sim01-explanation">Pada grafik, sumbu memakai satuan ribuan rupiah agar skala mudah dibaca.</p>
  </aside>;
}
function resultPanel(moduleId: SimulationModuleId, x: number, preset: string) {
  if (moduleId === "SIM-01") { const item = mappingTable(); return <div className="simulation-result"><strong>f(x)=x²</strong><p>Domain: {`{${item.domain.join(", ")}}`}<br />Kodomain: {`{${item.codomain.join(", ")}}`}<br />Range: {`{${item.range.join(", ")}}`}</p></div>; }
  if (moduleId === "SIM-02") { const item = operationValues(x); return <div className="simulation-result"><strong>f=2x+1, g=x−2</strong><p>f({x})={item.f}; g({x})={item.g}<br />f+g={item.sum}; f−g={item.difference}<br />fg={item.product}; f/g={item.quotient === null ? "tidak terdefinisi" : formatNumber(item.quotient)}</p></div>; }
  if (moduleId === "SIM-03") { const item = compositionValues(x); return <div className="simulation-result"><strong>f=2x+1, g=x+3</strong><p>g({x})={item.gx}; f(g({x}))={item.fog}<br />f({x})={item.fx}; g(f({x}))={item.gof}</p></div>; }
  if (moduleId === "SIM-04") { const item = compositionProperty(preset as CompositionProperty, x); return <div className="simulation-result"><strong>{item.label}</strong><p>Nilai kiri: {item.left}<br />Nilai kanan: {item.right}</p><p>{item.conclusion}</p></div>; }
  if (moduleId === "SIM-05") { const item = inverseRequirement(preset as InverseDomain, x); return <div className="simulation-result"><strong>f(x)=x²</strong><p>{item.explanation}</p><p>Invers: {item.inverse ?? "tidak ada pada ℝ→ℝ"}{item.inverse ? `; ${item.inverse}(${x})=${formatNumber(item.output)}` : ""}</p></div>; }
  if (moduleId === "SIM-06") { const item = inverseReflection(x); return <div className="simulation-result"><strong>f(x)=2x+3</strong><p>P=({item.point.join(", ")})<br />Q=({item.reflected.join(", ")})</p><p>Q adalah refleksi P terhadap y=x.</p></div>; }
  if (moduleId === "SIM-07") { const item = inverseComposition(x); return <div className="simulation-result"><strong>(f∘g)⁻¹(x)=(x−7)/2</strong><p>(f∘g)({x})={item.composed}<br />Invers({item.composed})={item.inverse}</p><p>Urutan dibalik: {item.order}.</p></div>; }
  const item = contextualFunction(x); return <div className="simulation-result"><strong>Harga akhir = 0,8x + Rp5.000</strong><p>{formatRupiah(item.price)} → {formatRupiah(item.finalPrice)}<br />Invers → {formatRupiah(item.reversed)}</p><p>Diskon 20%, lalu biaya tetap Rp5.000.</p></div>;
}
