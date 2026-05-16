import { getTurnoCount } from "./lib/services/scaleUtils";

const mockAgents = [
  { id: "1", status: "ATIVO", grupo_turno: "A II", tipo_escala: "2x2" }, // COM ESPAÇO
  { id: "2", status: "ATIVO", grupo_turno: "B II", tipo_escala: "2x2" }, // COM ESPAÇO
  { id: "3", status: "ATIVO", grupo_turno: "B", tipo_escala: "24X72" },   // 24h Coringa
  { id: "4", status: "ATIVO", grupo_turno: "B", tipo_escala: "24X72" },   // 24h Coringa
];

console.log("TESTE DE CONTAGEM (COM ESPAÇOS):");
console.log("Manhã (Esperado: 3 [1 A II + 2 B]):", getTurnoCount(mockAgents as any, "MANHÃ"));
console.log("Tarde (Esperado: 3 [1 B II + 2 B]):", getTurnoCount(mockAgents as any, "TARDE"));
console.log("24h (Esperado: 2 [2 B]):", getTurnoCount(mockAgents as any, "24H"));
