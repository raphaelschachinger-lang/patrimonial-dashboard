import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const expectedHash = process.env.AUTH_PASSWORD_HASH;
  const email = process.env.AUTH_USER_EMAIL;

  if (!expectedHash || !email) {
    return NextResponse.json(
      { error: "Auth non configurée côté serveur (.env)" },
      { status: 500 }
    );
  }

  if (!password || !(await bcrypt.compare(password, expectedHash))) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const token = await createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });

  return NextResponse.json({ ok: true });
}
