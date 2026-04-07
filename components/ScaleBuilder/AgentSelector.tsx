"use client";

import React, { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Agent, AptitudeResult } from "@/types/agent";

interface AgentSelectorProps {
  agents: Agent[];
  getAptitude: (id: string) => AptitudeResult;
  onSelect: (agentId: string) => void;
  onClose: () => void;
}

export default function AgentSelector({
  agents,
  getAptitude,
  onSelect,
  onClose,
}: AgentSelectorProps) {
  const [filter, setFilter] = useState("");

  const filtered = agents
    .filter((a) => {
      const match = a.nome_guerra.toLowerCase().includes(filter.toLowerCase());
      return match;
    })
    .sort((a, b) => a.nome_guerra.localeCompare(b.nome_guerra));

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-4 bg-[#1a1f26] border border-white/10 rounded-[24px] shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl mb-4">
        <Search size={14} className="text-[#7c3aed]" />
        <input
          autoFocus
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="PESQUISAR POLICIAL..."
          className="bg-transparent border-none text-[10px] font-black text-white outline-none w-full placeholder:text-white/10 uppercase tracking-widest"
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar pr-2">
        {filtered.map((ag) => {
          const aptitude = getAptitude(ag.id);
          const isError = aptitude.severity === "error";

          return (
            <button
              key={ag.id}
              disabled={isError}
              onClick={() => onSelect(ag.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                isError
                  ? "opacity-20 cursor-not-allowed bg-rose-500/5"
                  : "hover:bg-white/5 group"
              }`}
            >
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-black uppercase text-white group-hover:text-[#7c3aed] transition-colors truncate">
                  {ag.nome_guerra.replace(/^(SI|GD|GM|GC|CD|IR|Insp|SubInsp)\s+/i, '').trim()}
                </span>
                <span className="text-[9px] font-bold text-white/30 uppercase truncate">
                  Mat. {ag.matricula}
                </span>
              </div>
              
              {aptitude.label && (
                <span className={`text-[8px] font-black uppercase tracking-tighter ${
                  aptitude.severity === 'warning' ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {aptitude.label}
                </span>
              )}
            </button>
          );
        })}
        
        {filtered.length === 0 && (
          <div className="py-8 text-center opacity-20 italic text-[10px]">
            Nenhum resultado encontrado
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
        <button 
          onClick={onClose}
          className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
