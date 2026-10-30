module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/setup.ts"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  extensionsToTreatAsEsm: [".ts"],
};
