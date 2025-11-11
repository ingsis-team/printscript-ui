import {BACKEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    
    const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME")
    const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD")
    cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD)
  })
  it('Can add snippets manually', () => {
    cy.visit("/")
    cy.intercept('POST', BACKEND_URL+"/snippets", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id","name","content","language")
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="create-snippet-menu-item"]').click();
    cy.get('#name').clear().type('Some snippet name');
    cy.get('#demo-simple-select').click();
    cy.get('[data-testid="menu-option-printscript"]').click();

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`let x: number = 5;`);
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })

  it('Can add snippets via file', () => {
    cy.visit("/")
    cy.intercept('POST', BACKEND_URL+"/snippets", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id","name","content","language")
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", {force: true});

    cy.wait(1000); // Wait for file to load and modal to open
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })
})
