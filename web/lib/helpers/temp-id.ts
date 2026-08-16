import { nanoid } from "nanoid";

export const TEMP_ID_PREFIX = "temp-";


/**
 * Create a temporary identifier
 * Used for client-side created records before database insertion.
 */
export function createTempId(): string {
  return `${TEMP_ID_PREFIX}${nanoid()}`;
}


/**
 * Check whether an identifier is temporary.
 */
export function isTempId(
  id?: string | null,
): boolean {
  return Boolean(
    id?.startsWith(TEMP_ID_PREFIX),
  );
}