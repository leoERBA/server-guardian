"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewServerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase
      .from("servers")
      .insert({
        name,
        hostname: hostname || null,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <a
          href="/dashboard"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0e13] p-8">
          <p className="text-sm font-medium text-emerald-400">
            SERVER GUARDIAN
          </p>

          <h1 className="mt-3 text-2xl font-semibold">
            Add a server
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Register the Linux server you want Server Guardian to monitor.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Server name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                placeholder="Production API"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Hostname
              </label>

              <input
                type="text"
                value={hostname}
                onChange={(event) => setHostname(event.target.value)}
                placeholder="production-api-01"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Optional for now. The Server Guardian agent can update this later.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding server..." : "Add Server"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}