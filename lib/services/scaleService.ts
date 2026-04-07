import { Agent, ScaleEntry, VTR } from "@/types/agent";

/**
 * Formata a data de YYYY-MM-DD para o formato por extenso em português.
 */
export const formatDateToPortuguese = (dateStr: string): string => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day, 12, 0, 0); // "Vacina do Meio-Dia"
  
  const weekdays = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
  ];
  const months = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  return `${weekdays[dateObj.getDay()]}, ${day} DE ${months[month - 1]} DE ${year}`;
};

/**
 * Gera o texto formatado para publicação no WhatsApp.
 */
export const generateWhatsAppText = (
  date: string,
  turno: string,
  selectedAgents: ScaleEntry[],
  missoes: { tipo: string; descricao: string }[],
  activeAusencias: any[],
  vtrsMap: { [key: string]: VTR[] },
  getAgentById: (id: string) => Agent | undefined
): string => {
  const dateFull = formatDateToPortuguese(date);
  let text = `*🚨 ESCALANTE PRO - GTAM 🚨*\n`;
  text += `*📅 ${dateFull}*\n`;
  text += `*🕒 TURNO:* ${turno.toUpperCase()}\n\n`;

  // 1. ÁREA E OBS (Inteligência Operacional)
  const areas = missoes.filter((m) => m.tipo === "MISSAO");
  const alertas = missoes.filter((m) => m.tipo === "ALERTA");

  if (areas.length > 0) {
    text += `🏙 *ÁREA:* ${areas.map((m) => m.descricao).join(" & ")}\n`;
  }
  if (alertas.length > 0) {
    text += `⚠️ *OBS:* ${alertas.map((m) => m.descricao).join(" & ")}\n`;
  }
  if (areas.length > 0 || alertas.length > 0) text += "\n";

  // 2. EQUIPES DE COMANDO (SUPERVISÃO / ARMARIA)
  ["SUPERVISÃO", "ARMARIA"].forEach((catId) => {
    const members = selectedAgents.filter((a) => a.equipe === catId);
    if (members.length > 0) {
      const iconPrefix = catId === "SUPERVISÃO" ? "📋" : "🔫";
      const ag = getAgentById(members[0].agentId);
      if (ag) {
        text += `*${iconPrefix} ${catId}:* ${ag.posto_grad} ${ag.nome_guerra}\n`;
      }
    }
  });
  text += "\n";

  // 3. GUARNIÇÃO 24H (SE HOUVER)
  const guarnicao24h = selectedAgents.filter(
    (a) => a.equipe === "GUARNIÇÃO" && a.funcao === "TITULAR"
  );
  if (guarnicao24h.length > 0) {
    text += `🏰 *EQUIPE 24H:*\n`;
    guarnicao24h.forEach((m) => {
      const ag = getAgentById(m.agentId);
      if (ag) text += `• ${ag.posto_grad} ${ag.nome_guerra}\n`;
    });
    text += `\n`;
  }

  // 4. SUB-TURNOS (BI e BII)
  [
    { id: "BI", label: "Turno I" },
    { id: "BII", label: "Turno II" },
  ].forEach((sub) => {
    const vtrsInSub = selectedAgents.filter((a) => a.funcao === sub.id);
    if (vtrsInSub.length > 0) {
      text += `⏰ *${sub.label.toUpperCase()}*\n`;
      const uniqueVtrIds = Array.from(new Set(vtrsInSub.map((a) => a.equipe)));
      uniqueVtrIds.forEach((vtrId) => {
        const vtrInfo = vtrsMap[sub.id]?.find((v) => v.id === vtrId);
        const icon = vtrInfo?.type === "CARRO" ? "🚔" : "🏍";
        text += `${icon} *${vtrId}*\n`;
        vtrsInSub
          .filter((a) => a.equipe === vtrId)
          .forEach((entry) => {
            const ag = getAgentById(entry.agentId);
            if (ag) text += `  └ ${ag.posto_grad} ${ag.nome_guerra}\n`;
          });
      });
      text += `\n`;
    }
  });

  // 5. APOIO
  const apoio = selectedAgents.filter(
    (a) =>
      a.funcao === "TITULAR" &&
      a.equipe !== "GUARNIÇÃO" &&
      !["SUPERVISÃO", "ARMARIA"].includes(a.equipe)
  );
  if (apoio.length > 0) {
    text += `⚡ *EQUIPES DE APOIO (24H):*\n`;
    const uniqueApoioIds = Array.from(new Set(apoio.map((a) => a.equipe)));
    uniqueApoioIds.forEach((vtrId) => {
      const vtrInfo = vtrsMap.TITULAR?.find((v) => v.id === vtrId);
      const icon = vtrInfo?.type === "CARRO" ? "🚔" : "🏍";
      text += `${icon} *${vtrId}*\n`;
      apoio
        .filter((a) => a.equipe === vtrId)
        .forEach((entry) => {
          const ag = getAgentById(entry.agentId);
          if (ag) text += `  └ ${ag.posto_grad} ${ag.nome_guerra}\n`;
        });
    });
    text += "\n";
  }

  // 6. AFASTAMENTOS DO DIA
  if (activeAusencias.length > 0) {
    text += `🛑 *AFASTAMENTOS:*\n`;
    activeAusencias.forEach((aus) => {
      const ag = getAgentById(aus.efetivo_id);
      if (ag) {
        text += `• ${ag.posto_grad} ${ag.nome_guerra} (${aus.tipo})\n`;
      }
    });
    text += "\n";
  }

  text += `_Gerado por Escalante Pro_`;
  return text;
};
