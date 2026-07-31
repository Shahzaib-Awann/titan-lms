"use server";

import { and, desc, eq, gte, lte, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { announcements, assets, users } from "@/lib/db/schema";
import { AnnouncementFormSchema } from "../zod/admin.schema";
import z from "zod";
import { requireRole } from "./auth.action";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { formatDate } from "../helpers/date-fns";

export async function getAdminAnnouncementsDatatable(params: {
  audience?: "all" | "trainers" | "students";
  visibility?: "public" | "private";
  startDate?: string;
  endDate?: string;
}) {
  try {
    const { audience, visibility, startDate, endDate } = params;

    return await db.transaction(async (tx) => {
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

      const rows = await tx
        .select({
          id: announcements.id,

          title: announcements.title,
          description: announcements.description,

          isPublic: announcements.isPublic,
          audience: announcements.targetAudience,
          isPinned: announcements.isPinned,

          startDate: announcements.startDate,
          endDate: announcements.endDate,

          createdAt: announcements.createdAt,

          createdBy: {
            id: users.id,
            name: users.fullName,

            // Actual avatar URL
            avatarURL: assets.url,
          },
        })
        .from(announcements)
        .leftJoin(users, eq(announcements.createdBy, users.id))
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(and(...filters))
        .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

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
    });
  } catch (error) {
    console.error("Failed to fetch admin announcements datatable", {
      error,
      function: "getAdminAnnouncementsDatatable",
    });

    throw new Error("Unable to fetch announcements. Please try again later.");
  }
}

export async function getAnnouncementByIdForEdit(id: string) {
  try {
    return await db.transaction(async (tx) => {
      const [announcement] = await tx
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

      if (!announcement) {
        return {
          success: false,
          message: "Announcement not found",
          data: null,
        };
      }

      return {
        success: true,

        data: {
          id: announcement.id,

          title: announcement.title,
          description: announcement.description ?? "",

          audience: announcement.audience,

          isPublic: announcement.isPublic,
          isPinned: announcement.isPinned,

          // For HTML date input value
          startDate: announcement.startDate
            ? formatDate(announcement.startDate)
            : "",

          endDate: announcement.endDate
            ? formatDate(announcement.endDate)
            : null,
        },
      };
    });
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

export async function saveAnnouncement(
  data: z.infer<typeof AnnouncementFormSchema>,
) {
  try {
    const validated = AnnouncementFormSchema.parse(data);

    const user = await requireRole("admin");

    const announcementData = {
      title: validated.title,
      description: validated.description,

      targetAudience: validated.audience,

      isPublic: validated.isPublic,
      isPinned: validated.isPinned,

      startDate: validated.startDate ? new Date(validated.startDate) : null,

      endDate: validated.endDate ? new Date(validated.endDate) : null,
    };

    const result = await db.transaction(async (tx) => {
      // UPDATE
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

      // CREATE
      const id = nanoid();

      await tx.insert(announcements).values({
        id,
        createdBy: user.id,
        ...announcementData,
      });

      return {
        id,
        message: "Announcement created successfully",
      };
    });

    revalidatePath("/admin/announcements");

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

export async function deleteAnnouncement(id: string) {
  try {
    const existing = await db
      .select({
        id: announcements.id,
      })
      .from(announcements)
      .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
      .limit(1);

    if (!existing.length) {
      return {
        success: false,
        message: "Announcement not found",
      };
    }

    await db
      .update(announcements)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id));

    revalidatePath("/admin/announcements");

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
