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

      // 3. Lógica de Turno AII / BII / B (24h)
      // Turno B = 24x72 (Coringa)
      // Turno AII = Escala 2x2 Manhã
      // Turno BII = Escala 2x2 Tarde
      
      // Normalização robusta:
      // 1. Remove prefixo "TURNO" (banco tem "TURNO A II" e "A II" misturados)
      // 2. Remove todos os espaços internos
      // 3. Converte para maiúsculo
      const turnoRaw = String(a.grupo_turno || "").toUpperCase().replace(/^TURNO\s*/i, '').replace(/\s+/g, '').trim();
      const escala = String(a.tipo_escala || "").replace(/\s+/g, '').toUpperCase();

      const is24h = escala === "24X72" || turnoRaw === "B";
      const isAII = turnoRaw === "AII";
      const isBII = turnoRaw === "BII";
      
      if (currentScaleTurn === "MANHÃ") {
        return is24h || isAII;
      }
      if (currentScaleTurn === "TARDE") {
        return is24h || isBII;
      }

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

      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Agentes Disponíveis</h4>
        <span className="text-[10px] text-white/30 italic">Ordenado por Antiguidade</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-white/20">
            <Users size={24} className="mb-2 opacity-20" />
            <span className="text-[10px] font-medium">Nenhum agente encontrado</span>
          </div>
        ) : (
          filtered.map((agent) => (
            <AgentCard
              key={agent.id} 
              agent={agent} 
              aptitude={getAptitude(agent.id)}
              isScaled={selectedAgentIds.includes(agent.id) || alreadyInOtherTurnoIds.includes(agent.id)}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
        <button onClick={onClose} className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}
