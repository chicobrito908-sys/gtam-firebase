"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type Escala = {
  id?: string;
  data: string;
  turno?: string;
  agentes?: any[];
  missoes?: any[];
  vtrsMap?: any;
  status?: string;
};

export function todayStrFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useEscalasData() {
  const [currentDate, setCurrentDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(() => todayStrFromDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [missoes, setMissoes] = useState<any[]>([]);
  const [ausencias, setAusencias] = useState<any[]>([]);
  const [newAfastamentos, setNewAfastamentos] = useState<any[]>([]);
  const [newFerias, setNewFerias] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [addingAusencia, setAddingAusencia] = useState<string | null>(null);
  const [efetivo, setEfetivo] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: scalesData } = await supabase
        .from("escalas")
        .select("*")
        .gte("data", todayStrFromDate(firstDate))
        .lte("data", todayStrFromDate(lastDate));

      setEscalas(scalesData || []);

      const currentScale = (scalesData || []).find((sc: any) => sc.data === selectedDay);
      setMissoes(currentScale?.missoes || []);

      const { data: ausenciasData } = await supabase
        .from("ausencias")
        .select("*, efetivo:efetivo_id(nome_guerra, posto_grad)")
        .gte("data", todayStrFromDate(firstDate))
        .lte("data", todayStrFromDate(lastDate));
      setAusencias(ausenciasData || []);

      const { data: efetivoData } = await supabase.from("efetivo").select("*").eq("status", "ATIVO");
      setEfetivo(efetivoData || []);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedDay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleAddAusencia = async (efetivoId: string, tipo: string) => {
     if (!addingAusencia) return;
     const { error } = await supabase.from("ausencias").insert([{
        data: addingAusencia,
        efetivo_id: efetivoId,
        tipo,
        status: "ATIVO"
     }]);

     if (!error) {
        setAddingAusencia(null);
        fetchData();
     }
  };

  const removeAusencia = async (id: string) => {
     if (!confirm("Remover este registro de ausência?")) return;
     const { error } = await supabase.from("ausencias").delete().eq("id", id);
     if (!error) fetchData();
  };

  return {
    currentDate,
    selectedDay,
    setSelectedDay,
    loading,
    escalas,
    missoes,
    ausencias,
    newAfastamentos,
    newFerias,
    view,
    setView,
    addingAusencia,
    setAddingAusencia,
    efetivo,
    changeMonth,
    handleAddAusencia,
    removeAusencia,
    fetchData
  };
}
