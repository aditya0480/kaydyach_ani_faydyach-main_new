import "./commands";
import { register } from "@cypress/grep";

register();

// Prevent uncaught exceptions from failing tests
Cypress.on("uncaught:exception", (err) => {
  console.error("Uncaught exception:", err.message);
  return false;
});
