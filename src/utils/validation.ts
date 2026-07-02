/**
 * Validation Utilities
 *
 * Centralized validation schemas and helpers for type-safe input validation.
 * Uses Zod for schema validation.
 */

import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * UUID v4 validation
 */
export const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

/**
 * Email validation (optional field)
 */
export const optionalEmailSchema = z
  .string()
  .email({ message: "Invalid email format" })
  .max(255, { message: "Email must be 255 characters or less" })
  .optional()
  .nullable()
  .transform((val: string | null | undefined) => val?.trim() || null);

/**
 * Pagination schemas
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100).catch(100),
  offset: z.coerce.number().int().min(0).default(0).catch(0),
});

/**
 * Sorting schemas
 */
export const sortBySchema = z
  .enum(["name", "createdAt", "updatedAt"])
  .default("createdAt");
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

// =============================================================================
// TEXT SANITIZATION
// =============================================================================

/**
 * Escape SQL LIKE pattern special characters
 * Prevents LIKE injection (% and _ are wildcards)
 */
export function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * Sanitize text for XSS prevention
 * Strips dangerous HTML/script content
 */
export function sanitizeText(input: string): string {
  return (
    input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
  );
}

/**
 * Light sanitization - for display text that may contain markdown
 */
export function sanitizeTextLight(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Express middleware factory for Zod validation
 * Validates request body, query, or params against a schema
 */
export function validate<T extends z.ZodSchema>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err: z.ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    // Replace with validated/transformed data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = result.data;
    next();
  };
}

/**
 * Parse and validate data, returning result or throwing
 */
export function parseOrThrow<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Parse and validate data, returning result or null
 */
export function parseOrNull<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PaginationInput = z.infer<typeof paginationSchema>;
