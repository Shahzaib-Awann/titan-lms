import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

/**
 * Retrieves active user data for authentication.
 */
export async function getUserForSignin(cnic: string) {
  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
      password: users.password,
      status: users.status,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(and(eq(users.cnic, cnic), eq(users.status, "active")))
    .limit(1);

  /**
   * Validates user existence and deletion status.
   */
  if (!user) return null;
  if (user.deletedAt) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    password: user.password,
    status: user.status,
  };
}