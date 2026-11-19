/**
 * Helpers for partner-facing Connect requests.
 * Prefer "retry key" in partner-facing copy; system column remains idempotency_key.
 */

/** Read retry key from body fields and/or headers. */
export function readRetryKey(
  request: Request,
  body: { retry_key?: string; idempotency_key?: string },
): string | null {
  const fromBody = (body.retry_key ?? body.idempotency_key ?? "").trim();
  if (fromBody) return fromBody;

  const fromHeader =
    request.headers.get("idempotency-key") ??
    request.headers.get("x-retry-key") ??
    "";
  const trimmed = fromHeader.trim();
  return trimmed || null;
}
