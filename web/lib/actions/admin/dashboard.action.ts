"use server";

import { db } from "@/lib/db";
import { users, courses, trainerProfiles } from "@/lib/db/schema";
import { count, eq, and, isNull, desc } from "drizzle-orm";

export async function getAdminStats() {
  try {
    const [
      totalUsers,
      totalCourses,
      activeInstructors,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(isNull(users.deletedAt)),

      db
        .select({ count: count() })
        .from(courses)
        .where(isNull(courses.deletedAt)),

      db
        .select({ count: count() })
        .from(trainerProfiles)
        .innerJoin(users, eq(trainerProfiles.userId, users.id))
        .where(
          and(
            eq(users.status, "active"),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt)
          )
        ),
    ]);

    return {
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count ?? 0,
        totalCourses: totalCourses[0]?.count ?? 0,
        pendingLeaveApprovals: 0,
        activeInstructors: activeInstructors[0]?.count ?? 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard statistics.",
      data: {
        totalUsers: 0,
        totalCourses: 0,
        pendingLeaveApprovals: 0,
        activeInstructors: 0,
      },
    };
  }
}

export async function getRecentUsers(limit = 5) {
  try {
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.fullName,
        email: users.cnic, // Replace with users.email when you add an email column
        role: users.role,
        status: users.status,
        joinDate: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit);

    return {
      success: true,
      data: recentUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        status:
          user.status.charAt(0).toUpperCase() + user.status.slice(1),
        joinDate: new Date(user.joinDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch recent users:", error);

    return {
      success: false,
      message: "Failed to fetch recent users.",
      data: [],
    };
  }
}

export async function getUserDistribution() {
  try {
    const [admins, trainers, students, totalUsers] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "admin")),

      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "trainer")),

      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "student")),

      db
        .select({ count: count() })
        .from(users)
        .where(isNull(users.deletedAt)),
    ]);

    const total = totalUsers[0]?.count ?? 0;

    const getPercentage = (value: number) =>
      total === 0 ? 0 : Math.round((value / total) * 100);

    const data = [
      {
        id: "admin",
        label: "Admins",
        count: admins[0]?.count ?? 0,
        percentage: getPercentage(admins[0]?.count ?? 0),
        color: "#7658FF",
      },
      {
        id: "trainer",
        label: "Trainers",
        count: trainers[0]?.count ?? 0,
        percentage: getPercentage(trainers[0]?.count ?? 0),
        color: "#22C55E",
      },
      {
        id: "student",
        label: "Students",
        count: students[0]?.count ?? 0,
        percentage: getPercentage(students[0]?.count ?? 0),
        color: "#F59E0B",
      },
    ];

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Failed to fetch user distribution:", error);

    return {
      success: false,
      message: "Failed to fetch user distribution.",
      data: [],
    };
  }
}