export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      {/* Navbar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-emerald-400"
              >
                <path
                  d="M12 3L20 6V11C20 16 16.6 20.3 12 21C7.4 20.3 4 16 4 11V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="font-semibold tracking-tight">Server Guardian</p>
              <p className="text-xs text-zinc-500">Security Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Lightweight Linux Security Monitoring
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Know when someone is attacking your{" "}
            <span className="text-emerald-400">server.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Server Guardian monitors your Linux security logs, detects
            suspicious SSH activity and sends instant alerts when something
            requires your attention.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/signup"
              className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-black transition hover:bg-emerald-400"
            >
              Protect My Server
            </a>

            <a
              href="#features"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-500">
            <span>✓ No heavy dependencies</span>
            <span>✓ Fast installation</span>
            <span>✓ Raw logs stay local</span>
          </div>
        </div>

        {/* Fake dashboard preview */}
        <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-5 shadow-2xl shadow-emerald-500/5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-medium">Production API</p>
              <p className="mt-1 text-xs text-zinc-500">
                Security monitoring active
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Online
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 py-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Events today</p>
              <p className="mt-2 text-2xl font-semibold">14</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Threats</p>
              <p className="mt-2 text-2xl font-semibold text-red-400">3</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="mt-2 text-sm font-medium text-emerald-400">
                Protected
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Recent Security Events</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />

                  <div>
                    <p className="text-sm font-medium">SSH Brute Force</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      185.31.55.42 · root
                    </p>
                  </div>
                </div>

                <span className="text-xs text-zinc-500">2 min ago</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />

                  <div>
                    <p className="text-sm font-medium">
                      Unknown SSH Login
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      91.201.62.17 · deploy
                    </p>
                  </div>
                </div>

                <span className="text-xs text-zinc-500">18 min ago</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  <div>
                    <p className="text-sm font-medium">Agent heartbeat</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Server responding normally
                    </p>
                  </div>
                </div>

                <span className="text-xs text-zinc-500">32 sec ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-white/10 bg-[#080a0e]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-400">
              BUILT FOR SMALL TEAMS
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Security monitoring without a full SOC.
            </h2>

            <p className="mt-4 text-zinc-400">
              Get the signals that matter without deploying a complicated
              enterprise security stack.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature
              title="Brute Force Detection"
              description="Detect repeated failed SSH login attempts from the same IP address."
            />

            <Feature
              title="Suspicious Login Alerts"
              description="Know when root or an unknown IP successfully authenticates to your server."
            />

            <Feature
              title="Instant Notifications"
              description="Receive security alerts without constantly checking your Linux logs manually."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>

      <h3 className="font-medium">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}