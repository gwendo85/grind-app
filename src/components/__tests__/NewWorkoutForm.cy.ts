/// <reference types="cypress" />

describe('Formulaire Ajout Exercice GRIND', () => {
  beforeEach(() => {
    cy.visit('/'); // Adapter l'URL si besoin
    cy.viewport('iphone-6');
  });

  it('Ajoute et supprime des exercices avec validation UX', () => {
    // Vérifie le champ par défaut
    cy.findByPlaceholderText('Squat').should('exist');
    cy.findByPlaceholderText('20').should('exist');
    cy.findByPlaceholderText('10').should('exist');
    cy.findByPlaceholderText('3').should('exist');
    cy.findByPlaceholderText('90').should('exist');

    // Ajoute deux exercices
    cy.findByRole('button', { name: /ajouter/i }).click();
    cy.findByRole('button', { name: /ajouter/i }).click();
    cy.get('input[placeholder="Squat"]').should('have.length', 3);

    // Remplit le deuxième exercice
    cy.get('input[placeholder="Squat"]').eq(1).type('Développé couché');
    cy.get('input[placeholder="20"]').eq(1).clear().type('60');
    cy.get('input[placeholder="10"]').eq(1).clear().type('8');
    cy.get('input[placeholder="3"]').eq(1).clear().type('4');
    cy.get('input[placeholder="90"]').eq(1).clear().type('120');

    // Supprime le premier exercice
    cy.get('button[aria-label="Supprimer l\'exercice"]').first().click();
    cy.get('input[placeholder="Squat"]').should('have.length', 2);

    // Vérifie l'absence d'erreur console
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
      cy.stub(win.console, 'warn').as('consoleWarn');
    });
    cy.get('@consoleError').should('not.be.called');
    cy.get('@consoleWarn').should('not.be.called');
  });
}); 