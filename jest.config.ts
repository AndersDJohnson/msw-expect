import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  setupFilesAfterEnv: ["<rootDir>/src/jestSetup.ts"],
};

export default config;
