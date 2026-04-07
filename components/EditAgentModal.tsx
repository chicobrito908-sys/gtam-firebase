"use client";

import React, { useState } from "react";
import { X, User, Activity, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentEditor } from "@/hooks/useAgentEditor";
import AgentForm from "./AgentEditor/AgentForm";
import AbsenceManager from "./AgentEditor/AbsenceManager";
import VacationManager from "./AgentEditor/VacationManager";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: any;
}

export default function EditAgentModal({ isOpen, onClose, onSuccess, agent }: EditAgentModalProps) {
  const [activeTab, setActiveTab] = useState<"dados" | "afastamentos" | "ferias">("dados");
  const s = useAgentEditor(agent, isOpen, onSuccess, onClose);

  if (!isOpen) return null;

  const TABS = [
    { id: "dados", label: "Dados Cadastrais", icon: <User size={14} /> },
    { id: "afastamentos", label: "Afastamentos / RP / FA", icon: <Activity size={14} /> },
    { id: "ferias", label: "Gestão de Férias", icon: <Calendar size={14} /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#7c3aed]/20 to-indigo-600/20 p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7c3aed] rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-[#7c3aed]/20"><User className="text-white" size={28} /></div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Editar Guerreiro</h2>
                <p className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.2em] opacity-60">Atualização Cadastral GTAM</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
          </div>

          <div className="flex bg-[#0d1629] border-b border-white/5 p-1 gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20" : "text-white/20 hover:text-white hover:bg-white/5"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {activeTab === "dados" && <AgentForm formData={s.formData} setFormData={s.setFormData} onSubmit={s.handleUpdateAgent} onCancel={onClose} loading={s.loading} />}
            {activeTab === "afastamentos" && <AbsenceManager afastamentos={s.afastamentos} onAdd={s.handleAddAbsence} onRemove={s.handleRemoveAbsence} />}
            {activeTab === "ferias" && <VacationManager ferias={s.ferias} onAdd={s.handleAddVacation} onRemove={s.handleRemoveVacation} />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
