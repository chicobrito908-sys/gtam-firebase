"use client";

import React, { useState, useMemo } from "react";
import { X, UserPlus, Calendar, Shield, Search, Check } from "lucide-react";

interface QuickAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  efetivo: any[];
  onSave: (efetivoId: string, tipo: string) => void;
}

const ABSENCE_TYPES = [
  "F.A", "R.P", "M.P", "ATESTADO", "DOAÇÃO DE SANGUE", "LM", "LIP", "OUTROS"
];

export default function QuickAbsenceModal({ isOpen, onClose, date, efetivo, onSave }: QuickAbsenceModalProps) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedType, setSelectedType] = useState("FOLGA");
  const [search, setSearch] = useState("");

  const filteredEfetivo = useMemo(() => {
    return efetivo.filter(a => 
      a.nome_guerra.toLowerCase().includes(search.toLowerCase()) ||
      a.posto_grad.toLowerCase().includes(search.toLowerCase())
    );
  }, [efetivo, search]);

  if (!isOpen) return null;

  const displayDate = date ? new Date(date + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b0e14] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-t-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 ring-1 ring-rose-500/20 shadow-lg shadow-rose-500/5"><Calendar size={20} /></div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight italic">Registrar Ausência</h2>
              <p className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest">{displayDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all ring-1 ring-transparent hover:ring-white/10"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Agent Selection - Custom Searchable List */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Selecione o Agente</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Buscar por nome ou posto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredEfetivo.map(a => {
                const name = a.nome_guerra.replace(/^(SI|GD|GM|GC|CD|IR|Insp|SubInsp)\s+/i, '').trim();
                return (
                  <button 
                    key={a.id}
                    onClick={() => setSelectedAgent(a.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedAgent === a.id ? 'bg-primary/20 border-primary/40 text-primary shadow-inner' : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05] hover:border-white/10'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {name}
                    </span>
                    {selectedAgent === a.id && <Check size={14} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Absence Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Tipo de Registro</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ABSENCE_TYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => setSelectedType(type)}
                  className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase transition-all border tracking-widest ${selectedType === type ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 shadow-lg' : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20 hover:text-white/60'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-white/30 hover:bg-white/5 transition-all ring-1 ring-transparent hover:ring-white/5">Cancelar</button>
          <button 
            onClick={() => { if (selectedAgent) onSave(selectedAgent, selectedType); }}
            disabled={!selectedAgent}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-2xl transition-all flex items-center justify-center gap-2 ${selectedAgent ? 'bg-primary hover:bg-primary/80 shadow-primary/20 hover:-translate-y-0.5' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
          >
            <Shield size={14} /> Confirmar Registro
          </button>
        </div>
      </div>
    </div>
  );
}

