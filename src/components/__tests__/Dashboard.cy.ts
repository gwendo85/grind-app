/// <reference types="cypress" />

describe('Dashboard GRIND - Header personnalisé', () => {
  beforeEach(() => {
    // Remplace par un login mocké ou une seed si besoin
    cy.visit('/dashboard');
  });

  it('Affiche le skeleton de chargement du profil', () => {
    cy.get('.animate-pulse').should('exist');
  });

  it('Affiche l’avatar, le prénom et le message dynamique', () => {
    cy.get('img[alt="Avatar utilisateur"]').should('be.visible');
    cy.contains('Salut').should('be.visible');
    cy.get('span').contains(/(Commence ta journée|pause GRIND|Finis ta journée)/);
  });

  it('Affiche la mini-liste des badges récents', () => {
    cy.get('[title="Streak 3j"]').should('exist');
    cy.get('[title="1000 XP"]').should('exist');
    cy.get('[title="Débutant"]').should('exist');
  });

  it('Le bouton CTA “Démarrer une séance” est visible et fonctionnel', () => {
    cy.contains('Démarrer une séance').should('be.visible').click();
    cy.url().should('include', '/new-workout');
  });

  it('L’animation XP s’active lors du gain d’XP', () => {
    // Simule un gain d’XP en modifiant le state (à adapter selon l’implémentation réelle)
    // Ici, on force le composant à changer de valeur
    cy.visit('/dashboard');
    cy.window().then((win) => {
      // Suppose que le composant expose une méthode ou un event pour simuler le gain d’XP
      // À adapter selon l’API réelle
      // win.simulateXPGain && win.simulateXPGain(100);
    });
    cy.get('.animate-xp').should('exist');
  });

  it('Responsive mobile/desktop', () => {
    cy.viewport('iphone-12');
    cy.get('img[alt="Avatar utilisateur"]').should('be.visible');
    cy.contains('Démarrer une séance').should('be.visible');
    cy.viewport('macbook-15');
    cy.get('img[alt="Avatar utilisateur"]').should('be.visible');
  });
}); 