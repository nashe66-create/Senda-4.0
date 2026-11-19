import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { Partner } from "@prisma/client";

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function requirePartner(request: Request): Promise<
  | { ok: true; partner: Partner }
  | { ok: false; status: number; error: { code: string; message: string } }
> {
  const header =
    request.headers.get("authorization") ??
    request.headers.get("x-api-key") ??
    "";

  let apiKey = "";
  if (header.toLowerCase().startsWith("bearer ")) {
    apiKey = header.slice(7).trim();
  } else if (header) {
    apiKey = header.trim();
  }

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: {
        code: "unauthorized",
        message: "Missing partner API key (Authorization: Bearer <key>)",
      },
    };
  }

  const apiKeyHash = hashApiKey(apiKey);
  const partner = await prisma.partner.findFirst({
    where: { apiKeyHash, active: true },
  });

  if (!partner) {
    return {
      ok: false,
      status: 401,
      error: { code: "unauthorized", message: "Invalid partner API key" },
    };
  }

  return { ok: true, partner };
}

export const BILLER_COOKIE = "senda_biller_session";

export async function getBillerSession(): Promise<{
  userId: string;
  institutionId: string;
  email: string;
} | null> {
  const jar = await cookies();
  const raw = jar.get(BILLER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as {
      userId: string;
      institutionId: string;
      email: string;
    };
    if (!parsed.userId || !parsed.institutionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function encodeBillerSession(payload: {
  userId: string;
  institutionId: string;
  email: string;
}): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
