describe("User Auth", () => {
  beforeEach(() => {
    cy.loginAsUser();
  });

  it("should load the home page", () => {
    cy.visit("/", { timeout: 90000 });
    cy.get("body").should("be.visible");
  });
});
