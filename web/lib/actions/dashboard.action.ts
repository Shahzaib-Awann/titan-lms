"use server";

import { db } from "@/lib/db";
import { users, courses, trainerProfiles } from "@/lib/db/schema";
import { format } from "date-fns";
import { count, eq, isNull, desc, and } from "drizzle-orm";

/**
 * Fetch admin dashboard statistics
 */
export async function getAdminStats() {
  try {

    const [
      usersCount,
      coursesCount,
      activeInstructorsCount,
    ] = await Promise.all([
      db
        .select({
          count: count(),
        })
        .from(users)
        .where(isNull(users.deletedAt)),

      db
        .select({
          count: count(),
        })
        .from(courses)
        .where(isNull(courses.deletedAt)),

      db
        .select({
          count: count(),
        })
        .from(trainerProfiles)
        .innerJoin(
          users,
          eq(trainerProfiles.userId, users.id),
        )
        .where(
          and(
            eq(users.status, "active"),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt),
          ),
        ),
    ]);

    return {
      success: true,
      data: {
        usersCount: Number(usersCount[0]?.count ?? 0),
        coursesCount: Number(coursesCount[0]?.count ?? 0),
        pendingLeaveApprovals: 0,
        activeInstructorsCount: Number(
          activeInstructorsCount[0]?.count ?? 0,
        ),
      },
    };
  } catch (error) {
    console.error(
      "Failed to fetch admin dashboard stats:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch dashboard statistics.",
      data: {
        usersCount: 0,
        coursesCount: 0,
        pendingLeaveApprovals: 0,
        activeInstructorsCount: 0,
      },
    };
  }
}

/**
 * Fetch recently registered users
 */
export async function getRecentUsers(limit = 5) {
  try {

    // Fetch latest users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.fullName,
        cnic: users.cnic,
        role: users.role,
        status: users.status,
        joinDate: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit);

    // Format user response
    const formattedUsers = recentUsers.map((user) => ({
      id: user.id,
      name: user.name,
      cnic: user.cnic,

      role:
        user.role.charAt(0).toUpperCase() +
        user.role.slice(1),

      status:
        user.status.charAt(0).toUpperCase() +
        user.status.slice(1),

      joinDate: format(
        new Date(user.joinDate),
        "MMM dd, yyyy",
      ),
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error) {
    console.error("[getRecentUsers]: Failed to fetch recent users:", error);

    return {
      success: false,
      message: "Failed to fetch recent users.",
      data: [],
    };
  }
}

/**
 * Fetch user role distribution statistics
 */
export async function getUserDistribution() {
  try {

    const roleCounts = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.role);

    const distribution = {
      admin: 0,
      trainer: 0,
      student: 0,
    };

    roleCounts.forEach((item) => {
      distribution[item.role] = Number(item.count);
    });

    return {
      success: true,
      data: distribution,
    };
  } catch (error) {
    console.error(
      "Failed to fetch user distribution:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch user distribution.",
      data: {
        admin: 0,
        trainer: 0,
        student: 0,
      },
    };
  }
}