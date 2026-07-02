import { NextFunction, Request, Response } from "express";
import { checkRateLimit, getRateLimitInfo } from "../services/redis";

interface RateLimitOptions {
  /** Maximum requests allowed in window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Custom key generator (default: IP address) */
  keyGenerator?: (req: Request) => string;
  /** Custom message when rate limited */
  message?: string;
}

/**
 * Rate limiting middleware using Redis sliding window
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    limit,
    windowSeconds,
    keyGenerator = (req) => getClientIp(req),
    message = "Too many requests, please try again later",
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = keyGenerator(req);

    const isAllowed = await checkRateLimit(identifier, limit, windowSeconds);
    const info = await getRateLimitInfo(identifier, limit, windowSeconds);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", info.remaining.toString());
    res.setHeader("X-RateLimit-Reset", info.resetIn.toString());
    res.setHeader("X-RateLimit-Window", windowSeconds.toString());

    if (!isAllowed) {
      res.status(429).json({
        message,
        retryAfter: info.resetIn,
      });
      return;
    }

    next();
  };
}

/**
 * Get client IP address from request
 * Handles proxies (X-Forwarded-For) and direct connections
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

// =============================================================================
// PRE-CONFIGURED RATE LIMITERS
// =============================================================================

/** Standard: 500 requests per minute */
export const standardLimiter = rateLimit({
  limit: 500,
  windowSeconds: 60,
  message: "Too many requests. Please try again in a minute.",
});

/** Uploads: 50 per 15 minutes */
export const uploadLimiter = rateLimit({
  limit: 50,
  windowSeconds: 15 * 60,
  message: "Upload limit reached. Please try again later.",
});

/** Strict: 30 per minute (sensitive operations) */
export const strictLimiter = rateLimit({
  limit: 30,
  windowSeconds: 60,
  message: "Rate limit exceeded. Please slow down.",
});

/** Read: 1000 per minute */
export const readLimiter = rateLimit({
  limit: 1000,
  windowSeconds: 60,
  message: "Too many requests. Please try again shortly.",
});
