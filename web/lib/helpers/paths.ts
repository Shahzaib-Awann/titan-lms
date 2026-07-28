import path from "path";

const UPLOAD_ROOT = path.join(
  process.cwd(),
  "public",
  "uploads",
);

/**
 * Get upload folder path
 */
export function getUploadFolder(folderPath?: string) {
  if (!folderPath) {
    return UPLOAD_ROOT;
  }

  // Sanitize folder segments
  const safeSegments = folderPath
    .split("/")
    .filter(Boolean)
    .filter(
      (segment) =>
        segment !== "." &&
        segment !== "..",
    );

  const uploadFolder = path.join(
    UPLOAD_ROOT,
    ...safeSegments,
  );

  // Prevent escaping upload directory
  if (!uploadFolder.startsWith(UPLOAD_ROOT)) {
    return UPLOAD_ROOT;
  }

  return uploadFolder;
}