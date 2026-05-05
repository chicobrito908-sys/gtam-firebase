# 🏛️ Guia Mestre de Arquitetura: Escalante Pro (GTAM)

Este documento define as regras obrigatórias para o desenvolvimento do GTAM, garantindo que o sistema seja robusto, fácil de entender e simples de manter, mesmo para quem está começando.

---

## 1. Estrutura do Código (Componentização Estrita)

### 📏 Regra de Ouro Híbrida: Limite de Linhas
- **Regra para Páginas (app/):** Arquivos principais que juntam várias partes (`page.tsx`) não devem ultrapassar **350 linhas**.
- **Regra para Componentes (components/):** Nenhum arquivo de componente isolado (botões, modais, pequenos painéis) deve ultrapassar **100 linhas**.
- **Por que?** Permite velocidade ao desenvolver páginas completas, mas mantém os componentes individuais limpos e fáceis de dar manutenção e reaproveitar.
- **Ação:** Se um componente simples crescer mais de 100 linhas, ou uma página ultrapassar 350 linhas, eles devem ser obrigatoriamente divididos em pedaços menores.

### 🧩 Organização de Arquivos
- `components/ui/`: Componentes básicos e reutilizáveis (Botão, Card, Input).
- `components/[Modulo]/`: Componentes específicos de uma funcionalidade (ex: `ScaleBuilder/`).
- `lib/services/`: Toda a lógica de "cérebro" do app (quem pode ser escalado, cálculos).
- `lib/hooks/`: Funções que gerenciam o estado do React.
- `docs/specs/`: Especificações técnicas de cada funcionalidade (SDD).
- `tmp/sandbox/`: Ambiente de prototipagem rápida e segura.

---

## 2. Metodologia SDD (Spec-Driven Development)

### 📋 Fluxo de Trabalho Obrigatório
1.  **Spec**: Antes de codificar, uma especificação detalhada deve ser criada em `docs/specs/`.
2.  **Sandbox**: Protótipos visuais complexos devem ser construídos primeiro em `tmp/sandbox/`.
3.  **Auditoria**: Um agente de IA deve validar o protótipo no navegador (Mobile/Desktop) antes da integração.
4.  **Integração**: Somente após aprovação, o código é movido para as pastas definitivas.

---

## 2. Lógica de Negócio e Dados

### 🧠 Serviços Únicos
- Toda a lógica de **Aptidão** (verificar se o policial está de folga, férias ou atestado) deve morar exclusivamente em `lib/services/aptitudeService.ts`.
- **Proibição:** Não escreva regras de negócio complexas dentro dos componentes visuais.

### 🔌 Camada de Dados (Firebase/Supabase)
- Use o adapter `lib/supabase.ts` para todas as comunicações com o banco.
- Centralize a busca de dados em Contextos quando a informação for usada em várias telas (ex: o perfil do usuário logado).

---

## 3. Design System (Identidade Visual)

### 🎨 Padrão Estético "Deep Navy & Purple"
- **Fundo:** `#0d1117` (Deep Navy)
- **Principal:** `#7c3aed` (Purple/Vivid)
- **Regra:** Não use classes Tailwind "soltas" para bordas, sombras ou cores de fundo repetitivas. Use os componentes da pasta `components/ui/`.

### ✨ Animações & Mobile
- Use sempre `framer-motion` (importado como `motion/react`).
- **UI Premium**: Uso obrigatório de *Glassmorphism*, gradientes suaves e sombras profundas.
- **Scrollbars**: Devem ser customizadas via CSS (`.custom-scrollbar`) para manter a estética Navy/Purple.
- **Seleção Dinâmica**: Evitar `<select>` nativo para seleções críticas. Utilizar listas buscáveis customizadas para evitar falhas de renderização (bugs de "aba branca").
- **Responsividade Inversa**: Em dispositivos móveis, a hierarquia de informação deve ser reorganizada (ex: Relatório sobre o Calendário) via Grid/Flex.
- **Responsividade**: Priorize a visibilidade de informações críticas no topo da tela em dispositivos móveis (Mobile-First).

---

## 5. Automação de Agentes & Workflows

### 🤖 Agent Manager
- Use subagentes dedicados para Auditoria de UI e Validação de Segurança.
- Cada agente deve operar de forma isolada para garantir a qualidade do componente.

### 🔄 Workflows
- Utilize o comando `/salvar` para garantir a integridade do commit (testes + logs).
- Utilize o comando `/verificar-ui` para auditoria visual automática.

---

## 4. Auditoria e Blueprint

### 📜 Blueprint de Dados
- Qualquer mudança em coleções do Firestore deve ser refletida no `docs/database_schema.md` (antigo blueprint).
- **Consistência:** Use sempre Letras Maiúsculas para Status fixos (ex: `STATUS: "ATIVO"`, `TIPO: "FERIAS"`).

---
*Este guia é a lei do projeto. Sigam-no e o código será seu amigo.*
