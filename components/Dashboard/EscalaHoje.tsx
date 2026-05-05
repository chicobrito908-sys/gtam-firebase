"use client";
import { Users, Clock } from "lucide-react";
import type { Escala } from "@/lib/types/dashboard";
import { groupEscalas, formatTurnoLabel, avatarText } from "@/lib/utils/dashboardUtils";
import SectionCard from "./SectionCard";

interface Props { escalas: Escala[] }

const TURNO_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  "24x72": { icon: Clock, color: "text-primary",      bg: "bg-primary/10",     border: "border-primary/20" },
  MANHA:   { icon: Clock, color: "text-amber-400",    bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  TARDE:   { icon: Clock, color: "text-blue-400",     bg: "bg-blue-500/10",    border: "border-blue-500/20" },
};

export default function EscalaHoje({ escalas }: Props) {
  const grouped = groupEscalas(escalas);

  if (grouped.size === 0) {
    return (
      <SectionCard title="Escala de Hoje" icon={Users} subtitle="Distribuição por turno">
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50">
          <Clock size={32} />
          <p className="text-sm font-bold">Nenhuma escala registrada para hoje</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Escala de Hoje" icon={Users} subtitle="Distribuição por turno">
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([turno, byTeam]) => {
          const style = TURNO_STYLES[turno] ?? TURNO_STYLES.TARDE;
          const TurnoIcon = style.icon;
          return (
            <div key={turno}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 ${style.bg} rounded-lg`}>
                  <TurnoIcon size={14} className={style.color} />
                </div>
                <p className={`text-xs font-black uppercase tracking-widest ${style.color}`}>
                  {formatTurnoLabel(turno)}
                </p>
              </div>
              <div className="space-y-4">
                {Array.from(byTeam.entries()).map(([equipe, members]) => (
                  <div key={equipe}>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black mb-2 ml-1">{equipe}</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((e) => (
                        <div key={e.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${style.border} ${style.bg} hover:opacity-80 transition-all`}>
                          <div className={`w-6 h-6 rounded-lg ${style.bg} flex items-center justify-center text-[9px] font-black ${style.color}`}>
                            {avatarText(e.efetivo?.nome_guerra)}
                          </div>
                          <div>
                            <p className={`text-xs font-black uppercase ${style.color}`}>{e.efetivo?.nome_guerra ?? "—"}</p>
                            <p className="text-[9px] text-muted-foreground font-mono">{e.efetivo?.matricula}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
