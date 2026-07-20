import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

/**
 * Retrieves active user data for authentication.
 *
 * Returns null when:
 * - user does not exist
 * - user account is inactive
 * - user has been soft deleted
 */
export async function getUserForSignin(cnic: string) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        role: users.role,
        password: users.password,
        status: users.status,
      })
      .from(users)
      .where(
        and(
          eq(users.cnic, cnic),
          eq(users.status, "active"),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    /**
     * User not found or invalid account state
     */
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      password: user.password,
      status: user.status,
    };
  } catch (error) {
    console.error("getUserForSignin Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Unable to retrieve user.",
    );
  }
}
