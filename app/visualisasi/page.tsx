import { GeoGebraVisualization } from "@/components/GeoGebraVisualization";

export default function VisualizationPage() {
  return <>
    <span className="eyebrow">Eksplorasi interaktif</span>
    <h1>GeoGebra Simulation Lab</h1>
    <p className="lede">Delapan simulasi mandiri untuk memetakan fungsi, menyusun komposisi, dan memahami invers. Lab ini tidak menyimpan nilai atau data belajar.</p>
    <GeoGebraVisualization />
  </>;
}
