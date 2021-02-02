module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 1000 * 60, // 60 seconds for now
  resetMocks: true,
  restoreMocks: true,
}
