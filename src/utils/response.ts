import { Response } from "express";

/**
 * Send a success response
 */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json(data);
}

/**
 * Send an error response
 */
export function sendError(res: Response, message: string, status = 500): void {
  res.status(status).json({ message });
}

/**
 * Handle async route errors
 */
export function asyncHandler<T>(
  fn: (req: T, res: Response) => Promise<void>
): (req: T, res: Response) => void {
  return (req: T, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error("Route error:", err);
      sendError(
        res,
        err instanceof Error ? err.message : "Internal server error",
        500
      );
    });
  };
}
