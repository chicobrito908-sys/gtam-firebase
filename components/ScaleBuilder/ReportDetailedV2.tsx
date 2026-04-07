"use client";

import React from "react";
import { Shield, Zap, Clock, Share2, PlusCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReportProps {
  scale: any | null;
  ausencias: any[];
  onOpenBuilder: () => void;
  onRemoveAusencia: (id: string) => void;
  getAgent: (id: string) => any;
}

const cleanName = (name: string) => {
  if (!name) return "---";
  // Remove prefixos comuns de rank no GMF (SI, GD, GM, GC, CD, IR, Insp, etc.) seguidos de espaço
  return name.replace(/^(SI|GD|GM|GC|CD|IR|Insp|SubInsp)\s+/i, '').trim();
};

const CardVTR = ({ id, members, getAgent }: any) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-primary/40 transition-all group">
    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
      <div className="p-1.5 bg-primary/20 rounded-lg text-primary"><Shield size={12} /></div>
      <span className="text-[10px] font-black uppercase text-white tracking-tighter">{id}</span>
    </div>
    <div className="space-y-2">
      {members.map((m: any, i: number) => {
        const ag = getAgent(m.agentId);
        return (
          <div key={i} className="flex flex-col border-l border-primary/20 pl-2">
            <span className="text-[11px] font-black text-white/90 uppercase">{cleanName(ag?.nome_guerra)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function ReportDetailedV2({ scale, ausencias, onOpenBuilder, onRemoveAusencia, getAgent }: ReportProps) {
  const agentes = scale?.agentes || [];
  const dayAus = ausencias.filter(a => a.data === scale?.data);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[ { id: "SUPERVISÃO", color: "purple" }, { id: "ARMARIA", color: "amber" } ].map(cmd => {
          const s = agentes.find((a: any) => a.equipe === cmd.id);
          const rawName = s?.efetivo?.nome_guerra || "NÃO ESCALADO";
          return (
            <div key={cmd.id} className={`bg-${cmd.color}-600/10 border border-${cmd.color}-500/20 p-5 rounded-[1.5rem] flex items-center justify-between`}>
              <div className="flex flex-col"><span className={`text-[9px] font-black uppercase tracking-widest text-${cmd.color}-400 mb-1`}>{cmd.id}</span>
              <span className="text-lg font-black text-white uppercase">{cleanName(rawName)}</span></div>
              <div className={`p-3 bg-${cmd.color}-500/20 rounded-xl text-${cmd.color}-400`}><Zap size={18} /></div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3"><Clock size={16} className="text-primary" /><h4 className="text-xs font-black text-white uppercase tracking-tighter">Turno Operacional</h4></div>
          <button onClick={onOpenBuilder} className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline"><PlusCircle size={10} /> Gerenciar</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {["BI", "BII"].map(sub => agentes.filter((a:any) => a.funcao === sub).map((a:any, i:number) => (
            <CardVTR key={`${sub}-${i}`} id={a.equipe} members={agentes.filter((x:any) => x.equipe === a.equipe)} getAgent={getAgent} />
          )))}
        </div>
      </div>

      {dayAus.length > 0 && (
        <div className="bg-rose-600/5 border border-rose-500/10 p-5 rounded-[1.5rem] space-y-4">
          <h5 className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2"><Shield size={12} /> Afastamentos / Folgas</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dayAus.map((a, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase">{cleanName(a.efetivo?.nome_guerra)}</span>
                  <span className={`text-[8px] font-bold ${a.tipo === 'folga' ? 'text-emerald-400' : 'text-rose-400'} uppercase`}>{a.tipo}</span>
                </div>
                <button onClick={() => onRemoveAusencia(a.id)} className="p-1 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
