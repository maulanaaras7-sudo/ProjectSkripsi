import { GeoGebraVisualization } from "@/components/GeoGebraVisualization";

export default function VisualizationPage() {
  return <><span className="eyebrow">Eksplorasi interaktif</span><h1>Simulasi Komposisi & Invers Fungsi</h1><p className="lede">Geser nilai a, b, c, dan t untuk melihat perubahan grafik secara langsung.</p><div className="tabs"><button type="button" className="tab-btn active" id="tab-komposisi">Komposisi (f∘g)</button><button type="button" className="tab-btn" id="tab-invers">Invers (f⁻¹)</button></div><GeoGebraVisualization /></>;
}
