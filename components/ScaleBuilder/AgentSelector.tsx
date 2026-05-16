"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, Users } from "lucide-react";
import { Agent, AptitudeResult } from "@/types/agent";
import AgentCard from "./AgentCard";

interface Props {
  agents: Agent[];
  currentScaleTurn?: string;
  getAptitude: (id: string) => AptitudeResult;
  onSelect: (agentId: string) => void;
  onClose: () => void;
  selectedAgentIds?: string[];
  alreadyInOtherTurnoIds?: string[];
}

export default function AgentSelector({
  agents, currentScaleTurn, getAptitude, onSelect, onClose,
  selectedAgentIds = [], alreadyInOtherTurnoIds = [],
}: Props) {
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = agents
    .filter((a) => {
      // 1. Filtro de Texto (Busca)
      const matchesSearch = 
        a.nome_completo?.toLowerCase().includes(filter.toLowerCase()) ||
        a.matricula?.includes(filter) ||
        a.nome_guerra?.toLowerCase().includes(filter.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Filtro de Emergência (Botão Show All)
      if (showAll) return true;

      // 3. Lógica de Turno A / B / 24h
      const is24h = a.tipo_escala === "24x72";
      
      // Normalização simples para garantir compatibilidade
      const turno = (a.grupo_turno || "").toUpperCase();
      
      if (currentScaleTurn === "MANHÃ") {
        return is24h || turno === "A" || turno === "TURNO A";
      }
      if (currentScaleTurn === "TARDE") {
        return is24h || turno === "B" || turno === "TURNO B";
      }

      // Se for turno de 24h ou outro, mostra 24h por padrão
      if (currentScaleTurn === "24H") return is24h;

      return true;
    })
    .sort((a, b) => {
      // Prioridade:
      // 1. Erros de aptidão e já escalados (vão para o fim)
      const aptA = getAptitude(a.id).severity === 'error' ? 2 : 0;
      const aptB = getAptitude(b.id).severity === 'error' ? 2 : 0;
      const scaledA = (selectedAgentIds.includes(a.id) || alreadyInOtherTurnoIds.includes(a.id)) ? 1 : 0;
      const scaledB = (selectedAgentIds.includes(b.id) || alreadyInOtherTurnoIds.includes(b.id)) ? 1 : 0;
      
      if ((aptA + scaledA) !== (aptB + scaledB)) return (aptA + scaledA) - (aptB + scaledB);
      
      // 2. Antiguidade (Menor número = Mais antigo = Topo)
      return (a.antiguidade ?? 9999) - (b.antiguidade ?? 9999);
    });

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-4 bg-[#1a1f26] border border-white/10 rounded-[24px] shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
      {/* Cabeçalho com Filtros */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
          <Search size={14} className="text-[#7c3aed]" />
          <input
            autoFocus value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="PESQUISAR POLICIAL..."
            className="bg-transparent border-none text-[10px] font-black text-white outline-none w-full placeholder:text-white/10 uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${showAll ? 'bg-rose-500' : 'bg-emerald-500'}`} />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
               {showAll ? "MODO EMERGÊNCIA (TUDO)" : `FILTRADO: ${currentScaleTurn || "GERAL"}`}
             </span>
          </div>
          
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-black uppercase tracking-widest ${
              showAll 
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
            }`}
          >
            {showAll ? <Users size={12} /> : <AlertTriangle size={12} />}
            {showAll ? "ATIVAR FILTRO" : "MOSTRAR TODOS"}
          </button>
        </div>
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
