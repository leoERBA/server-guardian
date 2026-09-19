"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!acceptedTerms) {
      setError("You must agree to the Terms of Use and Privacy Policy.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(
      "Account created. Check your email to confirm your account."
    );

    setFullName("");
    setEmail("");
    setPassword("");
    setAcceptedTerms(false);
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <a href="/" className="mb-10 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
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
              <p className="font-semibold">Server Guardian</p>
              <p className="text-xs text-zinc-500">Security Monitoring</p>
            </div>
          </a>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Start monitoring your servers in minutes.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Full name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  placeholder="John Smith"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-zinc-500">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-emerald-500"
                />

                <span>
                  I agree to the Terms of Use and Privacy Policy.
                </span>
              </label>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}