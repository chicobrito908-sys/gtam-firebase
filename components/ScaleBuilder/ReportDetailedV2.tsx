"use client";

import React from "react";
import { Shield, Zap, Clock, PlusCircle, Trash2 } from "lucide-react";
import VtrCard from "./VtrCard";

import { type Agent } from "../AgentTable/AgentRow";

interface ScaleAgent {
  agentId: string;
  equipe: string;
  funcao: string;
  efetivo?: Agent;
}

interface ScaleVtr {
  id: string;
  prefixo: string;
}

interface DayScale {
  id: string;
  turno: string;
  data: string;
  agentes: ScaleAgent[];
  vtrsMap: Record<string, ScaleVtr[]>;
}

interface ReportProps {
  dayScales: DayScale[];
  ausencias: any[];
  onOpenBuilder: () => void;
  onRemoveAusencia: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;
}

const TurnoSectionGroup = ({ turnoName, vtrsMap, selectedAgents, getAgent }: { turnoName: string; vtrsMap: Record<string, ScaleVtr[]>; selectedAgents: ScaleAgent[]; getAgent: (id: string) => Agent | undefined }) => {
  if (!vtrsMap) return null;
  const subs = ["BI", "BII", "TITULAR"];
  let hasAnyVtr = false;

  return (
    <div className="space-y-4 mb-8">
      <h5 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] border-l-2 border-primary/40 pl-3">
        TURNO {turnoName}
      </h5>
      <div className="space-y-6">
        {subs.map(sub => {
          const subLabels: Record<string, string> = {
            BI: "Turno I (AII)",
            BII: "Turno II (BII)",
            TITULAR: "Escala 24h / Apoio"
          };
          const vtrs = vtrsMap[sub] || [];
          if (vtrs.length === 0) return null;
          hasAnyVtr = true;
          return (
            <div key={sub} className="space-y-3">
              <h6 className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest pl-2">• {subLabels[sub] || sub}</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vtrs.map((v: ScaleVtr) => (
                  <VtrCard
                    key={v.id}
                    vtr={v as any}
                    isReadOnly={true}
                    agents={selectedAgents.filter((a: ScaleAgent) => a.equipe === v.id && a.funcao === sub)}
                    getAgentById={getAgent}
                    getAgentAptitude={() => ({ status: true, severity: "none", label: "APTO", conditions: [] })}
                    onRename={() => {}}
                    onToggleType={() => {}}
                    onRemoveVtr={() => {}}
                    onRemoveAgent={() => {}}
                    onSelectAgent={() => {}}
                    isSelecting={false}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!hasAnyVtr && <div className="text-xs text-white/20 pl-4 italic">Nenhuma viatura escalada para este turno.</div>}
    </div>
  );
};

export default function ReportDetailedV2({ dayScales, ausencias, onOpenBuilder, onRemoveAusencia, getAgent }: ReportProps) {
  const comandoScale = dayScales.find((sc) => sc.turno === "COMANDO");
  const comandoAgents = comandoScale?.agentes || [];
  
  // Operacional shifts (we ignore COMANDO and GERAL)
  const opScales = dayScales.filter((sc) => sc.turno !== "COMANDO" && sc.turno !== "GERAL");
  
  // To verify if there are any ausencias for the first scale's date (or just use dayScales[0].data if available)
  const scaleDate = dayScales.length > 0 ? dayScales[0].data : null;
  const dayAus = scaleDate ? ausencias.filter((a: { data: string }) => a.data === scaleDate) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Supervisão e Armaria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ id: "SUPERVISÃO", color: "purple" } as const, { id: "ARMARIA", color: "amber" } as const].map(cmd => {
          const entry = comandoAgents.find((a: ScaleAgent) => a.funcao === cmd.id);
          const ag = entry ? getAgent(entry.agentId) : null;
          const displayName = ag?.nome_guerra || ag?.nome_completo || "NÃO ESCALADO";
          return (
            <div key={cmd.id} className={`bg-${cmd.color}-600/10 border border-${cmd.color}-500/20 p-5 rounded-[1.5rem] flex items-center justify-between`}>
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest text-${cmd.color}-400 mb-1`}>{cmd.id}</span>
                <span className="text-lg font-black text-white uppercase">{displayName}</span>
              </div>
              <div className={`p-3 bg-${cmd.color}-500/20 rounded-xl text-${cmd.color}-400`}><Zap size={18} /></div>
            </div>
          );
        })}
      </div>

      {/* Viaturas por turno */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-primary" />
            <h4 className="text-xs font-black text-white uppercase tracking-tighter">Turno Operacional</h4>
          </div>
          <button onClick={onOpenBuilder} className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline">
            <PlusCircle size={10} /> Gerenciar
          </button>
        </div>

        {opScales.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-[24px]">
             <span className="text-xs font-black text-white/30 uppercase tracking-widest">NENHUMA ESCALA CADASTRADA HOJE</span>
          </div>
        ) : (
          opScales.map((sc, i) => (
            <TurnoSectionGroup 
              key={sc.id || i}
              turnoName={sc.turno} 
              vtrsMap={sc.vtrsMap} 
              selectedAgents={sc.agentes || []} 
              getAgent={getAgent} 
            />
          ))
        )}
      </div>

      {/* Afastamentos */}
      {dayAus.length > 0 && (
        <div className="bg-rose-600/5 border border-rose-500/10 p-5 rounded-[1.5rem] space-y-4">
          <h5 className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} /> Afastamentos / Folgas
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dayAus.map((a: { id: string; efetivo?: { nome_guerra: string }; tipo: string }, i: number) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase">{a.efetivo?.nome_guerra || "—"}</span>
                  <span className={`text-[8px] font-bold ${a.tipo === 'folga' ? 'text-emerald-400' : 'text-rose-400'} uppercase`}>{a.tipo}</span>
                </div>
                <button onClick={() => onRemoveAusencia(a.id)} className="p-1 hover:text-rose-500 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
