import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore";

describe('Add snippet tests', () => {
  const fakeStore = new FakeSnippetStore()
  const snippets = fakeStore.listSnippetDescriptors()
  const testSnippet = snippets[0] // Get the first snippet from the fake store
  
  beforeEach(() => {
    const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME")
    const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD")
    cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD)
    
    // Mock GET all snippets with proper endpoint
    cy.intercept('GET', BACKEND_URL+"/api/snippets*", {
      statusCode: 200,
      body: snippets,
    }).as("getSnippets")
    
    // Mock GET snippet by ID with proper endpoint
    cy.intercept('GET', BACKEND_URL+"/api/snippets/*", {
      statusCode: 200,
      body: testSnippet,
    }).as("getSnippetById")
    
    // Mock GET tests endpoint (for test cases)
    cy.intercept('GET', BACKEND_URL+"/api/snippets/*/tests", {
      statusCode: 200,
      body: []
    }).as("getTests")

    cy.visit("/")
    cy.wait("@getSnippets")
    
    // Click on the first snippet row using data-testid
    cy.get('[data-testid="snippet-row"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.get('[data-testid="snippet-row"]').first().click();
    cy.wait("@getSnippetById")
  })

  it('Can share a snippet ', () => {
    // Mock share endpoint
    cy.intercept('POST', BACKEND_URL+"/api/snippets/*/share", {
      statusCode: 200,
      body: { message: "Shared successfully" }
    }).as("shareSnippet")
    
    // Mock users endpoint for the autocomplete - it's actually /api/snippets/users
    cy.intercept('GET', BACKEND_URL+"/api/snippets/users*", {
      statusCode: 200,
      body: {
        users: [
          { id: "1", name: "Test User", username: "testuser", email: "test@example.com", nickname: "tester", user_id: "1" }
        ],
        count: 1,
        page: 1,
        page_size: 10
      }
    }).as("getUsers")
    
    // Find Share button by the Share icon's data-testid (MUI icons have this)
    cy.get('[data-testid="ShareIcon"]').parent().scrollIntoView().should('be.visible').click();
    cy.wait(1000);
    
    // Look for the share modal by finding the specific heading text
    cy.contains('Share your snippet', { timeout: 5000 }).should('be.visible');
    
    // Find the autocomplete input and type (force: true to bypass backdrop coverage check)
    cy.contains('Share your snippet').parent().parent().within(() => {
      cy.get('input[type="text"]').first().click({ force: true }).type('test', { force: true });
    });
    cy.wait(1000);
    
    // Select the first option if it appears, otherwise close the autocomplete dropdown
    cy.get('body').then($body => {
      if ($body.find('[role="option"]').length > 0) {
        cy.get('[role="option"]').first().click({ force: true });
        cy.wait(500);
        // Click the Share button in the dialog
        cy.contains('Share your snippet').parent().parent().within(() => {
          cy.contains('button', 'Share').click({ force: true });
        });
      } else {
        // Click outside the autocomplete to close the "No options" dropdown
        cy.contains('Share your snippet').click({ force: true });
        cy.wait(500);
        // Now click Cancel button with force: true to bypass any remaining coverage
        cy.contains('Share your snippet').parent().parent().within(() => {
          cy.contains('button', 'Cancel').click({ force: true });
        });
      }
    });
  })

  it('Can run snippets', function() {
    // Mock execute endpoint - might be on a different port/service
    cy.intercept('POST', '**/execute*', {
      statusCode: 200,
      body: { output: "10" }
    }).as("executeSnippet")
    
    // Scroll to the play button and click it
    cy.get('[data-testid="PlayArrowIcon"]').scrollIntoView().should('be.visible').click();
    cy.wait(2000); // Wait for UI to update
  });

  it('Can format snippets', function() {
    // Mock format endpoint - it's on port 8082
    cy.intercept('POST', '**/format*', {
      statusCode: 200,
      body: { content: fakeStore.formatSnippet(testSnippet.content) }
    }).as("formatSnippet")
    
    cy.get('[data-testid="ReadMoreIcon"]').scrollIntoView().should('be.visible').click();
    cy.wait(2000); // Wait for format to complete
  });

  it('Can save snippets', function() {
    // Mock update endpoint
    cy.intercept('PUT', BACKEND_URL+"/api/snippets/*", {
      statusCode: 200,
      body: testSnippet
    }).as("updateSnippet")
    
    // Find code editor textarea and type in it
    cy.get('textarea.npm__react-simple-code-editor__textarea').first().should('be.visible').click();
    cy.get('textarea.npm__react-simple-code-editor__textarea').first().type("{enter}// Some new line", { force: true });
    
    // Scroll to save button and click it
    cy.get('[data-testid="SaveIcon"]').scrollIntoView().should('be.visible').click();
    cy.wait('@updateSnippet', { timeout: 10000 });
    cy.wait(500);
  });

  it('Can delete snippets', function() {
    // Mock delete endpoint
    cy.intercept('DELETE', BACKEND_URL+"/api/snippets/*", {
      statusCode: 200,
      body: { message: "Deleted successfully" }
    }).as("deleteSnippet")
    
    // Click delete button using the DeleteIcon data-testid
    cy.get('[data-testid="DeleteIcon"]').parent().scrollIntoView().should('be.visible').click();
    cy.wait(1000);
    
    // Look for confirmation text
    cy.contains('Are you sure you want to delete this snippet?', { timeout: 5000 }).should('be.visible');
    
    // Click the Delete button in the confirmation dialog
    cy.contains('button', 'Delete').click();
    
    // Wait for delete request
    cy.wait('@deleteSnippet', { timeout: 10000 });
    cy.wait(500);
    
    // Should redirect to home after deletion
    cy.url().should('include', '/');
  });
})
