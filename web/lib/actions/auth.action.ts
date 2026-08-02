"use server";

import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import { assets, users } from "../db/schema";
import { auth } from "@/auth";
import { Role, UserStatus } from "@/types/common";

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

/**
 * Enforce role-based access control.
 *
 * Throws an error if:
 * - user is not logged in
 * - user role does not match required role
 */
export async function requireRole(role: Role) {
  const session = await auth();

  const user = session?.user;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  if (user.role !== role) {
    throw new Error("Forbidden");
  }

  return user;
}


export async function getCurrentUser(
  { fresh = false }: { fresh?: boolean } = {}
): Promise<{
  id: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
} | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Fast path: use session data.
  if (!fresh) {
    return {
      id: session.user.id,
      fullName: session.user.fullName,
      role: session.user.role,
      status: session.user.status,
      avatarUrl: session.user.avatarUrl ?? null,
    };
  }

  // Fresh data from database.
  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
      status: users.status,
      avatarUrl: assets.url,
    })
    .from(users)
    .leftJoin(assets, eq(users.avatarAssetId, assets.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}