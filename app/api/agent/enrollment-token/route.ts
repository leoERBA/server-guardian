import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const serverId = body?.serverId;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { error: "Invalid server ID." },
        { status: 400 }
      );
    }

    /*
     * The authenticated Supabase client and RLS must ensure
     * that the current user can only access their own servers.
     */
    const { data: server, error: serverError } = await supabase
      .from("servers")
      .select("id")
      .eq("id", serverId)
      .single();

    if (serverError || !server) {
      return NextResponse.json(
        { error: "Server not found or access denied." },
        { status: 404 }
      );
    }

    /*
     * Generate a cryptographically secure enrollment secret.
     *
     * The raw token is returned to the user only once.
     * Only its SHA-256 hash is stored in the database.
     */
    const secret = randomBytes(32).toString("base64url");
    const token = `sg_enroll_${secret}`;

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabase
      .from("agent_enrollment_tokens")
      .insert({
        server_id: server.id,
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error(
        "Enrollment token insert failed:",
        insertError
      );

      return NextResponse.json(
        { error: "Could not create enrollment token." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Enrollment token error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}