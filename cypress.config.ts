import { defineConfig } from "cypress";
import { plugin as grepPlugin } from "@cypress/grep/plugin";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:2222",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: true,
    setupNodeEvents(_on, config) {
      grepPlugin(config);
      return config;
    },
  },
});
