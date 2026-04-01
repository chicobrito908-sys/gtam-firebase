"use client";

import { useEffect, useState } from "react";
import { 
  XSquare, 
  Plus, 
  Search, 
  FileText,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Falta {
  id: string;
  efetivo_id: string;
  data: string;
  tipo: string;
  justificativa: string;
  status: string;
  efetivo?: {
    nome_guerra: string;
    matricula: string;
    posto_grad: string;
  };
}

export default function FaltasPage() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  const statItems = [
    { label: "Mês Atual", value: faltas.filter(f => f.data.startsWith(new Date().toISOString().slice(0, 7))).length, color: "text-white" },
    { label: "Injustificadas", value: faltas.filter(f => f.tipo === 'INJUSTIFICADA').length, color: "text-rose-500" },
    { label: "Justificadas", value: faltas.filter(f => f.tipo === 'JUSTIFICADA').length, color: "text-amber-500" },
    { label: "Total Geral", value: faltas.length, color: "text-muted-foreground" },
  ];
  
  // Form State
  const [efetivo, setEfetivo] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    efetivo_id: "",
    data: new Date().toISOString().split('T')[0],
    tipo: "INJUSTIFICADA",
    justificativa: "",
    status: "REGISTRADO"
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: fData } = await supabase
      .from("faltas")
      .select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)")
      .order("data", { ascending: false });
    
    const { data: efData } = await supabase
      .from("efetivo")
      .select("id, nome_guerra, matricula, posto_grad")
      .order("nome_guerra");

    if (fData) setFaltas(fData);
    if (efData) setEfetivo(efData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("faltas").insert([formData]);
    if (!error) {
      setShowModal(false);
      fetchData();
      setFormData({
        efetivo_id: "",
        data: new Date().toISOString().split('T')[0],
        tipo: "INJUSTIFICADA",
        justificativa: "",
        status: "REGISTRADO"
      });
    }
  };

  const filteredFaltas = faltas.filter(f => 
    f.efetivo?.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.efetivo?.matricula.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-[1600px] ml-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <XSquare className="text-rose-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Registro de Faltas</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Controle de Assiduidade e Ocorrências • GTAM</p>
          </div>
        </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus size={16} /> Lançar Falta
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
          <div key={i} className="bg-[#0d1117] border border-white/5 p-4 rounded-2xl shadow-sm">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="PESQUISAR AGENTE OU MATRÍCULA..." 
            className="w-full bg-card border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:border-rose-500/50 focus:ring-0 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#090b10] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 font-black">Agente</th>
                  <th className="px-6 py-4 font-black">Tipo</th>
                  <th className="px-6 py-4 font-black">Justificativa</th>
                  <th className="px-6 py-4 font-black text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center animate-pulse uppercase font-black text-[10px] opacity-40">Consultando Banco...</td></tr>
                ) : filteredFaltas.map((f) => (
                  <tr key={f.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <History size={12} />
                        {new Date(f.data).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground group-hover:text-rose-400 transition-colors uppercase tracking-tighter">{f.efetivo?.nome_guerra}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{f.efetivo?.matricula}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-wider ${
                        f.tipo === 'INJUSTIFICADA' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                      }`}>
                        {f.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-[10px] text-muted-foreground italic">
                      {f.justificativa || "SEM JUSTIFICATIVA REGISTRADA"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFaltas.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center opacity-30">
                      <ShieldAlert size={40} className="mx-auto mb-4 text-emerald-500" />
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhuma falta registrada no período</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Registro de Falta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 bg-rose-500/5">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <AlertTriangle className="text-rose-500" /> Registrar Ausência
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Agente Escalado</label>
                <select 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold uppercase focus:border-rose-500/50 outline-none transition-all"
                  value={formData.efetivo_id}
                  onChange={(e) => setFormData({...formData, efetivo_id: e.target.value})}
                >
                  <option value="">SELECIONE O AGENTE...</option>
                  {efetivo.map(e => (
                    <option key={e.id} value={e.id}>{e.posto_grad} {e.nome_guerra} ({e.matricula})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data da Ocorrência</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:border-rose-500/50 outline-none transition-all"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Falta</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold uppercase focus:border-rose-500/50 outline-none transition-all"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="INJUSTIFICADA">INJUSTIFICADA</option>
                    <option value="JUSTIFICADA">JUSTIFICADA</option>
                    <option value="SERVIÇO EXTERNO">SERVIÇO EXTERNO</option>
                    <option value="OUTROS">OUTROS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Justificativa / Observações</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold uppercase focus:border-rose-500/50 outline-none min-h-[100px] transition-all"
                  placeholder="DESCREVA O MOTIVO DA AUSÊNCIA..."
                  value={formData.justificativa}
                  onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-muted-foreground"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                >
                  Confirmar Registro <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
