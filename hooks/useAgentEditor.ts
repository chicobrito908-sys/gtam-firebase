"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useAgentEditor(agent: any, isOpen: boolean, onSuccess: () => void, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [afastamentos, setAfastamentos] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    matricula: "",
    nome_completo: "",
    nome_guerra: "",
    posto_grad: "Guarda",
    status: "ATIVO",
    grupo_turno: "B",
    tipo_escala: "24x72"
  });

  const fetchData = useCallback(async () => {
    if (!agent?.id) return;
    const { data: af } = await supabase.from("afastamentos").select("*").eq("efetivo_id", agent.id).order("data_inicio", { ascending: false });
    const { data: fe } = await supabase.from("ferias").select("*").eq("efetivo_id", agent.id).order("data_inicio", { ascending: false });
    setAfastamentos(af || []);
    setFerias(fe || []);
  }, [agent?.id]);

  useEffect(() => {
    if (agent && isOpen) {
      setFormData({
        matricula: agent.matricula || "",
        nome_completo: agent.nome_completo || "",
        nome_guerra: agent.nome_guerra || "",
        posto_grad: agent.posto_grad || "Guarda",
        status: agent.status || "ATIVO",
        grupo_turno: agent.grupo_turno || "A",
        tipo_escala: agent.tipo_escala || "24x72"
      });
      fetchData();
    }
  }, [agent, isOpen, fetchData]);

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("efetivo").update(formData).eq("id", agent.id);
    if (!error) { onSuccess(); onClose(); }
    setLoading(false);
  };

  const handleAddAbsence = async (data: any) => {
    await supabase.from("afastamentos").insert([{ efetivo_id: agent.id, ...data, data_fim: data.data_fim || data.data_inicio }]);
    fetchData();
  };

  const handleRemoveAbsence = async (id: string) => {
    await supabase.from("afastamentos").delete().eq("id", id);
    fetchData();
  };

  const handleAddVacation = async (data: any) => {
    await supabase.from("ferias").insert([{ efetivo_id: agent.id, ...data, status: "AGENDADO" }]);
    fetchData();
  };

  const handleRemoveVacation = async (id: string) => {
    await supabase.from("ferias").delete().eq("id", id);
    fetchData();
  };

  return {
    loading, formData, setFormData, afastamentos, ferias,
    handleUpdateAgent, handleAddAbsence, handleRemoveAbsence, handleAddVacation, handleRemoveVacation
  };
}
