"use client";
import React from "react";
import type { ForceCard as ForceCardType } from "@/lib/types/dashboard";

interface Props { card: ForceCardType }

export default function ForceCard({ card }: Props) {
  const { title, subtitle, icon: Icon, iconColor, panelTint, barColor, total, available, blocked } = card;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-xl shadow-black/20 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 ${panelTint} rounded-xl`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${pct >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"} uppercase tracking-widest`}>
          {pct}% disp.
        </span>
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black">{available}</span>
        <span className="text-sm text-muted-foreground font-bold">de {total}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-4 text-xs">
        <span className="text-muted-foreground"><b className="text-rose-400 font-black">{blocked}</b> bloq.</span>
        <span className="text-muted-foreground"><b className="text-amber-400 font-black">{total}</b> total</span>
      </div>
    </div>
  );
}
