---
description: Como realizar os testes de blindagem e gerar o log de implementação
---

Este workflow deve ser seguido sempre que uma nova funcionalidade técnica for adicionada ao Escalante Pro. Ele garante a integridade dos dados e o registro no Obsidian.

### 🛡️ Passo a Passo da Blindagem:

1. **Rodar Testes de Lógica (Jest)**:
   // turbo
   `npm test`
   - O sistema irá validar se há duplicidade de nomes.
   - O sistema irá validar se o cálculo de efetivo está correto.

2. **Rodar Testes de Interface (Cypress - Opcional)**:
   `npm run cypress:run`
   - Simula o clique no botão de WhatsApp.
   - Verifica se o modal de seleção de nomes aparece.

3. **Gerar Log no Obsidian**:
   - Se os testes acima passarem (OK), acesse a pasta `D:\Projetos\Obisidian\GTAM.APP\Logs_Execucao\`.
   - Crie o arquivo de log seguindo o padrão `LOG_GTAM_YYYY-MM-DD_HHMM.md`.

4. **Validar "Vaga -> Policial"**:
   - Use a ferramenta de navegador para garantir que o dropdown de busca rápida está respondendo em menos de 100ms.

---
// turbo-all
**Importante: Se qualquer teste falhar, a implementação deve ser revertida imediatamente antes de gerar o log.** 🛑🛡️
