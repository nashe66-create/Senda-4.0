import { NextResponse } from "next/server";
import { ConnectError } from "./connect";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: { code, message, ...extra } },
    { status },
  );
}

export function handleRouteError(err: unknown) {
  if (err instanceof ConnectError) {
    return jsonError(err.code, err.message, err.status);
  }
  if (err instanceof ZodError) {
    return jsonError(
      "validation_error",
      err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      400,
    );
  }
  console.error(err);
  return jsonError("internal_error", "Unexpected server error", 500);
}
