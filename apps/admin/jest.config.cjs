module.exports = {
  clearMocks: true,
  watchman: false,
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          esModuleInterop: true,
          jsx: "react-jsx",
          module: "commonjs",
          target: "es2022",
        },
      },
    ],
  },
};
