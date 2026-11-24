"use client";

import { useEffect, useRef, useState } from "react";
import {
  type CompositionProperty, type InverseDomain, type SimulationModuleId,
  compositionProperty, compositionValues, contextualFunction, graphCommands,
  inverseComposition, inverseReflection, inverseRequirement, mappingTable, operationValues,
} from "@/lib/simulation-lab-math";

type GeoGebraApi = { evalCommand: (command: string) => boolean; setColor?: (name: string, red: number, green: number, blue: number) => void; setLineStyle?: (name: string, style: number) => void; setSize?: (width: number, height: number) => void; remove?: () => void };
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
  { id: "SIM-02", title: "Operasi Fungsi", short: "Tambah, kurang, kali, bagi", question: "Mengapa pembagian tidak terdefinisi saat x = 2?", discussion: "Karena g(2)=0 dan pembagian oleh nol tidak didefinisikan.", presets: [{ value: "linear", label: "f=2x+1, g=x−2" }] },
  { id: "SIM-03", title: "Mesin Komposisi", short: "Urutan masukan dan keluaran", question: "Mengapa f∘g dan g∘f memberi hasil berbeda?", discussion: "Urutan fungsi menentukan keluaran antara yang diproses fungsi berikutnya.", presets: [{ value: "machine", label: "f=2x+1, g=x+3" }] },
  { id: "SIM-04", title: "Sifat Komposisi", short: "Komutatif, asosiatif, identitas", question: "Sifat mana yang selalu berlaku untuk komposisi fungsi?", discussion: "Komposisi bersifat asosiatif dan memiliki identitas, tetapi tidak selalu komutatif.", presets: [{ value: "noncommutative", label: "Tidak komutatif" }, { value: "commutative", label: "Contoh komutatif" }, { value: "associative", label: "Asosiatif" }, { value: "identity", label: "Identitas" }] },
  { id: "SIM-05", title: "Syarat Fungsi Invers", short: "Domain menentukan invers", question: "Mengapa membatasi domain membuat x² memiliki invers?", discussion: "Pembatasan domain memilih satu cabang sehingga setiap keluaran kembali ke tepat satu masukan.", presets: [{ value: "all", label: "ℝ → ℝ" }, { value: "nonnegative", label: "x ≥ 0" }, { value: "nonpositive", label: "x ≤ 0" }] },
  { id: "SIM-06", title: "Refleksi Invers", short: "Tukar koordinat terhadap y=x", question: "Apa yang terjadi pada koordinat titik ketika direfleksikan terhadap y=x?", discussion: "Koordinatnya bertukar: (x,y) menjadi (y,x).", presets: [{ value: "reflection", label: "f(x)=2x+3" }] },
  { id: "SIM-07", title: "Invers Komposisi", short: "Balik urutan fungsi", question: "Mengapa urutan invers dibalik?", discussion: "Untuk membatalkan f∘g, pembatalan terakhir dilakukan oleh g⁻¹: (f∘g)⁻¹=g⁻¹∘f⁻¹.", presets: [{ value: "inverse-composition", label: "f=2x+3, g=x+2" }] },
  { id: "SIM-08", title: "Fungsi Kontekstual", short: "Diskon dan biaya tetap", question: "Bagaimana harga awal diperoleh kembali dari harga akhir?", discussion: "Kurangi biaya tetap, lalu bagi dengan faktor sisa harga 0,8.", presets: [{ value: "shopping", label: "Diskon 20% + Rp5.000" }] },
];
const defaults: Record<SimulationModuleId, { preset: string; x: number }> = {
  "SIM-01": { preset: "square", x: 2 }, "SIM-02": { preset: "linear", x: 2 }, "SIM-03": { preset: "machine", x: 2 }, "SIM-04": { preset: "noncommutative", x: 2 }, "SIM-05": { preset: "all", x: 4 }, "SIM-06": { preset: "reflection", x: 1 }, "SIM-07": { preset: "inverse-composition", x: 2 }, "SIM-08": { preset: "shopping", x: 100000 },
};
const formatNumber = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
const formatRupiah = (value: number) => `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
function sliderBounds(moduleId: SimulationModuleId) {
  if (moduleId === "SIM-01") return { min: -2, max: 2, step: 1 };
  if (moduleId === "SIM-08") return { min: 50000, max: 200000, step: 5000 };
  return { min: 0, max: 6, step: 1 };
}

export function GeoGebraVisualization() {
  const [moduleId, setModuleId] = useState<SimulationModuleId>("SIM-01");
  const [preset, setPreset] = useState(defaults["SIM-01"].preset);
  const [x, setX] = useState(defaults["SIM-01"].x);
  const [status, setStatus] = useState("Memuat GeoGebra…");
  const rootRef = useRef<HTMLDivElement>(null); const apiRef = useRef<GeoGebraApi | null>(null); const generationRef = useRef(0);
  const active = modules.find((item) => item.id === moduleId)!;
  const slider = sliderBounds(moduleId);
  const selectModule = (id: SimulationModuleId) => { const initial = defaults[id]; setModuleId(id); setPreset(initial.preset); setX(initial.x); };
  const reset = () => { const initial = defaults[moduleId]; setPreset(initial.preset); setX(initial.x); };

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    let disposed = false; const generation = ++generationRef.current; const target = document.createElement("div"); target.id = `geogebra-simulation-${generation}`; root.replaceChildren(target); setStatus("Memuat applet GeoGebra…");
    const inject = async () => {
      try {
        await loadGeoGebra(); if (disposed || !window.GGBApplet) return;
        const width = Math.max(280, Math.floor(root.getBoundingClientRect().width || 560));
        const applet = new window.GGBApplet({ appName: "graphing", width, height: Math.max(360, Math.min(480, Math.round(width * 0.7))), showToolBar: false, showAlgebraInput: false, showMenuBar: false, showResetIcon: false, enableLabelDrags: false, enableShiftDragZoom: true, showFullscreenButton: true, language: "id", appletOnLoad: (api: GeoGebraApi) => { if (disposed || generation !== generationRef.current) { api.remove?.(); return; } apiRef.current = api; applyGraph(api, moduleId, x, preset); setStatus("Applet GeoGebra siap digunakan."); } }, true);
        applet.inject(target.id);
      } catch { if (!disposed) setStatus("Gagal memuat GeoGebra. Periksa koneksi internet, lalu muat ulang halaman."); }
    };
    void inject();
    return () => { disposed = true; apiRef.current?.remove?.(); apiRef.current = null; target.replaceChildren(); };
    // A module/preset replacement deliberately disposes all previous graph objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, preset]);
  useEffect(() => { if (apiRef.current) applyGraph(apiRef.current, moduleId, x, preset); }, [moduleId, preset, x]);
  useEffect(() => {
    const root = rootRef.current; if (!root || !window.ResizeObserver) return;
    const observer = new ResizeObserver(() => { const api = apiRef.current; if (!api?.setSize) return; const width = Math.max(280, Math.floor(root.getBoundingClientRect().width)); api.setSize(width, Math.max(360, Math.min(480, Math.round(width * 0.7)))); });
    observer.observe(root); return () => observer.disconnect();
  }, []);

  return <section className="simulation-lab" aria-label="GeoGebra Simulation Lab">
    <div className="simulation-lab-intro"><p className="simulation-kicker">Delapan modul interaktif</p><h2>Eksplorasi fungsi dengan GeoGebra</h2><p>Pilih satu modul, ubah kontrol yang relevan, lalu bandingkan hasil aljabar dengan grafik nyata.</p></div>
    <div className="simulation-module-tabs" role="tablist" aria-label="Modul simulasi">{modules.map((item) => <button key={item.id} type="button" role="tab" aria-selected={moduleId === item.id} className={moduleId === item.id ? "active" : ""} onClick={() => selectModule(item.id)}><small>{item.id}</small>{item.title}</button>)}</div>
    <div className="simulation-workspace"><aside className="algebra-card simulation-controls"><p className="simulation-kicker">{active.id}</p><h3>{active.title}</h3><p className="control-summary">{active.short}</p>
      <label className="field"><span>Preset aman</span><select value={preset} onChange={(event) => setPreset(event.target.value)}>{active.presets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label className="field"><span>{moduleId === "SIM-08" ? "Harga awal (Rp)" : moduleId === "SIM-05" ? "Nilai keluaran y" : "Nilai x"}</span><input type="range" min={slider.min} max={slider.max} step={slider.step} value={x} onChange={(event) => setX(Number(event.target.value))} /><output>{moduleId === "SIM-08" ? formatRupiah(x) : x}</output></label>
      {resultPanel(moduleId, x, preset)}<button type="button" className="btn-ghost" onClick={reset}>Atur ulang modul</button></aside>
      <div className="geogebra-wrap simulation-graph"><div ref={rootRef} className="geogebra-applet" aria-label={`Grafik GeoGebra ${active.title}`} /><p className="geogebra-status" role="status" aria-live="polite">{status}</p><div className="graph-guide"><p className="simulation-kicker">Pertanyaan refleksi</p><h3>{active.question}</h3><p><strong>Pembahasan:</strong> {active.discussion}</p></div></div>
    </div>
  </section>;
}

function applyGraph(api: GeoGebraApi, moduleId: SimulationModuleId, x: number, preset: string) {
  for (const command of graphCommands(moduleId, x, preset)) api.evalCommand(command);
  for (const name of ["f", "h", "k", "P", "A", "B", "C", "D", "E"]) api.setColor?.(name, 47, 93, 187);
  for (const name of ["g", "Q"]) api.setColor?.(name, 194, 78, 46);
  if (moduleId === "SIM-06") { api.setLineStyle?.("i", 1); api.setColor?.("i", 60, 82, 110); }
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
