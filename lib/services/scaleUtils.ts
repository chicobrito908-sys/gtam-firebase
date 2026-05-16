import { Agent } from "@/types/agent";

export const getTurnoCount = (agents: Agent[], turno: string) => {
  return agents.filter(agent => {
    if (agent.status !== "ATIVO") return false;
    
    // Normalização das siglas para comparação
    const grupo = String(agent.grupo_turno || "").toUpperCase().trim();
    const escala = String(agent.tipo_escala || "").toUpperCase().trim();

    // Regra: B é 24h (Coringa), AII é Manhã (2x2), BII é Tarde (2x2)
    const is24h = escala === "24X72" || grupo === "B";
    const isAII = grupo === "AII";
    const isBII = grupo === "BII";

    if (turno === "MANHÃ") {
      return is24h || isAII;
    }
    
    if (turno === "TARDE") {
      return is24h || isBII;
    }

    if (turno === "24H") {
      return is24h;
    }
    
    return true;
  }).length;
};
