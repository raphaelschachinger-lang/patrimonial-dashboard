import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = "30d";

function getSecretKey() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET manquant (voir .env.example)");
  }
  return new TextEncoder().encode(secret);
}

/** Signe un cookie de session pour l'utilisateur unique de l'app. */
export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/** Vérifie un cookie de session. Retourne `null` si absent/invalide/expiré. */
export async function verifySessionToken(
  token: string | undefined
): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
