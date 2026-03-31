"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BriefcaseMedical,
  CalendarCheck,
  CalendarDays,
  Clock,
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
  return new Date().toISOString().split("T")[0];
}

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-BR");
}

function normalizeTurno(turno?: string) {
  const value = String(turno || "").toUpperCase();
  if (value.includes("24") || value.includes("SERV")) return "24x72";
  if (value.includes("MANH") || value === "A" || value === "A II" || value.includes("ALFA")) return "MANHA";
  return "TARDE";
}

function normalizeScaleGroup(agent: Efetivo) {
  const escala = String(agent.tipo_escala || "").toUpperCase();
  if (escala.includes("24")) return "24x72";
  const grupo = String(agent.grupo_turno || "").toUpperCase();
  if (grupo.includes("MANH") || grupo === "A" || grupo === "A II" || grupo.includes("ALFA")) return "MANHA";
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
      title: "Servico 24x72",
      subtitle: "Escala de 24 horas",
      icon: Shield,
      iconColor: "text-violet-400",
      panelTint: "bg-violet-500/10",
      barColor: "bg-violet-500",
    },
    {
      key: "MANHA",
      title: "Turno Manha",
      subtitle: "Escala 2x2 - Manha",
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
    <section className="rounded-[22px] border border-white/5 bg-[#182238] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-blue-400" />
          <h2 className="text-[18px] font-extrabold tracking-tight text-white">{title}</h2>
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
        const next30Str = in30Days.toISOString().split("T")[0];

        const in30Past = new Date();
        in30Past.setDate(in30Past.getDate() - 30);
        const prev30Str = in30Past.toISOString().split("T")[0];

        const in180Past = new Date();
        in180Past.setDate(in180Past.getDate() - 180);
        const prev180Str = in180Past.toISOString().split("T")[0];

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
        const afastamentosAtivos = afastamentos.filter((item) => item.data_inicio <= today && item.data_fim >= today);
        const feriasAtivas = ferias.filter((item) => item.status === "AGENDADO" && item.data_inicio <= today && item.data_fim >= today);
        const feriasProximas = ferias.filter((item) => item.status === "AGENDADO" && item.data_inicio >= today && item.data_inicio <= next30Str);

        const rankingProdutividade = efetivoAtivo
          .map((agent) => ({
            id: String(agent.id),
            nome: agent.nome_guerra || agent.nome_completo || "Sem nome",
            matricula: agent.matricula || "-",
            total: escalas.filter((item) => String(item.efetivo_id) === String(agent.id) && item.data >= prev30Str).length,
          }))
          .sort((a, b) => b.total - a.total)
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
          .sort((a, b) => a.total - b.total)
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
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sincronizando painel tatico...</p>
      </div>
    );
  }

  const groupedEscalas = groupEscalas(data?.escalaHoje || []);
  const dateLabel = data
    ? new Date(`${data.hoje}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-[18px] font-bold text-white">Dashboard</h1>
      </div>

      <SectionCard
        title="Forca Disponivel Hoje"
        icon={Shield}
        right={<span className="text-sm text-[#8fa6d8] capitalize">{dateLabel}</span>}
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {(data?.forceCards || []).map((card) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[18px] border border-white/5 bg-[#11192b] p-5"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`h-11 w-11 rounded-[14px] ${card.panelTint} flex items-center justify-center`}>
                  <card.icon size={22} className={card.iconColor} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-white">{card.title}</h3>
                  <p className="text-sm text-[#a7b8da]">{card.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "TOTAL", value: card.total, color: "text-white" },
                  { label: "DISPONIVEL", value: card.available, color: "text-emerald-400" },
                  { label: "IMPEDIDO", value: card.blocked, color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[12px] bg-[#1b2740] px-3 py-3 text-center">
                    <p className={`text-[16px] font-black ${item.color}`}>{item.value}</p>
                    <p className="text-[11px] font-semibold tracking-[0.15em] text-[#8ea2cc]">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="h-2 rounded-full bg-[#27344f] overflow-hidden mb-4">
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
          <div className="min-h-[84px]" />
        ) : (
          <div className="space-y-5">
            {Array.from(groupedEscalas.entries()).map(([turno, equipes]) => (
              <div key={turno} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8fa6d8]">{turno}</h3>
                {Array.from(equipes.entries()).map(([equipe, items]) => (
                  <div key={equipe} className="rounded-[14px] bg-[#11192b] p-4">
                    <p className="mb-3 text-sm font-bold text-white">{equipe}</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#1b2740] px-3 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-[10px] font-black text-blue-300">
                              {avatarText(item.efetivo?.nome_guerra)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">{item.efetivo?.nome_guerra || "Sem nome"}</p>
                              <p className="truncate text-xs text-[#8ea2cc]">{item.efetivo?.matricula || "-"}</p>
                            </div>
                          </div>
                          <span className="rounded-md bg-white/5 px-3 py-1 text-xs font-semibold text-[#c4d2ee]">
                            {item.funcao || "Servidor"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Afastamentos Ativos" icon={BriefcaseMedical}>
          {(data?.afastamentos.length || 0) === 0 ? (
            <div className="min-h-[40px]" />
          ) : (
            <div className="space-y-3">
              {(data?.afastamentos || []).slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[14px] bg-[#11192b] px-4 py-4">
                  <p className="text-sm font-bold text-white">{item.efetivo?.nome_guerra}</p>
                  <p className="text-xs text-[#8ea2cc]">
                    {item.tipo} • {formatDate(item.data_inicio)} ate {formatDate(item.data_fim)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Ferias Proximas" icon={Umbrella}>
          {(data?.ferias.length || 0) === 0 ? (
            <div className="min-h-[40px]" />
          ) : (
            <div className="space-y-3">
              {(data?.ferias || []).slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[14px] bg-[#11192b] px-4 py-4">
                  <p className="text-sm font-bold text-white">{item.efetivo?.nome_guerra}</p>
                  <p className="text-xs text-[#8ea2cc]">
                    {formatDate(item.data_inicio)} • Ref: {item.ano_referencia ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="hidden">
        {(data?.rankingProdutividade.length || 0) + (data?.rankingAssiduidade.length || 0) + (data?.faltasMes || 0) + (data?.usuariosPendentes || 0)}
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
