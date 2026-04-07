"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  Star,
  Users,
  Zap,
  UserPlus,
  Clock,
  LayoutDashboard,
  Trash2,
  Trash
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import DailyScaleBuilder from "@/components/DailyScaleBuilder";

type Escala = {
  id?: string;
  efetivo_id: string;
  data: string;
  turno?: string;
  equipe?: string;
  funcao?: string;
  status?: string;
  efetivo?: {
    nome_guerra?: string;
    posto_grad?: string;
  } | null;
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function todayStrFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const formatDateToPortuguese = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};

export default function EscalasPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(() => todayStrFromDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [missoes, setMissoes] = useState<any[]>([]);
  const [ausencias, setAusencias] = useState<any[]>([]);
  const [newAfastamentos, setNewAfastamentos] = useState<any[]>([]);
  const [newFerias, setNewFerias] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [addingAusencia, setAddingAusencia] = useState<string | null>(null);
  const [efetivo, setEfetivo] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data } = await supabase
        .from("escalas")
        .select("id, efetivo_id, data, turno, equipe, funcao, status, efetivo:efetivo_id(nome_guerra, posto_grad)")
        .gte("data", todayStrFromDate(firstDate))
        .lte("data", todayStrFromDate(lastDate));

      setEscalas(Array.isArray(data) ? (data as Escala[]) : []);

      const { data: missoesData } = await supabase
        .from("missoes_diarias")
        .select("*")
        .eq("data", selectedDay);
      
      setMissoes(Array.isArray(missoesData) ? missoesData : []);

      const { data: ausenciasData } = await supabase
        .from("ausencias")
        .select("*, efetivo:efetivo_id(nome_guerra, posto_grad)")
        .gte("data", todayStrFromDate(firstDate))
        .lte("data", todayStrFromDate(lastDate));
      
      setAusencias(Array.isArray(ausenciasData) ? ausenciasData : []);

      // Busca novos Afastamentos
      const { data: afData } = await supabase
        .from("afastamentos")
        .select("*, efetivo:efetivo_id(nome_guerra, posto_grad)")
        .gte("data_inicio", todayStrFromDate(firstDate))
        .lte("data_inicio", todayStrFromDate(lastDate));
      setNewAfastamentos(afData || []);

      // Busca Férias
      const { data: feData } = await supabase
        .from("ferias")
        .select("*, efetivo:efetivo_id(nome_guerra, posto_grad)")
        .gte("data_inicio", todayStrFromDate(firstDate))
        .lte("data_inicio", todayStrFromDate(lastDate));
      setNewFerias(feData || []);
      
      const { data: efetivoData } = await supabase.from("efetivo").select("*").eq("status", "ATIVO");
      setEfetivo(Array.isArray(efetivoData) ? efetivoData : []);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedDay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const handleAddAusencia = async (efetivoId: string, tipo: string) => {
     if (!addingAusencia) return;
     const { error } = await supabase.from("ausencias").insert([{
        data: addingAusencia,
        efetivo_id: efetivoId,
        tipo,
        status: "ATIVO"
     }]);

     if (!error) {
        setAddingAusencia(null);
        fetchData();
        alert("🛡️ Ausência registrada com sucesso!");
     }
  };

  const removeAusencia = async (id: string) => {
     if (!confirm("Remover este registro de ausência?")) return;
     const { error } = await supabase.from("ausencias").delete().eq("id", id);
     if (!error) fetchData();
  };

  const VTRCard = ({ equipe, members }: { equipe: string, members: any[] }) => {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 hover:border-primary/40 transition-all group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-xl text-primary"><Shield size={14} /></div>
            <span className="text-sm font-black text-white uppercase tracking-tighter">{equipe}</span>
          </div>
          <span className="text-[10px] font-black text-primary/40">{members.length} PX</span>
        </div>
        <div className="space-y-2">
          {members.map((m, idx) => (
            <div key={idx} className="flex flex-col border-l-2 border-white/5 pl-3">
              <span className="text-[11px] font-black text-white/90 uppercase">{m.efetivo?.nome_guerra}</span>
              <span className="text-[9px] font-bold text-white/30 uppercase">{m.efetivo?.posto_grad}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (view === 'builder') {
    return (
      <div className="min-h-screen bg-[#0d1117] p-4 md:p-8">
        <button
          onClick={() => { setView('dashboard'); fetchData(); }}
          className="mb-8 flex items-center gap-2 text-primary hover:text-primary/80 font-black uppercase tracking-widest text-xs transition-all"
        >
          <ChevronLeft size={16} /> Voltar ao Dashboard
        </button>
        <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-card/40 backdrop-blur-xl">
          <DailyScaleBuilder 
            initialDate={selectedDay} 
            globalAusencias={ausencias}
            afastamentos={newAfastamentos}
            ferias={newFerias}
          />
        </div>
      </div>
    );
  }

  const dayEscalas = escalas.filter(e => e.data === selectedDay);
  const supervisao = dayEscalas.find(e => e.equipe === "SUPERVISÃO");
  const armaria = dayEscalas.find(e => e.equipe === "ARMARIA");
  // Filtro corrigido para BI e BII
  const vtrsBI = dayEscalas.filter(e => e.funcao === "BI");
  const vtrsBII = dayEscalas.filter(e => e.funcao === "BII");
  // Guarnição de Apoio (Titulares que não são a Guarnição base nem Comando)
  const guarnicaoApoio = dayEscalas.filter(e => 
    e.funcao === "TITULAR" && 
    !["SUPERVISÃO", "ARMARIA", "GUARNIÇÃO"].includes(e.equipe || "")
  );
  // Guarnição Base 24h
  const guarnicaoBase = dayEscalas.filter(e => e.equipe === "GUARNIÇÃO");

  return (
    <div className="space-y-12 px-4 md:px-6 py-10 max-w-[1600px] mx-auto min-h-screen bg-[#0d1117]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Painel de <span className="text-primary">Escalas</span></h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
             {(() => {
               const [y, m, d] = selectedDay.split('-').map(Number);
               const dateObj = new Date(y, m - 1, d, 12, 0, 0);
               const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
               return `${weekdays[dateObj.getDay()]}, ${d} de ${MONTHS[m - 1]}`;
             })()}
          </p>
        </div>
        <button
          onClick={() => setView('builder')}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
            dayEscalas.length > 0 
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_10px_30px_rgba(245,158,11,0.25)]' 
              : 'bg-primary hover:bg-primary/90 text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)]'
          }`}
        >
          {dayEscalas.length > 0 ? <Zap size={18} /> : <CalendarDays size={18} />}
          {dayEscalas.length > 0 ? 'Gerenciar / Editar Equipes' : 'Criar Nova Escala'}
        </button>
      </div>

      {/* DASHBOARD RELATÓRIO OPERACIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* COLUNA COMANDO (SUPERVISÃO / ARMARIA / AFASTAMENTOS) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <LayoutDashboard size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">SUPERVISÃO</span>
            </div>
            {supervisao ? (
              <div className="flex flex-col">
                <span className="text-xl font-black text-white uppercase">{supervisao.efetivo?.nome_guerra}</span>
                <span className="text-xs font-bold text-purple-400/60 uppercase">{supervisao.efetivo?.posto_grad}</span>
              </div>
            ) : <span className="text-xs font-bold text-white/10 uppercase italic">Não Escalado</span>}
          </div>

          <div className="bg-amber-600/10 border border-amber-500/20 p-6 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Zap size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">ARMARIA</span>
            </div>
            {armaria ? (
              <div className="flex flex-col">
                <span className="text-xl font-black text-white uppercase">{armaria.efetivo?.nome_guerra}</span>
                <span className="text-xs font-bold text-amber-400/60 uppercase">{armaria.efetivo?.posto_grad}</span>
              </div>
            ) : <span className="text-xs font-bold text-white/10 uppercase italic">Não Escalado</span>}
          </div>

          <div className="bg-rose-600/5 border border-rose-500/10 p-6 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-rose-400 mb-4">
              <Shield size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">AFASTAMENTOS / FOLGAS</span>
            </div>
            <div className="space-y-2">
              {ausencias.filter(a => a.data === selectedDay).map((a, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">{a.efetivo?.nome_guerra}</span>
                    <span className={`text-[8px] font-bold uppercase ${a.tipo === 'ATESTADO' ? 'text-rose-500' : a.tipo === 'LICENCA' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {a.tipo}
                    </span>
                  </div>
                  <button onClick={() => removeAusencia(a.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {ausencias.filter(a => a.data === selectedDay).length === 0 && (
                <p className="text-[10px] font-bold text-white/5 uppercase text-center py-4 italic">QAP Total</p>
              )}
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] space-y-4 flex-1">
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <UserPlus size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">GUARNIÇÃO APOIO</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* Primeiro a Guarnição Base 24h */}
              {guarnicaoBase.length > 0 && (
                <div className="space-y-1 mb-4">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">GTAM BASE (24H)</span>
                  {guarnicaoBase.map((m, idx) => (
                    <div key={`base-${idx}`} className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <span className="text-xs font-black text-white uppercase">{m.efetivo?.nome_guerra}</span>
                      <span className="text-[9px] font-bold text-primary/50 uppercase">{m.efetivo?.posto_grad}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Depois as Equipes de Apoio Extras */}
              {guarnicaoApoio.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">EQUIPES EXTRAS</span>
                  {guarnicaoApoio.map((m, idx) => (
                    <div key={`apoio-${idx}`} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase">{m.efetivo?.nome_guerra}</span>
                        <span className="text-[8px] font-black text-blue-400/40 uppercase tracking-tighter">{m.equipe}</span>
                      </div>
                      <span className="text-[9px] font-bold text-blue-400/50 uppercase">{m.efetivo?.posto_grad}</span>
                    </div>
                  ))}
                </div>
              )}
              {guarnicaoBase.length === 0 && guarnicaoApoio.length === 0 && (
                <span className="text-xs font-bold text-white/5 uppercase text-center py-4 italic">Sem Apoio Escalado</span>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <Clock size={18} className="text-primary" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Rondas: Turno I (06-14h)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from(new Set(vtrsBI.map(d => d.equipe))).map((v, idx) => (
                <VTRCard key={idx} equipe={v || ""} members={vtrsBI.filter(d => d.equipe === v)} />
              ))}
              {vtrsBI.length === 0 && <p className="col-span-full py-10 text-center text-white/5 font-black uppercase text-xs border border-dashed border-white/5 rounded-3xl italic">Nenhuma VTR Escalada</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
              <Clock size={18} className="text-blue-500" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Rondas: Turno II (15-23h)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from(new Set(vtrsBII.map(d => d.equipe))).map((v, idx) => (
                <VTRCard key={idx} equipe={v || ""} members={vtrsBII.filter(d => d.equipe === v)} />
              ))}
              {vtrsBII.length === 0 && <p className="col-span-full py-10 text-center text-white/5 font-black uppercase text-xs border border-dashed border-white/5 rounded-3xl italic">Nenhuma VTR Escalada</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                 <Shield className="text-emerald-500" size={20} />
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Informações</h3>
                    <p className="text-[9px] font-bold text-white/20 uppercase">Inteligência Operacional</p>
                 </div>
              </div>

              <div className="space-y-6 flex-1">
                 {missoes.length > 0 ? missoes.map((m, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const label = m.tipo === 'ALERTA' ? '⚠️ OBS' : '🏙 ÁREA';
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className={`p-5 rounded-3xl border cursor-pointer transition-all ${m.tipo === 'ALERTA' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/5'} flex gap-4 rotate-in group shadow-sm hover:shadow-md`} 
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                         <div className="mt-1">
                            {m.tipo === 'ALERTA' ? <Zap size={16} className="text-amber-500" /> : <Star size={16} className="text-emerald-500" />}
                         </div>
                         <div className="flex flex-col gap-1 w-full">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${m.tipo === 'ALERTA' ? 'text-amber-500' : 'text-emerald-500'}`}>{label}</span>
                            <p className={`text-xs font-bold text-white/80 leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                               {m.descricao}
                            </p>
                            {!isExpanded && m.descricao.length > 60 && (
                               <span className="text-[8px] font-bold text-white/20 uppercase mt-1 group-hover:text-primary transition-colors">Ver tudo...</span>
                            )}
                         </div>
                      </div>
                    );
                 }) : (
                   <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
                      <LayoutDashboard size={40} className="text-white" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma missão<br/>atribuída hoje</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase">
                    <span>QAP Total</span>
                    <span className="text-emerald-500/40">GTAM-BOARD v2</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <section className="bg-card/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Calendário Mensal</h3>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground transition-all"><ChevronLeft size={20} /></button>
            <span className="text-xs font-black uppercase text-white min-w-[150px] text-center">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {WEEK_DAYS.map(day => (<div key={day} className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{day}</div>))}
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, "0");
            const d = String(day).padStart(2, "0");
            const dateStr = `${y}-${m}-${d}`;
            const isSelected = dateStr === selectedDay;
            const hasData = escalas.some(e => e.data === dateStr);
            const dayAusencias = ausencias.filter(a => a.data === dateStr);

            return (
              <div key={dateStr} className="relative group/cell">
                <button 
                  onClick={() => setSelectedDay(dateStr)} 
                  onDoubleClick={() => setAddingAusencia(dateStr)}
                  title="Duplo clique para registrar folga/ausência"
                  className={`w-full aspect-square rounded-2xl transition-all relative flex flex-col items-center justify-center border ${isSelected ? 'bg-primary border-primary shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                >
                  <span className={`text-base md:text-xl font-black ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{String(day).padStart(2, '0')}</span>
                  <div className="flex gap-1 mt-1">
                    {dayAusencias.some(a => a.tipo === 'FOLGA') && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    {dayAusencias.some(a => a.tipo === 'LICENCA') && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                    {dayAusencias.some(a => a.tipo === 'ATESTADO') && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                  </div>
                  {hasData && !isSelected && (<div className="absolute bottom-2 w-1 h-1 bg-primary/40 rounded-full" />)}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {addingAusencia && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#1a1f26] border border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-[0_0_100px_rgba(124,58,237,0.2)] space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Registrar Ausência</h3>
                 <button onClick={() => setAddingAusencia(null)} className="text-white/20 hover:text-white"><Trash2 size={24} className="rotate-45" /></button>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest italic">{addingAusencia && formatDateToPortuguese(addingAusencia)}</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 block mb-3">Selecione o Guerreiro</label>
                    <select id="agent-select" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all">
                       {efetivo.map(a => <option key={a.id} value={a.id} className="bg-[#1a1f26]">{a.posto_grad} {a.nome_guerra}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 block mb-3">Tipo de Afastamento</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['FOLGA', 'LICENCA', 'ATESTADO'].map(t => (
                          <button 
                            key={t}
                            onClick={() => {
                               const agentId = (document.getElementById('agent-select') as HTMLSelectElement).value;
                               handleAddAusencia(agentId, t);
                            }}
                            className={`py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${t === 'FOLGA' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500' : t === 'LICENCA' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500'} hover:text-white`}
                          >
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
