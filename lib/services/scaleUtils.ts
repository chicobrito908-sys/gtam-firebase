import { Agent } from "@/types/agent";

export const getTurnoCount = (agents: Agent[], turno: string) => {
  return agents.filter(agent => {
    if (agent.status !== "ATIVO") return false;
    const escala = String(agent.tipo_escala || "").toUpperCase().trim();
    const grupo = String(agent.grupo_turno || "").toUpperCase().trim();

    const is24h = escala.includes("24") || escala.includes("SERV");
    if (turno === "24H") return is24h;

    // Se é 2x2 (não 24h)
    if (is24h) return false;
    
    // Grupo A = Turno I / Manhã, Grupo B = Turno II / Noite
    const isManha = grupo.includes("A II") || grupo.includes("TURNO I") || grupo.includes("MANH") || grupo === "A";
    const isNoite = grupo.includes("B II") || grupo.includes("TURNO II") || grupo.includes("TARD") || grupo.includes("NOI") || grupo === "B";

    if (turno === "MANHÃ") return isManha;
    if (turno === "NOITE") return isNoite;
    
    return true; // fallback
  }).length;
};
