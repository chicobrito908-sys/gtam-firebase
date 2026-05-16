"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import VtrCard from "./VtrCard";
import Button from "../ui/Button";


const SUB_TURNOS = [
  { id: "BI", label: "Turno I" },
  { id: "BII", label: "Turno II" },
  { id: "TITULAR", label: "Escala 24h / Apoio" },
];

import { Agent, AptitudeResult, VTR, ScaleEntry } from "@/types/agent";

interface Props {
  turno?: string;
  vtrsMap: Record<string, VTR[]>;
  selectedAgents: ScaleEntry[];
  efetivo: Agent[];
  getAptitude: (id: string) => AptitudeResult;
  onAddVtr: (subId: string) => void;
  onRenameVtr: (subId: string, vtrId: string, name: string) => void;
  onToggleVtrType: (subId: string, vtrId: string) => void;
  onRemoveVtr: (subId: string, vtrId: string) => void;
  onRemoveAgent: (id: string) => void;
  setSelectingFor: (val: { equipe: string; funcao: string } | null) => void;
  selectingFor: { equipe: string; funcao: string } | null;
  isReadOnly?: boolean;
}

export default function SubTurnoList({
  turno, vtrsMap, selectedAgents, efetivo, getAptitude,
  onAddVtr, onRenameVtr, onToggleVtrType, onRemoveVtr,
  onRemoveAgent, setSelectingFor, selectingFor, isReadOnly
}: Props) {
  const filteredSubTurnos = SUB_TURNOS.filter(sub => {
    // Na Manhã, mostramos o Turno I (AII) e as equipes de 24h
    if (turno === "MANHÃ") return sub.id === "BI" || sub.id === "TITULAR";
    
    // Na Tarde, mostramos o Turno II (BII) e as equipes de 24h
    if (turno === "TARDE") return sub.id === "BII" || sub.id === "TITULAR";
    
    // Na escala de 24h, mostramos apenas as equipes de 24h
    if (turno === "24H") return sub.id === "TITULAR";
    
    return true;
  });

  // Pegamos todas as viaturas de todos os sub-turnos filtrados para exibir juntas
  const allVtrs = filteredSubTurnos.flatMap(sub => 
    (vtrsMap[sub.id] || []).map(v => ({ ...v, subId: sub.id }))
  );

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-l-4 border-[#7c3aed] pl-4">
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#7c3aed]">EQUIPES OPERACIONAIS</h3>
          {!isReadOnly && (
            <Button variant="ghost" size="sm" onClick={() => onAddVtr(turno === "MANHÃ" ? "BI" : (turno === "TARDE" ? "BII" : "TITULAR"))}>
              <UserPlus size={14} className="mr-2" /> Adicionar Viatura
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allVtrs.map(v => (
            <VtrCard
              key={`${v.subId}-${v.id}`} vtr={v}
              isReadOnly={isReadOnly}
              agents={selectedAgents.filter(a => a.equipe === v.id && a.funcao === v.subId)}
              getAgentById={(id) => efetivo.find(a => a.id === id)}
              getAgentAptitude={getAptitude}
              onRename={(name) => onRenameVtr(v.subId, v.id, name)}
              onToggleType={() => onToggleVtrType(v.subId, v.id)}
              onRemoveVtr={() => onRemoveVtr(v.subId, v.id)}
              onRemoveAgent={onRemoveAgent}
              onSelectAgent={() => setSelectingFor({ equipe: v.id, funcao: v.subId })}
              isSelecting={selectingFor?.equipe === v.id && selectingFor?.funcao === v.subId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
