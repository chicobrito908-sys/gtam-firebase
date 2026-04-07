"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Agent, ScaleEntry, VTR, AptitudeResult } from "@/types/agent";
import { getAgentAptitude } from "@/lib/services/aptitudeService";
import { generateWhatsAppText } from "@/lib/services/scaleService";

export function useScaleBuilder(initialDate?: string) {
  const [date, setDate] = useState<string>(initialDate ?? new Date().toISOString().split("T")[0]);
  const [turno, setTurno] = useState("MANHÃ");
  const [efetivo, setEfetivo] = useState<Agent[]>([]);
  const [ausencias, setAusencias] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<ScaleEntry[]>([]);
  const [missoes, setMissoes] = useState<{ tipo: string; descricao: string }[]>([]);
  const [vtrsMap, setVtrsMap] = useState<Record<string, VTR[]>>({ BI: [], BII: [], TITULAR: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectingFor, setSelectingFor] = useState<{ equipe: string; funcao: string } | null>(null);

  // Carregar dados iniciais
  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data: ef } = await supabase.from("efetivo").select("*");
      const { data: aus } = await supabase.from("ausencias").select("*");
      const { data: sc } = await supabase.from("escalas").select("*").eq("data", date).eq("turno", turno).single();

      if (ef) setEfetivo(ef);
      if (aus) setAusencias(aus);
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

  // Aptidão
  const getAptitude = useCallback((agentId: string): AptitudeResult => {
    const activeAus = ausencias.filter(a => {
      const start = new Date(a.data_inicio);
      const end = a.data_fim ? new Date(a.data_fim) : start;
      const d = new Date(date);
      return d >= start && d <= end;
    });
    return getAgentAptitude(agentId, activeAus);
  }, [ausencias, date]);

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
  };

  const handleSelectAgent = (agentId: string) => {
    if (!selectingFor) return;
    setSelectedAgents(prev => [...prev.filter(a => a.agentId !== agentId), { agentId, ...selectingFor }]);
    setSelectingFor(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase.from("escalas").upsert([{
      data: date,
      turno,
      agentes: selectedAgents,
      missoes,
      vtrsMap
    }], { onConflict: "data,turno" });
    setIsLoading(false);
    if (!error) window.location.href = '/escalas';
  };

  const handleShare = () => {
    const text = generateWhatsAppText(date, turno, selectedAgents, missoes, [], vtrsMap, (id) => efetivo.find(a => a.id === id));
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return {
    date, setDate, turno, setTurno, efetivo, ausencias, selectedAgents, missoes, setMissoes,
    vtrsMap, isLoading, isFetching, selectingFor, setSelectingFor,
    getAptitude, handleAddVtr, handleRenameVtr, handleToggleVtrType, handleRemoveVtr,
    handleRemoveAgent, handleSelectAgent, handleSave, handleShare
  };
}
