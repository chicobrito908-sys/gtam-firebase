"use client";

import React, { useState } from "react";
import CalendarCompactV2 from "./CalendarCompactV2";
import ReportDetailedV2 from "./ReportDetailedV2";
import { Share2, LayoutDashboard, CalendarDays } from "lucide-react";
import Button from "@/components/ui/Button";

interface DashboardProps {
  s: any; // Hook useEscalasData
  handleShare: () => void;
}

export default function ScaleDashboardV2({ s, handleShare }: DashboardProps) {
  const [tab, setTab] = useState<'HOJE' | 'CALENDÁRIO'>('HOJE');
  const d = s.escalas.find((sc: any) => sc.data === s.selectedDay);
  const titleDate = new Date(s.selectedDay + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 text-primary shadow-xl shadow-primary/20"><CalendarDays size={24} /></div>
          <div><h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Gestão Escalas</h1><p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em]">{titleDate}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => s.setView('builder')} variant="ghost" className="rounded-xl px-4 h-11 border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase"><LayoutDashboard size={14} className="mr-2" /> Montar</Button>
          <Button onClick={handleShare} variant="success" className="rounded-xl px-4 h-11 shadow-lg shadow-emerald-500/10 text-[10px] font-black uppercase"><Share2 size={14} className="mr-2" /> Share</Button>
        </div>
      </header>

      {/* MOBILE TABS */}
      <div className="flex lg:hidden bg-white/5 p-1 rounded-2xl border border-white/5">
        {['HOJE', 'CALENDÁRIO'].map((t: any) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 space-y-8 ${tab === 'HOJE' ? 'block' : 'hidden lg:block'}`}>
           <ReportDetailedV2 scale={d} ausencias={s.ausencias} onOpenBuilder={() => s.setView('builder')} onRemoveAusencia={s.removeAusencia} getAgent={(id: string) => s.efetivo.find((a:any) => a.id === id)} />
        </div>
        <div className={`lg:col-span-4 ${tab === 'CALENDÁRIO' ? 'block' : 'hidden lg:block'}`}>
           <CalendarCompactV2 currentDate={s.currentDate} selectedDay={s.selectedDay} setSelectedDay={s.setSelectedDay} changeMonth={s.changeMonth} escalas={s.escalas} ausencias={s.ausencias} />
        </div>
      </div>
    </div>
  );
}
