"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs/promises";

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "pdf", "mp4", "md"] as const;

type Extension = (typeof ALLOWED_EXTENSIONS)[number];

/**
 * Upload file and create asset record safely.
 * If database insertion fails, uploaded file is removed.
 */
export async function uploadAssetAction(file: File, folderPath?: string) {
  let uploadedFilePath: string | null = null;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!file) {
      throw new Error("No file provided.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension as Extension)) {
      throw new Error("Unsupported file type.");
    }

    return await db.transaction(async (tx) => {
      const assetId = nanoid();

      const publicId = nanoid();

      const fileName = `${publicId}.${extension}`;

      const uploadFolder = path.join(
        process.cwd(),
        "public",
        "uploads",
        ...(folderPath ? folderPath.split("/") : []),
      );

      await fs.mkdir(uploadFolder, {
        recursive: true,
      });

      uploadedFilePath = path.join(uploadFolder, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(uploadedFilePath, buffer);

      const url = "/uploads/" + (folderPath ? `${folderPath}/` : "") + fileName;

      await tx.insert(assets).values({
        id: assetId,

        publicId,

        url,

        originalName: file.name,

        fileName,

        extension: extension as Extension,

        sizeBytes: file.size,

        uploadedBy: session.user.id,

        uploadedAt: new Date(),
      });

      return {
        success: true,

        assetId,

        publicId,

        url,

        originalName: file.name,

        fileName,

        extension,

        sizeBytes: file.size,
      };
    });
  } catch (error) {
    console.error("uploadAssetAction Error:", error);

    /**
     * Cleanup uploaded file
     * if transaction or upload process fails
     */
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);

        console.log("Temporary uploaded file removed:", uploadedFilePath);
      } catch (cleanupError) {
        console.error("File cleanup failed:", cleanupError);
      }
    }

    throw new Error(
      error instanceof Error ? error.message : "File upload failed.",
    );
  }
}
