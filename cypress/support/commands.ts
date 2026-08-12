declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsUser(email?: string, password?: string): Chainable<void>;
    }
  }
}

function loginViaCredentials(email: string, password: string) {
  // 1. Get CSRF token from NextAuth
  cy.request("/api/auth/csrf").then((csrfRes) => {
    const csrfToken = csrfRes.body.csrfToken;

    // 2. Sign in with credentials
    cy.request({
      method: "POST",
      url: "/api/auth/callback/credentials",
      form: true,
      body: {
        email,
        password,
        csrfToken,
      },
      failOnStatusCode: false,
    });
  });
}

Cypress.Commands.add("loginAsAdmin", () => {
  cy.session("admin", () => {
    loginViaCredentials(
      Cypress.env("ADMIN_EMAIL"),
      Cypress.env("ADMIN_PASSWORD"),
    );
  });
});

Cypress.Commands.add("loginAsUser", (email?: string, password?: string) => {
  const userEmail = email || Cypress.env("USER_EMAIL");
  const userPassword = password || Cypress.env("USER_PASSWORD");

  cy.session(["user", userEmail], () => {
    loginViaCredentials(userEmail, userPassword);
  });
});

export {};
