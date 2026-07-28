"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import {
  removeUploadedFile,
  saveUploadedFile,
} from "@/lib/helpers/upload";

const ALLOWED_FILES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  mp4: "video/mp4",
  md: "text/markdown",
} as const;

type Extension = keyof typeof ALLOWED_FILES;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate uploaded file
 */
function validateFile(file: File): Extension {
  if (!file) {
    throw new Error("No file provided.");
  }

  if (file.size === 0) {
    throw new Error("File is empty.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 5MB limit.");
  }

  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    !extension ||
    !(extension in ALLOWED_FILES)
  ) {
    throw new Error("Unsupported file type.");
  }

  const allowedMime =
    ALLOWED_FILES[extension as Extension];

  if (file.type !== allowedMime) {
    throw new Error(
      "File content does not match its extension.",
    );
  }

  return extension as Extension;
}

/**
 * Sanitize upload folder path
 */
function sanitizeFolderPath(folderPath?: string) {
  if (!folderPath) {
    return undefined;
  }

  return folderPath
    .replace(/\.\./g, "")
    .replace(/^\/+|\/+$/g, "");
}

/**
 * Upload asset file and save metadata
 */
export async function uploadAssetAction(
  file: File,
  folderPath?: string,
) {
  let uploadedFilePath: string | null = null;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized.");
    }

    const extension = validateFile(file);

    const safeFolderPath =
      sanitizeFolderPath(folderPath);

    const assetId = nanoid();
    const publicId = nanoid();

    const fileName = `${publicId}.${extension}`;

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    uploadedFilePath = await saveUploadedFile(
      buffer,
      fileName,
      safeFolderPath,
    );

    const url = `/uploads/${
      safeFolderPath
        ? `${safeFolderPath}/`
        : ""
    }${fileName}`;

    await db.insert(assets).values({
      id: assetId,
      publicId,
      url,
      originalName: file.name,
      fileName,
      extension,
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
  } catch (error) {
    if (uploadedFilePath) {
      try {
        await removeUploadedFile(uploadedFilePath);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup uploaded file:",
          cleanupError,
        );
      }
    }

    console.error(
      "uploadAssetAction error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "File upload failed.",
    );
  }
}