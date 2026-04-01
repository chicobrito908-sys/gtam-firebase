"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  User,
  History,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RegistroBanco {
  id: string;
  efetivo_id: string;
  data: string;
  tipo: 'CREDITO' | 'DEBITO';
  horas: number;
  motivo: string;
  aprovado_por: string;
  efetivo?: {
    nome_guerra: string;
    matricula: string;
  };
}

export default function BancoHorasPage() {
  const [registros, setRegistros] = useState<RegistroBanco[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  interface EfetivoBasico {
    id: string;
    nome_guerra: string;
    matricula: string;
  }

  const [efetivo, setEfetivo] = useState<EfetivoBasico[]>([]);
  const [formData, setFormData] = useState({
    efetivo_id: "",
    data: new Date().toISOString().split('T')[0],
    tipo: "CREDITO",
    horas: 1,
    motivo: "",
    aprovado_por: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: regData } = await supabase
      .from("banco_horas")
      .select("*, efetivo:efetivo_id(nome_guerra, matricula)")
      .order("data", { ascending: false });
    
    const { data: efData } = await supabase
      .from("efetivo")
      .select("id, nome_guerra, matricula")
      .order("nome_guerra");

    if (regData) setRegistros(regData);
    if (efData) setEfetivo(efData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("banco_horas").insert([formData]);
    if (!error) {
      setShowModal(false);
      fetchData();
      setFormData({
        efetivo_id: "",
        data: new Date().toISOString().split('T')[0],
        tipo: "CREDITO",
        horas: 1,
        motivo: "",
        aprovado_por: ""
      });
    }
  };

  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    registros.forEach(r => {
      const id = r.efetivo_id;
      if (!balances[id]) balances[id] = 0;
      balances[id] += r.tipo === 'CREDITO' ? Number(r.horas) : -Number(r.horas);
    });
    return balances;
  };

  const balances = calculateBalances();
  const filteredRegistros = registros.filter(r => 
    r.efetivo?.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.efetivo?.matricula.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-[1600px] ml-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary-500/5">
            <Clock className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Banco de Horas</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Gestão de Créditos e Compensações • GTAM</p>
          </div>
        </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Lançar Horas
        </button>
      </div>

      {/* Grid: Balanço e Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d1117] border border-white/5 p-6 rounded-2xl flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total de Créditos (H)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-500">
              +{registros.filter(r => r.tipo === 'CREDITO').reduce((acc, r) => acc + Number(r.horas), 0)}
            </p>
            <TrendingUp size={16} className="text-emerald-500/50" />
          </div>
        </div>
        <div className="bg-[#0d1117] border border-white/5 p-6 rounded-2xl flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total de Débitos (H)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-rose-500">
              -{registros.filter(r => r.tipo === 'DEBITO').reduce((acc, r) => acc + Number(r.horas), 0)}
            </p>
            <TrendingDown size={16} className="text-rose-500/50" />
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Balanço Geral do Grupo</p>
          <p className="text-3xl font-black text-white">
            {Object.values(balances).reduce((acc, b) => acc + b, 0)}H
          </p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lado Esquerdo: Saldo dos Agentes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-muted-foreground" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Saldo por Agente</h3>
          </div>
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar shadow-sm">
            {efetivo.map(ef => {
              const balance = balances[ef.id] || 0;
              return (
                <div key={ef.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground uppercase">{ef.nome_guerra}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">{ef.matricula}</span>
                  </div>
                  <span className={`text-xs font-black ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {balance > 0 ? '+' : ''}{balance}H
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Histórico de Lançamentos */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={16} className="text-muted-foreground" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Histórico de Lançamentos</h3>
            </div>
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="PROCURAR NOS REGISTROS..." 
                className="w-full bg-[#0d1117] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-primary/50 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#090b10] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-black">Data</th>
                    <th className="px-6 py-4 font-black">Agente</th>
                    <th className="px-6 py-4 font-black">Motivo</th>
                    <th className="px-6 py-4 font-black text-center">Horas</th>
                    <th className="px-6 py-4 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <tr><td colSpan={5} className="py-10 text-center animate-pulse text-[10px] font-black uppercase opacity-40">Extraindo dados...</td></tr>
                  ) : filteredRegistros.map((reg) => (
                    <tr key={reg.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground">
                        {new Date(reg.data).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground uppercase tracking-tighter">{reg.efetivo?.nome_guerra}</span>
                          <span className="text-[8px] text-muted-foreground">{reg.efetivo?.matricula}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-[10px] text-muted-foreground italic font-medium">
                        &quot;{reg.motivo}&quot;
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${reg.tipo === 'CREDITO' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                          {reg.tipo === 'CREDITO' ? '+' : '-'}{reg.horas}H
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                          <CheckCircle2 size={10} /> APROVADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-white/5 bg-blue-500/5">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Plus className="text-blue-500" /> Novo Lançamento
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Agente</label>
                <select 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-blue-500/50 outline-none"
                  value={formData.efetivo_id}
                  onChange={(e) => setFormData({...formData, efetivo_id: e.target.value})}
                >
                  <option value="">SELECIONE O AGENTE...</option>
                  {efetivo.map(e => (
                    <option key={e.id} value={e.id}>{e.nome_guerra} ({e.matricula})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                  >
                    <option value="CREDITO">CRÉDITO (+)</option>
                    <option value="DEBITO">DÉBITO (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qtd Horas</label>
                  <input 
                    type="number" 
                    required
                    step="0.5"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500/50"
                    value={formData.horas}
                    onChange={(e) => setFormData({...formData, horas: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Motivo / Justificativa</label>
                <textarea 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-blue-500/50 min-h-[80px]"
                  placeholder="EX: SERVIÇO EXTRA CARNAVAL, APOIO OPERAÇÃO..."
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Aprovado Por (Escalante)</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-blue-500/50 outline-none"
                  value={formData.aprovado_por}
                  onChange={(e) => setFormData({...formData, aprovado_por: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-muted-foreground"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
