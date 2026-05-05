"use client";

import React, { useState } from "react";
import CalendarCompactV2 from "./CalendarCompactV2";
import ReportDetailedV2 from "./ReportDetailedV2";
import { Share2, LayoutDashboard, CalendarDays, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { getAgentAptitude } from "@/lib/services/aptitudeService";

import { type Agent, type Afastamento, type Ferias } from "../AgentTable/AgentRow";
import { type DayScale } from "./ReportDetailedV2";

interface DashboardProps {
  s: {
    escalas: DayScale[];
    selectedDay: string;
    afastamentos: Afastamento[];
    ferias: Ferias[];
    efetivo: Agent[];
    setView: (view: string) => void;
    removeAusencia: (id: string) => void;
    currentDate: Date;
    setSelectedDay: (day: string) => void;
    changeMonth: (offset: number) => void;
    ausencias: { id: string; efetivo?: { nome_guerra: string }; tipo: string }[];
  };
  handleShare: () => void;
}

export default function ScaleDashboardV2({ s, handleShare }: DashboardProps) {
  const [tab, setTab] = useState<'HOJE' | 'CALENDÁRIO'>('HOJE');
  const d = s.escalas.filter((sc: DayScale) => sc.data === s.selectedDay);
  const titleDate = new Date(s.selectedDay + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  // HUD Analytics — SSOT: afastamentos e férias do módulo Efetivo cruzados com selectedDay
  const afastamentos = s.afastamentos || [];
  const ferias = s.ferias || [];
  let disponiveis = 0;
  let restricoes = 0;
  
  s.efetivo.forEach((agent: Agent) => {
    const apt = getAgentAptitude(agent.id, s.selectedDay, afastamentos, ferias);
    if (apt.isFit && apt.severity === 'none') disponiveis++;
  });
  const totalEfetivo = s.efetivo.length;
  restricoes = totalEfetivo - disponiveis;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 text-primary shadow-xl shadow-primary/20"><CalendarDays size={24} /></div>
          <div><h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Gestão Escalas</h1><p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em]">{titleDate}</p></div>
        </div>
        
        {/* HUD Analytics */}
        <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1"><Users size={10} /> Total</span>
            <span className="text-lg font-black text-white">{totalEfetivo}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Disponíveis</span>
            <span className="text-lg font-black text-emerald-400">{disponiveis}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Em Restrição</span>
            <span className="text-lg font-black text-amber-400">{restricoes}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => s.setView('builder')} variant="ghost" className="rounded-xl px-4 h-11 border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase"><LayoutDashboard size={14} className="mr-2" /> Montar</Button>
          <Button onClick={handleShare} variant="success" className="rounded-xl px-4 h-11 shadow-lg shadow-emerald-500/10 text-[10px] font-black uppercase"><Share2 size={14} className="mr-2" /> Share</Button>
        </div>
      </header>

      {/* MOBILE TABS */}
      <div className="flex lg:hidden bg-white/5 p-1 rounded-2xl border border-white/5">
        {(['HOJE', 'CALENDÁRIO'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 space-y-8 ${tab === 'HOJE' ? 'block' : 'hidden lg:block'}`}>
           <ReportDetailedV2 dayScales={d} ausencias={s.ausencias} onOpenBuilder={() => s.setView('builder')} onRemoveAusencia={s.removeAusencia} getAgent={(id: string) => s.efetivo.find((a: Agent) => a.id === id)} />
        </div>
        <div className={`lg:col-span-4 ${tab === 'CALENDÁRIO' ? 'block' : 'hidden lg:block'}`}>
           <CalendarCompactV2 currentDate={s.currentDate} selectedDay={s.selectedDay} setSelectedDay={s.setSelectedDay} changeMonth={s.changeMonth} escalas={s.escalas} ausencias={s.ausencias} />
        </div>
      </div>
    </div>
  );
}
