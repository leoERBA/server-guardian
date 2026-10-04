import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const INVALID_TOKEN_MESSAGE = "Invalid or expired enrollment token.";
const INTERNAL_ERROR_MESSAGE =
  "Could not complete enrollment. Try again. If this token is rejected, generate a new installation token.";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400);
    }

    const rawToken =
      typeof body === "object" &&
      body !== null &&
      !Array.isArray(body) &&
      "token" in body &&
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    if (
      !rawToken ||
      !rawToken.startsWith("sg_enroll_") ||
      rawToken.length > 200
    ) {
      return json({ error: INVALID_TOKEN_MESSAGE }, 401);
    }

    const admin = createAdminClient();
    const enrollmentTokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const agentToken = `sg_agent_${randomBytes(32).toString("base64url")}`;
    const agentTokenHash = createHash("sha256")
      .update(agentToken)
      .digest("hex");

    const { data: serverId, error } = await admin.rpc("enroll_agent_atomic", {
      p_enrollment_token_hash: enrollmentTokenHash,
      p_agent_token_hash: agentTokenHash,
    });

    if (error) {
      // Log only the error code; database details may contain credential hashes.
      console.error("Atomic enrollment failed:", { code: error.code });
      return json({ error: INTERNAL_ERROR_MESSAGE }, 500);
    }

    if (serverId === null) {
      return json({ error: INVALID_TOKEN_MESSAGE }, 401);
    }

    if (typeof serverId !== "string" || !UUID_PATTERN.test(serverId)) {
      console.error("Atomic enrollment returned an unexpected result.");
      return json({ error: INTERNAL_ERROR_MESSAGE }, 500);
    }

    return json({ agentToken, serverId }, 200);
  } catch {
    console.error("Agent enrollment failed.");
    return json({ error: INTERNAL_ERROR_MESSAGE }, 500);
  }
}
