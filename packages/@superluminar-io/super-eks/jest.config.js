export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test/"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  resetMocks: true,
  restoreMocks: true,
}
