"use client";

import React from "react";
import { Star } from "lucide-react";
import { Agent } from "@/types/agent";

const CARGOS_COMANDO = [
  { id: "SUPERVISÃO", label: "Supervisor do Turno", color: "purple" },
  { id: "ARMARIA", label: "Responsável Armaria", color: "amber" },
];

import { ScaleEntry } from "@/types/agent";

interface Props {
  selectedAgents: ScaleEntry[];
  efetivo: Agent[];
  onRemove: (id: string) => void;
  onSelect: (equipe: string, funcao: string) => void;
  isReadOnly?: boolean;
}

export default function CommandSection({ selectedAgents, efetivo, onRemove, onSelect, isReadOnly }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Star size={16} className="text-amber-400" />
        <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-amber-400">Supervisão e Apoio</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARGOS_COMANDO.map(cargo => {
          const assigned = selectedAgents.find(a => a.equipe === cargo.id);
          const agent = assigned ? efetivo.find(a => a.id === assigned.agentId) : null;
          const colorClass = cargo.color === "purple" ? "border-purple-500/30 bg-purple-600/5" : "border-amber-500/30 bg-amber-600/5";
          const textClass = cargo.color === "purple" ? "text-purple-400" : "text-amber-400";
          return (
            <div key={cargo.id} className={`border rounded-2xl p-5 ${colorClass}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${textClass}`}>{cargo.label}</p>
              {agent ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">{agent.nome_guerra}</span>
                  {!isReadOnly && (
                    <button onClick={() => onRemove(assigned!.agentId)} className="text-[9px] text-rose-400 hover:text-rose-300 uppercase font-bold">Remover</button>
                  )}
                </div>
              ) : (
                !isReadOnly ? (
                  <button onClick={() => onSelect(cargo.id, cargo.id)} className={`w-full text-[10px] font-black uppercase border border-dashed rounded-xl py-3 transition-all ${textClass} border-current hover:opacity-80`}>
                    + Designar
                  </button>
                ) : (
                  <div className={`w-full text-[10px] font-black uppercase border border-dashed rounded-xl py-3 text-center opacity-50 ${textClass} border-current`}>
                    Não Designado
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
