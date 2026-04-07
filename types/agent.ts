export interface Agent {
  id: string;
  nome_guerra: string;
  posto_grad: string;
  matricula: string;
  antiguidade: number;
  tipo_escala: string;
  grupo_turno: string;
}

export interface ScaleEntry {
  agentId: string;
  equipe: string;    // Ex: "GTAM 07", "SUPERVISÃO"
  funcao: string;    // Ex: "TITULAR", "04", "BI", "BII"
}

export interface VTR {
  id: string;
  type: 'MOTO' | 'CARRO';
}

export interface AptitudeResult {
  severity: "none" | "warning" | "error";
  label?: string;
  details?: string;
}
