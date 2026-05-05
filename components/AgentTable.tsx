"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import EditAgentModal from "./EditAgentModal";
import AgentRow, { type Agent, type Afastamento, type Ferias } from "./AgentTable/AgentRow";

interface AgentTableProps {
  agents: Agent[];
  onUpdate?: () => void;
}

export default function AgentTable({ agents, onUpdate }: AgentTableProps) {
  const [searchTerm, setSearchTerm]     = useState("");
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [selected, setSelected]         = useState<Agent | null>(null);
  const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
  const [ferias, setFerias]             = useState<Ferias[]>([]);

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();

  useEffect(() => {
    supabase.from("afastamentos").select("*").then(({ data }) => setAfastamentos(data || []));
    supabase.from("ferias").select("*").then(({ data }) => setFerias(data || []));
  }, []);

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Excluir ${agent.nome_guerra} (${agent.matricula})? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("efetivo").delete().eq("id", agent.id);
    if (error) alert("Erro ao excluir: " + error.message);
    else onUpdate?.();
  };

  const filtered = agents.filter((a) =>
    a.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.matricula.includes(searchTerm) ||
    a.nome_guerra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, matrícula ou nome de guerra..."
          className="w-full bg-card border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden bg-card border border-white/5 rounded-2xl shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#090b10]">
                {["#","Matrícula","Nome de Guerra","Posto/Grad","Turno","Status Mestre","Status Hoje","Ações"].map((h, i) => (
                  <th key={h} className={`px-3 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground/80 whitespace-nowrap ${i >= 5 ? "text-center" : ""} ${i === 7 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((agent, index) => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  index={index}
                  today={today}
                  afastamentos={afastamentos}
                  ferias={ferias}
                  onEdit={(a) => { setSelected(a); setIsEditOpen(true); }}
                  onDelete={handleDelete}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    Nenhum agente encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditAgentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => { onUpdate?.(); }}
        agent={selected}
      />
    </div>
  );
}
