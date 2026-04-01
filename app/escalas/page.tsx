"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  Plus,
  Save,
  Shield,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Efetivo = {
  id: string;
  nome_guerra?: string;
  nome_completo?: string;
  matricula?: string;
  posto_grad?: string;
  status?: string;
  tipo_escala?: string;
  grupo_turno?: string;
};

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
    matricula?: string;
    posto_grad?: string;
  } | null;
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function todayStrFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr() {
  return todayStrFromDate(new Date());
}

function parseDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`);
}

function formatDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatShortDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString("pt-BR");
}

function getMonthRange(currentDate: Date) {
  const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return {
    firstDay: todayStrFromDate(firstDate),
    lastDay: todayStrFromDate(lastDate),
    daysInMonth: lastDate.getDate(),
    startsOn: firstDate.getDay(),
  };
}

function normalizeTurno(turno?: string) {
  const value = String(turno || "").toUpperCase();
  if (value.includes("24") || value.includes("SERV")) return "24x72";
  if (value.includes("MANH")) return "Manha";
  return "Tarde";
}

function turnoIcon(turno?: string) {
  const normalized = normalizeTurno(turno);
  if (normalized === "24x72") return <Shield size={16} className="text-violet-400" />;
  if (normalized === "Manha") return <Sun size={16} className="text-amber-400" />;
  return <Clock3 size={16} className="text-blue-400" />;
}

function turnoBadgeClasses(turno?: string) {
  const normalized = normalizeTurno(turno);
  if (normalized === "24x72") return "border-violet-500/20 bg-violet-500/10 text-violet-300";
  if (normalized === "Manha") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  return "border-blue-500/20 bg-blue-500/10 text-blue-300";
}

function turnoDisplay(turno?: string) {
  const normalized = normalizeTurno(turno);
  if (normalized === "24x72") return "Servico 24x72";
  if (normalized === "Manha") return "Turno Manha";
  return "Turno Tarde";
}

function getAgentName(escala: Escala) {
  return escala.efetivo?.nome_guerra || escala.efetivo?.matricula || "Servidor";
}

function getAgentLabel(agent: Efetivo) {
  const parts = [agent.posto_grad, agent.nome_guerra].filter(Boolean);
  return parts.join(" ");
}

export default function EscalasPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(() => todayStr());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [efetivo, setEfetivo] = useState<Efetivo[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedEscala, setSelectedEscala] = useState<Escala | null>(null);
  const [formData, setFormData] = useState({
    efetivo_id: "",
    data: todayStr(),
    turno: "24x72",
    equipe: "ALFA",
    funcao: "Patrulheiro",
  });

  const monthRange = getMonthRange(currentDate);

  async function fetchData() {
    setLoading(true);
    try {
      const [{ data: efetivoData }, { data: escalasData }] = await Promise.all([
        supabase
          .from("efetivo")
          .select("id, nome_guerra, nome_completo, matricula, posto_grad, status, tipo_escala, grupo_turno")
          .eq("status", "ATIVO")
          .order("nome_guerra", { ascending: true }),
        supabase
          .from("escalas")
          .select("id, efetivo_id, data, turno, equipe, funcao, status, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)")
          .gte("data", monthRange.firstDay)
          .lte("data", monthRange.lastDay),
      ]);

      setEfetivo(Array.isArray(efetivoData) ? (efetivoData as Efetivo[]) : []);
      setEscalas(Array.isArray(escalasData) ? (escalasData as Escala[]) : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  useEffect(() => {
    const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    if (!selectedDay.startsWith(monthPrefix)) {
      const preferred = todayStr();
      if (preferred.startsWith(monthPrefix)) {
        setSelectedDay(preferred);
      } else {
        setSelectedDay(`${monthPrefix}-01`);
      }
    }
  }, [currentDate, selectedDay]);

  const dayItems = escalas
    .filter((item) => item.data === selectedDay)
    .sort((a, b) => {
      const turnoDiff = turnoDisplay(a.turno).localeCompare(turnoDisplay(b.turno));
      if (turnoDiff !== 0) return turnoDiff;
      return getAgentName(a).localeCompare(getAgentName(b));
    });

  const calendarCells: Array<{ key: string; date?: string; day?: number; count?: number; hasServico?: boolean }> = [];
  for (let i = 0; i < monthRange.startsOn; i += 1) {
    calendarCells.push({ key: `empty-${i}` });
  }
  for (let day = 1; day <= monthRange.daysInMonth; day += 1) {
    const date = todayStrFromDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const items = escalas.filter((item) => item.data === date);
    calendarCells.push({
      key: date,
      date,
      day,
      count: items.length,
      hasServico: items.length > 0,
    });
  }

  const query = agentSearch.trim().toLowerCase();
  const filteredAgents = !query
    ? efetivo
    : efetivo.filter((agent) => {
        const name = String(agent.nome_guerra || agent.nome_completo || "").toLowerCase();
        const matricula = String(agent.matricula || "");
        return name.includes(query) || matricula.includes(query);
      });

  function changeMonth(offset: number) {
    if (offset === 0) {
      setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      return;
    }
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function openCreateModal() {
    setSelectedEscala(null);
    setFormData({
      efetivo_id: "",
      data: selectedDay,
      turno: "24x72",
      equipe: "ALFA",
      funcao: "Patrulheiro",
    });
    setAgentSearch("");
    setShowModal(true);
  }

  function openEditModal(escala: Escala) {
    setSelectedEscala(escala);
    setFormData({
      efetivo_id: escala.efetivo_id,
      data: escala.data,
      turno: normalizeTurno(escala.turno),
      equipe: escala.equipe || "ALFA",
      funcao: escala.funcao || "Patrulheiro",
    });
    setAgentSearch(getAgentName(escala));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedEscala(null);
    setAgentSearch("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.efetivo_id || !formData.data) return;

    setSaving(true);
    try {
      const payload = {
        efetivo_id: formData.efetivo_id,
        data: formData.data,
        turno: formData.turno,
        equipe: formData.equipe.trim() || "ALFA",
        funcao: formData.funcao.trim() || "Patrulheiro",
        status: "CONFIRMADO",
      };

      const { error } = await supabase.from("escalas").upsert([payload], { onConflict: "data,efetivo_id" });
      if (error) throw error;

      closeModal();
      await fetchData();
      setSelectedDay(payload.data);
    } catch (error: any) {
      alert(`Erro ao salvar escala: ${error?.message || "desconhecido"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEscala) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("escalas")
        .delete()
        .eq("efetivo_id", selectedEscala.efetivo_id)
        .eq("data", selectedEscala.data);

      if (error) throw error;

      closeModal();
      await fetchData();
    } catch (error: any) {
      alert(`Erro ao remover escala: ${error?.message || "desconhecido"}`);
    } finally {
      setSaving(false);
    }
  }

  function handleShareWhatsApp() {
    if (!dayItems.length) {
      alert("Nao ha escalas neste dia para compartilhar.");
      return;
    }

    const grouped = new Map<string, Escala[]>();
    for (const item of dayItems) {
      const label = turnoDisplay(item.turno);
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label)!.push(item);
    }

    let text = `*ESCALA GTAM*\n${formatDate(selectedDay)}\n\n`;
    for (const [turno, items] of Array.from(grouped.entries())) {
      text += `*${turno}*\n`;
      for (const item of items) {
        const equipe = item.equipe ? ` [${item.equipe}]` : "";
        const funcao = item.funcao ? ` - ${item.funcao}` : "";
        text += `- ${getAgentName(item)}${equipe}${funcao}\n`;
      }
      text += "\n";
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <CalendarDays className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Escalas</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Operacao diaria e planejamento mensal</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/5 bg-[#182238] p-1">
            <button onClick={() => changeMonth(-1)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[180px] px-4 text-center text-xs font-black uppercase tracking-[0.2em] text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={() => changeMonth(1)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => changeMonth(0)}
            className="rounded-xl border border-white/5 bg-[#182238] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 transition hover:bg-[#1d2941] hover:text-white"
          >
            Hoje
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />
            Adicionar Escala
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[22px] border border-white/5 bg-[#182238] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="border-b border-white/5 px-5 py-5">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 p-5">
            {calendarCells.map((cell) => {
              if (!cell.date || !cell.day) {
                return <div key={cell.key} className="min-h-[92px] rounded-2xl border border-transparent" />;
              }

              const isSelected = cell.date === selectedDay;
              const isToday = cell.date === todayStr();

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDay(cell.date!)}
                  className={`min-h-[92px] rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-white/5 bg-[#11192b] hover:border-white/10 hover:bg-[#14203a]"
                  } ${isToday ? "ring-1 ring-inset ring-blue-400/30" : ""}`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className={`text-sm font-black ${isSelected ? "text-white" : "text-slate-200"}`}>{cell.day}</span>
                    {cell.hasServico ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        {cell.count}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    {cell.hasServico ? (
                      <>
                        <div className="h-2 rounded-full bg-slate-700">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min((cell.count || 0) * 20, 100)}%` }} />
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400">
                          {cell.count === 1 ? "1 lancamento" : `${cell.count} lancamentos`}
                        </p>
                      </>
                    ) : (
                      <p className="pt-4 text-[10px] font-semibold text-slate-500">Sem escala</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[22px] border border-white/5 bg-[#182238] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="border-b border-white/5 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">Dia Selecionado</p>
                <h2 className="mt-2 text-xl font-black text-white">{formatDate(selectedDay)}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20"
                  title="Compartilhar no WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              </div>
            ) : dayItems.length ? (
              <div className="space-y-3">
                {dayItems.map((item, index) => (
                  <motion.button
                    key={`${item.efetivo_id}-${item.data}-${index}`}
                    type="button"
                    layout
                    onClick={() => openEditModal(item)}
                    className="w-full rounded-2xl border border-white/5 bg-[#11192b] p-4 text-left transition hover:border-white/10 hover:bg-[#14203a]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {turnoIcon(item.turno)}
                          <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${turnoBadgeClasses(item.turno)}`}>
                            {turnoDisplay(item.turno)}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white">{getAgentName(item)}</p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                          <span>{item.equipe || "Sem equipe"}</span>
                          <span>•</span>
                          <span>{item.funcao || "Servidor"}</span>
                        </div>
                      </div>
                      <span className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                        Editar
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#11192b] px-6 text-center">
                <CalendarDays size={28} className="mb-4 text-slate-500" />
                <p className="text-sm font-black text-white">Nenhuma escala neste dia</p>
                <p className="mt-2 text-xs text-slate-400">Selecione um dia no calendario e adicione os lancamentos operacionais.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/5 bg-[#182238] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">
                    {selectedEscala ? "Editar escala" : "Nova escala"}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-white">{formatShortDate(formData.data)}</h3>
                </div>
                <button onClick={closeModal} className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Buscar agente</span>
                    <div className="relative">
                      <UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        value={agentSearch}
                        onChange={(event) => setAgentSearch(event.target.value)}
                        placeholder="Nome de guerra ou matricula"
                        className="w-full rounded-xl border border-white/5 bg-[#11192b] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/30"
                      />
                    </div>
                  </label>

                  <div className="max-h-[280px] space-y-2 overflow-y-auto rounded-2xl border border-white/5 bg-[#11192b] p-3">
                    {filteredAgents.map((agent) => {
                      const active = formData.efetivo_id === agent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, efetivo_id: agent.id }));
                            setAgentSearch(agent.nome_guerra || agent.nome_completo || "");
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-blue-500/30 bg-blue-500/10"
                              : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                          }`}
                        >
                          <p className="text-sm font-bold text-white">{getAgentLabel(agent) || agent.matricula || "Servidor"}</p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {agent.matricula || "Sem matricula"}
                          </p>
                        </button>
                      );
                    })}

                    {!filteredAgents.length ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-slate-500">
                        Nenhum agente encontrado.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Data</span>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(event) => setFormData((prev) => ({ ...prev, data: event.target.value }))}
                      className="w-full rounded-xl border border-white/5 bg-[#11192b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/30"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Turno</span>
                    <select
                      value={formData.turno}
                      onChange={(event) => setFormData((prev) => ({ ...prev, turno: event.target.value }))}
                      className="w-full rounded-xl border border-white/5 bg-[#11192b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/30"
                    >
                      <option value="24x72">Servico 24x72</option>
                      <option value="Manha">Turno Manha</option>
                      <option value="Tarde">Turno Tarde</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Equipe</span>
                    <input
                      value={formData.equipe}
                      onChange={(event) => setFormData((prev) => ({ ...prev, equipe: event.target.value.toUpperCase() }))}
                      className="w-full rounded-xl border border-white/5 bg-[#11192b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/30"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Funcao</span>
                    <input
                      value={formData.funcao}
                      onChange={(event) => setFormData((prev) => ({ ...prev, funcao: event.target.value }))}
                      className="w-full rounded-xl border border-white/5 bg-[#11192b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/30"
                    />
                  </label>

                  <div className="flex gap-3 pt-4">
                    {selectedEscala ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 transition hover:bg-rose-500/20"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-xl border border-white/5 bg-[#11192b] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 transition hover:bg-[#14203a] hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !formData.efetivo_id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={16} />
                      {saving ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
