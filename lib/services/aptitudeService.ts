import { Agent } from "@/types/agent";

export interface AptitudeResult {
  isFit: boolean;
  label: string | null;
  severity: "none" | "info" | "warning" | "error";
}

/**
 * Verifica se uma data está dentro de um intervalo [start, end].
 * Usa T12:00:00Z para evitar bugs de fuso horário.
 */
export const isDateInInterval = (checkDate: string, start: string, end?: string): boolean => {
  if (!start) return false;
  const dCheck = new Date(checkDate + "T12:00:00Z");
  const dStart = new Date(start + "T12:00:00Z");
  const dEnd   = end ? new Date(end + "T12:00:00Z") : dStart;
  return dCheck >= dStart && dCheck <= dEnd;
};

/**
 * SSOT: Calcula a aptidão de um agente cruzando seus afastamentos com a data da escala.
 * @param agentId   ID do servidor
 * @param date      Data da escala no formato YYYY-MM-DD
 * @param afastamentos  Array de afastamentos vindos da coleção "afastamentos" (SSOT do Efetivo)
 * @param ferias        Array de férias vindas da coleção "ferias" (SSOT do Efetivo)
 */
export const getAgentAptitude = (
  agentId: string,
  date: string,
  afastamentos: any[],
  ferias: any[]
): AptitudeResult => {
  // 1. Verificar Férias
  const feriaAtiva = ferias.find(
    f => f.efetivo_id === agentId && isDateInInterval(date, f.data_inicio, f.data_fim)
  );
  if (feriaAtiva) {
    return { isFit: false, label: "FÉRIAS", severity: "error" };
  }

  // 2. Verificar Afastamentos ativos na data
  const afAtivo = afastamentos.find(
    a => a.efetivo_id === agentId && isDateInInterval(date, a.data_inicio, a.data_fim)
  );
  if (!afAtivo) {
    return { isFit: true, label: null, severity: "none" };
  }

  const tipo = (afAtivo.tipo || "").toUpperCase();

  // 🚨 Bloqueio total — impedido de escalar
  const blockers = ["F.A", "FOLGA AGENDADA", "ATESTADO", "L.P", "LP", "AMSEC", "SANGUE", "DOACAO"];
  if (blockers.some(c => tipo.includes(c))) {
    return { isFit: false, label: tipo, severity: "error" };
  }

  // ⚠️ M.P / R.P — Apto, mas com restrição de horário
  if (tipo.includes("M.P") || tipo.includes("MP") || tipo.includes("MEIO") || tipo.includes("R.P") || tipo.includes("RP") || tipo.includes("REDUCAO")) {
    return { isFit: true, label: tipo.includes("M.P") ? "M.P (Sai às 18h)" : "R.P (Restrição)", severity: "warning" };
  }

  // ℹ️ Qualquer outro registro — informativo sem restrição
  return { isFit: true, label: tipo, severity: "info" };
};
