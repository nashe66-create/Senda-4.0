import { z } from "zod";
import { prisma } from "@/lib/db";
import { BILLER_COOKIE, encodeBillerSession, safeEqual } from "@/lib/auth";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";
import { NextResponse } from "next/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const user = await prisma.schoolUser.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { institution: true },
    });

    if (!user || !safeEqual(user.passwordStub, body.password)) {
      return jsonError("invalid_credentials", "Invalid email or password", 401);
    }

    const token = encodeBillerSession({
      userId: user.id,
      institutionId: user.institutionId,
      email: user.email,
    });

    const organisation = {
      id: user.institution.externalId,
      name: user.institution.name,
    };
    const res = jsonOk({
      ok: true,
      // Prefer organisation; school kept as alias for older dogfood/scripts.
      organisation,
      school: organisation,
      user: { email: user.email, name: user.name },
    });

    res.cookies.set(BILLER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BILLER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
