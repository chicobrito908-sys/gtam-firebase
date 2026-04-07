"use client";

import React, { useEffect } from "react";
import { Share2, UserPlus, ChevronLeft, X, Star } from "lucide-react";
import { useScaleBuilder } from "@/hooks/useScaleBuilder";
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

const CARGOS_COMANDO = [
  { id: "SUPERVISÃO", label: "Supervisor do Turno", color: "purple" },
  { id: "ARMARIA", label: "Responsável Armaria", color: "amber" },
];

interface Props { initialDate?: string; }

export default function DailyScaleBuilder({ initialDate }: Props) {
  const s = useScaleBuilder(initialDate);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") s.setSelectingFor(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [s]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 md:p-8 text-white relative">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/escalas'}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <ScaleHeader
            date={s.date} setDate={s.setDate} turno={s.turno} setTurno={s.setTurno}
            isFetching={s.isFetching} availableCount={s.efetivo.length}
            onSave={s.handleSave} isLoading={s.isLoading} turnOptions={TURNOS}
          />
        </div>

        <TacBoard
          missoes={s.missoes}
          onAdd={(tipo) => s.setMissoes(prev => [...prev, { tipo, descricao: "Clique para editar..." }])}
          onRemove={(idx) => s.setMissoes(prev => prev.filter((_, i) => i !== idx))}
          onUpdate={(idx, desc) => s.setMissoes(prev => prev.map((m, i) => i === idx ? { ...m, descricao: desc } : m))}
        />

        {/* Seção: Cargos de Comando */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Star size={16} className="text-amber-400" />
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-amber-400">Cargos de Comando</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CARGOS_COMANDO.map(cargo => {
              const assigned = s.selectedAgents.find(a => a.equipe === cargo.id);
              const agent = assigned ? s.efetivo.find(a => a.id === assigned.agentId) : null;
              const colorClass = cargo.color === "purple" ? "border-purple-500/30 bg-purple-600/5" : "border-amber-500/30 bg-amber-600/5";
              const textClass = cargo.color === "purple" ? "text-purple-400" : "text-amber-400";
              return (
                <div key={cargo.id} className={`border rounded-2xl p-5 ${colorClass}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${textClass}`}>{cargo.label}</p>
                  {agent ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white uppercase">{agent.nome_guerra}</span>
                      <button
                        onClick={() => s.handleRemoveAgent(assigned!.agentId)}
                        className="text-[9px] text-rose-400 hover:text-rose-300 uppercase font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => s.setSelectingFor({ equipe: cargo.id, funcao: cargo.id })}
                      className={`w-full text-[10px] font-black uppercase border border-dashed rounded-xl py-3 transition-all ${textClass} border-current hover:opacity-80`}
                    >
                      + Designar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Viaturas por turno */}
        <div className="space-y-10">
          {SUB_TURNOS.map((sub) => (
            <div key={sub.id} className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-[#7c3aed] pl-4">
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#7c3aed]">{sub.label}</h3>
                <Button variant="ghost" size="sm" onClick={() => s.handleAddVtr(sub.id)}>
                   <UserPlus size={14} className="mr-2" /> Adicionar Viatura
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
                    onRemoveAgent={s.handleRemoveAgent}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => s.setSelectingFor(null)}
        >
          <div
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => s.setSelectingFor(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-rose-500/80 rounded-full transition-all text-white"
            >
              <X size={14} />
            </button>
            <AgentSelector
              agents={s.efetivo} getAptitude={s.getAptitude}
              onSelect={s.handleSelectAgent} onClose={() => s.setSelectingFor(null)}
              selectedAgentIds={s.selectedAgents.map(a => a.agentId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
