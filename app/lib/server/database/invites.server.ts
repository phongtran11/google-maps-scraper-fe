import { sql } from "./db.server";

export async function checkInviteExists(email: string): Promise<boolean> {
  const result = await sql.query(
    `SELECT 1 FROM user_invites WHERE email = $1`,
    [email.toLowerCase().trim()],
  );
  return result.length > 0;
}

export async function createInvite(email: string): Promise<boolean> {
  const trimmedEmail = email.toLowerCase().trim();
  const exists = await checkInviteExists(trimmedEmail);
  if (exists) {
    return false;
  }
  await sql.query(
    `INSERT INTO user_invites (email) VALUES ($1)`,
    [trimmedEmail],
  );
  return true;
}
