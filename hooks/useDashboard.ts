"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardData } from "@/lib/types/dashboard";
import {
  todayStr, todayStrFromDate,
  isActiveAgent, buildForceCards,
} from "@/lib/utils/dashboardUtils";

export function useDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const today = todayStr();
        const d30  = new Date(); d30.setDate(d30.getDate() + 30);
        const d30p = new Date(); d30p.setDate(d30p.getDate() - 30);
        const d180 = new Date(); d180.setDate(d180.getDate() - 180);
        const next30  = todayStrFromDate(d30);
        const prev30  = todayStrFromDate(d30p);
        const prev180 = todayStrFromDate(d180);

        const [
          { data: efetivoRaw },
          { data: escalasRaw },
          { data: afastamentosRaw },
          { data: feriasRaw },
          { data: faltasRaw },
          { data: usuariosRaw },
        ] = await Promise.all([
          supabase.from("efetivo").select("id,nome_completo,nome_guerra,matricula,posto_grad,grupo_turno,tipo_escala,status"),
          supabase.from("escalas").select("*, efetivo:efetivo_id(nome_guerra,matricula,posto_grad)"),
          supabase.from("afastamentos").select("*, efetivo:efetivo_id(nome_guerra,matricula,posto_grad)"),
          supabase.from("ferias").select("*, efetivo:efetivo_id(nome_guerra,matricula,posto_grad)"),
          supabase.from("faltas").select("id,efetivo_id,data"),
          supabase.from("usuarios").select("id,status"),
        ]);

        const efetivo      = Array.isArray(efetivoRaw)      ? efetivoRaw      : [];
        const escalas      = Array.isArray(escalasRaw)      ? escalasRaw      : [];
        const afastamentos = Array.isArray(afastamentosRaw) ? afastamentosRaw : [];
        const ferias       = Array.isArray(feriasRaw)       ? feriasRaw       : [];
        const faltas       = Array.isArray(faltasRaw)       ? faltasRaw       : [];
        const usuarios     = Array.isArray(usuariosRaw)     ? usuariosRaw     : [];

        const efetivoAtivo        = efetivo.filter(isActiveAgent);
        const escalaHoje          = escalas.filter((i) => i.data === today && i.efetivo?.nome_guerra);
        const afastamentosAtivos  = afastamentos.filter((i) => i.data_inicio <= today && (i.data_fim || i.data_inicio) >= today);
        const feriasAtivas        = ferias.filter((i) => i.status === "AGENDADO" && i.data_inicio <= today && (i.data_fim || i.data_inicio) >= today);
        const feriasProximas      = ferias.filter((i) => i.status === "AGENDADO" && i.data_inicio > today && i.data_inicio <= next30);
        const feriasVisiveis      = [...feriasAtivas, ...feriasProximas];

        const rankingProdutividade = efetivoAtivo
          .map((a) => ({ id: String(a.id), nome: a.nome_guerra || a.nome_completo || "Sem nome", matricula: a.matricula || "-", total: escalas.filter((e) => String(e.efetivo_id) === String(a.id) && e.data >= prev30).length }))
          .sort((a, b) => b.total - a.total).slice(0, 5);

        const rankingAssiduidade = efetivoAtivo
          .map((a) => ({ id: String(a.id), nome: a.nome_guerra || a.nome_completo || "Sem nome", matricula: a.matricula || "-", total: afastamentos.filter((af) => String(af.efetivo_id) === String(a.id) && af.tipo === "SAUDE" && af.data_inicio >= prev180).length }))
          .sort((a, b) => a.total - b.total).slice(0, 5);

        setData({
          hoje: today,
          totalEfetivo: efetivoAtivo.length,
          emServicoHoje: escalaHoje.length,
          afastadosAtivos: afastamentosAtivos.length,
          feriasProximas: feriasProximas.length,
          faltasMes: faltas.filter((f) => f.data.startsWith(today.slice(0, 7))).length,
          usuariosPendentes: usuarios.filter((u) => u.status === "PENDENTE").length,
          escalaHoje,
          afastamentos: afastamentosAtivos,
          ferias: feriasVisiveis,
          rankingProdutividade,
          rankingAssiduidade,
          forceCards: buildForceCards(efetivo, escalaHoje, afastamentosAtivos, feriasAtivas),
        });
      } catch (e) {
        console.error("Erro ao carregar dashboard:", e instanceof Error ? e.message : e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { data, loading };
}
