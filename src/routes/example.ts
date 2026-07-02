import { getAuth, requireAuth } from "@clerk/express";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../utils/response";
import { paginationSchema, validate } from "../utils/validation";

const router = Router();

// All routes require authentication
router.use(requireAuth());

// =============================================================================
// SCHEMAS
// =============================================================================

const createExampleSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(255, { message: "Name must be 255 characters or less" })
    .transform((val: string) => val.trim()),
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((val: string | undefined) => val?.trim() || null),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/example
 * List items with pagination
 */
router.get(
  "/",
  validate(paginationSchema, "query"),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { limit, offset } = req.query as unknown as {
      limit: number;
      offset: number;
    };

    // TODO: Replace with actual database query
    const items = [
      { id: "1", name: "Example Item", createdAt: new Date().toISOString() },
    ];

    sendSuccess(res, {
      items,
      pagination: {
        total: items.length,
        limit,
        offset,
        hasMore: false,
      },
    });
  })
);

/**
 * GET /api/example/:id
 * Get single item by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { id } = req.params;

    // TODO: Replace with actual database query
    const item = { id, name: "Example Item", createdAt: new Date().toISOString() };

    if (!item) {
      sendError(res, "Item not found", 404);
      return;
    }

    sendSuccess(res, item);
  })
);

/**
 * POST /api/example
 * Create a new item
 */
router.post(
  "/",
  validate(createExampleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { name, description } = req.body as { name: string; description: string | null };

    // TODO: Replace with actual database insert
    const newItem = {
      id: crypto.randomUUID(),
      name,
      description,
      userId,
      createdAt: new Date().toISOString(),
    };

    sendSuccess(res, newItem, 201);
  })
);

/**
 * DELETE /api/example/:id
 * Delete an item
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { id } = req.params;

    // TODO: Replace with actual database delete
    // Verify ownership before deleting
    console.log(`Deleting item ${id} for user ${userId}`);

    sendSuccess(res, { message: "Item deleted" });
  })
);

export default router;
