describe('GGTAM Dashboard & Escalas Smoke Test', () => {
  beforeEach(() => {
    cy.viewport(1536, 730);
    cy.visit('/');
    cy.wait(5000); // Garante tempo para o Supabase retornar os dados
  });

  it('deve carregar os cards de força disponível no dashboard', () => {
    // Usando o texto literal exato do DOM para evitar problemas de CSS uppercase
    cy.contains('Forca Disponivel Hoje', { timeout: 15000 }).should('be.visible');
  });

  it('deve navegar para a página de escalas e verificar o título', () => {
    cy.visit('/escalas');
    cy.contains(/painel de escalas/i, { timeout: 15000 }).should('be.visible');
  });

  it('deve abrir o seletor de agentes ao clicar em escala nas viaturas', () => {
    cy.visit('/escalas');
    cy.wait(3000);
    // Clica no primeiro botão de Escalar
    cy.get('button').contains(/escalar/i).first().click({ force: true });
    cy.contains(/selecionar policial/i, { timeout: 10000 }).should('be.visible');
  });
});
