import { db } from "./db.server";
import { userInvites } from "./schema";
import { eq } from "drizzle-orm";

export async function checkInviteExists(email: string): Promise<boolean> {
  const result = await db
    .select({ id: userInvites.id })
    .from(userInvites)
    .where(eq(userInvites.email, email.toLowerCase().trim()))
    .limit(1);
  return result.length > 0;
}

export async function createInvite(email: string): Promise<boolean> {
  const trimmedEmail = email.toLowerCase().trim();
  const exists = await checkInviteExists(trimmedEmail);
  if (exists) {
    return false;
  }
  await db.insert(userInvites).values({ email: trimmedEmail });
  return true;
}
