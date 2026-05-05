"use client";

import React from "react";
import { Shield, Zap, Star, LayoutDashboard } from "lucide-react";

interface OperationalInsightsProps {
  missoes: { tipo: string; descricao: string }[];
  expandedIndex: number | null;
  setExpandedIndex: (idx: number | null) => void;
}

export default function OperationalInsights({ missoes, expandedIndex, setExpandedIndex }: OperationalInsightsProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
        <Shield className="text-emerald-500" size={20} />
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Informações</h3>
          <p className="text-[9px] font-bold text-white/20 uppercase">Inteligência Operacional</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {missoes.length > 0 ? missoes.map((m, idx) => {
          const isExpanded = expandedIndex === idx;
          const label = m.tipo === 'ALERTA' ? '⚠️ OBS' : '🏙 ÁREA';
          return (
            <div 
              key={idx} 
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${m.tipo === 'ALERTA' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/5'} flex gap-4 group shadow-sm hover:shadow-md animate-in fade-in duration-300`} 
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="mt-1">
                {m.tipo === 'ALERTA' ? <Zap size={16} className="text-amber-500" /> : <Star size={16} className="text-emerald-500" />}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className={`text-[9px] font-black uppercase tracking-widest ${m.tipo === 'ALERTA' ? 'text-amber-500' : 'text-emerald-500'}`}>{label}</span>
                <p className={`text-xs font-bold text-white/80 leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {m.descricao}
                </p>
                {!isExpanded && m.descricao.length > 60 && (
                  <span className="text-[8px] font-bold text-white/20 uppercase mt-1 group-hover:text-primary transition-colors">Ver tudo...</span>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
            <LayoutDashboard size={40} className="text-white" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma missão<br/>atribuída hoje</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase">
          <span>QAP Total</span>
          <span className="text-emerald-500/40">GTAM-BOARD v2</span>
        </div>
      </div>
    </div>
  );
}
