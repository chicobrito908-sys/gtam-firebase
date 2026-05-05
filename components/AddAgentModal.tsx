"use client";

import { useState } from "react";
import { X, Shield, User, Fingerprint, Award, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

import { POSTOS_GRAD, TURNOS, ESCALAS } from "@/lib/constants/efetivo";

export default function AddAgentModal({ isOpen, onClose, onSuccess }: AddAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricula: "",
    nome_completo: "",
    nome_guerra: "",
    posto_grad: "Guarda",
    grupo_turno: "A",
    tipo_escala: "24x72",
    status: "ATIVO",
    setor: "GTAM",
    antiguidade: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("efetivo")
        .insert([formData]);

      if (error) throw error;
      
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        matricula: "",
        nome_completo: "",
        nome_guerra: "",
        posto_grad: "Guarda",
        grupo_turno: "A",
        tipo_escala: "24x72",
        status: "ATIVO",
        setor: "GTAM",
        antiguidade: ""
      });
    } catch (error: any) {
      alert("Erro ao cadastrar agente: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header Header */}
            <div className="bg-gradient-to-r from-primary/20 to-indigo-600/20 p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_8px_16px_rgba(124,58,237,0.3)]">
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Novo Agente</h2>
                  <p className="text-sm text-primary font-bold uppercase tracking-[0.2em] opacity-60">Cadastro Operacional GTAM</p>
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
                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-base font-bold text-white placeholder:text-white/20"
                      placeholder="NOME COMPLETO DO SERVIDOR"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                {/* Nome de Guerra */}
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Nome de Guerra</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-base font-bold uppercase text-white placeholder:text-white/20"
                      placeholder="EX: CHICO BRITO"
                      value={formData.nome_guerra}
                      onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                {/* Matrícula */}
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Matrícula (Prontuário)</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/40" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50 transition-all text-base font-mono font-bold text-white placeholder:text-white/20"
                      placeholder="00.000-0"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    />
                  </div>
                </div>

                {/* Hierarquia */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hierarquia</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all text-base font-bold appearance-none text-white"
                      value={formData.posto_grad}
                      onChange={(e) => setFormData({ ...formData, posto_grad: e.target.value })}
                    >
                      {POSTOS_GRAD.map((p) => (
                        <option key={p} value={p} className="bg-[#0a0f1e]">{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Antiguidade */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Antiguidade (#)</label>
                  <div className="relative">
                    < Award className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                    <input
                      required
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-base font-bold text-white"
                      placeholder="0"
                      value={formData.antiguidade}
                      onChange={(e) => setFormData({ ...formData, antiguidade: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Turno / Grupo */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Turno / Grupo</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-base font-bold appearance-none text-white"
                  value={formData.grupo_turno}
                  onChange={(e) => setFormData({ ...formData, grupo_turno: e.target.value })}
                >
                  {TURNOS.map((t) => (
                    <option key={t} value={t} className="bg-[#0a0f1e]">{t}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Escala */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Escala</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-base font-bold appearance-none text-white"
                  value={formData.tipo_escala}
                  onChange={(e) => setFormData({ ...formData, tipo_escala: e.target.value })}
                >
                  {ESCALAS.map((s) => (
                    <option key={s} value={s} className="bg-[#0a0f1e]">{s}</option>
                  ))}
                </select>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_30px_rgba(124,58,237,0.2)]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      <span>SALVAR AGENTE NA BASE DE DADOS</span>
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
