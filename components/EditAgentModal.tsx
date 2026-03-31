"use client";

import { useState, useEffect } from "react";
import { X, Save, Shield, User, Fingerprint, Award, Layers, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Agent {
  id: string;
  matricula: string;
  nome_completo: string;
  nome_guerra: string;
  posto_grad: string;
  status: string;
  grupo_turno: string;
  tipo_escala: string;
}

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Agent | null;
}

const POSTOS_GRAD = ["Guarda", "Subinspetor", "Inspetor"];
const TURNOS = ["A", "B", "A II", "B II"];
const ESCALAS = ["24x72", "2x2", "Expediente"];
const STATUS_OPTIONS = ["ATIVO", "FERIAS", "AFASTADO", "LICENCO"];

export default function EditAgentModal({ isOpen, onClose, onSuccess, agent }: EditAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricula: "",
    nome_completo: "",
    nome_guerra: "",
    posto_grad: "Guarda",
    status: "ATIVO",
    grupo_turno: "A",
    tipo_escala: "24x72"
  });

  useEffect(() => {
    if (agent && isOpen) {
      console.log("Populando modal com agente:", agent);
      setFormData({
        matricula: agent.matricula || "",
        nome_completo: agent.nome_completo || "",
        nome_guerra: agent.nome_guerra || "",
        posto_grad: agent.posto_grad || "Guarda",
        status: agent.status || "ATIVO",
        grupo_turno: agent.grupo_turno || "A",
        tipo_escala: agent.tipo_escala || "24x72"
      });
    }
  }, [agent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("efetivo")
        .update({
          matricula: formData.matricula,
          nome_completo: formData.nome_completo,
          nome_guerra: formData.nome_guerra,
          posto_grad: formData.posto_grad,
          status: formData.status,
          grupo_turno: formData.grupo_turno,
          tipo_escala: formData.tipo_escala,
        })
        .eq("id", agent.id);

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar agente:", error);
      alert("Erro ao atualizar dados do agente: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/10">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Editar Guerreiro</h2>
                  <p className="text-sm text-blue-400 font-bold uppercase tracking-[0.2em] opacity-60">Atualização Cadastral GTAM</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nome de Guerra */}
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Nome de Guerra</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-base font-bold uppercase text-white"
                      value={formData.nome_guerra}
                      onChange={(e) => setFormData({...formData, nome_guerra: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                {/* Matrícula */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Matrícula</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50 transition-all text-base font-mono font-bold text-white"
                      value={formData.matricula}
                      onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                    />
                  </div>
                </div>

                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-base font-bold text-white"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({...formData, nome_completo: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                {/* Turno */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Turno Operacional</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/40" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-base font-bold appearance-none text-white"
                      value={formData.grupo_turno}
                      onChange={(e) => setFormData({...formData, grupo_turno: e.target.value})}
                    >
                      {TURNOS.map(t => (
                        <option key={t} value={t} className="bg-[#0a0f1e]">TURNO {t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Graduação */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Graduação</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-sm font-bold appearance-none text-white"
                      value={formData.posto_grad}
                      onChange={(e) => setFormData({...formData, posto_grad: e.target.value})}
                    >
                      {POSTOS_GRAD.map(p => (
                        <option key={p} value={p} className="bg-[#0a0f1e]">{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Escala */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Escala</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/40" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm font-bold appearance-none text-white"
                      value={formData.tipo_escala}
                      onChange={(e) => setFormData({...formData, tipo_escala: e.target.value})}
                    >
                      {ESCALAS.map(es => (
                        <option key={es} value={es} className="bg-[#0a0f1e]">{es.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Situação</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-base font-bold appearance-none text-white"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-[#0a0f1e]">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/5 text-muted-foreground"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      SALVAR ALTERAÇÕES
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
