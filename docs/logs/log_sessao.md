# Log de Implementação — Escalante Pro
**Data:** 2026-04-07
**Hora:** 16:24 (BRT)
**Responsável:** Antigravity (Agente)

---

## Resumo da Implementação

Foi adicionado um indicador visual no `AgentSelector` para policiais que já estão designados em alguma equipe na escala atual. Isso facilita a visualização e evita a alocação acidental do mesmo policial em várias viaturas, sem impedi-lo de ser realocado.

---

## Modificações Realizadas

### 1. Indicador Visual de Agente "Em Escala"
**Arquivos afetados:**
- `components/ScaleBuilder/AgentSelector.tsx`
- `components/DailyScaleBuilder.tsx`

**Detalhes Técnicos:**
- **Propriedade Adicionada:** O componente `AgentSelector` agora recebe uma nova prop opcional `selectedAgentIds?: string[]`.
- **Passagem de Dados:** O `DailyScaleBuilder` mapeia o estado `selectedAgents` do hook `useScaleBuilder` e extrai um array de `agentId`s para passar a esta prop.
- **Lógica Visuais:**
    - Dentro da iteração de renderização dos policiais no `AgentSelector`, constata-se se o ID do agente atual está incluso no array `selectedAgentIds`.
    - Caso verdadeiro, o card correspondente sofre modificações de estilo:
        - A opacidade base é reduzida para `opacity-40` (diminui o destaque).
        - No :hover, a opacidade aumenta para `opacity-70`.
        - Um badge textual com "Em escala" (estilizado em cor âmbar com borda) é renderizado adjacente a outros possíveis badges (como os de inaptidão).
- **Ordenação Lista (Sort):** Policiais já escalados foram colocados em uma zona intermediária de prioridade na listagem visual, ou seja, abaixo dos policiais totalmente disponíveis, porém acima dos inaptos que estão no fim da lista bloqueados.

---

## Testes Realizados (Blindagem Automática - Subagente)

| Teste | Executado | Resultado | Detalhes / URL (Screenshots) |
|---|---|---|---|
| Abertura da interface Builder | Sim | ✅ PASS | Interface inicializa adequadamente. |
| Adição de Policial em Nova VTR | Sim | ✅ PASS | GD L MAIA incluído em VTR criada no Turno I. |
| Reabertura e Verificação Visual | Sim | ✅ PASS | GD L MAIA aparece com UI alterada (apagado e com badge visível). |
| Estado dos demais agentes | Sim | ✅ PASS | Policiais não inclusos em escalas mantiveram a interface natural. |

**Evidência de Testes (Gravada e verificada pelo agente):**
- [agent_selector_em_escala_badge_1775591925_1775589527272.png]
- [agent_selector_badges_check_1775589779420.png]

---

## Status
Código testado localmente. Sem quebra de layout. Push para a branch `main` liberado.
