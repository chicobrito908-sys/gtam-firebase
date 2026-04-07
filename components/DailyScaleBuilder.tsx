"use client";

import React from "react";
import { Share2, UserPlus, Info } from "lucide-react";
import { useScaleBuilder } from "@/hooks/useScaleBuilder";
import { Agent, ScaleEntry, VTR, AptitudeResult } from "@/types/agent";
import ScaleHeader from "./ScaleBuilder/ScaleHeader";
import TacBoard from "./ScaleBuilder/TacBoard";
import VtrCard from "./ScaleBuilder/VtrCard";
import AgentSelector from "./ScaleBuilder/AgentSelector";
import Button from "./ui/Button";

const TURNOS = [
  { id: "MANHÃ", label: "Turno Manhã (06h - 18h)" },
  { id: "NOITE", label: "Turno Noite (18h - 06h)" },
  { id: "ESPECIAL", label: "Operação Especial" },
];

const SUB_TURNOS = [
  { id: "BI", label: "Turno I" },
  { id: "BII", label: "Turno II" },
  { id: "TITULAR", label: "Escala 24h / Apoio" },
];

export default function DailyScaleBuilder() {
  const s = useScaleBuilder();

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 md:p-8 text-white relative">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <ScaleHeader 
          date={s.date} setDate={s.setDate} turno={s.turno} setTurno={s.setTurno}
          isFetching={s.isFetching} availableCount={s.efetivo.length}
          onSave={s.handleSave} isLoading={s.isLoading} turnOptions={TURNOS}
        />

        <TacBoard 
          missoes={s.missoes} 
          onAdd={(tipo) => s.setMissoes([...s.missoes, { tipo, descricao: "Clique para editar..." }])}
          onRemove={(idx) => s.setMissoes(s.missoes.filter((_, i) => i !== idx))}
        />

        <div className="space-y-10">
          {SUB_TURNOS.map((sub) => (
            <div key={sub.id} className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-[#7c3aed] pl-4">
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#7c3aed]">{sub.label}</h3>
                <Button variant="ghost" size="sm" onClick={() => s.handleAddVtr(sub.id)}>
                   <UserPlus size={14} className="mr-2" /> Adicionar Equipe
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(s.vtrsMap[sub.id] || []).map(v => (
                  <VtrCard 
                    key={v.id} vtr={v} 
                    agents={s.selectedAgents.filter(a => a.equipe === v.id && a.funcao === sub.id)}
                    getAgentById={(id) => s.efetivo.find(a => a.id === id)}
                    getAgentAptitude={s.getAptitude}
                    onRename={(name) => s.handleRenameVtr(sub.id, v.id, name)}
                    onToggleType={() => s.handleToggleVtrType(sub.id, v.id)}
                    onRemoveVtr={() => s.handleRemoveVtr(sub.id, v.id)}
                    onRemoveAgent={(id) => s.setSelectedAgents(prev => prev.filter(a => a.agentId !== id))}
                    onSelectAgent={() => s.setSelectingFor({ equipe: v.id, funcao: sub.id })}
                    isSelecting={s.selectingFor?.equipe === v.id && s.selectingFor?.funcao === sub.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-end">
          <Button onClick={s.handleShare} variant="success" size="lg" className="px-12">
            <Share2 size={18} className="mr-3" /> Publicar WhatsApp
          </Button>
        </div>
      </div>

      {s.selectingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md relative">
            <AgentSelector 
              agents={s.efetivo} getAptitude={s.getAptitude} 
              onSelect={s.handleSelectAgent} onClose={() => s.setSelectingFor(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
