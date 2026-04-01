"use client";

import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Activity,
  History,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Afastamento {
  id: string;
  efetivo_id: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  motivo?: string;
  efetivo?: {
    nome_guerra: string;
    matricula: string;
    posto_grad: string;
  };
}

interface EfetivoBasico {
  id: string;
  nome_guerra: string;
  matricula: string;
  posto_grad: string;
}

export default function AfastamentosPage() {
  const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
  const [efetivo, setEfetivo] = useState<EfetivoBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    efetivo_id: "",
    tipo: "SAUDE",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    motivo: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Afastamentos join Efetivo
      const { data: afData } = await supabase
        .from("afastamentos")
        .select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)")
        .order("data_inicio", { ascending: false });

      // 2. Buscar Efetivo para o dropdown
      const { data: efData } = await supabase
        .from("efetivo")
        .select("id, nome_guerra, matricula, posto_grad")
        .eq("status", "ATIVO")
        .order("nome_guerra", { ascending: true });

      setAfastamentos(afData || []);
      setEfetivo(efData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.efetivo_id || !formData.data_inicio || !formData.data_fim) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const { error } = await supabase
        .from("afastamentos")
        .insert([formData]);

      if (error) throw error;
      
      setShowModal(false);
      setFormData({
        efetivo_id: "",
        tipo: "SAUDE",
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: "",
        motivo: "",
      });
      fetchData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "desconhecido";
      alert("Erro ao salvar: " + errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const { error } = await supabase.from("afastamentos").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "desconhecido";
      alert("Erro ao excluir: " + errorMsg);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pl-4 py-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <Briefcase className="text-rose-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Afastamentos</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">Controle Operacional / Licenças e Atestados</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg shadow-rose-600/20 active:scale-95 uppercase tracking-wider text-xs"
        >
          <Plus size={20} />
          <span>Registrar Afastamento</span>
        </button>
      </div>

      {/* Listagem */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity size={18} />
            <h3 className="font-bold uppercase tracking-[0.2em] text-xs">Registros Encontrados</h3>
          </div>
          <span className="text-[10px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest">
            {afastamentos.length} Integrantes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#090b10] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Integrante</th>
                <th className="px-6 py-4 font-black">Tipo</th>
                <th className="px-6 py-4 font-black">Período</th>
                <th className="px-6 py-4 font-black">Motivo / Observação</th>
                <th className="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {afastamentos.map((af, index) => (
                <motion.tr 
                  key={af.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-white/[0.01] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10 text-primary font-bold text-xs uppercase">
                        {af.efetivo?.nome_guerra?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground uppercase tracking-tighter">{af.efetivo?.nome_guerra}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-medium tracking-tight">
                          {af.efetivo?.posto_grad} • {af.efetivo?.matricula}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                      af.tipo === 'SAUDE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' : 
                      'bg-amber-500/10 text-amber-500 border-amber-500/10'
                    }`}>
                      {af.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Calendar size={12} className="text-muted-foreground" />
                        {new Date(af.data_inicio).toLocaleDateString()} 
                        <span className="text-muted-foreground font-normal">➔</span> 
                        {new Date(af.data_fim).toLocaleDateString()}
                      </div>
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                        {Math.ceil((new Date(af.data_fim).getTime() - new Date(af.data_inicio).getTime()) / (1000 * 3600 * 24)) + 1} Dias
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-muted-foreground max-w-[300px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      {af.motivo || "Sem observações adicionais."}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(af.id)}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {afastamentos.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <History size={48} className="text-muted-foreground" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-rose-500" />
                  Novo Registro
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Seleção de Agente */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User size={12} /> Integrante *
                  </label>
                  <select 
                    required
                    value={formData.efetivo_id}
                    onChange={(e) => setFormData({...formData, efetivo_id: e.target.value})}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 transition-all outline-none"
                  >
                    <option value="" className="text-black">Selecionar...</option>
                    {efetivo.map(ef => (
                      <option key={ef.id} value={ef.id} className="text-black">
                        {ef.nome_guerra} ({ef.posto_grad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tipo */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Activity size={12} /> Tipo
                    </label>
                    <select 
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 transition-all outline-none"
                    >
                      <option value="SAUDE" className="text-black">SAÚDE</option>
                      <option value="NUPRE" className="text-black">NUPRE</option>
                      <option value="PATERNIDADE" className="text-black">PATERNIDADE</option>
                      <option value="OUTRO" className="text-black">OUTRO</option>
                    </select>
                  </div>

                  {/* Data Início */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Calendar size={12} /> Início *
                    </label>
                    <input 
                      type="date"
                      required
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Data Fim */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar size={12} /> Término (Inclusive) *
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 transition-all outline-none"
                  />
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <AlertCircle size={12} /> Motivo / Observações
                  </label>
                  <textarea 
                    value={formData.motivo}
                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    placeholder="Especifique o motivo do afastamento..."
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 transition-all outline-none min-h-[100px] resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all"
                  >
                    Salvar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
