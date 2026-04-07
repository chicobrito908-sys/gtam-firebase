"use client";

import { useEscalasData } from "@/hooks/useEscalasData";
import ScaleDashboardV2 from "@/components/ScaleBuilder/ScaleDashboardV2";
import QuickAbsenceModal from "@/components/ScaleBuilder/QuickAbsenceModal";
import OperationalInsights from "@/components/ScaleBuilder/OperationalInsights";
import { useState } from "react";

export default function SandboxPage() {
  const s = useEscalasData();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleShare = () => {
    alert("Share logic connected in Sandbox");
  };

  if (s.loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d1117] p-4 md:p-8 text-white relative font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.5); }
      `}</style>

      <ScaleDashboardV2 s={s} handleShare={handleShare} />
      
      <div className="max-w-[1400px] mx-auto mt-12 mb-20">
        <OperationalInsights missoes={s.missoes} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} />
      </div>

      {/* Test Controls */}
      <div className="fixed bottom-6 right-6 z-[110]">
        <button 
          onClick={() => s.setAddingAusencia(s.selectedDay)}
          className="bg-primary/20 hover:bg-primary/40 border border-primary/40 p-4 rounded-full shadow-2xl backdrop-blur-md transition-all group"
          title="Forçar Modal de Ausência"
        >
          <UserPlus size={24} className="text-primary group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <QuickAbsenceModal 
        isOpen={!!s.addingAusencia} onClose={() => s.setAddingAusencia(null)} 
        date={s.addingAusencia} efetivo={s.efetivo} onSave={s.handleAddAusencia} 
      />
    </main>
  );
}

import { UserPlus } from "lucide-react";

