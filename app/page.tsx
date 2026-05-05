"use client";
import React from "react";

import { motion } from "framer-motion";
import {
  Shield, CalendarDays, BriefcaseMedical, Umbrella, Activity,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDateRange, formatTurnoLabel, groupEscalas, avatarText } from "@/lib/utils/dashboardUtils";

// ─── Componente interno: SectionCard (estilo original do dashboard) ─────────

function SectionCard({
  title, icon: Icon, right, children,
}: {
  title: string;
  icon: React.ElementType;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/5 bg-card shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-primary" />
          <h2 className="text-[18px] font-black uppercase tracking-tight text-white">{title}</h2>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function Home() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sincronizando painel tatico...</p>
      </div>
    );
  }

  const groupedEscalas = groupEscalas(data?.escalaHoje || []);

  const dateLabel = data
    ? (() => {
        const [y, m, d] = data.hoje.split("-").map(Number);
        const obj = new Date(y, m - 1, d, 12);
        const weekdays = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
        const months   = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
        return `${weekdays[obj.getDay()]}, ${d} de ${months[m - 1]}`;
      })()
    : "";

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-[18px] font-bold text-white">Dashboard</h1>
      </div>

      {/* ── Força Disponível ─────────────────────────────────────────────── */}
      <SectionCard
        title="Forca Disponivel Hoje"
        icon={Shield}
        right={<span className="text-sm capitalize text-[#8fa6d8]">{dateLabel}</span>}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {(data?.forceCards || []).map((card) => (
            <motion.div key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-[18px] border border-white/5 bg-[#0d1117] p-5 shadow-inner">
              <div className="mb-5 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${card.panelTint}`}>
                  <card.icon size={22} className={card.iconColor} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-white">{card.title}</h3>
                  <p className="text-sm text-[#a7b8da]">{card.subtitle}</p>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: "TOTAL",     value: card.total,     color: "text-white" },
                  { label: "DISPONIVEL",value: card.available, color: "text-emerald-400" },
                  { label: "IMPEDIDO",  value: card.blocked,   color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[12px] bg-[#1a1f2e] px-3 py-3 text-center border border-white/5">
                    <p className={`text-[16px] font-black ${item.color}`}>{item.value}</p>
                    <p className="text-[11px] font-bold tracking-[0.15em] text-[#8ea2cc] opacity-60">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#27344f]">
                <div className={`${card.barColor} h-full rounded-full`}
                  style={{ width: card.total > 0 ? `${Math.round((card.available / card.total) * 100)}%` : "0%" }} />
              </div>
              {card.onDuty > 0
                ? <span className="inline-flex rounded-md bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">{card.onDuty} Escalados</span>
                : <p className="text-sm text-[#8ea2cc]">Sem registros hoje</p>}
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ── Escala de Hoje ───────────────────────────────────────────────── */}
      <SectionCard title="Escala de Hoje" icon={CalendarDays}>
        {groupedEscalas.size === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#0d1117] px-6 text-center border border-white/5">
            <p className="text-sm text-[#8ea2cc]">Nenhuma escala lancada para hoje.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(groupedEscalas.entries()).map(([turno, equipes]) => (
              <div key={turno} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8fa6d8]">{formatTurnoLabel(turno)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from(equipes.entries()).map(([equipe, items]) => (
                    <div key={equipe} className="rounded-[18px] border border-white/5 bg-[#11192b] p-5 shadow-2xl flex flex-col h-full hover:border-primary/20 transition-all">
                      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <p className="text-[14px] font-black text-white leading-none uppercase">{equipe}</p>
                        </div>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black text-primary uppercase">{items.length} PX</span>
                      </div>
                      <div className="space-y-2 flex-grow">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#0d1117] px-3 py-3 border border-white/5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-[9px] font-black text-primary">
                                {avatarText(item.efetivo?.nome_guerra)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-black text-white uppercase leading-tight">
                                  <span className="text-primary/70 mr-1">{item.efetivo?.posto_grad}</span>
                                  {item.efetivo?.nome_guerra || "Sem nome"}
                                </p>
                                <p className="truncate text-[9px] font-bold text-[#8ea2cc] tracking-widest opacity-40 uppercase">{item.efetivo?.matricula || "-"}</p>
                              </div>
                            </div>
                            <span className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-black text-[#c4d2ee] uppercase">{item.funcao || "SERV"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Afastamentos + Férias ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Afastamentos Ativos" icon={BriefcaseMedical}
          right={<span className="rounded-md bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#c4d2ee]">{data?.afastamentos.length || 0}</span>}>
          {(data?.afastamentos.length || 0) === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#11192b] px-6 text-center">
              <p className="text-sm text-[#8ea2cc]">Nenhum afastamento ativo no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.afastamentos || []).slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[14px] bg-[#0d1117] px-4 py-4 border border-white/5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">{item.efetivo?.nome_guerra || "Sem nome"}</p>
                    <span className="rounded-md bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-300">{item.tipo}</span>
                  </div>
                  <p className="text-xs text-[#8ea2cc]">{formatDateRange(item.data_inicio, item.data_fim)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Ferias Proximas" icon={Umbrella}
          right={<span className="rounded-md bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#c4d2ee]">{data?.ferias.length || 0}</span>}>
          {(data?.ferias.length || 0) === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-[14px] bg-[#11192b] px-6 text-center">
              <p className="text-sm text-[#8ea2cc]">Nenhuma ferias agendada para os proximos 30 dias.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.ferias || []).slice(0, 5).map((item) => {
                const emGozo = item.data_inicio <= (data?.hoje || "") && (item.data_fim || item.data_inicio) >= (data?.hoje || "");
                return (
                  <div key={item.id} className={`rounded-[14px] bg-[#0d1117] px-4 py-4 border shadow-sm transition-all ${emGozo ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white uppercase tracking-tighter">{item.efetivo?.nome_guerra || "Sem nome"}</p>
                        {emGozo && (
                          <span className="flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[8px] font-black text-black uppercase animate-pulse">
                            <Activity size={10} /> EM GOZO
                          </span>
                        )}
                      </div>
                      <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300">REF. {item.ano_referencia ?? "-"}</span>
                    </div>
                    <p className="text-xs text-[#8ea2cc]">{formatDateRange(item.data_inicio, item.data_fim)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
