export interface Agent {
  id: string;
  nome_completo?: string;
  nome_guerra: string;
  posto_grad: string;
  matricula: string;
  antiguidade: number;
  tipo_escala: string;
  grupo_turno: string;
  status?: string;
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
  isFit: boolean;
  severity: "none" | "warning" | "error" | "info";
  label?: string | null;
  details?: string | null;
}

