"use client";

import { Search, User, Shield, Phone, Activity, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import EditAgentModal from "./EditAgentModal";

interface Agent {
  id: string;
  matricula: string;
  nome_completo: string;
  nome_guerra: string;
  posto_grad: string;
  setor: string;
  status: string;
  grupo_turno: string;
  tipo_escala: string;
  contato?: string;
}

interface AgentTableProps {
  agents: Agent[];
  onUpdate?: () => void;
}

const statusColors: Record<string, string> = {
  ATIVO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  FERIAS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  AFASTADO: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  LICENCO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  RESERVA: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const turnoColors: Record<string, string> = {
  "A": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "B": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "A II": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "B II": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "A I": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "B I": "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function AgentTable({ agents, onUpdate }: AgentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.matricula.includes(searchTerm) ||
      agent.nome_guerra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, matrícula ou nome de guerra..."
          className="w-full bg-card border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden bg-card border border-white/5 rounded-2xl shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-800/40">
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80">Matrícula</th>
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80">Nome de Guerra</th>
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80">Posto/Grad</th>
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80">Turno</th>
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80 text-center">Status</th>
                <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-muted-foreground/80 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAgents.map((agent, index) => (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm font-bold text-blue-400 bg-blue-400/5 px-2.5 py-1.5 rounded-lg border border-blue-400/10">
                      {agent.matricula}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-base text-foreground group-hover:text-blue-400 transition-colors tracking-tight">{agent.nome_guerra}</span>
                      <span className="text-sm text-muted-foreground/60 truncate max-w-[200px]">{agent.nome_completo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-muted-foreground/50" />
                      <span className="text-base font-bold text-foreground/80 tracking-tight">{agent.posto_grad}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest ${turnoColors[agent.grupo_turno] || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                        {agent.grupo_turno || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground/40 font-mono font-bold">({agent.tipo_escala})</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-black border border-white/5 uppercase tracking-widest ${statusColors[agent.status] || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                      <Activity size={14} className="mr-2" />
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEditClick(agent)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-foreground/70 hover:text-blue-500 transition-all border border-white/5 shadow-sm" 
                        title="Editar Agente"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-foreground/70 hover:text-rose-500 transition-all border border-white/5 shadow-sm" title="Remover Agente">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredAgents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum agente encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          if (onUpdate) onUpdate();
        }}
        agent={selectedAgent}
      />
    </div>
  );
}
