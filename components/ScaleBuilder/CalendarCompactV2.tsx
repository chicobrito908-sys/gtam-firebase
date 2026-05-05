"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Minimize2, Maximize2 } from "lucide-react";
import { todayStrFromDate } from "@/hooks/useEscalasData";
import { motion, AnimatePresence } from "framer-motion";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

import { type DayScale } from "./ReportDetailedV2";

interface CalendarProps {
  currentDate: Date;
  selectedDay: string;
  setSelectedDay: (date: string) => void;
  changeMonth: (offset: number) => void;
  escalas: DayScale[];
  ausencias: { data: string; tipo: string }[];
}

export default function CalendarCompactV2({ currentDate, selectedDay, setSelectedDay, changeMonth, escalas, ausencias }: CalendarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <section className="bg-[#161b22]/60 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-6 group">
        <h3 className="text-sm font-black text-white/40 uppercase tracking-widest italic">Calendário Operacional</h3>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/5 rounded-xl text-primary/40 transition-all">
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-xl text-primary transition-all"><ChevronLeft size={18} /></button>
          <span className="text-[10px] font-black uppercase text-white px-4 tracking-tighter">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-xl text-primary transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {WEEK_DAYS.map(d => <div key={d} className="text-center py-1 text-[8px] font-black uppercase text-white/20">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
                const dateStr = todayStrFromDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                const isSel = dateStr === selectedDay;
                const hasE = escalas.some(e => e.data === dateStr);
                const a = ausencias.filter(au => au.data === dateStr);
                return (
                  <button key={dateStr} onClick={() => setSelectedDay(dateStr)} className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all relative ${isSel ? 'bg-primary border-primary shadow-[0_0_20px_rgba(124,58,237,0.4)]' : 'bg-white/[0.02] border-white/5 hover:border-primary/40'}`}>
                    <span className={`text-xs md:text-sm font-black ${isSel ? 'text-white' : 'text-white/60'}`}>{day}</span>
                    {!isSel && (
                      <div className="flex gap-0.5 mt-0.5">
                        {a.some(x => x.tipo === 'FOLGA') && <div className="w-1 h-1 bg-emerald-500 rounded-full" />}
                        {a.some(x => x.tipo === 'ATESTADO') && <div className="w-1 h-1 bg-rose-500 rounded-full" />}
                        {hasE && <div className="w-1 h-1 bg-primary/40 rounded-full" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
