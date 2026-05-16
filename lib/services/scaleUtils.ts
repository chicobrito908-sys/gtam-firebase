import { Agent } from "@/types/agent";

export const getTurnoCount = (agents: Agent[], turno: string) => {
  return agents.filter(a => {
    if (a.status !== "ATIVO") return false;
    
    // Normalização robusta:
    // 1. Remove prefixo "TURNO" (banco tem "TURNO A II" e "A II" misturados)
    // 2. Remove todos os espaços internos
    const grupo = String(a.grupo_turno || "").toUpperCase().replace(/^TURNO\s*/i, '').replace(/\s+/g, '').trim();
    const escala = String(a.tipo_escala || "").replace(/\s+/g, '').toUpperCase();

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
