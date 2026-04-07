# Log de Implementação - Modernização Escalas v2

## Resumo das Alterações
- **Migração para v2**: Interface oficial atualizada para o `ScaleDashboardV2` no caminho `/escalas`.
- **Limpeza de Nomes (Regex)**: Implementada lógica global para remover prefixos de hierarquia (GM, GD, SI, GC, CD, IR, Insp, SubInsp) em todos os componentes de escala (Card, Selector, Report, Modal).
- **Tipos de Ausência**: Atualizada a lista oficial para: `F.A`, `R.P`, `M.P`, `ATESTADO`, `DOAÇÃO DE SANGUE`, `LM`, `LIP`, `OUTROS`.
- **Correção Nutri**: Removida a opção "NUTRI" que era incorreta.
- **UX Premium**: Design Mobile-First consolidado com sistema de abas e visual Navy/Purple.

## Arquivos Afetados
- `components/ScaleBuilder/QuickAbsenceModal.tsx`
- `components/ScaleBuilder/AgentSelector.tsx`
- `components/ScaleBuilder/AgentCard.tsx`
- `components/ScaleBuilder/ReportDetailedV2.tsx`
- `components/ScaleBuilder/ScaleDashboardV2.tsx` (Novo orquestrador)
- `app/escalas/page.tsx` (Integração final)
- `app/sandbox/page.tsx` (Sandbox atualizado)

## Verificação
- Verificado via browser subagent em `/escalas`.
- Confirmada a limpeza do nome "L MAIA".
- Confirmada a presença dos novos tipos de registro.
- Build estável.

---
*Data: 07 de Abril de 2026*
*Status: Migração Concluída*
