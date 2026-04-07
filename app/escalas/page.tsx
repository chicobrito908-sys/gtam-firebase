"use client";

import { useState } from "react";
import { CalendarDays, LayoutDashboard, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DailyScaleBuilder from "@/components/DailyScaleBuilder";
import ScaleCalendar from "@/components/ScaleBuilder/ScaleCalendar";
import ScaleReport from "@/components/ScaleBuilder/ScaleReport";
import OperationalInsights from "@/components/ScaleBuilder/OperationalInsights";
import QuickAbsenceModal from "@/components/ScaleBuilder/QuickAbsenceModal";
import { useEscalasData, todayStrFromDate } from "@/hooks/useEscalasData";
import { generateWhatsAppText } from "@/lib/services/scaleService";
import Button from "@/components/ui/Button";

export default function EscalasPage() {
  const s = useEscalasData();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const titleDate = new Date(s.selectedDay + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
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

  if (s.view === 'builder') return <DailyScaleBuilder />;

  return (
    <main className="min-h-screen bg-[#0d1117] p-4 md:p-8 text-white relative overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/20 rounded-[2rem] border border-primary/20 shadow-2xl shadow-primary/10 transition-transform hover:scale-110"><CalendarDays className="text-primary" size={32} /></div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Gestão de Escalas</h1>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] mt-1">{titleDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => s.setView('builder')} variant="ghost" className="rounded-2xl px-6 h-14 border border-white/10 hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"><LayoutDashboard size={18} className="mr-3" /> Montar Escala</Button>
            <Button onClick={handleShare} variant="success" className="rounded-2xl px-6 h-14 shadow-lg shadow-emerald-500/10 text-sm font-black uppercase tracking-widest"><Share2 size={18} className="mr-3" /> Compartilhar</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-12">
            <ScaleCalendar 
              currentDate={s.currentDate} selectedDay={s.selectedDay} setSelectedDay={s.setSelectedDay} 
              changeMonth={s.changeMonth} escalas={s.escalas} ausencias={s.ausencias} 
              onDoubleClickHandler={(day) => s.setAddingAusencia(day)}
            />
            <AnimatePresence mode="wait">
              <motion.div key={s.selectedDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
                <ScaleReport 
                   scaleData={currentScale} 
                   ausencias={s.ausencias} 
                   selectedDay={s.selectedDay} 
                   onRemoveAusencia={s.removeAusencia} 
                   onOpenBuilder={() => s.setView('builder')}
                   getAgentById={(id: string) => s.efetivo.find(a => a.id === id)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="xl:col-span-4"><OperationalInsights missoes={s.missoes} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} /></div>
        </div>
      </div>

      <QuickAbsenceModal 
        isOpen={!!s.addingAusencia} onClose={() => s.setAddingAusencia(null)} 
        date={s.addingAusencia} efetivo={s.efetivo} onSave={s.handleAddAusencia} 
      />
    </main>
  );
}
