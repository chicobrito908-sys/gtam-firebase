"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Save, 
  Share2, 
  TrendingDown,
  AlertTriangle,
  Zap,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Agent {
  id: string;
  nome_guerra: string;
  posto_grad: string;
  matricula: string;
  antiguidade: number;
  servicos_04_count: number;
}

interface ScaleEntry {
  agentId: string;
  funcao: string; // 01, 02, 03, 04
  prefixo: string; // GTAM 01, GTAM 02, GTAM 03
}

export default function DailyScaleBuilder() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [efetivo, setEfetivo] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<ScaleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [turno, setTurno] = useState("24x72");

  // Load Efetivo
  useEffect(() => {
    async function loadEfetivo() {
      const { data } = await supabase
        .from("efetivo")
        .select("*")
        .eq("status", "ATIVO")
        .order("antiguidade", { ascending: true });
      
      setEfetivo(data || []);
    }
    loadEfetivo();
  }, []);

  const addToScale = (agentId: string, prefixo: string, funcao: string) => {
    if (selectedAgents.some(a => a.agentId === agentId)) return;
    setSelectedAgents(prev => [...prev, { agentId, prefixo, funcao }]);
  };

  const removeFromScale = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.agentId !== agentId));
  };

  const handleSave = async () => {
    if (selectedAgents.length === 0) {
      alert("Selecione ao menos um policial para a escala.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Limpar escalas anteriores deste dia/turno
      await supabase
        .from("escalas")
        .delete()
        .eq("data", date)
        .eq("turno", turno);

      // 2. Formatar dados
      const entries = selectedAgents.map(entry => ({
        data: date,
        turno: turno,
        efetivo_id: entry.agentId,
        equipe: entry.prefixo,
        funcao: entry.funcao
      }));

      // 3. Inserir
      const { error } = await supabase.from("escalas").insert(entries);
      if (error) throw error;
      
      // 4. Contador de 04
      const fourthAgents = selectedAgents.filter(a => a.funcao === "04");
      for (const f of fourthAgents) {
        const agent = getAgentById(f.agentId);
        if (agent) {
           await supabase
            .from("efetivo")
            .update({ servicos_04_count: (agent.servicos_04_count || 0) + 1 })
            .eq("id", f.agentId);
        }
      }

      alert("🛡️ Escala Salva com Sucesso!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar escala.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (selectedAgents.length === 0) {
      alert("Monte a escala antes de publicar.");
      return;
    }
    
    let text = `*🛡️ ESCALA OPERACIONAL GTAM - ${new Date(date).toLocaleDateString('pt-BR')}*\n`;
    text += `*🕒 TURNO:* ${turno.toUpperCase()}\n\n`;

    const teams = ["GTAM 01", "GTAM 02", "GTAM 03"];
    teams.forEach(team => {
      const teamAgents = selectedAgents.filter(a => a.prefixo === team);
      if (teamAgents.length > 0) {
        text += `🏍️ *${team}*\n`;
        teamAgents.forEach(entry => {
          const ag = getAgentById(entry.agentId);
          if (ag) {
            text += `• ${entry.funcao}: ${ag.posto_grad} ${ag.nome_guerra}\n`;
          }
        });
        text += `\n`;
      }
    });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getAgentById = (id: string) => efetivo.find(a => a.id === id);

  const renderMotoSlot = (prefixo: string, funcao: string, label: string) => {
    const entry = selectedAgents.find(a => a.prefixo === prefixo && a.funcao === funcao);
    const agent = entry ? getAgentById(entry.agentId) : null;

    return (
      <div className={`p-4 rounded-2xl border min-h-[100px] flex flex-col justify-center transition-all ${
        agent 
        ? 'bg-blue-600/10 border-blue-500/30 shadow-lg shadow-black/20' 
        : 'bg-black/20 border-white/5 border-dashed hover:border-white/20'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
          {agent && (
            <button onClick={() => removeFromScale(agent.id)} className="text-muted-foreground hover:text-rose-500 p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        {agent ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase">{agent.nome_guerra}</span>
              {funcao === "04" && agent.servicos_04_count > 5 && (
                 <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-tighter">
              {agent.posto_grad} • {agent.matricula}
            </p>
          </div>
        ) : (
          <div className="text-[10px] font-bold text-muted-foreground/20 uppercase text-center py-2">
            Vago
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2 overflow-x-hidden">
      {/* 📋 Disponíveis Lateral */}
      <div className="xl:col-span-3 space-y-4 order-2 xl:order-1">
        <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-500" />
            Integrantes
          </h3>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {efetivo.map((agent) => {
              const isUsed = selectedAgents.some(a => a.agentId === agent.id);
              return (
                <div 
                  key={agent.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-1 group relative ${
                    isUsed 
                    ? 'opacity-30 pointer-events-none border-transparent bg-white/5' 
                    : 'bg-white/[0.02] border-white/5 hover:border-blue-500/40 cursor-default shadow-lg shadow-black/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase">{agent.nome_guerra}</span>
                    <span className="text-[9px] font-black text-muted-foreground/40">{agent.posto_grad}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => addToScale(agent.id, "GTAM 01", "01")} className="bg-blue-600/20 hover:bg-blue-600 text-[9px] font-black p-1.5 rounded-lg text-blue-400 hover:text-white transition-all shadow-lg active:scale-90">01</button>
                      <button onClick={() => addToScale(agent.id, "GTAM 02", "02")} className="bg-blue-600/20 hover:bg-blue-600 text-[9px] font-black p-1.5 rounded-lg text-blue-400 hover:text-white transition-all shadow-lg active:scale-90">02</button>
                      <button onClick={() => addToScale(agent.id, "GTAM 03", "03")} className="bg-blue-600/20 hover:bg-blue-600 text-[9px] font-black p-1.5 rounded-lg text-blue-400 hover:text-white transition-all shadow-lg active:scale-90">03</button>
                      <button onClick={() => addToScale(agent.id, "GTAM 03", "04")} className="bg-rose-600/20 hover:bg-rose-600 text-[9px] font-black p-1.5 rounded-lg text-rose-400 hover:text-white transition-all shadow-lg active:scale-90">04</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🏍️ Workspace de Montagem */}
      <div className="xl:col-span-9 space-y-6 order-1 xl:order-2">
        <div className="bg-card border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-20 -right-20 p-20 opacity-[0.02] rotate-12 pointer-events-none">
            <Shield size={400} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none text-3xl font-black text-white p-0 focus:ring-0 outline-none w-fit uppercase cursor-pointer hover:text-blue-400 transition-colors"
                />
                <Calendar className="absolute -right-8 top-1 text-blue-600 pointer-events-none" size={20} />
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div>
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                   Montagem Operacional GTAM
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select 
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all uppercase appearance-none cursor-pointer"
              >
                <option value="24x72">24x72</option>
                <option value="Manhã">07h-19h</option>
                <option value="Tarde">19h-07h</option>
              </select>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/40 active:scale-95 text-xs uppercase tracking-[0.2em]"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                Salvar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-12">
            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-lg">01</div>
                <h4 className="font-black uppercase tracking-tighter text-xl text-white">GTAM 01</h4>
              </div>
              {renderMotoSlot("GTAM 01", "01", "Piloto 01")}
            </div>

            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-lg">02</div>
                <h4 className="font-black uppercase tracking-tighter text-xl text-white">GTAM 02</h4>
              </div>
              {renderMotoSlot("GTAM 02", "02", "Piloto 02")}
            </div>

            <div className="space-y-5 bg-blue-600/[0.03] p-6 rounded-[32px] border border-blue-500/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-lg">03</div>
                <h4 className="font-black uppercase tracking-tighter text-xl text-white">GTAM 03</h4>
              </div>
              <div className="space-y-3">
                {renderMotoSlot("GTAM 03", "03", "Piloto 03")}
                {renderMotoSlot("GTAM 03", "04", "Garupa (04)")}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex justify-end relative z-10">
             <button 
                onClick={handleShare}
                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black transition-all border border-white/10 shadow-2xl text-[10px] uppercase tracking-[0.3em] group"
              >
                <Share2 size={18} className="text-blue-400 group-hover:scale-110 transition-transform" /> 
                <span>Publicar WhatsApp</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
