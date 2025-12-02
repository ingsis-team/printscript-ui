import {BACKEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    
    const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME")
    const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD")
    cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD)
  })
  it('Can add snippets manually', () => {
    cy.visit("/")
    
    // Intercept and mock the file types API
    cy.intercept('GET', BACKEND_URL+"/api/languages", {
      statusCode: 200,
      body: [
        {
          id: 'printscript',
          name: 'PrintScript',
          extension: 'ps',
          description: 'Lenguaje educativo PrintScript'
        }
      ]
    }).as('getFileTypes');
    
    cy.intercept('POST', BACKEND_URL+"/api/snippets", (req) => {
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

    // Wait for file types to load
    cy.wait('@getFileTypes');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="create-snippet-menu-item"]').first().click();
    
    // Wait for modal to be visible
    cy.get('[data-testid="save-snippet-button"]').should('be.visible');
    
    cy.get('#name').clear().type('Some snippet name');
    cy.get('#demo-simple-select').first().click();
    cy.get('[data-testid="menu-option-printscript"]').first().click();

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: String = "some snippet" \n print(snippet)`);
    
    // Wait for button to be enabled (all required fields filled)
    cy.get('[data-testid="save-snippet-button"]')
      .should('not.be.disabled')
      .click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })

  it('Can add snippets via file', () => {
    cy.visit("/")
    
    // Intercept and mock the file types API to ensure both ps and prs are available
    cy.intercept('GET', BACKEND_URL+"/api/languages", {
      statusCode: 200,
      body: [
        {
          id: 'printscript',
          name: 'PrintScript',
          extension: 'ps',
          description: 'Lenguaje educativo PrintScript'
        }
      ]
    }).as('getFileTypes');
    
    cy.intercept('POST', BACKEND_URL+"/api/snippets", (req) => {
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

    // Wait for file types to load
    cy.wait('@getFileTypes');

    /* ==== Updated with reliable selectors ==== */
    cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", {force: true});

    // Wait for modal to be visible
    cy.get('[data-testid="save-snippet-button"]', { timeout: 10000 }).should('be.visible');
    
    // Wait for file to be loaded (name field should be populated)
    cy.get('#name', { timeout: 5000 }).should('not.have.value', '');
    
    // Wait for button to be enabled (all required fields filled)
    cy.get('[data-testid="save-snippet-button"]')
      .should('not.be.disabled')
      .click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })
})
