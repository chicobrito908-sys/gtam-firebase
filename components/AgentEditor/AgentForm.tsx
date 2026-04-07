"use client";

import React from "react";
import { Shield, Fingerprint, User, Layers, Clock, Activity, Save } from "lucide-react";
import Button from "@/components/ui/Button";

interface AgentFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

const POSTOS_GRAD = ["Guarda", "Subinspetor", "Inspetor"];
const TURNOS = ["A", "B", "A II", "B II"];
const ESCALAS = ["24x72", "2x2", "Expediente"];
const STATUS_OPTIONS = ["ATIVO", "FERIAS", "AFASTADO", "LICENÇA"]; // Corrigido typo LICENCO

export default function AgentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
}: AgentFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome de Guerra */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-[#7c3aed]/60 ml-1">Nome de Guerra</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
            <input
              required
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 transition-all text-base font-bold uppercase text-white"
              value={formData.nome_guerra}
              onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Matrícula */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#7c3aed]/60 ml-1">Matrícula</label>
          <div className="relative">
            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/40" size={18} />
            <input
              required
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 transition-all text-base font-mono font-bold text-white"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
            />
          </div>
        </div>

        {/* Nome Completo */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-[#7c3aed]/60 ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/40" size={18} />
            <input
              required
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 transition-all text-base font-bold text-white"
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Selects */}
        {[
          { label: "Turno", value: "grupo_turno", options: TURNOS, icon: <Layers size={18} /> },
          { label: "Graduação", value: "posto_grad", options: POSTOS_GRAD, icon: <Shield size={18} /> },
          { label: "Escala", value: "tipo_escala", options: ESCALAS, icon: <Clock size={18} /> },
          { label: "Situação", value: "status", options: STATUS_OPTIONS, icon: <Activity size={18} /> },
        ].map((field) => (
          <div key={field.value} className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#7c3aed]/60 ml-1">
              {field.label}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                {field.icon}
              </div>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 appearance-none text-white font-bold"
                value={formData[field.value]}
                onChange={(e) => setFormData({ ...formData, [field.value]: e.target.value })}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0a0f1e]">
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex gap-3">
        <Button variant="ghost" onClick={onCancel} className="flex-1 py-5">
          CANCELAR
        </Button>
        <Button onClick={onSubmit} isLoading={loading} className="flex-[2] py-5">
          <Save size={18} className="mr-2" /> SALVAR ALTERAÇÕES
        </Button>
      </div>
    </form>
  );
}
