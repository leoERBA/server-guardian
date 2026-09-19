import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const INVALID_TOKEN_MESSAGE =
  "Invalid or expired enrollment token.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawToken =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    if (
      !rawToken ||
      !rawToken.startsWith("sg_enroll_") ||
      rawToken.length > 200
    ) {
      return NextResponse.json(
        { error: INVALID_TOKEN_MESSAGE },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const { data: enrollment, error: enrollmentError } =
      await admin
        .from("agent_enrollment_tokens")
        .select("id, server_id, expires_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();

    if (enrollmentError) {
      console.error(
        "Enrollment lookup failed:",
        enrollmentError
      );

      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: INVALID_TOKEN_MESSAGE },
        { status: 401 }
      );
    }

    const expiresAt = new Date(enrollment.expires_at);

    if (
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt.getTime() <= Date.now()
    ) {
      await admin
        .from("agent_enrollment_tokens")
        .delete()
        .eq("id", enrollment.id);

      return NextResponse.json(
        { error: INVALID_TOKEN_MESSAGE },
        { status: 401 }
      );
    }

    /*
     * Consume the temporary enrollment token BEFORE
     * issuing the permanent agent credential.
     *
     * This makes the enrollment token single-use.
     */
    const {
      data: consumedToken,
      error: consumeError,
    } = await admin
      .from("agent_enrollment_tokens")
      .delete()
      .eq("id", enrollment.id)
      .eq("token_hash", tokenHash)
      .select("id")
      .maybeSingle();

    if (consumeError) {
      console.error(
        "Enrollment token consumption failed:",
        consumeError
      );

      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }

    if (!consumedToken) {
      return NextResponse.json(
        { error: INVALID_TOKEN_MESSAGE },
        { status: 401 }
      );
    }

    /*
     * Create a new credential for this specific agent.
     * Only its SHA-256 hash is stored.
     */
    const agentSecret =
      randomBytes(32).toString("base64url");

    const agentToken =
      `sg_agent_${agentSecret}`;

    const agentTokenHash = createHash("sha256")
      .update(agentToken)
      .digest("hex");

    const { error: credentialError } = await admin
      .from("agent_credentials")
      .upsert(
        {
          server_id: enrollment.server_id,
          token_hash: agentTokenHash,
          created_at: new Date().toISOString(),
          last_used_at: null,
          revoked_at: null,
        },
        {
          onConflict: "server_id",
        }
      );

    if (credentialError) {
      console.error(
        "Agent credential creation failed:",
        credentialError
      );

      return NextResponse.json(
        {
          error:
            "Could not create agent credential. Generate a new installation token and try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agentToken,
      serverId: enrollment.server_id,
    });
  } catch (error) {
    console.error("Agent enrollment failed:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}