"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { eq, and, ne, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";

import { db } from "@/lib/db";
import { assets, studentProfiles, users } from "@/lib/db/schema";
import { StudentFormSchema } from "@/lib/zod/admin.schema";
import { uploadAssetAction } from "@/lib/actions/asset.action";
import { hashPassword } from "../helpers/password";
import { requireRole } from "./auth.action";

/**
 * Fetch all active students
 */
export async function getStudents() {
  try {
    return await db.transaction(async (tx) => {
      return await tx
        .select({
          id: users.id,
          studentId: studentProfiles.id,

          avatarId: assets.id,
          avatarUrl: assets.url,

          rollNumber: studentProfiles.rollNumber,

          fullName: users.fullName,
          cnic: users.cnic,

          guardian: studentProfiles.guardianName,
          admissionDate: studentProfiles.admissionDate,

          status: users.status,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(
          and(
            eq(users.role, "student"),
            isNull(users.deletedAt),
            isNull(studentProfiles.deletedAt),
          ),
        );
    });
  } catch (error) {
    console.error("getStudentsAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch students.",
    );
  }
}

/**
 * Fetch single student by ID for edit
 */
export async function getStudentForEdit(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [student] = await tx
        .select({
          id: users.id,

          fullName: users.fullName,
          cnic: users.cnic,
          phone: users.phone,

          avatarAssetId: users.avatarAssetId,
          avatarUrl: assets.url,

          rollNumber: studentProfiles.rollNumber,
          dateOfBirth: studentProfiles.dateOfBirth,

          guardianName: studentProfiles.guardianName,
          guardianPhone: studentProfiles.guardianPhone,

          address: studentProfiles.address,
          admissionDate: studentProfiles.admissionDate,

          status: users.status,

          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))
        .where(
          and(
            eq(users.id, id),
            eq(users.role, "student"),
            isNull(users.deletedAt),
            isNull(studentProfiles.deletedAt),
          ),
        )
        .limit(1);

      return student ?? null;
    });
  } catch (error) {
    console.error("getStudentForEditAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch student.",
    );
  }
}

/**
 * Create or update a student record
 */
export async function saveStudent(
  data: z.infer<typeof StudentFormSchema> & {
    removeAvatar?: boolean;
  },
) {
  try {
    await requireRole("admin");

    const parsed = StudentFormSchema.parse(data);

    let avatarAssetId: string | undefined;

    // 1. Upload new avatar image if provided
    if (parsed.avatar) {
      const upload = await uploadAssetAction(parsed.avatar, "avatars/students");
      avatarAssetId = upload.assetId;
    }

    let diskFileToRemove: string | null = null;

    await db.transaction(async (tx) => {
      // Common Uniqueness Checks for CNIC
      const [existingCnic] = await tx
        .select({ id: users.id })
        .from(users)
        .where(
          parsed.id
            ? and(eq(users.cnic, parsed.cnic), ne(users.id, parsed.id))
            : eq(users.cnic, parsed.cnic),
        )
        .limit(1);

      if (existingCnic) {
        throw new Error("CNIC / B-Form is already registered.");
      }

      // Common Uniqueness Checks for Roll Number
      const [existingRoll] = await tx
        .select({ id: studentProfiles.id })
        .from(studentProfiles)
        .where(
          parsed.id
            ? and(
                eq(studentProfiles.rollNumber, parsed.rollNumber),
                ne(studentProfiles.userId, parsed.id),
              )
            : eq(studentProfiles.rollNumber, parsed.rollNumber),
        )
        .limit(1);

      if (existingRoll) {
        throw new Error("Roll Number is already in use.");
      }

      /**
       * UPDATE STUDENT
       */
      if (parsed.id) {
        const [existingStudent] = await tx
          .select({ avatarAssetId: users.avatarAssetId })
          .from(users)
          .where(eq(users.id, parsed.id))
          .limit(1);

        if (!existingStudent) {
          throw new Error("Student not found.");
        }

        const userUpdate: Partial<typeof users.$inferInsert> = {
          fullName: parsed.fullName,
          cnic: parsed.cnic,
          phone: parsed.phone || null,
          status: parsed.status,
        };

        if (parsed.password?.trim()) {
          userUpdate.password = await hashPassword(parsed.password);
        }

        // Handle Avatar removal or replacement
        if (data.removeAvatar || avatarAssetId) {
          if (existingStudent.avatarAssetId) {
            const [oldAsset] = await tx
              .select()
              .from(assets)
              .where(eq(assets.id, existingStudent.avatarAssetId))
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
                .where(eq(assets.id, existingStudent.avatarAssetId));
            }
          }

          if (data.removeAvatar) {
            userUpdate.avatarAssetId = null;
          }
        }

        if (avatarAssetId) {
          userUpdate.avatarAssetId = avatarAssetId;
        }

        // Update Users Table
        await tx.update(users).set(userUpdate).where(eq(users.id, parsed.id));

        // Update Student Profiles Table
        await tx
          .update(studentProfiles)
          .set({
            rollNumber: parsed.rollNumber,
            dateOfBirth: parsed.dateOfBirth
              ? new Date(parsed.dateOfBirth)
              : null,
            guardianName: parsed.guardianName,
            guardianPhone: parsed.guardianPhone,
            address: parsed.address,
            admissionDate: parsed.admissionDate
              ? new Date(parsed.admissionDate)
              : null,
          })
          .where(eq(studentProfiles.userId, parsed.id));

        revalidatePath("/admin/students");
        return;
      }

      /**
       * CREATE STUDENT
       */
      if (!parsed.password?.trim()) {
        throw new Error("Password is required for new students.");
      }

      const userId = nanoid();

      // Insert User
      await tx.insert(users).values({
        id: userId,
        cnic: parsed.cnic,
        password: await hashPassword(parsed.password),
        fullName: parsed.fullName,
        phone: parsed.phone || null,
        role: "student",
        status: parsed.status,
        avatarAssetId: avatarAssetId ?? null,
      });

      // Insert Student Profile
      await tx.insert(studentProfiles).values({
        id: nanoid(),
        userId,
        rollNumber: parsed.rollNumber,
        dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
        guardianName: parsed.guardianName,
        guardianPhone: parsed.guardianPhone,
        address: parsed.address,
        admissionDate: parsed.admissionDate
          ? new Date(parsed.admissionDate)
          : null,
      });

      revalidatePath("/admin/students");
    });

    // 2. Remove physical avatar file asynchronously if replaced/deleted
    if (diskFileToRemove) {
      try {
        await fs.unlink(diskFileToRemove);
      } catch (error) {
        console.error("Failed removing old avatar file:", error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("saveStudent Action Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to save student.",
    );
  }
}

/**
 * Soft delete student
 */
export async function deleteStudent(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [student] = await tx
        .select({
          id: users.id,
          role: users.role,
          studentProfileId: studentProfiles.id,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
        .where(
          and(
            eq(users.id, id),
            isNull(users.deletedAt),
            isNull(studentProfiles.deletedAt),
          ),
        )
        .limit(1);

      if (!student) {
        throw new Error("Student not found.");
      }

      if (student.role !== "student") {
        throw new Error("Only student accounts can be deleted.");
      }

      const deletedAt = new Date();

      // Soft delete user account
      await tx
        .update(users)
        .set({
          deletedAt,
        })
        .where(eq(users.id, id));

      // Soft delete student profile
      await tx
        .update(studentProfiles)
        .set({
          deletedAt,
        })
        .where(eq(studentProfiles.id, student.studentProfileId));

      revalidatePath("/admin/students");

      return {
        success: true,
        id,
      };
    });
  } catch (error) {
    console.error("deleteStudentAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to delete student.",
    );
  }
}
