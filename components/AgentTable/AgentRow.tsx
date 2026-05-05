"use client";
import { Shield, Activity, Zap, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { TURNO_COLORS, STATUS_COLORS, normalizeTurnoDisplay } from "@/lib/constants/efetivo";
import { getAgentAptitude } from "@/lib/services/aptitudeService";

export interface Agent {
  id: string;
  matricula: string;
  nome_completo: string;
  nome_guerra: string;
  posto_grad: string;
  setor: string;
  status: string;
  grupo_turno: string;
  tipo_escala: string;
  antiguidade: number;
  contato?: string;
}

export interface Afastamento {
  id: string;
  agent_id: string;
  tipo: string;
  data_inicio: string;
  data_fim?: string;
  motivo?: string;
}

export interface Ferias {
  id: string;
  agent_id: string;
  data_inicio: string;
  data_fim: string;
  ano_referencia?: number;
}

interface Props {
  agent: Agent;
  index: number;
  today: string;
  afastamentos: Afastamento[];
  ferias: Ferias[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export default function AgentRow({ agent, index, today, afastamentos, ferias, onEdit, onDelete }: Props) {
  const displayTurno = normalizeTurnoDisplay(agent.grupo_turno);
  const turnoClass   = TURNO_COLORS[agent.grupo_turno] ?? TURNO_COLORS[displayTurno] ?? "bg-slate-500/10 text-slate-500 border-slate-500/20";
  const statusClass  = STATUS_COLORS[agent.status] ?? "bg-slate-500/10 text-slate-500 border-slate-500/20";
  const apt          = getAgentAptitude(agent.id, today, afastamentos, ferias);

  return (
    <motion.tr
      key={agent.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="hover:bg-white/[0.01] transition-colors group"
    >
      <td className="px-3 py-4 whitespace-nowrap">
        <span className="text-sm font-black text-muted-foreground/50 italic">{index + 1}</span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
          {agent.matricula}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-black text-base text-foreground group-hover:text-primary transition-colors uppercase tracking-tighter">{agent.nome_guerra}</span>
          <span className="text-xs text-muted-foreground/60 truncate max-w-[150px]">{agent.nome_completo}</span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-muted-foreground/50" />
          <span className="text-sm font-bold text-foreground/80 tracking-tight">{agent.posto_grad}</span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest ${turnoClass}`}>
            {displayTurno}
          </span>
          <span className="text-xs text-muted-foreground/40 font-mono font-bold">({agent.tipo_escala})</span>
        </div>
      </td>
      <td className="px-3 py-4 text-center whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${statusClass}`}>
          <Activity size={12} className="mr-1.5" />{agent.status}
        </span>
      </td>
      <td className="px-3 py-4 text-center whitespace-nowrap">
        {apt.severity === "none" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-widest">
            <Zap size={11} /> DISPONÍVEL
          </span>
        )}
        {apt.severity === "warning" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-widest">
            <Zap size={11} /> M.P
          </span>
        )}
        {apt.severity === "error" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase tracking-widest">
            <Activity size={11} /> {apt.label || "IMPEDIDO"}
          </span>
        )}
        {apt.severity === "info" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest">
            <Activity size={11} /> {apt.label || "INFO"}
          </span>
        )}
      </td>
      <td className="px-3 py-4 text-right whitespace-nowrap">
        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onEdit(agent)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-foreground/70 hover:text-primary transition-all border border-white/5 shadow-sm" title="Editar Agente">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(agent)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-foreground/70 hover:text-rose-500 transition-all border border-white/5 shadow-sm" title="Remover Agente">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
