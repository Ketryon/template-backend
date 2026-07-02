/**
 * Sanitization Utilities
 *
 * Security utilities for sanitizing user input, especially filenames.
 */

// Invalid characters in file/folder names (Windows + control chars)
const INVALID_CHARACTERS = /[<>:"|?*\x00-\x1f]/g;

// Path traversal patterns
const PATH_TRAVERSAL = /\.\./g;

// Reserved names (Windows)
const RESERVED_NAMES = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
];

/**
 * Sanitizes a filename for safe storage
 *
 * - Removes dangerous characters
 * - Removes path traversal sequences
 * - Handles reserved Windows names
 * - Truncates to safe length
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "untitled";
  }

  // Remove dangerous characters
  let sanitized = filename.replace(INVALID_CHARACTERS, "_");

  // Remove path traversal sequences
  sanitized = sanitized.replace(PATH_TRAVERSAL, "_");

  // Remove leading/trailing slashes and dots
  sanitized = sanitized.replace(/^[./\\]+|[./\\]+$/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Handle empty result
  if (!sanitized) {
    return "untitled";
  }

  // Check for reserved Windows names
  const baseName = sanitized.split(".")[0].toUpperCase();
  if (RESERVED_NAMES.includes(baseName)) {
    sanitized = "_" + sanitized;
  }

  // Truncate if too long (max 255 chars, preserve extension)
  if (sanitized.length > 255) {
    const extIndex = sanitized.lastIndexOf(".");
    if (extIndex > 0) {
      const name = sanitized.substring(0, extIndex);
      const extension = sanitized.substring(extIndex);
      sanitized = name.substring(0, 255 - extension.length) + extension;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }

  return sanitized;
}

/**
 * Validates that a filename is safe (without modifying it)
 * Returns true if safe, false if it contains dangerous patterns
 */
export function isFilenameValid(filename: string): boolean {
  if (!filename || typeof filename !== "string") {
    return false;
  }

  if (filename.includes("..")) {
    return false;
  }

  if (INVALID_CHARACTERS.test(filename)) {
    INVALID_CHARACTERS.lastIndex = 0;
    return false;
  }

  const baseName = filename.split(".")[0].toUpperCase();
  if (RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  if (filename.length > 255 || filename.length === 0) {
    return false;
  }

  return true;
}
