import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    } satisfies ApiResponse<T>,
    { status }
  );
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
    } satisfies ApiResponse,
    { status }
  );
}

export function validationError(error: ZodError) {
  return errorResponse("Invalid payload", 400, error.flatten());
}

export function parsePagination(searchParams: URLSearchParams, defaults?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || String(defaults?.page ?? 1), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") || String(defaults?.pageSize ?? 20), 10) || 20)
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { data: null, error: validationError(parsed.error) };
  }
  return { data: parsed.data, error: null };
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return errorResponse(message);
}
