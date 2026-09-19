import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InstallAgentButton from "./install-agent-button";

export default async function ServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: server, error } = await supabase
    .from("servers")
    .select("id, name, hostname, status, last_heartbeat, created_at")
    .eq("id", id)
    .single();

  if (error || !server) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <a
          href="/dashboard"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              SERVER GUARDIAN
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              {server.name}
            </h1>

            <p className="mt-2 text-zinc-500">
              {server.hostname || "Hostname not configured"}
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              server.status === "online"
                ? "bg-emerald-500/10 text-emerald-400"
                : server.status === "offline"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {server.status === "online"
              ? "● Online"
              : server.status === "offline"
                ? "● Offline"
                : "● Pending setup"}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              Agent Status
            </p>

            <p className="mt-3 font-medium">
              {server.last_heartbeat
                ? "Connected"
                : "Not installed"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              Last Heartbeat
            </p>

            <p className="mt-3 font-medium">
              {server.last_heartbeat
                ? new Date(server.last_heartbeat).toLocaleString()
                : "Never"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              Security Events
            </p>

            <p className="mt-3 text-2xl font-semibold">
              0
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0e13] p-8">
          <div className="flex items-center justify-between gap-8">
            <div>
              <h2 className="text-xl font-semibold">
                Install Server Guardian Agent
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Install the lightweight Server Guardian agent on this Linux
                server to start monitoring SSH activity and reporting security
                events.
              </p>
            </div>

            <InstallAgentButton serverId={server.id} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0e13] p-8">
          <h2 className="text-lg font-semibold">
            Recent Security Events
          </h2>

          <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-sm text-zinc-500">
              No security events detected yet.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}