"use server";

import { db } from "@/lib/db";
import { users, assets, trainerProfiles } from "@/lib/db/schema";
import { hashPassword } from "@/lib/helpers/password";
import { nanoid } from "nanoid";
import { eq, isNull, and } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { uploadAssetAction } from "../asset.action";
import path from "path";
import fs from "fs/promises";
import { TrainerFormSchema } from "../../zod/admin.schema";
import { requireRole } from "./auth.action";

/**
 * Fetch all active trainers
 */
export async function getTrainers() {
  try {
    return await db.transaction(async (tx) => {
      return await tx
        .select({
          id: users.id,
          trainerId: trainerProfiles.id,

          avatarId: assets.id,
          avatarUrl: assets.url,

          fullName: users.fullName,
          status: users.status,
          cnic: users.cnic,

          employeeCode: trainerProfiles.employeeCode,
          specialization: trainerProfiles.specialization,
          hourlyRate: trainerProfiles.hourlyRate,
          joinedAt: trainerProfiles.joinedAt,
        })
        .from(users)
        .innerJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(
          and(
            eq(users.role, "trainer"),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt),
          ),
        );
    });
  } catch (error) {
    console.error("getTrainersAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch trainers.",
    );
  }
}

/**
 * Create or update trainer
 */
export async function saveTrainer(
  data: z.infer<typeof TrainerFormSchema> & {
    removeAvatar?: boolean;
  },
) {
  try {
    await requireRole("admin");

    const parsed = TrainerFormSchema.parse(data);

    let avatarAssetId: string | undefined;

    // Upload new avatar
    if (parsed.avatar) {
      const upload = await uploadAssetAction(parsed.avatar, "avatars/trainers");

      avatarAssetId = upload.assetId;
    }

    let diskFileToRemove: string | null = null;

    await db.transaction(async (tx) => {
      /**
       * UPDATE TRAINER
       */
      if (parsed.id) {
        const [existingTrainer] = await tx
          .select({
            avatarAssetId: users.avatarAssetId,
          })
          .from(users)
          .where(eq(users.id, parsed.id))
          .limit(1);

        const userUpdate: Partial<typeof users.$inferInsert> = {
          fullName: parsed.fullName,
          phone: parsed.phone,
          status: parsed.status,
          cnic: parsed.cnic,
        };

        if (parsed.password?.trim()) {
          userUpdate.password = await hashPassword(parsed.password);
        }

        /**
         * Avatar replacement/removal
         */
        if (data.removeAvatar || avatarAssetId) {
          if (existingTrainer?.avatarAssetId) {
            const [oldAsset] = await tx
              .select()
              .from(assets)
              .where(eq(assets.id, existingTrainer.avatarAssetId))
              .limit(1);

            if (oldAsset) {
              const relativePath = oldAsset.url.startsWith("/")
                ? oldAsset.url.slice(1)
                : oldAsset.url;

              diskFileToRemove = path.join(
                process.cwd(),
                "public",
                relativePath,
              );

              await tx
                .delete(assets)
                .where(eq(assets.id, existingTrainer.avatarAssetId));
            }
          }

          if (data.removeAvatar) {
            userUpdate.avatarAssetId = null;
          }
        }

        if (avatarAssetId) {
          userUpdate.avatarAssetId = avatarAssetId;
        }

        await tx.update(users).set(userUpdate).where(eq(users.id, parsed.id));

        await tx
          .update(trainerProfiles)
          .set({
            employeeCode: parsed.employeeCode,

            specialization: parsed.specialization || null,

            hourlyRate: parsed.hourlyRate ? Number(parsed.hourlyRate) : null,

            joinedAt: new Date(parsed.joinedDate),
          })
          .where(eq(trainerProfiles.userId, parsed.id));

        revalidatePath("/admin/trainers");

        return;
      }

      /**
       * CREATE TRAINER
       */

      if (!parsed.password?.trim()) {
        throw new Error("Password is required.");
      }

      const [existingCode] = await tx
        .select({
          id: trainerProfiles.id,
        })
        .from(trainerProfiles)
        .where(eq(trainerProfiles.employeeCode, parsed.employeeCode))
        .limit(1);

      if (existingCode) {
        throw new Error("Employee code already exists.");
      }

      const userId = nanoid();

      await tx.insert(users).values({
        id: userId,

        password: await hashPassword(parsed.password),

        fullName: parsed.fullName,

        cnic: parsed.cnic,

        phone: parsed.phone,

        role: "trainer",

        status: parsed.status,

        avatarAssetId: avatarAssetId ?? null,
      });

      await tx.insert(trainerProfiles).values({
        id: nanoid(),

        userId,

        employeeCode: parsed.employeeCode,

        specialization: parsed.specialization || null,

        hourlyRate: parsed.hourlyRate ? Number(parsed.hourlyRate) : null,

        joinedAt: new Date(parsed.joinedDate),
      });

      revalidatePath("/admin/trainers");
    });

    /**
     * Delete old physical avatar
     */
    if (diskFileToRemove) {
      try {
        await fs.unlink(diskFileToRemove);
      } catch (error) {
        console.error("Failed removing old avatar:", error);
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("saveTrainerAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to save trainer.",
    );
  }
}

/**
 * Fetch single trainer by ID for edit
 */
export async function getTrainerForEdit(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [trainer] = await tx
        .select({
          id: users.id,

          fullName: users.fullName,
          phone: users.phone,
          cnic: users.cnic,
          status: users.status,

          avatarAssetId: users.avatarAssetId,
          avatarUrl: assets.url,

          employeeCode: trainerProfiles.employeeCode,
          specialization: trainerProfiles.specialization,
          hourlyRate: trainerProfiles.hourlyRate,
          joinedAt: trainerProfiles.joinedAt,

          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)

        .innerJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))

        .leftJoin(assets, eq(users.avatarAssetId, assets.id))

        .where(
          and(
            eq(users.id, id),
            eq(users.role, "trainer"),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt),
          ),
        )

        .limit(1);

      return trainer ?? null;
    });
  } catch (error) {
    console.error("getTrainerForEditAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch trainer.",
    );
  }
}

/**
 * Soft delete trainer
 */
export async function deleteTrainer(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [trainer] = await tx
        .select({
          id: users.id,
          role: users.role,
          trainerProfileId: trainerProfiles.id,
        })
        .from(users)
        .innerJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))
        .where(
          and(
            eq(users.id, id),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt),
          ),
        )
        .limit(1);

      if (!trainer) {
        throw new Error("Trainer not found.");
      }

      if (trainer.role !== "trainer") {
        throw new Error("Only trainer accounts can be deleted.");
      }

      // Soft delete user account
      await tx
        .update(users)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(users.id, id));

      // Soft delete trainer profile
      await tx
        .update(trainerProfiles)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(trainerProfiles.id, trainer.trainerProfileId));

      revalidatePath("/admin/trainers");

      return {
        success: true,
        id,
      };
    });
  } catch (error) {
    console.error("deleteTrainerAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to delete trainer.",
    );
  }
}
