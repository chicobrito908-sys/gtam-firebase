"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Agent, ScaleEntry, VTR, AptitudeResult } from "@/types/agent";
import { getAgentAptitude } from "@/lib/services/aptitudeService";
import { generateWhatsAppText } from "@/lib/services/scaleService";

export function useScaleBuilder(initialDate?: string) {
  const [date, setDate] = useState<string>(initialDate ?? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })());
  const [turno, setTurno] = useState("MANHÃ");
  const [efetivo, setEfetivo] = useState<Agent[]>([]);
  const [afastamentos, setAfastamentos] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<ScaleEntry[]>([]);
  const [missoes, setMissoes] = useState<{ tipo: string; descricao: string }[]>([]);
  const [vtrsMap, setVtrsMap] = useState<Record<string, VTR[]>>({ BI: [], BII: [], TITULAR: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [allDayScales, setAllDayScales] = useState<any[]>([]);
  const [selectingFor, setSelectingFor] = useState<{ equipe: string; funcao: string } | null>(null);
  const [comandoAgents, setComandoAgents] = useState<ScaleEntry[]>([]);

  // Carregar dados iniciais
  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data: ef } = await supabase.from("efetivo").select("*");
      const { data: af } = await supabase.from("afastamentos").select("*");
      const { data: fe } = await supabase.from("ferias").select("*");
      const { data: dayScales } = await supabase.from("escalas").select("*").eq("data", date);

      if (ef) setEfetivo(ef);
      if (af) setAfastamentos(af);
      if (fe) setFerias(fe);
      
      const scales = dayScales || [];
      setAllDayScales(scales);

      // Separar a Supervisão/Comando
      const cmdScale = scales.find((s: any) => s.turno === "COMANDO");
      setComandoAgents(cmdScale?.agentes || []);

      const sc = scales.find((s: any) => s.turno === turno);
      if (sc) {
        setSelectedAgents(sc.agentes || []);
        setMissoes(sc.missoes || []);
        setVtrsMap(sc.vtrsMap || { BI: [], BII: [], TITULAR: [] });
      } else {
        setSelectedAgents([]);
        setMissoes([]);
        setVtrsMap({ BI: [], BII: [], TITULAR: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [date, turno]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aptidão — SSOT: cruza afastamentos e férias com a data da escala
  const getAptitude = useCallback((agentId: string): AptitudeResult => {
    return getAgentAptitude(agentId, date, afastamentos, ferias);
  }, [afastamentos, ferias, date]);

  // Handlers
  const handleAddVtr = (sub: string) => {
    const id = `GTAM ${Math.floor(Math.random() * 100)}`;
    setVtrsMap(prev => ({ ...prev, [sub]: [...prev[sub], { id, type: 'MOTO' }] }));
  };

  const handleRenameVtr = (sub: string, oldId: string, newId: string) => {
    setVtrsMap(prev => ({ ...prev, [sub]: prev[sub].map(v => v.id === oldId ? { ...v, id: newId } : v) }));
    setSelectedAgents(prev => prev.map(a => a.equipe === oldId && a.funcao === sub ? { ...a, equipe: newId } : a));
  };

  const handleToggleVtrType = (sub: string, id: string) => {
    setVtrsMap(prev => ({ ...prev, [sub]: prev[sub].map(v => v.id === id ? { ...v, type: v.type === 'MOTO' ? 'CARRO' : 'MOTO' } : v) }));
  };

  const handleRemoveVtr = (sub: string, id: string) => {
    setVtrsMap(prev => ({ ...prev, [sub]: prev[sub].filter(v => v.id !== id) }));
    setSelectedAgents(prev => prev.filter(a => !(a.equipe === id && a.funcao === sub)));
  };

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.agentId !== agentId));
    setComandoAgents(prev => prev.filter(a => a.agentId !== agentId));
  };

  const handleSelectAgent = (agentId: string) => {
    if (!selectingFor) return;
    if (selectingFor.funcao === "SUPERVISÃO" || selectingFor.funcao === "ARMARIA") {
      setComandoAgents(prev => [...prev.filter(a => a.funcao !== selectingFor.funcao), { agentId, ...selectingFor }]);
    } else {
      setSelectedAgents(prev => [...prev.filter(a => a.agentId !== agentId), { agentId, ...selectingFor }]);
    }
    setSelectingFor(null);
  };

  const handleSave = async (onSuccess?: () => void) => {
    setIsLoading(true);

    const saveCurrent = supabase.from("escalas").upsert([{
      data: date,
      turno,
      agentes: selectedAgents,
      missoes,
      vtrsMap
    }], { onConflict: "data,turno" });
    
    // Salvar sempre o turno flutuante do comando
    const saveComando = supabase.from("escalas").upsert([{
      data: date,
      turno: "COMANDO",
      agentes: comandoAgents,
      missoes: [],
      vtrsMap: { BI: [], BII: [], TITULAR: [] }
    }], { onConflict: "data,turno" });

    const [res1, res2] = await Promise.all([saveCurrent, saveComando]);

    setIsLoading(false);
    if (!res1.error && !res2.error) {
      if (onSuccess) onSuccess();
      else window.location.href = '/escalas';
    }
  };

  const handleShare = () => {
    // Para simplificar, a mensagem de WhatsApp englobará todos selecionados (incluindo Comando se tratarmos no backend ou se juntarmos)
    const allTextAgents = [...comandoAgents, ...selectedAgents];
    const text = generateWhatsAppText(date, turno, allTextAgents, missoes, [], vtrsMap, (id) => efetivo.find(a => a.id === id));
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return {
    date, setDate, turno, setTurno, efetivo, afastamentos, ferias, selectedAgents, comandoAgents, missoes, setMissoes,
    vtrsMap, isLoading, isFetching, allDayScales, selectingFor, setSelectingFor,
    getAptitude, handleAddVtr, handleRenameVtr, handleToggleVtrType, handleRemoveVtr,
    handleRemoveAgent, handleSelectAgent, handleSave, handleShare
  };
}
