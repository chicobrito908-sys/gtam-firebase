"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Agent, AptitudeResult } from "@/types/agent";
import AgentCard from "./AgentCard";

interface Props {
  agents: Agent[];
  getAptitude: (id: string) => AptitudeResult;
  onSelect: (agentId: string) => void;
  onClose: () => void;
  selectedAgentIds?: string[];
  alreadyInOtherTurnoIds?: string[];
}

export default function AgentSelector({
  agents, getAptitude, onSelect, onClose,
  selectedAgentIds = [], alreadyInOtherTurnoIds = [],
}: Props) {
  const [filter, setFilter] = useState("");

  const filtered = agents
    .filter((a) =>
      a.nome_completo?.toLowerCase().includes(filter.toLowerCase()) ||
      a.matricula?.includes(filter) ||
      a.nome_guerra?.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aptA = getAptitude(a.id).severity === 'error' ? 2 : 0;
      const aptB = getAptitude(b.id).severity === 'error' ? 2 : 0;
      const scaledA = (selectedAgentIds.includes(a.id) || alreadyInOtherTurnoIds.includes(a.id)) ? 1 : 0;
      const scaledB = (selectedAgentIds.includes(b.id) || alreadyInOtherTurnoIds.includes(b.id)) ? 1 : 0;
      if ((aptA + scaledA) !== (aptB + scaledB)) return (aptA + scaledA) - (aptB + scaledB);
      return (a.antiguidade ?? 9999) - (b.antiguidade ?? 9999);
    });

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-4 bg-[#1a1f26] border border-white/10 rounded-[24px] shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl mb-4">
        <Search size={14} className="text-[#7c3aed]" />
        <input
          autoFocus value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="PESQUISAR POLICIAL..."
          className="bg-transparent border-none text-[10px] font-black text-white outline-none w-full placeholder:text-white/10 uppercase tracking-widest"
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar pr-2">
        {filtered.map((ag) => (
          <AgentCard
            key={ag.id} agent={ag} 
            aptitude={getAptitude(ag.id)}
            isScaled={selectedAgentIds.includes(ag.id) || alreadyInOtherTurnoIds.includes(ag.id)}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && <div className="py-8 text-center opacity-20 italic text-[10px]">Nenhum resultado encontrado</div>}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
        <button onClick={onClose} className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}
