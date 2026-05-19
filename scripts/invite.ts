import { pool } from "~/lib/db.server";

const email = process.argv[2];

if (!email) {
  console.error("Usage: pnpm invite <email>");
  process.exit(1);
}

await pool.query(
  `INSERT INTO user_invites (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
  [email],
);

console.log(`Invited ${email}`);
process.exit(0);
