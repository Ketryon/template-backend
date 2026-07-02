// Load environment variables FIRST - before any Clerk imports
// This is critical as Clerk reads env vars at import time
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { standardLimiter } from "./middleware/rateLimit";
import exampleRoutes from "./routes/example";
import healthRoutes from "./routes/health";
// Initialize Redis connection
import "./services/redis";

const app: Application = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Clerk authentication middleware (validates JWTs, attaches auth to request)
app.use(clerkMiddleware());

// Apply standard rate limiting to all API routes
app.use("/api", standardLimiter);

// =============================================================================
// ROUTES
// =============================================================================

// Example routes (authenticated — demonstrates all patterns)
app.use("/api/example", exampleRoutes);

// Health check (no rate limiting, no auth)
app.use("/health", healthRoutes);

// API info
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    name: "Template Backend API",
    version: "1.0.0",
    description: "Ketryon Express Backend Template",
    endpoints: {
      example: {
        "GET /api/example": "List items (auth required, paginated)",
        "GET /api/example/:id": "Get item by ID (auth required)",
        "POST /api/example": "Create item (auth required)",
        "DELETE /api/example/:id": "Delete item (auth required)",
      },
    },
    authentication: {
      type: "Bearer token (Clerk JWT)",
      header: "Authorization: Bearer <token>",
    },
    rateLimit: {
      standard: "500 requests per minute",
    },
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`API info at http://localhost:${PORT}/api`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});

export default app;
