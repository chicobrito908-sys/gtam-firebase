"use client";

import React from "react";
import { Car, Bike, Trash2, UserPlus } from "lucide-react";
import { Agent, ScaleEntry, VTR, AptitudeResult } from "@/types/agent";
import AgentCard from "./AgentCard";

interface VtrCardProps {
  vtr: VTR;
  agents: ScaleEntry[];
  getAgentById: (id: string) => Agent | undefined;
  getAgentAptitude: (id: string) => AptitudeResult;
  onRename: (newName: string) => void;
  onToggleType: () => void;
  onRemoveVtr: () => void;
  onRemoveAgent: (agentId: string) => void;
  onSelectAgent: () => void;
  isSelecting: boolean;
  isReadOnly?: boolean;
}

export default function VtrCard({
  vtr,
  agents,
  getAgentById,
  getAgentAptitude,
  onRename,
  onToggleType,
  onRemoveVtr,
  onRemoveAgent,
  onSelectAgent,
  isSelecting,
  isReadOnly
}: VtrCardProps) {
  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-[24px] p-5 flex flex-col min-h-[160px] group/vtr hover:border-[#7c3aed]/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button 
            onClick={!isReadOnly ? onToggleType : undefined} 
            disabled={isReadOnly}
            className={`p-1.5 rounded-lg transition-colors text-[#7c3aed] ${isReadOnly ? 'cursor-default opacity-60' : 'hover:bg-white/5'}`}
            title="Alternar Carro/Moto"
          >
            {vtr.type === 'CARRO' ? <Car size={16} /> : <Bike size={16} />}
          </button>
          {!isReadOnly ? (
            <input 
              type="text" 
              defaultValue={vtr.id} 
              onBlur={(e) => onRename(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="bg-transparent border-none text-[11px] font-black text-white hover:text-[#7c3aed] focus:text-[#7c3aed] focus:bg-white/5 p-1 rounded transition-all w-full outline-none uppercase tracking-tighter"
            />
          ) : (
            <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate">{vtr.id}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black text-white/10 uppercase">{agents.length} PX</span>
           {!isReadOnly && (
             <button onClick={onRemoveVtr} className="p-1.5 text-rose-500/60 hover:text-rose-500 opacity-20 group-hover/vtr:opacity-100 transition-all rounded-lg hover:bg-rose-500/10">
               <Trash2 size={14} />
             </button>
           )}
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {agents.map(entry => (
          <AgentCard 
            key={entry.agentId}
            agent={getAgentById(entry.agentId)}
            aptitude={getAgentAptitude(entry.agentId)}
            onRemove={!isReadOnly ? () => onRemoveAgent(entry.agentId) : undefined}
            size="sm"
          />
        ))}
        
        {!isReadOnly && (
          <div className="relative pt-2">
             <button 
              onClick={onSelectAgent} 
              className={`w-full py-3 border border-dashed rounded-xl flex items-center justify-center gap-2 group transition-all ${isSelecting ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]' : 'border-white/5 hover:border-white/10 text-white/10 hover:text-white/30'}`}
            >
                <UserPlus size={14} /> 
                <span className="text-[8px] font-black uppercase tracking-widest">Adicionar PX</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
