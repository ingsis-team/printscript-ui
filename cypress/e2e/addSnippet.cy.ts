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
      // Validate request has required fields
      expect(req.body).to.have.property('name');
      expect(req.body).to.have.property('content');
      expect(req.body).to.have.property('language');
      
      // Mock successful response
      req.reply({
        statusCode: 201,
        body: {
          id: 'test-id-123',
          name: req.body.name,
          content: req.body.content,
          language: req.body.language,
          description: req.body.description || '',
          version: req.body.version || '1.1',
          compliance: 'pending'
        }
      });
    }).as('postRequest');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="create-snippet-menu-item"]').first().click();
    cy.get('#name').clear().type('Some snippet name');
    cy.get('#demo-simple-select').first().click();
    cy.get('[data-testid="menu-option-printscript"]').first().click();

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`let x: number = 5;`);
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })

  it('Can add snippets via file', () => {
    cy.visit("/")
    cy.intercept('POST', BACKEND_URL+"/snippets", (req) => {
      // Validate request has required fields
      expect(req.body).to.have.property('name');
      expect(req.body).to.have.property('content');
      expect(req.body).to.have.property('language');
      
      // Mock successful response
      req.reply({
        statusCode: 201,
        body: {
          id: 'test-id-456',
          name: req.body.name,
          content: req.body.content,
          language: req.body.language,
          description: req.body.description || '',
          version: req.body.version || '1.1',
          compliance: 'pending'
        }
      });
    }).as('postRequest');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", {force: true});

    cy.wait(1000); // Wait for file to load and modal to open
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })
})
