"use client";

import { useState } from "react";

type InstallAgentButtonProps = {
  serverId: string;
};

type EnrollmentResponse = {
  token?: string;
  expiresAt?: string;
  error?: string;
};

export default function InstallAgentButton({
  serverId,
}: InstallAgentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createEnrollmentToken() {
    setLoading(true);
    setError(null);
    setToken(null);
    setExpiresAt(null);

    try {
      const response = await fetch("/api/agent/enrollment-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
        }),
      });

      const data: EnrollmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create enrollment token."
        );
      }

      if (!data.token) {
        throw new Error("Enrollment token was not returned.");
      }

      setToken(data.token);
      setExpiresAt(data.expiresAt || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={createEnrollmentToken}
        disabled={loading}
        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating..." : "Install Agent"}
      </button>

      {error && (
        <p className="mt-3 max-w-sm text-sm text-red-400">
          {error}
        </p>
      )}

      {token && (
        <div className="mt-4 max-w-lg rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-400">
            Enrollment token generated
          </p>

          <code className="mt-3 block break-all rounded-lg bg-black/40 p-3 text-xs text-zinc-300">
            {token}
          </code>
<button
  type="button"
  onClick={async () => {
    await navigator.clipboard.writeText(token);
  }}
  className="mt-3 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
>
  Copy Token
</button>
          {expiresAt && (
            <p className="mt-3 text-xs text-zinc-500">
              Expires at{" "}
              {new Date(expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}