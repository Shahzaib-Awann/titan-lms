import fs from "fs/promises";
import path from "path";
import { getUploadFolder } from "./paths";

/**
 * Save uploaded file to storage
 */
export async function saveUploadedFile(
  buffer: Buffer,
  fileName: string,
  folderPath?: string,
) {
  const uploadFolder = getUploadFolder(folderPath);

  // Ensure upload directory exists
  await fs.mkdir(uploadFolder, {
    recursive: true,
  });

  const safeFileName = path.basename(fileName);

  const filePath = path.join(
    uploadFolder,
    safeFileName,
  );

  // Write file to disk
  await fs.writeFile(
    filePath,
    buffer,
  );

  return filePath;
}

/**
 * Remove uploaded file from storage
 */
export async function removeUploadedFile(
  filePath: string,
) {
  try {
    // Remove file if it exists
    await fs.rm(filePath, {
      force: true,
    });
  } catch (error) {
    console.error(
      "Failed to remove uploaded file:",
      error,
    );
  }
}