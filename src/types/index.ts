import { Request } from "express";

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Authenticated request with Clerk user info
 */
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Standard success response
 */
export interface SuccessResponse<T> {
  data: T;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  message: string;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
