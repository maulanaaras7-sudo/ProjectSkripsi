import { GeoGebraVisualization } from "@/components/GeoGebraVisualization";
import { MathText } from "@/components/MathText";

export default function VisualizationPage() {
  return <>
    <span className="eyebrow">Eksplorasi interaktif</span>
    <h1>Simulasi Komposisi &amp; Invers Fungsi</h1>
    <p className="lede">Geser nilai a, b, c, dan t untuk melihat perubahan grafik secara langsung.</p>
    <div className="tabs"><button type="button" className="tab-btn active" id="tab-komposisi">Komposisi <MathText>{"\\(f\\circ g\\)"}</MathText></button><button type="button" className="tab-btn" id="tab-invers">Invers <MathText>{"\\(f^{-1}\\)"}</MathText></button></div>
    <GeoGebraVisualization />
  </>;
}
