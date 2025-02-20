import { defineConfig } from "drizzle-kit";

const DATABASE_URL = `postgresql://neondb_owner:npg_TfP4cDvBiKC8@ep-winter-bird-a5j3vl8l.us-east-2.aws.neon.tech/neondb?sslmode=require`;


export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
