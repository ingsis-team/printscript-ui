import {AUTH0_USERNAME,AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test', () => {
  it('should show login button when accessing a protected route unauthenticated', () => {
    // Visit the protected route
    cy.visit('/');

    cy.wait(1000)

    // Check if the login button is displayed
    cy.get('#login-button').should('exist');
    cy.contains('Please login to access resources').should('exist');
  });

  it('should allow access when the user is already authenticated', () => {
    const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME")
    const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD")
    cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD)

    cy.visit('/');

    cy.wait(1000)

    // Check that we can access the protected content (no login button)
    cy.get('#login-button').should('not.exist');
    cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
  });

})
