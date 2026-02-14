import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "backend",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/src/domain/**/*.test.ts",
        "<rootDir>/src/services/**/*.test.ts",
        "<rootDir>/src/repositories/**/*.test.ts",
        "<rootDir>/src/mappers/**/*.test.ts",
        "<rootDir>/src/dtos/**/*.test.ts",
        "<rootDir>/src/lib/**/*.test.ts",
        "<rootDir>/src/factories/**/*.test.ts",
        "<rootDir>/src/utils/**/*.test.ts",
        "<rootDir>/src/config/**/*.test.ts",
        "<rootDir>/src/__tests__/**/*.test.ts",
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { tsconfig: "tsconfig.jest.json" },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/src/store/**/*.test.ts",
        "<rootDir>/src/hooks/**/*.test.ts?(x)",
        "<rootDir>/src/features/**/*.test.ts?(x)",
        "<rootDir>/src/components/**/*.test.ts?(x)",
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { tsconfig: "tsconfig.jest.json" },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/app/**",
    "!src/components/ui/**",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
};

export default config;
