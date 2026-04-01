"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Save,
  Filter,
  Search,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import DailyScaleBuilder from "@/components/DailyScaleBuilder";

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthParam = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const parseMonthParam = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(year, month - 1, 1);
};

function EscalasGradePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMonth = parseMonthParam(searchParams.get("month")) ?? getMonthStart(new Date());

  const [efetivo, setEfetivo] = useState<any[]>([]);
  const [escalasLookup, setEscalasLookup] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(initialMonth);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCellModal, setShowCellModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"mensal" | "diaria">("mensal");
  const [selectedCell, setSelectedCell] = useState<{
    agentId: string;
    agentName: string;
    day: number;
    date: string;
    escala?: any;
  } | null>(null);
  const [cellFormData, setCellFormData] = useState({
    turno: "24x72",
    equipe: "ALFA",
    funcao: "Patrulheiro",
  });

  // Bulk Form State
  const [bulkData, setBulkData] = useState({
    selectedAgents: [] as string[],
    dateStart: formatLocalDate(new Date()),
    dateEnd: formatLocalDate(new Date()),
    turno: "24x72",
    equipe: "ALFA",
    funcao: "Patrulheiro",
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const firstDay = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      const lastDay = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), daysInMonth));

      // 1. Buscar Efetivo
      const { data: efData } = await supabase
        .from("efetivo")
        .select("id, nome_guerra, posto_grad, matricula")
        .eq("status", "ATIVO")
        .order("nome_guerra", { ascending: true });

      // 2. Buscar Escalas do Mês
      const { data: escData } = await supabase
        .from("escalas")
        .select("efetivo_id, data, turno, equipe, funcao")
        .gte("data", firstDay)
        .lte("data", lastDay);

      const nextEscalas: any[] = Array.isArray(escData) ? escData : [];
      const nextLookup = nextEscalas.reduce((acc: Record<string, any>, escala: any) => {
        acc[`${escala.efetivo_id}:${escala.data}`] = escala;
        return acc;
      }, {});

      setEfetivo(efData || []);
      setEscalasLookup(nextLookup);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  useEffect(() => {
    if (!searchParams.get("month")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", formatMonthParam(currentDate));
      router.replace(`/escalas?${params.toString()}`);
    }
  }, [currentDate, router, searchParams]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", formatMonthParam(newDate));
    router.replace(`/escalas?${params.toString()}`);
  };

  const getEscalaForDay = (agentId: string, day: number) => {
    const dateStr = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return escalasLookup[`${agentId}:${dateStr}`];
  };

  const openCellModal = (agent: any, day: number) => {
    const date = formatLocalDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const escala = escalasLookup[`${agent.id}:${date}`];

    setSelectedCell({
      agentId: agent.id,
      agentName: agent.nome_guerra,
      day,
      date,
      escala,
    });
    setCellFormData({
      turno: escala?.turno || "24x72",
      equipe: escala?.equipe || "ALFA",
      funcao: escala?.funcao || "Patrulheiro",
    });
    setShowCellModal(true);
  };

  const closeCellModal = () => {
    setShowCellModal(false);
    setSelectedCell(null);
  };

  const filteredEfetivo = efetivo.filter(e => 
    String(e.nome_guerra || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(e.matricula || "").includes(searchTerm)
  );

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkData.selectedAgents.length === 0) {
      alert("Selecione pelo menos um agente.");
      return;
    }

    setLoading(true);
    try {
      const start = new Date(bulkData.dateStart);
      const end = new Date(bulkData.dateEnd);
      const inserts = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = formatLocalDate(d);
        
        for (const agentId of bulkData.selectedAgents) {
          inserts.push({
            efetivo_id: agentId,
            data: dateStr,
            turno: bulkData.turno,
            equipe: bulkData.equipe,
            funcao: bulkData.funcao,
            status: 'CONFIRMADO'
          });
        }
      }

      const { error } = await supabase.from("escalas").upsert(inserts, { onConflict: 'data,efetivo_id' });
      if (error) throw error;

      setShowBulkModal(false);
      fetchData();
    } catch (error: any) {
      alert("Erro ao salvar escalas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentSelection = (id: string) => {
    setBulkData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(id) 
        ? prev.selectedAgents.filter(a => a !== id)
        : [...prev.selectedAgents, id]
    }));
  };

  const handleCellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("escalas")
        .upsert([
          {
            efetivo_id: selectedCell.agentId,
            data: selectedCell.date,
            turno: cellFormData.turno,
            equipe: cellFormData.equipe,
            funcao: cellFormData.funcao,
            status: "CONFIRMADO",
          }
        ], { onConflict: "data,efetivo_id" });

      if (error) throw error;

      closeCellModal();
      await fetchData();
    } catch (error: any) {
      alert("Erro ao salvar escala: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellDelete = async () => {
    if (!selectedCell?.escala) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("escalas")
        .delete()
        .eq("efetivo_id", selectedCell.agentId)
        .eq("data", selectedCell.date);

      if (error) throw error;

      closeCellModal();
      await fetchData();
    } catch (error: any) {
      alert("Erro ao excluir escala: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pl-4 py-8 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-lg shadow-blue-500/5">
            <CalendarIcon className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Grade de Escalas</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">GMF / GTAM - Planejamento Mensal</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="bg-card border border-white/5 rounded-xl p-1 flex items-center shadow-lg">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <span className="px-6 text-xs font-black uppercase tracking-[0.2em] min-w-[180px] text-center">
              {monthName}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />

          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab("mensal")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "mensal" ? "bg-blue-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
            >
              Grade Mensal
            </button>
            <button 
              onClick={() => setActiveTab("diaria")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "diaria" ? "bg-blue-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
            >
              Montagem de Serviço
            </button>
          </div>

          <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />

          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-black transition-all border border-white/5 active:scale-95 uppercase tracking-wider text-xs"
          >
            <Plus size={18} />
            <span>Escala Coletiva</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "mensal" ? (
          <motion.div 
            key="mensal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Controls & Search */}
            <div className="flex items-center gap-4 px-2">
              <div className="relative flex-1 max-w-sm group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Filtrar por nome ou matrícula..."
                  className="w-full bg-card border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs focus:ring-2 focus:ring-blue-500/30 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-3 bg-card border border-white/5 rounded-xl text-muted-foreground hover:text-white transition-all shadow-lg">
                <Filter size={18} />
              </button>
            </div>

            {/* Grade Table */}
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto custom-scrollbar scroll-smooth">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="px-6 py-4 sticky left-0 z-20 bg-card border-r border-white/5 min-w-[220px]">Integrante</th>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        return (
                          <th key={day} className={`px-2 py-4 text-center min-w-[45px] ${isWeekend ? 'bg-white/[0.03] text-blue-400' : ''}`}>
                            {day}<br/>
                            <span className="text-[7px] opacity-40">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 1)}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredEfetivo.map((agent) => (
                      <tr key={agent.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-3 sticky left-0 z-10 bg-card border-r border-white/5 group-hover:bg-card/80 backdrop-blur-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground truncate max-w-[180px]">{agent.nome_guerra}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">
                              {agent.posto_grad} • {agent.matricula}
                            </span>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const escala = getEscalaForDay(agent.id, day);
                          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                          
                          return (
                            <td key={day} className={`p-1 text-center border-r border-white/2 last:border-0 ${isToday ? 'bg-blue-500/5 ring-1 ring-inset ring-blue-500/20' : ''}`}>
                              <button
                                type="button"
                                onClick={() => openCellModal(agent, day)}
                                className="w-full aspect-square flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                title={escala ? `${escala.turno} - ${escala.equipe}` : `Lançar escala em ${day}/${currentDate.getMonth() + 1}`}
                              >
                                {escala ? (
                                  <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`w-full aspect-square flex items-center justify-center rounded-lg text-[8px] font-black shadow-lg shadow-black/20 ${
                                      escala.turno === '24x72' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/10' :
                                      escala.turno === 'Manhã' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/10' :
                                      'bg-blue-600/20 text-blue-400 border border-blue-500/10'
                                    }`}
                                  >
                                    {escala.turno === '24x72' ? '24' : escala.turno[0]}
                                  </motion.div>
                                ) : (
                                  <span className="text-[10px] font-black text-white/15">+</span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-6 px-4 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-t border-white/5 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-600/20 border border-purple-500/20" />
                <span>Serviço 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-600/20 border border-amber-500/20" />
                <span>Turno Manhã (2x2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-600/20 border border-blue-500/20" />
                <span>Turno Tarde (2x2)</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="diaria"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <DailyScaleBuilder />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCellModal && selectedCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCellModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="font-black uppercase tracking-widest text-sm">
                    {selectedCell.escala ? "Editar Escala" : "Nova Escala"}
                  </h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    {selectedCell.agentName} • {new Date(selectedCell.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button onClick={closeCellModal} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCellSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turno</label>
                  <select
                    value={cellFormData.turno}
                    onChange={(e) => setCellFormData({ ...cellFormData, turno: e.target.value })}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="24x72" className="text-black">24x72 (Ordinário)</option>
                    <option value="Manhã" className="text-black">Turno Manhã</option>
                    <option value="Tarde" className="text-black">Turno Tarde</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipe</label>
                    <input
                      type="text"
                      value={cellFormData.equipe}
                      onChange={(e) => setCellFormData({ ...cellFormData, equipe: e.target.value.toUpperCase() })}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Função</label>
                    <input
                      type="text"
                      value={cellFormData.funcao}
                      onChange={(e) => setCellFormData({ ...cellFormData, funcao: e.target.value })}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  {selectedCell.escala && (
                    <button
                      type="button"
                      onClick={handleCellDelete}
                      disabled={loading}
                      className="px-4 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-rose-500/20"
                    >
                      Excluir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeCellModal}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-muted-foreground rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBulkModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <Shield size={18} className="text-blue-500" />
                  Lançamento Operacional Coletivo
                </h2>
                <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left: Agents Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <span>Selecionar Integrantes ({bulkData.selectedAgents.length})</span>
                      <button type="button" onClick={() => setBulkData(d => ({...d, selectedAgents: filteredEfetivo.map(e => e.id)}))} className="text-blue-400 hover:underline">Todos</button>
                    </label>
                    <div className="bg-black/20 border border-white/5 rounded-2xl h-[300px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {filteredEfetivo.map(ef => (
                        <div key={ef.id} 
                          onClick={() => toggleAgentSelection(ef.id)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                            bulkData.selectedAgents.includes(ef.id) 
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-xs font-bold">{ef.nome_guerra}</span>
                          <span className="text-[9px] font-black opacity-40">{ef.matricula}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Scale Details */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Início</label>
                        <input type="date" required value={bulkData.dateStart}
                          onChange={(e) => setBulkData({...bulkData, dateStart: e.target.value})}
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fim</label>
                        <input type="date" required value={bulkData.dateEnd}
                          onChange={(e) => setBulkData({...bulkData, dateEnd: e.target.value})}
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turno de Serviço</label>
                      <select value={bulkData.turno} onChange={(e) => setBulkData({...bulkData, turno: e.target.value})}
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none">
                        <option value="24x72" className="text-black">24x72 (Ordinário)</option>
                        <option value="Manhã" className="text-black">Turno Manhã (07h às 19h)</option>
                        <option value="Tarde" className="text-black">Turno Tarde (19h às 07h)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipe</label>
                        <input type="text" value={bulkData.equipe} onChange={(e) => setBulkData({...bulkData, equipe: e.target.value.toUpperCase()})}
                          placeholder="EX: ALFA" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Função</label>
                        <input type="text" value={bulkData.funcao} onChange={(e) => setBulkData({...bulkData, funcao: e.target.value})}
                          placeholder="EX: Patrulheiro" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <button type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        Lançar Escalas
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EscalasGradePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-in fade-in duration-500 pl-4 py-8 max-w-[100vw] overflow-x-hidden">
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Carregando grade de escalas...
            </p>
          </div>
        </div>
      }
    >
      <EscalasGradePageContent />
    </Suspense>
  );
}
