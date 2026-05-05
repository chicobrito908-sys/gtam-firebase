"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Palmtree, 
  Plus, 
  Search, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Ferias {
  id: string;
  efetivo_id: string;
  ano_referencia: number;
  data_inicio: string;
  data_fim: string;
  status: 'AGENDADO' | 'GOZADO' | 'CANCELADO';
  efetivo?: {
    nome_guerra: string;
    matricula: string;
    posto_grad: string;
  };
}

export default function FeriasPage() {
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  interface EfetivoBasico {
    id: string;
    nome_guerra: string;
    matricula: string;
    posto_grad: string;
    antiguidade?: number;
  }

  // Form State
  const [efetivo, setEfetivo] = useState<EfetivoBasico[]>([]);
  const [formData, setFormData] = useState<{
    id?: string;
    efetivo_id: string;
    ano_referencia: number;
    data_inicio: string;
    data_fim: string;
    status: 'AGENDADO' | 'GOZADO' | 'CANCELADO';
  }>({
    efetivo_id: "",
    ano_referencia: new Date().getFullYear(),
    data_inicio: "",
    data_fim: "",
    status: "AGENDADO"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: feData, error: feError } = await supabase
        .from("ferias")
        .select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)")
        .order("data_inicio", { ascending: false });
      
      if (feError) throw feError;

      const { data: efData, error: efError } = await supabase
        .from("efetivo")
        .select("id, nome_guerra, matricula, posto_grad, antiguidade")
        .order("antiguidade", { ascending: true });

      if (efError) throw efError;

      if (feData) setFerias(feData as unknown as Ferias[]);
      if (efData) {
        const sortedEfData = (efData as EfetivoBasico[]).sort((a, b) => {
          if ((a.antiguidade ?? 9999) !== (b.antiguidade ?? 9999)) {
            return (a.antiguidade ?? 9999) - (b.antiguidade ?? 9999);
          }
          return (a.nome_guerra || "").localeCompare(b.nome_guerra || "");
        });
        setEfetivo(sortedEfData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de ferias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      if (formData.id) {
        const { error } = await supabase.from("ferias").update({
          efetivo_id: formData.efetivo_id,
          ano_referencia: formData.ano_referencia,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          status: formData.status
        }).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ferias").insert([{
          efetivo_id: formData.efetivo_id,
          ano_referencia: formData.ano_referencia,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          status: formData.status
        }]);
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchData();
      setFormData({
        efetivo_id: "",
        ano_referencia: new Date().getFullYear(),
        data_inicio: "",
        data_fim: "",
        status: "AGENDADO"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "desconhecido";
      alert("Erro ao salvar ferias: " + errorMsg);
    }
  };

  const handleEdit = (f: Ferias) => {
    setFormData({
      id: f.id,
      efetivo_id: f.efetivo_id,
      ano_referencia: f.ano_referencia,
      data_inicio: f.data_inicio,
      data_fim: f.data_fim,
      status: f.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro de férias?")) return;
    try {
      const { error } = await supabase.from("ferias").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "desconhecido";
      alert("Erro ao excluir: " + errorMsg);
    }
  };

  const filteredFerias = ferias.filter(f => 
    f.efetivo?.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.efetivo?.matricula.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOZADO': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'CANCELADO': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-[1600px] ml-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <Palmtree className="text-amber-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Gestão de Férias</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Planejamento e Controle de Descanso • GTAM</p>
          </div>
        </div>
        </div>
        <button 
          onClick={() => {
            setFormData({
              efetivo_id: "",
              ano_referencia: new Date().getFullYear(),
              data_inicio: "",
              data_fim: "",
              status: "AGENDADO"
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20"
        >
          <Plus size={16} /> Agendar Férias
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1117] border border-white/5 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Agendadas</p>
          <p className="text-2xl font-black text-amber-500">{ferias.filter(f => f.status === 'AGENDADO').length}</p>
        </div>
        <div className="bg-[#0d1117] border border-white/5 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Em Gozo (Atuais)</p>
          <p className="text-2xl font-black text-emerald-500">
            {ferias.filter(f => {
              const today = new Date().toISOString().split('T')[0];
              return f.status === 'AGENDADO' && today >= f.data_inicio && today <= f.data_fim;
            }).length}
          </p>
        </div>
        <div className="bg-[#0d1117] border border-white/5 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total {new Date().getFullYear()}</p>
          <p className="text-2xl font-black text-white">{ferias.filter(f => f.ano_referencia === new Date().getFullYear()).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="BUSCAR AGENTE OU MATRÍCULA..." 
            className="w-full bg-card border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:border-amber-500/50 focus:ring-0 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#090b10] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Agente</th>
                <th className="px-6 py-4 font-black">Ref.</th>
                <th className="px-6 py-4 font-black">Período</th>
                <th className="px-6 py-4 font-black text-center">Status</th>
                <th className="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-40 animate-pulse">Sincronizando...</td>
                </tr>
              ) : filteredFerias.map((f) => (
                <tr key={f.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-black border border-amber-500/20">
                        {f.efetivo?.posto_grad.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground group-hover:text-amber-400 transition-colors uppercase tracking-tighter">{f.efetivo?.nome_guerra}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{f.efetivo?.matricula}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black">{f.ano_referencia}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <Calendar size={12} className="text-muted-foreground" />
                      <span>{f.data_inicio.split('-').reverse().join('/')}</span>
                      <ChevronRight size={10} className="text-muted-foreground" />
                      <span>{f.data_fim.split('-').reverse().join('/')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getStatusColor(f.status)}`}>
                      {f.status === 'AGENDADO' && <Clock size={10} />}
                      {f.status === 'GOZADO' && <CheckCircle2 size={10} />}
                      {f.status === 'CANCELADO' && <XCircle size={10} />}
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(f)}
                        className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Editar Registro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir Registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFerias.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-30">
                    <Palmtree size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhum registro de férias encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agendamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-white/5 bg-amber-500/5">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Calendar className="text-amber-500" /> {formData.id ? 'Editar Férias' : 'Agendar Período'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Agente</label>
                <select 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-amber-500/50 focus:ring-0 outline-none"
                  value={formData.efetivo_id}
                  onChange={(e) => setFormData({...formData, efetivo_id: e.target.value})}
                >
                  <option value="">SELECIONE O AGENTE...</option>
                  {efetivo.map(e => (
                    <option key={e.id} value={e.id}>{e.posto_grad} {e.nome_guerra} ({e.matricula})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ano Ref.</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-amber-500/50 outline-none"
                    value={formData.ano_referencia}
                    onChange={(e) => setFormData({...formData, ano_referencia: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'AGENDADO' | 'GOZADO' | 'CANCELADO'})}
                  >
                    <option value="AGENDADO">AGENDADO</option>
                    <option value="GOZADO">GOZADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Início</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-amber-500/50 outline-none"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fim</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-amber-500/50 outline-none"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-muted-foreground"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20"
                >
                  {formData.id ? 'Atualizar Registro' : 'Salvar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
