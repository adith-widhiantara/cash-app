import { defineConfig, env } from "prisma/config";

// Prisma 7 reads the database URL from here, not from schema.prisma.
// DATABASE_URL is set in compose.yaml, not in .env.
export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
