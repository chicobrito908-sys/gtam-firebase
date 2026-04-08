"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import VtrCard from "./VtrCard";
import Button from "../ui/Button";
import { Agent, AptitudeResult } from "@/types/agent";

const SUB_TURNOS = [
  { id: "BI", label: "Turno I" },
  { id: "BII", label: "Turno II" },
  { id: "TITULAR", label: "Escala 24h / Apoio" },
];

interface Props {
  turno?: string;
  vtrsMap: Record<string, any[]>;
  selectedAgents: any[];
  efetivo: Agent[];
  getAptitude: (id: string) => AptitudeResult;
  onAddVtr: (subId: string) => void;
  onRenameVtr: (subId: string, vtrId: string, name: string) => void;
  onToggleVtrType: (subId: string, vtrId: string) => void;
  onRemoveVtr: (subId: string, vtrId: string) => void;
  onRemoveAgent: (id: string) => void;
  setSelectingFor: (val: any) => void;
  selectingFor: any;
  isReadOnly?: boolean;
}

export default function SubTurnoList({
  turno, vtrsMap, selectedAgents, efetivo, getAptitude,
  onAddVtr, onRenameVtr, onToggleVtrType, onRemoveVtr,
  onRemoveAgent, setSelectingFor, selectingFor, isReadOnly
}: Props) {
  const filteredSubTurnos = SUB_TURNOS.filter(sub => {
    if (turno === "MANHÃ") return sub.id === "BI";
    if (turno === "TARDE") return sub.id === "BII";
    if (turno === "24H") return sub.id === "TITULAR";
    return true;
  });

  return (
    <div className="space-y-10">
      {filteredSubTurnos.map((sub) => (
        <div key={sub.id} className="space-y-6">
          <div className="flex items-center justify-between border-l-4 border-[#7c3aed] pl-4">
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#7c3aed]">{sub.label}</h3>
            {!isReadOnly && (
              <Button variant="ghost" size="sm" onClick={() => onAddVtr(sub.id)}>
                <UserPlus size={14} className="mr-2" /> Adicionar Viatura
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(vtrsMap[sub.id] || []).map(v => (
              <VtrCard
                key={v.id} vtr={v}
                isReadOnly={isReadOnly}
                agents={selectedAgents.filter(a => a.equipe === v.id && a.funcao === sub.id)}
                getAgentById={(id) => efetivo.find(a => a.id === id)}
                getAgentAptitude={getAptitude}
                onRename={(name) => onRenameVtr(sub.id, v.id, name)}
                onToggleType={() => onToggleVtrType(sub.id, v.id)}
                onRemoveVtr={() => onRemoveVtr(sub.id, v.id)}
                onRemoveAgent={onRemoveAgent}
                onSelectAgent={() => setSelectingFor({ equipe: v.id, funcao: sub.id })}
                isSelecting={selectingFor?.equipe === v.id && selectingFor?.funcao === sub.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
