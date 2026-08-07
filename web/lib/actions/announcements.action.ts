"use server";

import {
  and,
  desc,
  eq,
  gte,
  lte,
  isNull,
  or,
  isNotNull,
  inArray,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { announcements, assets, users } from "@/lib/db/schema";
import { AnnouncementFormSchema } from "../zod/admin.schema";
import z from "zod";
import { requireRole } from "./auth.action";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { formatDate } from "../helpers/date-fns";
import { auth } from "@/auth";
import { DashboardAnnouncement } from "@/components/pages/dashboards/announcements-calender-card";
import { AnnouncementStatus } from "@/types/common";

/**
 * Fetches announcements for the admin data table.
 *
 * Supports optional filtering by:
 * - Target audience
 * - Visibility (public/private)
 * - Start date
 * - End date
 *
 * Soft-deleted announcements are automatically excluded.
 */
export async function getAdminAnnouncementsDatatable(params: {
  audience?: "all" | "trainers" | "students";
  visibility?: "public" | "private";
  startDate?: string;
  endDate?: string;
}) {
  try {
    // Extract the optional filter values from the function parameters.
    const { audience, visibility, startDate, endDate } = params;

    // Build the WHERE conditions dynamically.
    const filters = [isNull(announcements.deletedAt)];

    if (audience) {
      filters.push(eq(announcements.targetAudience, audience));
    }

    if (visibility) {
      filters.push(eq(announcements.isPublic, visibility === "public"));
    }

    if (startDate) {
      filters.push(gte(announcements.startDate, new Date(startDate)));
    }

    if (endDate) {
      filters.push(lte(announcements.endDate, new Date(endDate)));
    }

    // Fetch the announcement records along with the creator's basic information and avatar.
    const rows = await db
      .select({
        id: announcements.id,

        title: announcements.title,
        description: announcements.description,

        isPublic: announcements.isPublic,
        audience: announcements.targetAudience,
        isPinned: announcements.isPinned,

        startDate: announcements.startDate,
        endDate: announcements.endDate,

        createdBy: {
          id: users.id,
          name: users.fullName,
          avatarURL: assets.url,
        },

        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .leftJoin(assets, eq(users.avatarAssetId, assets.id))
      .where(and(...filters))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

    // Normalize the response data.
    return {
      success: true,
      data: rows.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? null,
        isPublic: item.isPublic,
        audience: item.audience,
        isPinned: item.isPinned,
        startDate: item.startDate,
        endDate: item.endDate,
        createdBy: {
          id: item.createdBy?.id ?? "",
          name: item.createdBy?.name ?? "Unknown",
          avatarURL: item.createdBy?.avatarURL ?? null,
        },
        createdAt: item.createdAt,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch admin announcements datatable", {
      error,
      function: "getAdminAnnouncementsDatatable",
    });

    throw new Error("Unable to fetch announcements. Please try again later.");
  }
}

/**
 * Retrieves a single announcement by its ID for the edit form.
 */
export async function getAnnouncementByIdForEdit(id: string) {
  try {
    const [announcement] = await db
      .select({
        id: announcements.id,

        title: announcements.title,
        description: announcements.description,

        audience: announcements.targetAudience,
        isPublic: announcements.isPublic,
        isPinned: announcements.isPinned,

        startDate: announcements.startDate,
        endDate: announcements.endDate,
      })
      .from(announcements)
      .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
      .limit(1);

    // If no announcement is found, return an error.
    if (!announcement) {
      return {
        success: false,
        message: "Announcement not found",
        data: null,
      };
    }

    // Normalize the response data.
    return {
      success: true,
      data: {
        id: announcement.id,

        title: announcement.title,
        description: announcement.description ?? "",

        audience: announcement.audience,

        isPublic: announcement.isPublic,
        isPinned: announcement.isPinned,

        startDate: announcement.startDate
          ? formatDate(announcement.startDate)
          : "",

        endDate: announcement.endDate ? formatDate(announcement.endDate) : null,
      },
    };
  } catch (error) {
    console.error("Failed to fetch announcement", {
      error,
      function: "getAnnouncementByIdForEdit",
    });

    return {
      success: false,
      message: "Unable to fetch announcement",
      data: null,
    };
  }
}

/**
 * Creates a new announcement or updates an existing one.
 */
export async function saveAnnouncement(
  data: z.infer<typeof AnnouncementFormSchema>,
) {
  try {
    // Validate the input data.
    const validated = AnnouncementFormSchema.parse(data);

    // Get the admin user.
    const user = await requireRole("admin");

    // Prepare the announcement data.
    const announcementData = {
      title: validated.title,
      description: validated.description,

      targetAudience: validated.audience,

      isPublic: validated.isPublic,
      isPinned: validated.isPinned,

      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    };

    // Execute the save operation inside a transaction.
    const result = await db.transaction(async (tx) => {
      // Update an existing announcement when an ID is supplied by the form.
      if (validated.id) {
        await tx
          .update(announcements)
          .set({
            ...announcementData,
          })
          .where(eq(announcements.id, validated.id));

        return {
          id: validated.id,
          message: "Announcement updated successfully",
        };
      }

      // Otherwise, create a brand-new announcement.
      const id = nanoid();

      await tx.insert(announcements).values({
        id,
        createdBy: user.id, // Set the created-by user.
        ...announcementData,
      });

      return {
        id,
        message: "Announcement created successfully",
      };
    });

    revalidatePath("/admin/announcements");

    // Return the result.
    return {
      success: true,
      message: result.message,
      id: result.id,
    };
  } catch (error) {
    console.error("Failed to create/update announcement", {
      error,
      function: "saveAnnouncement",
    });

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unable to save announcement. Please try again later.");
  }
}

/**
 * Soft-deletes an announcement by setting its deletedAt field.
 */
export async function deleteAnnouncement(id: string) {
  try {
    // Verify that the announcement exists and has not already been soft deleted.
    const existing = await db
      .select({
        id: announcements.id,
      })
      .from(announcements)
      .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
      .limit(1);

    // If no announcement is found, return an error.
    if (!existing.length) {
      return {
        success: false,
        message: "Announcement not found",
      };
    }

    // Perform the soft-delete inside a transaction to ensure atomicity.
    await db
      .update(announcements)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id));

    revalidatePath("/admin/announcements");

    // Return the result.
    return {
      success: true,
      message: "Announcement deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete announcement", {
      error,
      function: "softDeleteAnnouncement",
    });

    return {
      success: false,
      message: "Unable to delete announcement. Please try again later.",
    };
  }
}

/**
 * Helper function to determine the status of an announcement.
 *
 * Calculates whether an announcement is live, scheduled, or expired
 * relative to today's date.
 */
function calculateAnnouncementStatus(
  startDate: Date | string | null,
  endDate: Date | string | null,
  referenceDate: Date = new Date(),
): AnnouncementStatus {
  if (!startDate) return "expired";

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return "scheduled";

  // Single-day announcement
  if (!endDate) {
    return today.getTime() === start.getTime() ? "live" : "expired";
  }

  // Multi-day announcement
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return today <= end ? "live" : "expired";
}

/**
 * Retrieves announcements for the dashboard based on the selected date.
 */
export async function getDashboardAnnouncements(
  selectedDate: Date,
): Promise<DashboardAnnouncement[]> {
  // Authenticate User
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = user.role === "admin";

  const targetDate = new Date(selectedDate);
  targetDate.setHours(0, 0, 0, 0);

  const filters = [
    isNull(announcements.deletedAt),

    // Trainers & students can only see public announcements.
    !isAdmin ? eq(announcements.isPublic, true) : undefined,

    // Role-based audience filtering.
    !isAdmin
      ? inArray(
          announcements.targetAudience,
          user.role === "trainer" ? ["all", "trainers"] : ["all", "students"],
        )
      : undefined,
  ].filter(Boolean);

  const selectedAnnouncements = await db
    .select()
    .from(announcements)
    .where(
      and(
        ...filters,

        // Announcement has started.
        lte(announcements.startDate, targetDate),

        // Still active.
        or(
          // Multi-day announcement.
          and(
            isNotNull(announcements.endDate),
            gte(announcements.endDate, targetDate),
          ),

          // Single-day announcement.
          and(
            isNull(announcements.endDate),
            eq(announcements.startDate, targetDate),
          ),
        ),
      ),
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.startDate));

  return selectedAnnouncements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    description: announcement.description ?? "",
    startDate: announcement.startDate,
    endDate: announcement.endDate,
    isPinned: announcement.isPinned,
    status: calculateAnnouncementStatus(
      announcement.startDate,
      announcement.endDate,
    ),
    ...(isAdmin && { isPublic: announcement.isPublic }),
  }));
}

/**
 * Get role-based announcements with filtering and ordering.
 */
export async function getRoleBasedAnnouncements(
  audience: "trainer" | "student",
): Promise<
  {
    id: string;
    title: string;
    description: string | null;
    audience: "all" | "trainer" | "student";
    isPinned: boolean;
    startDate: Date;
    endDate: Date | null;
    createdBy: {
      name: string;
      avatarUrl: string | null;
    };
    status: AnnouncementStatus;
  }[]
> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      description: announcements.description,

      audience: announcements.targetAudience,
      isPinned: announcements.isPinned,

      startDate: announcements.startDate,
      endDate: announcements.endDate,

      createdBy: {
        name: users.fullName,
        avatarUrl: assets.url,
      },
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.createdBy, users.id))
    .leftJoin(assets, eq(users.avatarAssetId, assets.id))
    .where(
      and(
        isNull(announcements.deletedAt),
        inArray(
          announcements.targetAudience,
          audience === "trainer" ? ["all", "trainers"] : ["all", "students"],
        ),
        or(
          // Upcoming
          gte(announcements.startDate, today),

          // Live (multi-day)
          and(
            isNotNull(announcements.endDate),
            lte(announcements.startDate, today),
            gte(announcements.endDate, today),
          ),

          // Live (single-day)
          and(
            isNull(announcements.endDate),
            eq(announcements.startDate, today),
          ),
        ),
      ),
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.startDate));

  return rows.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    description: announcement.description,

    audience:
      announcement.audience === "all"
        ? "all"
        : announcement.audience === "trainers"
          ? "trainer"
          : "student",

    isPinned: announcement.isPinned,

    startDate: announcement.startDate,
    endDate: announcement.endDate,

    createdBy: {
      name: announcement.createdBy.name ?? "Unknown",
      avatarUrl: announcement.createdBy.avatarUrl,
    },

    status: calculateAnnouncementStatus(
      announcement.startDate,
      announcement.endDate,
    ),
  }));
}
