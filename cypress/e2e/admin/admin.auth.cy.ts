describe("Admin Auth", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should load the dashboard", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
  });
});
