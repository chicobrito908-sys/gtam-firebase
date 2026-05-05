"use client";

import React, { useState } from "react";
import { Trash2, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";

interface Vacation {
  id: string;
  data_inicio: string;
  data_fim: string;
  ano_referencia?: number;
}

interface VacationManagerProps {
  ferias: Vacation[];
  onAdd: (data: { data_inicio: string; data_fim: string; ano_referencia: number }) => void;
  onRemove: (id: string) => void;
}

export default function VacationManager({ ferias, onAdd, onRemove }: VacationManagerProps) {
  const [novo, setNovo] = useState({ data_inicio: "", data_fim: "", ano_referencia: new Date().getFullYear() });

  return (
    <div className="p-8 space-y-6">
      <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
          <Calendar size={16} /> Programar Novas Férias
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Início</label>
            <input type="date" value={novo.data_inicio} onChange={e => setNovo({...novo, data_inicio: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Fim</label>
            <input type="date" value={novo.data_fim} onChange={e => setNovo({...novo, data_fim: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
          </div>
        </div>
        
        <Button onClick={() => { onAdd(novo); setNovo({ data_inicio: "", data_fim: "", ano_referencia: new Date().getFullYear() }); }} disabled={!novo.data_inicio || !novo.data_fim} className="w-full uppercase tracking-widest text-[10px] font-black">
          AGENDAR FÉRIAS
        </Button>
      </div>

      <div className="space-y-3">
        {ferias.map(f => (
          <div key={f.id} className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black text-[10px]">FE</div>
              <div>
                <p className="text-xs font-black text-white">{f.data_inicio} ATÉ {f.data_fim}</p>
                <p className="text-[9px] text-indigo-400/60 font-black tracking-widest uppercase">REFERÊNCIA: {f.ano_referencia}</p>
              </div>
            </div>
            <button onClick={() => onRemove(f.id)} className="p-2 text-rose-500 opacity-20 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
