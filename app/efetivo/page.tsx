"use client";

import { useEffect, useState } from "react";
import { Users, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AgentTable from "@/components/AgentTable";
import AddAgentModal from "@/components/AddAgentModal";

export default function EfetivoPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("efetivo")
        .select("*")
        .order("antiguidade", { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar efetivo:", err);
      setError("Não foi possível carregar os dados do efetivo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Users className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Gestão de Efetivo</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-40">GMF / GTAM - Listagem Geral</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAgents}
            disabled={loading}
            className="p-3 bg-slate-800 border border-white/5 rounded-xl text-muted-foreground hover:text-foreground hover:border-blue-500/30 transition-all disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 border border-white/10"
          >
            <Plus size={20} />
            <span>ADICIONAR AGENTE</span>
          </button>
        </div>
      </div>

      {/* Modal de Cadastro */}
      <AddAgentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchAgents();
        }}
      />

      {/* Main Content */}
      {loading ? (
        <div className="bg-card border border-white/5 rounded-2xl p-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">Acessando Banco de Dados Seguro...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="text-destructive mb-4" size={48} />
          <h2 className="text-xl font-bold text-destructive mb-2">Falha na Conexão</h2>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <button 
            onClick={fetchAgents}
            className="px-6 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg font-bold transition-all border border-destructive/30"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      ) : (
        <AgentTable agents={agents} onUpdate={fetchAgents} />
      )}
    </div>
  );
}
