// Tipos TypeScript centralizados para o Dashboard

import React from "react";

export type Efetivo = {
  id: string;
  nome_completo?: string;
  nome_guerra?: string;
  matricula?: string;
  posto_grad?: string;
  grupo_turno?: string;
  tipo_escala?: string;
  status?: string;
};

export type Escala = {
  id: string;
  data: string;
  turno?: string;
  equipe?: string;
  funcao?: string;
  efetivo_id: string;
  efetivo?: { nome_guerra?: string; matricula?: string; posto_grad?: string } | null;
};

export type Afastamento = {
  id: string;
  efetivo_id: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  efetivo?: { nome_guerra?: string; matricula?: string; posto_grad?: string } | null;
};

export type Ferias = {
  id: string;
  efetivo_id: string;
  ano_referencia?: number;
  data_inicio: string;
  data_fim: string;
  status?: string;
  efetivo?: { nome_guerra?: string; matricula?: string; posto_grad?: string } | null;
};

export type Falta = { id: string; efetivo_id: string; data: string };
export type Usuario = { id: string; status?: string };

export type RankingItem = {
  id: string;
  nome: string;
  matricula: string;
  total: number;
};

export type ForceCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  panelTint: string;
  barColor: string;
  total: number;
  available: number;
  blocked: number;
  onDuty: number;
};

export type DashboardData = {
  hoje: string;
  totalEfetivo: number;
  emServicoHoje: number;
  afastadosAtivos: number;
  feriasProximas: number;
  faltasMes: number;
  usuariosPendentes: number;
  escalaHoje: Escala[];
  afastamentos: Afastamento[];
  ferias: Ferias[];
  rankingProdutividade: RankingItem[];
  rankingAssiduidade: RankingItem[];
  forceCards: ForceCard[];
};
