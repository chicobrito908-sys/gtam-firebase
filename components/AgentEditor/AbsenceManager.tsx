"use client";

import React, { useState } from "react";
import { Plus, Trash2, Activity } from "lucide-react";
import Button from "@/components/ui/Button";

interface AbsenceManagerProps {
  afastamentos: any[];
  onAdd: (data: any) => void;
  onRemove: (id: string) => void;
}

const TIPOS = ["F.A", "R.P", "M.P", "ATESTADO", "L.P", "AMSEC", "SANGUE"];

export default function AbsenceManager({ afastamentos, onAdd, onRemove }: AbsenceManagerProps) {
  const [novo, setNovo] = useState({ tipo: "F.A", data_inicio: "", data_fim: "", motivo: "" });

  return (
    <div className="p-8 space-y-8">
      <div className="p-8 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-[2.5rem] space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] flex items-center gap-3">
          <Activity size={16} /> Lançar Nova Condulção / Afastamento
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Tipo</label>
            <select 
              className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white"
              value={novo.tipo}
              onChange={e => setNovo({...novo, tipo: e.target.value})}
            >
              {TIPOS.map(t => <option key={t} value={t} className="bg-[#0a0f1e]">{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Início</label>
            <input type="date" value={novo.data_inicio} onChange={e => setNovo({...novo, data_inicio: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
          </div>
          {/* Outros campos e botão de adicionar */}
        </div>
        <input type="text" placeholder="MOTIVO / OBS..." value={novo.motivo} onChange={e => setNovo({...novo, motivo: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
        <Button onClick={() => { onAdd(novo); setNovo({ tipo: "F.A", data_inicio: "", data_fim: "", motivo: "" }); }} disabled={!novo.data_inicio} className="w-full uppercase tracking-widest text-[10px] font-black">
          ADICIONAR REGISTRO
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Histórico Recente</h4>
        {afastamentos.map(af => (
          <div key={af.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${af.tipo === 'ATESTADO' ? 'bg-rose-500/20 text-rose-500' : 'bg-[#7c3aed]/20 text-[#7c3aed]'}`}>
                {af.tipo}
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase">{af.data_inicio} {af.data_fim && `- ${af.data_fim}`}</p>
                <p className="text-[9px] text-white/30 uppercase font-black">{af.motivo || 'SEM OBS'}</p>
              </div>
            </div>
            <button onClick={() => onRemove(af.id)} className="p-2 text-rose-500 opacity-20 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
