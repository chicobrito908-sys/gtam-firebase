"use client";

import React, { useState } from "react";
import { Trash2, Activity } from "lucide-react";
import Button from "@/components/ui/Button";

interface AbsenceManagerProps {
  afastamentos: {
    id: string;
    tipo: string;
    data_inicio: string;
    data_fim?: string;
    motivo?: string;
  }[];
  ferias: {
    id: string;
    data_inicio: string;
    data_fim: string;
    ano_referencia?: number;
  }[];
  onAdd: (data: { tipo: string; data_inicio: string; data_fim: string; motivo: string }) => void;
  onRemove: (id: string) => void;
  onRemoveVacation: (id: string) => void;
  agent: {
    tipo_escala?: string;
    [key: string]: any;
  } | null;
}

const ALL_TIPOS = [
  { id: "F.A",     label: "F.A (Folga Agendada)" },
  { id: "R.P",     label: "R.P (Redução de Plantão)", restricted: true },
  { id: "M.P",     label: "M.P (Meio Plantão)",       restricted: true },
  { id: "ATESTADO",label: "ATESTADO" },
  { id: "SANGUE",  label: "DOAÇÃO DE SANGUE" },
];

export default function AbsenceManager({ afastamentos, ferias, onAdd, onRemove, onRemoveVacation, agent }: AbsenceManagerProps) {
  const [novo, setNovo] = useState({ tipo: "F.A", data_inicio: "", data_fim: "", motivo: "" });

  const validTipos = ALL_TIPOS.filter(t => !t.restricted || agent?.tipo_escala === "24x72");

  const handleInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setNovo(prev => ({
      ...prev,
      data_inicio: v,
      // Herda automaticamente SE data_fim estiver vazio ou igual ao data_inicio anterior
      // (ou seja, não foi editado manualmente para um período diferente)
      data_fim: (!prev.data_fim || prev.data_fim === prev.data_inicio) ? v : prev.data_fim,
    }));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="p-8 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-[2.5rem] space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c3aed] flex items-center gap-3">
          <Activity size={16} /> Lançar Novo Afastamento / Condição
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Tipo</label>
            <select 
              className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white"
              value={novo.tipo}
              onChange={e => setNovo({...novo, tipo: e.target.value})}
            >
              {validTipos.map(t => <option key={t.id} value={t.id} className="bg-[#0a0f1e]">{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Início</label>
            <input type="date" value={novo.data_inicio} onChange={handleInicioChange} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/20 uppercase ml-1">Fim</label>
            <input type="date" value={novo.data_fim} onChange={e => setNovo({...novo, data_fim: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
          </div>
        </div>
        <input type="text" placeholder="MOTIVO / OBS..." value={novo.motivo} onChange={e => setNovo({...novo, motivo: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-bold text-white outline-none" />
        <Button onClick={() => { onAdd(novo); setNovo({ tipo: "F.A", data_inicio: "", data_fim: "", motivo: "" }); }} disabled={!novo.data_inicio || !novo.data_fim} className="w-full uppercase tracking-widest text-[10px] font-black">
          ADICIONAR REGISTRO
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Histórico Recente</h4>
        {afastamentos.map(af => (
          <div key={af.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${af.tipo === 'ATESTADO' ? 'bg-rose-500/20 text-rose-500' : af.tipo === 'FERIAS' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#7c3aed]/20 text-[#7c3aed]'}`}>
                {af.tipo === 'FERIAS' ? 'FE' : af.tipo}
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase">{af.data_inicio} {af.data_fim && `- ${af.data_fim}`}</p>
                <p className="text-[9px] text-white/30 uppercase font-black">{af.motivo || 'SEM OBS'}</p>
              </div>
            </div>
            <button onClick={() => onRemove(af.id)} className="p-2 text-rose-500 opacity-20 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
        {ferias.map(f => (
          <div key={f.id} className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black text-[10px]">FE</div>
              <div>
                <p className="text-xs font-black text-white">{f.data_inicio} - {f.data_fim}</p>
                <p className="text-[9px] text-indigo-400/60 font-black uppercase">FÉRIAS — Ref. {f.ano_referencia || ''}</p>
              </div>
            </div>
            <button onClick={() => onRemoveVacation(f.id)} className="p-2 text-rose-500 opacity-20 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
