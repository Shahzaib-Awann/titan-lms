"use server";

import { db } from "@/lib/db";
import { users, assets } from "@/lib/db/schema";
import { AdminFormSchema } from "@/lib/zod/admin.schema";
import { hashPassword } from "@/lib/helpers/password";
import { nanoid } from "nanoid";
import { eq, isNull, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadAssetAction } from "./asset.action";
import path from "path";
import fs from "fs/promises";

/**
 * Fetch all active admin users
 */
export async function getAdmins() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    return await db.transaction(async (tx) => {
      return await tx
        .select({
          id: users.id,
          cnic: users.cnic,
          fullName: users.fullName,
          phone: users.phone,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,

          avatarId: assets.id,
          avatarUrl: assets.url,
        })
        .from(users)
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(and(eq(users.role, "admin"), isNull(users.deletedAt)));
    });
  } catch (error) {
    console.error("getAdminsAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch admins.",
    );
  }
}

/**
 * Fetch single admin by ID
 */
export async function getAdminForEdit(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    return await db.transaction(async (tx) => {
      const [admin] = await tx
        .select({
          id: users.id,
          cnic: users.cnic,
          fullName: users.fullName,
          phone: users.phone,

          role: users.role,
          status: users.status,

          avatarAssetId: users.avatarAssetId,
          avatarUrl: assets.url,

          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(
          and(
            eq(users.id, id),
            eq(users.role, "admin"),
            isNull(users.deletedAt),
          ),
        )
        .limit(1);

      return admin ?? null;
    });
  } catch (error) {
    console.error("getAdminByIdAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch admin.",
    );
  }
}
/**
 * Create or update admin
 */
export async function saveAdmin(
  data: z.infer<typeof AdminFormSchema> & { removeAvatar?: boolean }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsed = AdminFormSchema.parse(data);
    let avatarAssetId: string | undefined;

    // 1. Upload new avatar if provided
    if (parsed.avatar) {
      const upload = await uploadAssetAction(parsed.avatar, "avatars/admins");
      avatarAssetId = upload.assetId;
    }

    // Keep track of any old physical file to clean up after DB operations complete
    let diskFileToRemove: string | null = null;

    await db.transaction(async (tx) => {
      /**
       * Update existing admin logic
       */
      if (parsed.id) {
        const [existingUser] = await tx
          .select({ avatarAssetId: users.avatarAssetId })
          .from(users)
          .where(eq(users.id, parsed.id))
          .limit(1);

        const updateData: Partial<typeof users.$inferInsert> = {
          fullName: parsed.fullName,
          cnic: parsed.cnic,
          phone: parsed.phone || "",
          status: parsed.status,
        };

        if (parsed.password?.trim()) {
          updateData.password = await hashPassword(parsed.password);
        }

        // Handle Image Deletion or Replacement
        if (data.removeAvatar || avatarAssetId) {
          if (existingUser?.avatarAssetId) {
            // Find old asset details to capture the disk file location
            const [oldAsset] = await tx
              .select()
              .from(assets)
              .where(eq(assets.id, existingUser.avatarAssetId))
              .limit(1);

            if (oldAsset) {
              const relativePath = oldAsset.url.startsWith("/") ? oldAsset.url.slice(1) : oldAsset.url;
              diskFileToRemove = path.join(process.cwd(), "public", relativePath);

              // Delete the old row from assets table
              await tx.delete(assets).where(eq(assets.id, existingUser.avatarAssetId));
            }
          }

          // If explicitly removed, explicitly nullify columns
          if (data.removeAvatar) {
            updateData.avatarAssetId = null;
          }
        }

        // If a new replacement avatar was uploaded, assign it
        if (avatarAssetId) {
          updateData.avatarAssetId = avatarAssetId;
        }

        await tx.update(users).set(updateData).where(eq(users.id, parsed.id));
        revalidatePath("/admin/admins");

        return;
      }

      /**
       * Create new admin logic
       */
      if (!parsed.password?.trim()) {
        throw new Error("Password is required.");
      }

      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.cnic, parsed.cnic))
        .limit(1);

      if (existingUser) {
        throw new Error("An account with this CNIC already exists.");
      }

      const userId = nanoid();
      await tx.insert(users).values({
        id: userId,
        cnic: parsed.cnic,
        password: await hashPassword(parsed.password),
        fullName: parsed.fullName,
        phone: parsed.phone || "",
        role: "admin",
        status: parsed.status,
        avatarAssetId: avatarAssetId ?? null,
      });

      revalidatePath("/admin/admins");
    });

    // 2. Perform disk cleanup safely OUTSIDE the DB transaction.
    // This guarantees we only wipe physical files if the database operations pass successfully.
    if (diskFileToRemove) {
      try {
        await fs.unlink(diskFileToRemove);
      } catch (unlinkError) {
        console.error("Warning: Failed to erase replaced asset from disk storage:", unlinkError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("saveAdminAction Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save admin.");
  }
}

/**
 * Soft delete admin
 */
export async function deleteAdmin(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    return await db.transaction(async (tx) => {
      const [admin] = await tx
        .select({
          id: users.id,
          role: users.role,
        })
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);

      if (!admin) {
        throw new Error("Admin not found.");
      }

      if (admin.role !== "admin") {
        throw new Error("Only admin accounts can be deleted.");
      }

      await tx
        .update(users)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(users.id, id));

      revalidatePath("/admin/admins");

      return {
        success: true,
        id,
      };
    });
  } catch (error) {
    console.error("deleteAdminAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to delete admin.",
    );
  }
}
