# 📄 Especificação Técnica: Aba de Escalas v2 (Mobile-First)

## 1. Visão Geral
Refatorar a interface de gestão de escalas para priorizar a usabilidade em dispositivos móveis e melhorar a interatividade do calendário mensal, mantendo a estética premium "Deep Navy & Purple".

---

## 2. Requisitos de UX/UI

### 📱 Experiência Mobile (Prioritária)
- **Hierarquia Invertida**: No mobile, o `ScaleReport` deve aparecer **acima** do `ScaleCalendar`.
- **Visualização Compacta**: Cards de viaturas e agentes mais densos.
- **Toque Amigável**: Botões de ação fixos ou em destaque.

### 📅 Calendário Interativo
- **Click Simples**: Seleciona o dia e atualiza o relatório instantaneamente.
- **Indicadores de Status**: Dots coloridos para Folgas (Verde), Licenças (Amarelo) e Atestados (Vermelho).
- **Feedback Visual**: Glow roxo no dia selecionado.

### 🎨 Design System & Polimento
- **Fundo**: `#0d1117` (Deep Navy).
- **Glassmorphism**: Backdrop blur em modais e cards.
- **Aba Branca (Correção)**: Eliminar falhas visuais no `QuickAbsenceModal`.

---

## 3. Arquitetura de Componentes
- `ScaleDashboardV2`: Container mestre.
- `CalendarCompact`: Calendário retrátil/semanal.
- `ScaleReportV2`: Relatório detalhado modularizado.

---

## 4. Critérios de Aceite
- [ ] O relatório é a primeira coisa visível no celular.
- [ ] Calendário não quebra em 360px.
- [ ] Modal segue tema escuro.
- [ ] Arquivos < 100 linhas.
