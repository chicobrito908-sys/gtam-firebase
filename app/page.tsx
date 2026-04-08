"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BriefcaseMedical,
  CalendarCheck,
  CalendarDays,
  HeartPulse,
  Moon,
  Palmtree,
  Shield,
  Sun,
  Trophy,
  Umbrella,
  User,
  Users,
  XSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Efetivo = {
  id: string;
  nome_completo?: string;
  nome_guerra?: string;
  matricula?: string;
  posto_grad?: string;
  grupo_turno?: string;
  tipo_escala?: string;
  status?: string;
};

type Escala = {
  id: string;
  data: string;
  turno?: string;
  equipe?: string;
  funcao?: string;
  efetivo_id: string;
  efetivo?: {
    nome_guerra?: string;
    matricula?: string;
    posto_grad?: string;
  } | null;
};

type Afastamento = {
  id: string;
  efetivo_id: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  efetivo?: {
    nome_guerra?: string;
    matricula?: string;
    posto_grad?: string;
  } | null;
};

type Ferias = {
  id: string;
  efetivo_id: string;
  ano_referencia?: number;
  data_inicio: string;
  data_fim: string;
  status?: string;
  efetivo?: {
    nome_guerra?: string;
    matricula?: string;
    posto_grad?: string;
  } | null;
};

type Falta = {
  id: string;
  efetivo_id: string;
  data: string;
};

type Usuario = {
  id: string;
  status?: string;
};

type RankingItem = {
  id: string;
  nome: string;
  matricula: string;
  total: number;
};

type ForceCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Shield;
  iconColor: string;
  panelTint: string;
  barColor: string;
  total: number;
  available: number;
  blocked: number;
  onDuty: number;
};

type DashboardData = {
  hoje: string;
  totalEfetivo: number;
  emServicoHoje: number;
  afastadosAtivos: number;
  feriasProximas: number;
  faltasMes: number;
  usuariosPendentes: number;
  escalaHoje: Escala[];
  afastamentos: Afastamento[];
  ferias: Ferias[];
  rankingProdutividade: RankingItem[];
  rankingAssiduidade: RankingItem[];
  forceCards: ForceCard[];
};

function todayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-BR");
}

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return "-";
  if (start === end) return formatDate(start);
  return `${formatDate(start)} ate ${formatDate(end)}`;
}

function normalizeTurno(turno?: string) {
  const value = String(turno || "").toUpperCase().trim();
  
  if (value.includes("MANH") || value.includes("TURNO I") || value === "A" || value.includes("A II")) return "MANHA";
  if (value.includes("TARD") || value.includes("TURNO II") || value.includes("B II") || value === "B") return "TARDE";
  if (value.includes("24") || value.includes("SERV") || value.includes("ALFA") || value.includes("BETA")) return "24x72";
  
  return "TARDE"; // Default
}

function formatTurnoLabel(turno: string) {
  switch (turno) {
    case "24x72":
      return "Servico 24x72";
    case "MANHA":
      return "Turno Manha";
    default:
      return "Turno Tarde";
  }
}

function normalizeScaleGroup(agent: Efetivo) {
  const escala = String(agent.tipo_escala || "").toUpperCase().trim();
  const grupo = String(agent.grupo_turno || "").toUpperCase().trim();

  // Prioridade 1: Escalas de 24h (independente do grupo_turno)
  if (escala.includes("24") || escala.includes("SERV")) return "24x72";
  
  // Prioridade 2: IDs operacionais oficiais (A II e B II) para 2x2
  if (grupo.includes("A II") || grupo.includes("TURNO I") || grupo.includes("MANH") || grupo === "A") return "MANHA";
  if (grupo.includes("B II") || grupo.includes("TURNO II") || grupo.includes("TARD") || grupo === "B") return "TARDE";
  
  // Default para 2x2 sem grupo definido
  return "TARDE";
}

function isActiveAgent(agent: Efetivo) {
  return agent.status === "ATIVO";
}

function isHealthLeave(afastamento: Afastamento) {
  return afastamento.tipo === "SAUDE";
}

function avatarText(name?: string) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

function buildForceCards(
  efetivo: Efetivo[],
  escalasHoje: Escala[],
  afastamentosAtivos: Afastamento[],
  feriasAtivas: Ferias[]
): ForceCard[] {
  const activeAgents = efetivo.filter(isActiveAgent);
  
  const blockedIds = new Set([
    ...afastamentosAtivos.map((item) => String(item.efetivo_id)),
    ...feriasAtivas.map((item) => String(item.efetivo_id)),
  ]);

  const onDutyIds = new Set(escalasHoje.map((item) => String(item.efetivo_id)));

  const groups = [
    {
      key: "24x72",
      title: "Serviço 24x72",
      subtitle: "Escala de 24 horas",
      icon: Shield,
      iconColor: "text-primary",
      panelTint: "bg-primary/10",
      barColor: "bg-primary",
    },
    {
      key: "MANHA",
      title: "Turno Manhã",
      subtitle: "Escala 2x2 - Manhã",
      icon: Sun,
      iconColor: "text-amber-400",
      panelTint: "bg-amber-500/10",
      barColor: "bg-amber-500",
    },
    {
      key: "TARDE",
      title: "Turno Tarde",
      subtitle: "Escala 2x2 - Tarde",
      icon: Moon,
      iconColor: "text-blue-400",
      panelTint: "bg-blue-500/10",
      barColor: "bg-blue-500",
    },
  ];

  return groups.map((group) => {
    const members = activeAgents.filter((agent) => normalizeScaleGroup(agent) === group.key);
    const total = members.length;
    const blocked = members.filter((agent) => blockedIds.has(String(agent.id))).length;
    const onDuty = members.filter((agent) => onDutyIds.has(String(agent.id))).length;

    return {
      ...group,
      total,
      available: Math.max(total - blocked, 0),
      blocked,
      onDuty,
    };
  });
}

function groupEscalas(escalas: Escala[]) {
  const grouped = new Map<string, Map<string, Escala[]>>();

  for (const escala of escalas) {
    const turno = normalizeTurno(escala.turno);
    const equipe = escala.equipe?.trim() || "Sem equipe";
    if (!grouped.has(turno)) grouped.set(turno, new Map());
    const byTeam = grouped.get(turno)!;
    if (!byTeam.has(equipe)) byTeam.set(equipe, []);
    byTeam.get(equipe)!.push(escala);
  }

  return grouped;
}

function SectionCard({
  title,
  icon: Icon,
  right,
  children,
}: {
  title: string;
  icon: typeof Shield;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/5 bg-card shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-primary" />
          <h2 className="text-[18px] font-black uppercase tracking-tight text-white">{title}</h2>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const today = todayStr();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const next30Str = todayStrFromDate(in30Days);

        const in30Past = new Date();
        in30Past.setDate(in30Past.getDate() - 30);
        const prev30Str = todayStrFromDate(in30Past);

        const in180Past = new Date();
        in180Past.setDate(in180Past.getDate() - 180);
        const prev180Str = todayStrFromDate(in180Past);

        const [
          { data: efetivoRaw },
          { data: escalasRaw },
          { data: afastamentosRaw },
          { data: feriasRaw },
          { data: faltasRaw },
          { data: usuariosRaw },
        ] = await Promise.all([
          supabase.from("efetivo").select("id, nome_completo, nome_guerra, matricula, posto_grad, grupo_turno, tipo_escala, status"),
          supabase.from("escalas").select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)"),
          supabase.from("afastamentos").select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)"),
          supabase.from("ferias").select("*, efetivo:efetivo_id(nome_guerra, matricula, posto_grad)"),
          supabase.from("faltas").select("id, efetivo_id, data"),
          supabase.from("usuarios").select("id, status"),
        ]);

        const efetivo = Array.isArray(efetivoRaw) ? (efetivoRaw as Efetivo[]) : [];
        const escalas = Array.isArray(escalasRaw) ? (escalasRaw as Escala[]) : [];
        const afastamentos = Array.isArray(afastamentosRaw) ? (afastamentosRaw as Afastamento[]) : [];
        const ferias = Array.isArray(feriasRaw) ? (feriasRaw as Ferias[]) : [];
        const faltas = Array.isArray(faltasRaw) ? (faltasRaw as Falta[]) : [];
        const usuarios = Array.isArray(usuariosRaw) ? (usuariosRaw as Usuario[]) : [];

        const efetivoAtivo = efetivo.filter(isActiveAgent);
        const escalaHoje = escalas.filter((item) => item.data === today);
        const afastamentosAtivos = afastamentos.filter((item) => item.data_inicio <= today && (item.data_fim || item.data_inicio) >= today);
        const feriasAtivas = ferias.filter((item) => item.status === "AGENDADO" && item.data_inicio <= today && (item.data_fim || item.data_inicio) >= today);
        const feriasProximas = ferias.filter((item) => item.status === "AGENDADO" && item.data_inicio >= today && item.data_inicio <= next30Str);

        const rankingProdutividade = efetivoAtivo
          .map((agent) => ({
            id: String(agent.id),
            nome: agent.nome_guerra || agent.nome_completo || "Sem nome",
            matricula: agent.matricula || "-",
            total: escalas.filter((item) => String(item.efetivo_id) === String(agent.id) && item.data >= prev30Str).length,
          }))
          .sort((left, right) => right.total - left.total)
          .slice(0, 5);

        const rankingAssiduidade = efetivoAtivo
          .map((agent) => ({
            id: String(agent.id),
            nome: agent.nome_guerra || agent.nome_completo || "Sem nome",
            matricula: agent.matricula || "-",
            total: afastamentos.filter(
              (item) => String(item.efetivo_id) === String(agent.id) && isHealthLeave(item) && item.data_inicio >= prev180Str
            ).length,
          }))
          .sort((left, right) => left.total - right.total)
          .slice(0, 5);

        setData({
          hoje: today,
          totalEfetivo: efetivoAtivo.length,
          emServicoHoje: escalaHoje.length,
          afastadosAtivos: afastamentosAtivos.length,
          feriasProximas: feriasProximas.length,
          faltasMes: faltas.filter((item) => item.data.startsWith(today.slice(0, 7))).length,
          usuariosPendentes: usuarios.filter((item) => item.status === "PENDENTE").length,
          escalaHoje,
          afastamentos: afastamentosAtivos,
          ferias: feriasProximas,
          rankingProdutividade,
          rankingAssiduidade,
          forceCards: buildForceCards(efetivo, escalaHoje, afastamentosAtivos, feriasAtivas),
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "desconhecido";
        console.error("Erro ao carregar dashboard:", errorMsg);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sincronizando painel tatico...</p>
      </div>
    );
  }

  const groupedEscalas = groupEscalas(data?.escalaHoje || []);
  const dateLabel = data
    ? (() => {
        const [y, m, d] = data.hoje.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d, 12, 0, 0); // Vacina do Meio-Dia
        const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        return `${weekdays[dateObj.getDay()]}, ${d} de ${months[m - 1]}`;
      })()
    : "";

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-[18px] font-bold text-white">Dashboard</h1>
      </div>

      <SectionCard
        title="Forca Disponivel Hoje"
        icon={Shield}
        right={<span className="text-sm capitalize text-[#8fa6d8]">{dateLabel}</span>}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {(data?.forceCards || []).map((card) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[18px] border border-white/5 bg-[#0d1117] p-5 shadow-inner"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${card.panelTint}`}>
                  <card.icon size={22} className={card.iconColor} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-white">{card.title}</h3>
                  <p className="text-sm text-[#a7b8da]">{card.subtitle}</p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: "TOTAL", value: card.total, color: "text-white" },
                  { label: "DISPONIVEL", value: card.available, color: "text-emerald-400" },
                  { label: "IMPEDIDO", value: card.blocked, color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[12px] bg-[#1a1f2e] px-3 py-3 text-center border border-white/5">
                    <p className={`text-[16px] font-black ${item.color}`}>{item.value}</p>
                    <p className="text-[11px] font-bold tracking-[0.15em] text-[#8ea2cc] opacity-60">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#27344f]">
                <div
                  className={`${card.barColor} h-full rounded-full`}
                  style={{ width: card.total > 0 ? `${Math.round((card.available / card.total) * 100)}%` : "0%" }}
                />
              </div>

              {card.onDuty > 0 ? (
                <span className="inline-flex rounded-md bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                  {card.onDuty} Escalados
                </span>
              ) : (
                <p className="text-sm text-[#8ea2cc]">Sem registros hoje</p>
              )}
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Escala de Hoje" icon={CalendarDays}>
        {groupedEscalas.size === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#0d1117] px-6 text-center border border-white/5">
            <p className="text-sm text-[#8ea2cc]">Nenhuma escala lancada para hoje.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(groupedEscalas.entries()).map(([turno, equipes]) => (
              <div key={turno} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8fa6d8]">{formatTurnoLabel(turno)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from(equipes.entries()).map(([equipe, items]) => (
                    <div key={equipe} className="rounded-[18px] border border-white/5 bg-[#11192b] p-5 shadow-2xl flex flex-col h-full hover:border-primary/20 transition-all">
                      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <p className="text-[14px] font-black text-white leading-none uppercase">{equipe}</p>
                        </div>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black text-primary uppercase">
                          {items.length} PX
                        </span>
                      </div>
                      <div className="space-y-2 flex-grow">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#0d1117] px-3 py-3 border border-white/5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-[9px] font-black text-primary">
                                {avatarText(item.efetivo?.nome_guerra)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-black text-white uppercase leading-tight">
                                  <span className="text-primary/70 mr-1">{item.efetivo?.posto_grad}</span>
                                  {item.efetivo?.nome_guerra || "Sem nome"}
                                </p>
                                <p className="truncate text-[9px] font-bold text-[#8ea2cc] tracking-widest opacity-40 uppercase">{item.efetivo?.matricula || "-"}</p>
                              </div>
                            </div>
                            <span className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-black text-[#c4d2ee] uppercase">
                              {item.funcao || "SERV"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Afastamentos Ativos"
          icon={BriefcaseMedical}
          right={
            <span className="rounded-md bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#c4d2ee]">
              {data?.afastamentos.length || 0}
            </span>
          }
        >
          {(data?.afastamentos.length || 0) === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#11192b] px-6 text-center">
              <p className="text-sm text-[#8ea2cc]">Nenhum afastamento ativo no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.afastamentos || []).slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[14px] bg-[#0d1117] px-4 py-4 border border-white/5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">{item.efetivo?.nome_guerra || "Sem nome"}</p>
                    <span className="rounded-md bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-300">
                      {item.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-[#8ea2cc]">{formatDateRange(item.data_inicio, item.data_fim)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Ferias Proximas"
          icon={Umbrella}
          right={
            <span className="rounded-md bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#c4d2ee]">
              {data?.ferias.length || 0}
            </span>
          }
        >
          {(data?.ferias.length || 0) === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#11192b] px-6 text-center">
              <p className="text-sm text-[#8ea2cc]">Nenhuma ferias agendada para os proximos 30 dias.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.ferias || []).slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[14px] bg-[#0d1117] px-4 py-4 border border-white/5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">{item.efetivo?.nome_guerra || "Sem nome"}</p>
                    <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300">
                      {item.ano_referencia ?? "-"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8ea2cc]">{formatDateRange(item.data_inicio, item.data_fim)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="hidden">
        {(data?.rankingProdutividade.length || 0) +
          (data?.rankingAssiduidade.length || 0) +
          (data?.faltasMes || 0) +
          (data?.usuariosPendentes || 0)}
        <Trophy size={1} />
        <HeartPulse size={1} />
        <CalendarCheck size={1} />
        <Activity size={1} />
        <AlertTriangle size={1} />
        <Palmtree size={1} />
        <Users size={1} />
        <User size={1} />
        <XSquare size={1} />
      </div>
    </div>
  );
}

function todayStrFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
