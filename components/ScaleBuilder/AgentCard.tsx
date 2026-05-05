"use client";

import React from "react";
import { X } from "lucide-react";
import { Agent, AptitudeResult } from "@/types/agent";

interface AgentCardProps {
  agent?: Agent; // Allow undefined to fix TS error in VtrCard
  aptitude: AptitudeResult;
  isScaled?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: () => void;
}

export default function AgentCard({ agent, aptitude, isScaled, onSelect, onRemove }: AgentCardProps) {
  const isError = aptitude.severity === "error";

  if (!agent) {
    return <div className="p-3 bg-white/5 border border-white/10 rounded-[16px] text-[11px] font-black uppercase text-white/30 text-center">AGENTE NÃO ENCONTRADO</div>;
  }

  return (
    <div className={`relative group w-full flex items-center justify-between p-3 rounded-[16px] transition-all
        ${isError ? "opacity-30 cursor-not-allowed bg-rose-500/5 border border-rose-500/10" :
          isScaled ? "opacity-60 bg-amber-500/5 border border-amber-500/10" :
          "hover:bg-[#7c3aed]/10 border border-transparent hover:border-[#7c3aed]/20"
        }
      `}
    >
      <button
        disabled={isError || !onSelect}
        onClick={() => onSelect && onSelect(agent.id)}
        className="flex-1 flex flex-col text-left outline-none"
      >
        <span className={`text-[11px] font-black uppercase ${isError ? 'text-rose-400' : 'text-white'}`}>
          {agent.nome_guerra || agent.nome_completo || "SEM NOME"}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[8px] font-black uppercase tracking-widest ${isError ? 'text-rose-500' : 'text-white/30'}`}>
            MAT: {agent.matricula || "—"}
          </span>
          {isError && (
             <span className="text-[7px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded uppercase">
               {aptitude.label || "IMPEDIDO"}
             </span>
          )}
          {!isError && aptitude.severity === 'info' && aptitude.label && (
            <span className="text-[7px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase">
              {aptitude.label}
            </span>
          )}
          {aptitude.severity === 'warning' && (
             <span className="text-[7px] font-bold bg-amber-500/20 text-amber-500/80 px-1.5 py-0.5 rounded uppercase">
               [ M.P. - SAI ÀS 18H ]
             </span>
          )}
          {isScaled && !isError && aptitude.severity !== 'warning' && (
             <span className="text-[7px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
               EM ESCALA
             </span>
          )}
        </div>
      </button>

      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
