"use client";
import { AlertTriangle, Calendar } from "lucide-react";
import type { Afastamento } from "@/lib/types/dashboard";
import { formatDate } from "@/lib/utils/dashboardUtils";
import { avatarText } from "@/lib/utils/dashboardUtils";

interface Props { afastamentos: Afastamento[] }

const SEVERITY_STYLE: Record<string, string> = {
  "LICENÇA PRÊMIO":        "text-purple-400 border-purple-500/20 bg-purple-500/10",
  "LICENÇA SAÚDE":         "text-rose-400 border-rose-500/20 bg-rose-500/10",
  "LICENÇA INTERESSE PARTICULAR": "text-amber-400 border-amber-500/20 bg-amber-500/10",
  "AMSEC":                 "text-blue-400 border-blue-500/20 bg-blue-500/10",
  DEFAULT:                 "text-muted-foreground border-white/10 bg-white/5",
};

function badgeStyle(tipo: string) {
  return SEVERITY_STYLE[tipo?.toUpperCase()] ?? SEVERITY_STYLE.DEFAULT;
}

export default function AfastamentosCard({ afastamentos }: Props) {
  if (afastamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50">
        <AlertTriangle size={32} />
        <p className="text-sm font-bold">Nenhum afastamento ativo</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {afastamentos.map((af) => (
        <div key={af.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-black shrink-0">
            {avatarText(af.efetivo?.nome_guerra)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase truncate">{af.efetivo?.nome_guerra ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{af.efetivo?.matricula}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${badgeStyle(af.tipo)}`}>
              {af.tipo}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-mono justify-end">
              <Calendar size={10} />
              <span>{formatDate(af.data_inicio)} – {formatDate(af.data_fim)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
