"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayStrFromDate } from "@/hooks/useEscalasData";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

import { type DayScale } from "./ReportDetailedV2";

interface ScaleCalendarProps {
  currentDate: Date;
  selectedDay: string;
  setSelectedDay: (date: string) => void;
  onDoubleClickHandler: (date: string) => void;
  changeMonth: (offset: number) => void;
  escalas: DayScale[];
  ausencias: { data: string; tipo: string }[];
}

export default function ScaleCalendar({
  currentDate,
  selectedDay,
  setSelectedDay,
  onDoubleClickHandler,
  changeMonth,
  escalas,
  ausencias
}: ScaleCalendarProps) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <section className="bg-card/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Calendário Mensal</h3>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground transition-all"><ChevronLeft size={20} /></button>
          <span className="text-xs font-black uppercase text-white min-w-[150px] text-center">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground transition-all"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {WEEK_DAYS.map(day => (<div key={day} className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{day}</div>))}
        {calendarCells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
          const dateStr = todayStrFromDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          const isSelected = dateStr === selectedDay;
          const hasData = escalas.some(e => e.data === dateStr);
          const dayAusencias = ausencias.filter(a => a.data === dateStr);

          return (
            <div key={dateStr} className="relative group/cell">
              <button 
                onClick={() => setSelectedDay(dateStr)} 
                onDoubleClick={() => onDoubleClickHandler(dateStr)}
                className={`w-full aspect-square rounded-2xl transition-all relative flex flex-col items-center justify-center border ${isSelected ? 'bg-primary border-primary shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
              >
                <span className={`text-base md:text-xl font-black ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{String(day).padStart(2, '0')}</span>
                <div className="flex gap-1 mt-1">
                  {dayAusencias.some(a => a.tipo === 'FOLGA') && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  {dayAusencias.some(a => a.tipo === 'LICENCA') && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                  {dayAusencias.some(a => a.tipo === 'ATESTADO') && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                </div>
                {hasData && !isSelected && (<div className="absolute bottom-2 w-1 h-1 bg-primary/40 rounded-full" />)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
