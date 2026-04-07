"use client";

import React, { useState } from "react";
import { X, UserPlus, Calendar, Shield } from "lucide-react";

interface QuickAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  efetivo: any[];
  onSave: (efetivoId: string, tipo: string) => void;
}

const ABSENCE_TYPES = [
  "FOLGA", "LICENCA", "ATESTADO", "F.A", "R.P", "M.P", "SANGUE", "DISPENSA", "NUTRI", "OUTROS"
];

export default function QuickAbsenceModal({ isOpen, onClose, date, efetivo, onSave }: QuickAbsenceModalProps) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedType, setSelectedType] = useState("FOLGA");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><Calendar size={20} /></div>
             <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Registrar Ausência</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{date}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Agente</label>
            <div className="relative group">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none"
              >
                <option value="">Selecione um agente...</option>
                {efetivo.map(a => (<option key={a.id} value={a.id}>{a.posto_grad} {a.nome_guerra}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tipo de Ausência</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ABSENCE_TYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => setSelectedType(type)}
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedType === type ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-white/40 hover:bg-white/5 transition-all outline-none">Cancelar</button>
          <button 
            onClick={() => { if (selectedAgent) onSave(selectedAgent, selectedType); }}
            disabled={!selectedAgent}
            className="flex-1 bg-primary hover:bg-primary/80 disabled:opacity-50 py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg shadow-primary/20 transition-all outline-none flex items-center justify-center gap-2"
          >
            <Shield size={14} /> Salvar Registro
          </button>
        </div>
      </div>
    </div>
  );
}
