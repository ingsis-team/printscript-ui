import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL, FRONTEND_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";

describe('Home', () => {
  beforeEach(() => {
    const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME")
    const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD")
    cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD)
  })
  before(() => {
    process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
    process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
  })
  it('Renders home', () => {
    cy.visit(FRONTEND_URL)
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
    cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
    cy.get('.css-jie5ja').click();
    /* ==== End Cypress Studio ==== */
  })

  // You need to have at least 1 snippet in your DB for this test to pass
  it('Renders the first snippets', () => {
    // Mock the GET snippets endpoint with test data
    cy.intercept('GET', BACKEND_URL+"/api/snippets*", {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'Test Snippet 1',
          content: 'print(1)',
          language: 'printscript',
          extension: '.ps',
          compliance: 'pending',
          author: 'Test User'
        },
        {
          id: '2',
          name: 'Test Snippet 2',
          content: 'print(2)',
          language: 'printscript',
          extension: '.ps',
          compliance: 'pending',
          author: 'Test User'
        }
      ]
    }).as('getSnippets');
    
    cy.visit(FRONTEND_URL)
    
    // Wait for the API call
    cy.wait('@getSnippets')
    
    // Wait for snippets to render
    cy.get('[data-testid="snippet-row"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .and('have.length.at.most', 10)
  })

  it('Can creat snippet find snippets by name', () => {
    cy.visit(FRONTEND_URL)
    const snippetData: CreateSnippet = {
      name: "Test name",
      content: "print(1)",
      language: "printscript",
      extension: ".ps"
    }

    // Mock the POST request to create a snippet
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
          extension: req.body.extension || '.ps',
          compliance: 'pending'
        }
      });
    }).as('postSnippet');

    // Mock the GET request to search snippets
    cy.intercept('GET', BACKEND_URL+"/api/snippets*", (req) => {
      req.reply({
        statusCode: 200,
        body: [{
          id: 'test-id-123',
          name: snippetData.name,
          content: snippetData.content,
          language: snippetData.language,
          extension: snippetData.extension
        }]
      });
    }).as('getSnippets');

    // Use the UI to create the snippet
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="create-snippet-menu-item"]').first().click();
    cy.get('#name').clear().type(snippetData.name);
    cy.get('#demo-simple-select').first().click();
    cy.get('[data-testid="menu-option-printscript"]').first().click();
    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(snippetData.content);
    cy.get('[data-testid="save-snippet-button"]').click();

    // Wait for the POST request and verify it was successful
    cy.wait('@postSnippet').its('response.statusCode').should('eq', 201);

    // Wait for modal to close and return to home page
    cy.wait(1000);
    
    // Ensure we're back on the home page with the search input visible
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
    
    // Now search for the snippet by name
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').clear();
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').type(snippetData.name + "{enter}");

    // Wait for the GET request and verify the snippet appears
    cy.wait("@getSnippets")
    cy.contains(snippetData.name).should('exist');
  })
})
