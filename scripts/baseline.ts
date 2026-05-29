import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Client } from "@neondatabase/serverless";

const DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

async function main() {
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  const journalPath = path.join(migrationsFolder, "meta/_journal.json");

  if (!fs.existsSync(journalPath)) {
    console.error(`Journal file not found at: ${journalPath}`);
    process.exit(1);
  }

  const journalContent = fs.readFileSync(journalPath, "utf8");
  const journal = JSON.parse(journalContent);
  const entry = journal.entries[0];
  if (!entry) {
    console.error("No entries found in journal.");
    process.exit(1);
  }

  const sqlFilePath = path.join(migrationsFolder, `${entry.tag}.sql`);
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Migration SQL file not found at: ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, "utf8");
  const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");
  const when = entry.when;

  console.log(`Migration Tag: ${entry.tag}`);
  console.log(`Migration Hash: ${hash}`);
  console.log(`Migration Created At (Millis): ${when}`);

  const client = new Client(DATABASE_URL);
  await client.connect();

  try {
    console.log("Creating drizzle schema and __drizzle_migrations table if not exists...");
    await client.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    console.log("Clearing existing entries and registering new baseline in drizzle.__drizzle_migrations...");
    await client.query(`DELETE FROM "drizzle"."__drizzle_migrations"`);
    await client.query(
      `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [hash, when]
    );
    console.log("Baseline successful!");
  } catch (error) {
    console.error("Failed to baseline migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
