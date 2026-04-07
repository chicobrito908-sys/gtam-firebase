"use client";

import ScaleDashboardV2 from "@/components/ScaleBuilder/ScaleDashboardV2";
import QuickAbsenceModal from "@/components/ScaleBuilder/QuickAbsenceModal";
import { useEscalasData } from "@/hooks/useEscalasData";
import { generateWhatsAppText } from "@/lib/services/scaleService";
import DailyScaleBuilder from "@/components/DailyScaleBuilder";

export default function EscalasPage() {
  const s = useEscalasData();
  const currentScale = s.escalas.find(sc => sc.data === s.selectedDay);

  const handleShare = () => {
    if (!currentScale) return alert("Nenhuma escala encontrada para este dia.");
    const text = generateWhatsAppText(
      s.selectedDay,
      currentScale.turno || "DIÁRIO",
      currentScale.agentes || [],
      currentScale.missoes || [],
      s.ausencias.filter(a => a.data === s.selectedDay),
      currentScale.vtrsMap || { BI: [], BII: [], TITULAR: [] },
      (id: string) => s.efetivo.find(a => a.id === id)
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (s.view === 'builder') return <DailyScaleBuilder initialDate={s.selectedDay} />;

  return (
    <main className="min-h-screen bg-[#0d1117] p-4 lg:p-8 text-white relative">
      <ScaleDashboardV2 s={s} handleShare={handleShare} />

      <QuickAbsenceModal 
        isOpen={!!s.addingAusencia} 
        onClose={() => s.setAddingAusencia(null)} 
        date={s.addingAusencia} 
        efetivo={s.efetivo} 
        onSave={(id, tipo) => {
          s.handleAddAusencia(id, tipo);
          s.setAddingAusencia(null);
        }} 
      />
    </main>
  );
}
