import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  setupFilesAfterEnv: ["<rootDir>/src/setup.ts"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
};

export default config;
