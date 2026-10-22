import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["dotenv/config"],
    // Tests share one Postgres/Redis; run files serially.
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
