import { getTurnoCount } from "./lib/services/scaleUtils";

const mockAgents = [
  { id: "1", status: "ATIVO", grupo_turno: "AII", tipo_escala: "2x2" },
  { id: "2", status: "ATIVO", grupo_turno: "BII", tipo_escala: "2x2" },
  { id: "3", status: "ATIVO", grupo_turno: "B", tipo_escala: "24X72" }, // 24h Coringa
  { id: "4", status: "ATIVO", grupo_turno: "B", tipo_escala: "24X72" }, // 24h Coringa
];

console.log("TESTE DE CONTAGEM:");
console.log("Manhã (Esperado: 3 [1 AII + 2 B]):", getTurnoCount(mockAgents as any, "MANHÃ"));
console.log("Tarde (Esperado: 3 [1 BII + 2 B]):", getTurnoCount(mockAgents as any, "TARDE"));
console.log("24h (Esperado: 2 [2 B]):", getTurnoCount(mockAgents as any, "24H"));
