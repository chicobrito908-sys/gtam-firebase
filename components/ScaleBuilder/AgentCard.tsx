"use client";

import React from "react";
import { Shield, Zap, Trash2 } from "lucide-react";
import { Agent, AptitudeResult } from "@/types/agent";

interface AgentCardProps {
  agent: Agent | undefined;
  aptitude: AptitudeResult;
  onRemove: () => void;
  size?: "sm" | "md";
}

export default function AgentCard({ 
  agent, 
  aptitude, 
  onRemove,
  size = "md" 
}: AgentCardProps) {
  if (!agent) return null;

  const isError = aptitude.severity === 'error';
  const isWarning = aptitude.severity === 'warning';
  
  const statusColor = isError 
    ? 'text-rose-500' 
    : isWarning 
      ? 'text-amber-500' 
      : 'text-white';

  const containerBg = isError 
    ? 'bg-rose-500/20 ring-rose-500/50 animate-pulse outline outline-2 outline-rose-500' 
    : isWarning 
      ? 'bg-amber-500/10 ring-amber-500/30 font-bold' 
      : 'bg-white/5 ring-white/5 hover:ring-[#7c3aed]/40';

  return (
    <div className={`flex items-center justify-between ${size === 'sm' ? 'p-2' : 'p-4'} rounded-2xl ring-1 transition-all group ${containerBg}`}>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          {isError && <Shield size={10} className="text-rose-500 shake" />}
          {isWarning && <Zap size={10} className="text-amber-500" />}
          <span className={`${size === 'sm' ? 'text-[9px]' : 'text-xs'} font-black uppercase truncate ${statusColor}`}>
            {agent.nome_guerra.replace(/^(SI|GD|GM|GC|CD|IR|Insp|SubInsp)\s+/i, '').trim()}
            {aptitude.label && (
              <span className="ml-2 opacity-60 text-[8px] font-bold">
                ({aptitude.label})
              </span>
            )}
          </span>
        </div>
        <span className="text-[9px] font-bold text-white/30 uppercase truncate">
          Mat. {agent.matricula}
        </span>
      </div>
      
      <button 
        onClick={onRemove} 
        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
}
