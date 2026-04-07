import { Agent } from "@/types/agent";

export interface AptitudeResult {
  isFit: boolean;
  label: string | null;
  severity: "none" | "info" | "warning" | "error";
  origin?: string;
}

/**
 * Lógica centralizada para verificar a aptidão de um agente em uma data específica.
 * Baseado em afastamentos, férias e ausências registradas.
 */
export const getAgentAptitude = (
  agentId: string,
  activeAusencias: any[]
): AptitudeResult => {
  const aus = activeAusencias.find((a) => a.efetivo_id === agentId);
  
  if (!aus) {
    return { isFit: true, label: null, severity: "none" };
  }

  const tipo = (aus.tipo || "").toUpperCase();

  // 🚨 Condições que bloqueiam 100% a escalação (Séria restrição operacional)
  const criticals = [
    "FERIAS",
    "F.A",
    "FOLGA AGENDADA",
    "ATESTADO",
    "LICENCA",
    "L.P",
    "DOACAO",
    "SANGUE",
    "AMSEC",
    "RP",
    "REDUCAO",
  ];

  if (criticals.some((c) => tipo.includes(c))) {
    return { 
      isFit: false, 
      label: tipo === "LICENCO" ? "LICENÇA" : tipo, // Correção do erro de digitação identificado
      severity: "error" 
    };
  }

  // ⚠️ MP (Meio Plantão) - Indica que o agente cumpre apenas parte do horário
  if (tipo.includes("MP") || tipo.includes("MEIO")) {
    return { 
      isFit: true, 
      label: "M.P (Até 18h)", 
      severity: "warning" 
    };
  }

  // ℹ️ Informações gerais (Avisos que não bloqueiam nem alertam criticidade)
  return { 
    isFit: true, 
    label: tipo, 
    severity: "info" 
  };
};

/**
 * Verifica se uma data está dentro de um intervalo.
 */
export const isDateInInterval = (checkDate: string, start: string, end?: string) => {
  if (!start) return false;
  const dCheck = new Date(checkDate + "T12:00:00Z");
  const dStart = new Date(start + "T12:00:00Z");
  const dEnd = end ? new Date(end + "T12:00:00Z") : dStart;
  return dCheck >= dStart && dCheck <= dEnd;
};
