"use client";
import { Calendar, Palmtree } from "lucide-react";
import type { Ferias } from "@/lib/types/dashboard";
import { formatDate, avatarText, todayStr } from "@/lib/utils/dashboardUtils";

interface Props { ferias: Ferias[]; hoje?: string }

export default function FeriasCard({ ferias, hoje }: Props) {
  const today = hoje ?? todayStr();

  if (ferias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50">
        <Palmtree size={32} />
        <p className="text-sm font-bold">Nenhuma férias nos próximos 30 dias</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {ferias.map((f) => {
        const emGozo = f.data_inicio <= today && (f.data_fim || f.data_inicio) >= today;
        return (
          <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${emGozo ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${emGozo ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"}`}>
              {avatarText(f.efetivo?.nome_guerra)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black uppercase truncate">{f.efetivo?.nome_guerra ?? "—"}</p>
                {emGozo && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest shrink-0">
                    EM GOZO
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">{f.efetivo?.matricula}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0">
              <Calendar size={10} />
              <span>{formatDate(f.data_inicio)} – {formatDate(f.data_fim)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
