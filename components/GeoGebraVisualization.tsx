"use client";

import { useEffect } from "react";

export function GeoGebraVisualization() {
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!(window as unknown as { GGBApplet?: unknown }).GGBApplet) {
        await new Promise<void>((resolve, reject) => { const s=document.createElement("script"); s.src="https://www.geogebra.org/apps/deployggb.js"; s.onload=()=>resolve(); s.onerror=()=>reject(); document.head.appendChild(s); });
      }
      if (cancelled) return;
      const browser = window as unknown as { initGeoGebraVisualization?: () => void; setMode?: (mode: string) => void };
      const initialize = () => {
        browser.initGeoGebraVisualization?.();
        document.getElementById("tab-komposisi")?.addEventListener("click", () => browser.setMode?.("komposisi"));
        document.getElementById("tab-invers")?.addEventListener("click", () => browser.setMode?.("invers"));
      };
      if (browser.initGeoGebraVisualization) initialize();
      else { const script = document.createElement("script"); script.src="/assets/js/geogebra-viz.js"; script.onload=initialize; document.body.appendChild(script); }
    }
    load().catch(() => { const el=document.getElementById("ggb-status"); if(el) el.textContent="Gagal memuat GeoGebra. Periksa koneksi internet Anda."; });
    return () => { cancelled = true; };
  }, []);
  return <div className="visualization-layout"><div className="algebra-card visualization-controls"><h4>Kontrol nilai</h4>{[["a",-3,3,1,2],["b",-5,5,1,1],["c",-4,4,1,-2],["t",-4,4,.5,2]].map(([name,min,max,step,value])=><div className="row" key={name}><span className="mono" style={{minWidth:70}}>{name} = <span id={`val-${name}`}>{value}</span></span><input type="range" id={`slider-${name}`} min={min} max={max} step={step} defaultValue={value}/></div>)}<div className="row"><span className="mono" id="formula-display">f(x)=2x+1, g(x)=x²−2</span></div><p id="inverse-warning" className="alert alert-danger" hidden>Fungsi konstan tidak mempunyai invers berupa fungsi.</p><button type="button" className="btn-ghost" id="reset-simulation">Atur ulang simulasi</button></div><div className="geogebra-wrap"><div id="ggb-applet-container"/><p id="ggb-status">Memuat applet GeoGebra…</p></div></div>;
}
