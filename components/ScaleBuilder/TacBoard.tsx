"use client";

import React from "react";
import { Shield, Star, Zap, Trash2, Plus } from "lucide-react";
import Button from "@/components/ui/Button";

interface Mission {
  tipo: string;
  descricao: string;
}

interface TacBoardProps {
  missoes: Mission[];
  onAdd: (tipo: "MISSAO" | "ALERTA") => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, newDesc: string) => void;
}

export default function TacBoard({ missoes, onAdd, onRemove, onUpdate }: TacBoardProps) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
      <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-4 py-1">
        <div className="flex items-center gap-3">
          <Shield size={16} className="text-emerald-500" />
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-emerald-500">
            Missões e Alertas (Tac-Board)
          </h3>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAdd("MISSAO")} className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10">
            <Star size={14} className="mr-2" /> + Missão
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAdd("ALERTA")} className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
            <Zap size={14} className="mr-2" /> + Alerta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missoes.map((m, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${
              m.tipo === "ALERTA"
                ? "bg-amber-500/5 border-amber-500/10"
                : "bg-emerald-500/5 border-emerald-500/10"
            } group relative`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {m.tipo === "ALERTA" ? (
                  <Zap size={14} className="text-amber-500" />
                ) : (
                  <Star size={14} className="text-emerald-500" />
                )}
                <span className={`text-[8px] font-black uppercase tracking-widest ${m.tipo === "ALERTA" ? "text-amber-500" : "text-emerald-500"}`}>
                  {m.tipo}
                </span>
              </div>
              <button
                onClick={() => onRemove(idx)}
                className="text-rose-500/60 hover:text-rose-500 opacity-40 group-hover:opacity-100 transition-all p-1 hover:bg-rose-500/10 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={m.descricao}
              onChange={(e) => onUpdate(idx, e.target.value)}
              className="text-[11px] font-bold text-white/70 mt-2 leading-relaxed bg-transparent border-none w-full min-h-[60px] resize-none focus:text-white focus:bg-white/5 p-1 rounded outline-none"
              placeholder="Descreva a missão ou alerta..."
            />
          </div>
        ))}
        
        {missoes.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/10">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">
              Aguardando definição de ordens e missões
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
