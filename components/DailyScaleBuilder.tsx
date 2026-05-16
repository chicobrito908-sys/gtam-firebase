"use client";

import React, { useEffect } from "react";
import { Share2, ChevronLeft, X } from "lucide-react";
import { useScaleBuilder } from "@/hooks/useScaleBuilder";
import { getTurnoCount } from "@/lib/services/scaleUtils";
import ScaleHeader from "./ScaleBuilder/ScaleHeader";
import TacBoard from "./ScaleBuilder/TacBoard";
import AgentSelector from "./ScaleBuilder/AgentSelector";
import CommandSection from "./ScaleBuilder/CommandSection";
import SubTurnoList from "./ScaleBuilder/SubTurnoList";
import Button from "./ui/Button";

const TURNOS = [{ id: "MANHÃ", label: "Turno Manhã (06h às 14h)" }, { id: "TARDE", label: "Turno Tarde (15h às 23h)" }, { id: "24H", label: "Turno 24H (06h às 06h)" }];

export default function DailyScaleBuilder({ initialDate, onBack }: { initialDate?: string; onBack?: () => void }) {
  const s = useScaleBuilder(initialDate);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && s.setSelectingFor(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [s]);

  const turnoCount = getTurnoCount(s.efetivo, s.turno);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack || (() => window.location.href = '/escalas')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"><ChevronLeft size={20} /></button>
          <ScaleHeader date={s.date} setDate={s.setDate} turno={s.turno} setTurno={s.setTurno} isFetching={s.isFetching} availableCount={turnoCount} onSave={() => s.handleSave(onBack)} isLoading={s.isLoading} turnOptions={TURNOS} />
        </div>

        <TacBoard missoes={s.missoes} onAdd={(tipo) => s.setMissoes(p => [...p, { tipo, descricao: "..." }])} onRemove={(idx) => s.setMissoes(p => p.filter((_, i) => i !== idx))} onUpdate={(idx, desc) => s.setMissoes(p => p.map((m, i) => i === idx ? { ...m, descricao: desc } : m))} />

        <CommandSection selectedAgents={s.comandoAgents} efetivo={s.efetivo} onRemove={s.handleRemoveAgent} onSelect={(e, f) => s.setSelectingFor({ equipe: e, funcao: f })} />

        <SubTurnoList turno={s.turno} vtrsMap={s.vtrsMap} selectedAgents={s.selectedAgents} efetivo={s.efetivo} getAptitude={s.getAptitude} onAddVtr={s.handleAddVtr} onRenameVtr={s.handleRenameVtr} onToggleVtrType={s.handleToggleVtrType} onRemoveVtr={s.handleRemoveVtr} onRemoveAgent={s.handleRemoveAgent} setSelectingFor={s.setSelectingFor} selectingFor={s.selectingFor} />

        <div className="pt-8 border-t border-white/5 flex justify-end">
          <Button onClick={s.handleShare} variant="success" size="lg" className="px-12"><Share2 size={18} className="mr-3" /> Publicar WhatsApp</Button>
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
              agents={s.efetivo} 
              currentScaleTurn={s.turno}
              getAptitude={s.getAptitude} 
              onSelect={s.handleSelectAgent} 
              onClose={() => s.setSelectingFor(null)} 
              selectedAgentIds={s.selectedAgents.map(a => a.agentId)} 
              alreadyInOtherTurnoIds={s.allDayScales
                .filter(sc => sc.turno !== s.turno)
                .flatMap(sc => sc.agentes || [])
                .map(a => a.agentId)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
