"use client";

import React from "react";
import { Agent, AptitudeResult } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  aptitude: AptitudeResult;
  isScaled: boolean;
  onSelect: (id: string) => void;
}

export default function AgentCard({ agent, aptitude, isScaled, onSelect }: AgentCardProps) {
  const isError = aptitude.severity === "error";

  return (
    <button
      disabled={isError}
      onClick={() => onSelect(agent.id)}
      className={`w-full flex items-center justify-between p-3 rounded-[16px] transition-all
        ${isError ? "opacity-30 cursor-not-allowed bg-rose-500/5 border border-rose-500/10" :
          isScaled ? "opacity-60 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10" :
          "hover:bg-[#7c3aed]/10 border border-transparent hover:border-[#7c3aed]/20"
        }
      `}
    >
      <div className="flex flex-col text-left">
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
          {isScaled && !isError && (
            <span className="text-[7px] font-bold bg-amber-500/20 text-amber-500/80 px-1.5 py-0.5 rounded uppercase">
              EM ESCALA
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
