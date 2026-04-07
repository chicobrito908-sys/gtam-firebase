"use client";

import React from "react";
import { Shield, Zap, LayoutDashboard, Trash2, Clock, UserPlus } from "lucide-react";

interface ScaleReportProps {
  scaleData: any | null;
  ausencias: any[];
  selectedDay: string;
  onRemoveAusencia: (id: string) => void;
  onOpenBuilder: () => void;
  getAgentById: (id: string) => any;
}

const VTRCard = ({ equipe, members, getAgentById }: { equipe: string; members: any[]; getAgentById: (id: string) => any }) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 hover:border-primary/40 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/20 rounded-xl text-primary"><Shield size={14} /></div>
        <span className="text-sm font-black text-white uppercase tracking-tighter">{equipe}</span>
      </div>
      <span className="text-[10px] font-black text-primary/40">{members.length} PX</span>
    </div>
    <div className="space-y-2">
      {members.map((m, idx) => {
        const ag = getAgentById(m.agentId);
        return (
          <div key={idx} className="flex flex-col border-l-2 border-white/5 pl-3">
            <span className="text-[11px] font-black text-white/90 uppercase">{ag?.nome_guerra || "---"}</span>
            <span className="text-[9px] font-bold text-white/30 uppercase">{ag?.posto_grad || "---"}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function ScaleReport({ scaleData, ausencias, selectedDay, onRemoveAusencia, onOpenBuilder, getAgentById }: ScaleReportProps) {
  const agentes = scaleData?.agentes || [];
  const vtrsMap = scaleData?.vtrsMap || {};

  const supervisao = agentes.find((e: any) => e.equipe === "SUPERVISÃO");
  const armaria = agentes.find((e: any) => e.equipe === "ARMARIA");
  
  const getSubTurnoAgentes = (subId: string) => agentes.filter((a: any) => a.funcao === subId && a.equipe !== "SUPERVISÃO" && a.equipe !== "ARMARIA");

  const vtrsBI = getSubTurnoAgentes("BI");
  const vtrsBII = getSubTurnoAgentes("BII");
  const guarnicaoApoio = agentes.filter((e: any) => e.funcao === "TITULAR" && !["SUPERVISÃO", "ARMARIA", "GUARNIÇÃO"].includes(e.equipe || ""));
  const guarnicaoBase = agentes.filter((e: any) => e.equipe === "GUARNIÇÃO");

  const renderVtrCards = (subAgentes: any[], subId: string) => {
    const subVtrs = vtrsMap[subId] || [];
    return subVtrs.map((v: any, idx: number) => (
      <VTRCard key={idx} equipe={v.id} members={subAgentes.filter(a => a.equipe === v.id)} getAgentById={getAgentById} />
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* COLUNA COMANDO */}
      <div className="space-y-6">
        <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-[2rem] space-y-2">
          <div className="flex items-center gap-2 text-purple-400 mb-2"><LayoutDashboard size={14} /><span className="text-[10px] font-black uppercase tracking-widest">SUPERVISÃO</span></div>
          {supervisao ? <><span className="text-xl font-black text-white uppercase">{supervisao.efetivo?.nome_guerra}</span><span className="block text-xs font-bold text-purple-400/60 uppercase">{supervisao.efetivo?.posto_grad}</span></> : <span className="text-xs font-bold text-white/10 uppercase italic">Não Escalado</span>}
        </div>
        <div className="bg-amber-600/10 border border-amber-500/20 p-6 rounded-[2rem] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 mb-2"><Zap size={14} /><span className="text-[10px] font-black uppercase tracking-widest">ARMARIA</span></div>
          {armaria ? <><span className="text-xl font-black text-white uppercase">{armaria.efetivo?.nome_guerra}</span><span className="block text-xs font-bold text-amber-400/60 uppercase">{armaria.efetivo?.posto_grad}</span></> : <span className="text-xs font-bold text-white/10 uppercase italic">Não Escalado</span>}
        </div>
        <div className="bg-rose-600/5 border border-rose-500/10 p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-2 text-rose-400"><Shield size={14} /><span className="text-[10px] font-black uppercase tracking-widest">AFASTAMENTOS</span></div>
          <div className="space-y-2">
            {ausencias.filter(a => a.data === selectedDay).map((a, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                <div className="flex flex-col"><span className="text-xs font-black text-white uppercase">{a.efetivo?.nome_guerra}</span><span className={`text-[8px] font-bold uppercase ${a.tipo === 'ATESTADO' ? 'text-rose-500' : 'text-emerald-500'}`}>{a.tipo}</span></div>
                <button onClick={() => onRemoveAusencia(a.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COLUNA RONDAS */}
      <div className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><Clock size={16} className="text-primary" /><h2 className="text-sm font-black text-white uppercase tracking-tighter italic">Turno I (06-14h)</h2></div>
          <div className="grid grid-cols-1 gap-6">{renderVtrCards(vtrsBI, "BI")}</div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4"><Clock size={16} className="text-blue-500" /><h2 className="text-sm font-black text-white uppercase tracking-tighter italic">Turno II (15-23h)</h2></div>
          <div className="grid grid-cols-1 gap-6">{renderVtrCards(vtrsBII, "BII")}</div>
        </div>
      </div>

      {/* COLUNA APOIO */}
      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-2 text-blue-400 mb-4"><UserPlus size={16} /><span className="text-[10px] font-black uppercase tracking-widest">GUARNIÇÃO APOIO</span></div>
        <div className="space-y-4">
          {guarnicaoBase.map((m: any, idx: number) => {
            const ag = getAgentById(m.agentId);
            return (
              <div key={idx} className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/20"><span className="text-xs font-black text-white uppercase">{ag?.nome_guerra || "---"}</span><span className="text-[9px] font-bold text-primary/50 uppercase">Base 24h</span></div>
            );
          })}
          {guarnicaoApoio.map((m: any, idx: number) => {
            const ag = getAgentById(m.agentId);
            return (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col"><span className="text-xs font-black text-white uppercase">{ag?.nome_guerra || "---"}</span><span className="text-[8px] font-black text-blue-400/40 uppercase tracking-tighter">{m.equipe}</span></div>
                <span className="text-[9px] font-bold text-blue-400/50 uppercase">{ag?.posto_grad || "---"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
