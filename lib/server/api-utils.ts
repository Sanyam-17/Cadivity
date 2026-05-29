import "server-only";
import { NextResponse } from "next/server";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Standard utility for sending successful API responses.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard utility for sending error API responses.
 */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Common error handler for API routes.
 */
export function handleApiError(error: any) {
  console.error("API Error:", error);
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return errorResponse(message);
}

