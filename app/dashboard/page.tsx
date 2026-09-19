import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: servers, error } = await supabase
    .from("servers")
    .select("id, name, hostname, status, last_heartbeat, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load servers: ${error.message}`);
  }

  const serverList = servers ?? [];

  const fullName =
    user.user_metadata?.full_name || "Server Guardian User";

  const onlineServers = serverList.filter(
    (server) => server.status === "online"
  ).length;

  const systemStatus =
    serverList.length === 0
      ? "Ready"
      : onlineServers > 0
        ? "Monitoring"
        : "Waiting for agent";

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              SERVER GUARDIAN
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Dashboard
            </h1>

            <p className="mt-2 text-zinc-500">
              Welcome back, {fullName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-zinc-500">
                Signed in as
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {user.email}
              </p>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              Protected Servers
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {serverList.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              Threats Today
            </p>

            <p className="mt-3 text-3xl font-semibold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <p className="text-sm text-zinc-500">
              System Status
            </p>

            <p className="mt-3 text-sm font-medium text-emerald-400">
              {systemStatus}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0e13] p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Your Servers
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Manage your protected infrastructure.
              </p>
            </div>

            <a
              href="/dashboard/servers/new"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              + Add Server
            </a>
          </div>

          {serverList.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-sm text-zinc-500">
                You haven&apos;t added any servers yet.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {serverList.map((server) => (
                <a
                  key={server.id}
                  href={`/dashboard/servers/${server.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        server.status === "online"
                          ? "bg-emerald-400"
                          : server.status === "offline"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                      }`}
                    />

                    <div>
                      <p className="font-medium">
                        {server.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {server.hostname || "Hostname pending"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        server.status === "online"
                          ? "text-emerald-400"
                          : server.status === "offline"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {server.status === "online"
                        ? "Online"
                        : server.status === "offline"
                          ? "Offline"
                          : "Pending setup"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {server.last_heartbeat
                        ? "Agent connected"
                        : "Agent not installed"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}