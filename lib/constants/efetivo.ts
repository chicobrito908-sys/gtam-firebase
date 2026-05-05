// Constantes centralizadas para o módulo Efetivo
// Importe daqui em todos os formulários e componentes

export const POSTOS_GRAD = ["GM", "Guarda", "Subinspetor", "Inspetor"];
export const TURNOS = ["A", "B", "A II", "B II"];
export const ESCALAS = ["24x72", "2x2", "Expediente"];
export const STATUS_OPTIONS = ["ATIVO", "FERIAS", "AFASTADO", "LICENÇA"];

export const STATUS_COLORS: Record<string, string> = {
  ATIVO:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  FERIAS:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  AFASTADO: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  LICENÇA:  "bg-primary/10 text-primary border-primary/20",
  RESERVA:  "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export const TURNO_COLORS: Record<string, string> = {
  "A":          "bg-primary/10 text-primary border-primary/20",
  "B":          "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "A II":       "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "B II":       "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "A I":        "bg-primary/10 text-primary border-primary/20",
  "B I":        "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "TURNO A":    "bg-primary/10 text-primary border-primary/20",
  "TURNO B":    "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "TURNO A II": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "TURNO B II": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "ALFA":       "bg-primary/10 text-primary border-primary/20",
  "BRAVO":      "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "CHARLIE":    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "DELTA":      "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

/** Normaliza qualquer formato legado para exibição padronizada (ex: "TURNO B II" → "B II") */
export function normalizeTurnoDisplay(grupo: string): string {
  const g = String(grupo || "").toUpperCase().trim();
  const clean = g.replace(/^TURNO\s+/, "");
  const legacyMap: Record<string, string> = {
    ALFA: "A", BRAVO: "B", CHARLIE: "A II", DELTA: "B II",
  };
  return (legacyMap[clean] ?? clean) || "N/A";
}
