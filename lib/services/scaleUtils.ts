import { Agent } from "@/types/agent";

export const getTurnoCount = (agents: Agent[], turno: string) => {
  return agents.filter(a => {
    if (a.status !== "ATIVO") return false;
    
    // Normalização robusta (remove espaços internos)
    const grupo = String(a.grupo_turno || "").replace(/\s+/g, '').toUpperCase();
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
