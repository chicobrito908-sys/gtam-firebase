// Funções utilitárias puras para o Dashboard
import type { Efetivo, Escala, Afastamento, Ferias, ForceCard } from "@/lib/types/dashboard";
import { Shield, Sun, Moon } from "lucide-react";

// ─── Datas ────────────────────────────────────────────────────────────────────

export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function todayStrFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDate(date?: string): string {
  if (!date) return "-";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-BR");
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "-";
  if (start === end) return formatDate(start);
  return `${formatDate(start)} ate ${formatDate(end)}`;
}

// ─── Turnos ───────────────────────────────────────────────────────────────────

export function normalizeTurno(turno?: string): "MANHA" | "TARDE" | "24x72" {
  const v = String(turno || "").toUpperCase().trim();
  if (v.includes("MANH") || v.includes("TURNO I") || v === "A" || v.includes("A II")) return "MANHA";
  if (v.includes("TARD") || v.includes("TURNO II") || v.includes("B II") || v === "B") return "TARDE";
  if (v.includes("24") || v.includes("SERV") || v.includes("ALFA") || v.includes("BETA")) return "24x72";
  return "TARDE";
}

export function formatTurnoLabel(turno: string): string {
  if (turno === "24x72") return "Servico 24x72";
  if (turno === "MANHA") return "Turno Manha";
  return "Turno Tarde";
}

// ─── Agentes ──────────────────────────────────────────────────────────────────

export function isActiveAgent(agent: Efetivo): boolean {
  return agent.status === "ATIVO";
}

export function normalizeScaleGroup(agent: Efetivo): "24x72" | "MANHA" | "TARDE" {
  const escala = String(agent.tipo_escala || "").toUpperCase().trim();
  const grupo = String(agent.grupo_turno || "").toUpperCase().trim();
  // B e 24x72 são o mesmo grupo (coringa — aparece em Manhã e Tarde)
  if (escala.includes("24") || escala.includes("SERV") || grupo === "B") return "24x72";
  if (grupo.includes("A II") || grupo.includes("TURNO I") || grupo.includes("MANH")) return "MANHA";
  if (grupo.includes("B II") || grupo.includes("TURNO II") || grupo.includes("TARD")) return "TARDE";
  return "TARDE";
}

export function avatarText(name?: string): string {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

// ─── Force Cards ──────────────────────────────────────────────────────────────

export function buildForceCards(
  efetivo: Efetivo[], escalasHoje: Escala[], afastamentosAtivos: Afastamento[], feriasAtivas: Ferias[]
): ForceCard[] {
  const activeAgents = efetivo.filter(isActiveAgent);
  const blockedIds = new Set([
    ...afastamentosAtivos.map((i) => String(i.efetivo_id)),
    ...feriasAtivas.map((i) => String(i.efetivo_id)),
  ]);
  const onDutyIds = new Set(escalasHoje.map((i) => String(i.efetivo_id)));

  const groups = [
    { key: "24x72", title: "Serviço 24x72", subtitle: "Escala de 24 horas", icon: Shield, iconColor: "text-primary", panelTint: "bg-primary/10", barColor: "bg-primary" },
    { key: "MANHA", title: "Turno Manhã",   subtitle: "Escala 2x2 - Manhã",  icon: Sun,    iconColor: "text-amber-400", panelTint: "bg-amber-500/10", barColor: "bg-amber-500" },
    { key: "TARDE", title: "Turno Tarde",   subtitle: "Escala 2x2 - Tarde",  icon: Moon,   iconColor: "text-blue-400",  panelTint: "bg-blue-500/10",  barColor: "bg-blue-500" },
  ];

  return groups.map((group) => {
    const members = activeAgents.filter((a) => normalizeScaleGroup(a) === group.key);
    const total   = members.length;
    const blocked = members.filter((a) => blockedIds.has(String(a.id))).length;
    const onDuty  = members.filter((a) => onDutyIds.has(String(a.id))).length;
    return { ...group, total, available: Math.max(total - blocked, 0), blocked, onDuty };
  });
}

// ─── Escalas ──────────────────────────────────────────────────────────────────

export function groupEscalas(escalas: Escala[]): Map<string, Map<string, Escala[]>> {
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
