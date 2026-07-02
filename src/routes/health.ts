import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /health
 * Health check endpoint — no rate limiting, no auth
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "template-backend",
    timestamp: new Date().toISOString(),
  });
});

export default router;
