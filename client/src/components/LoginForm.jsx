
import { useState } from "react";

export default function LoginForm({
  onSubmit,
  loading,
  error,
  email,
  setEmail,
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const success = await onSubmit({
      email: email.trim(),
      password,
    });

    if (success) {
      setPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[#49382B]"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          className="w-full rounded-lg border border-[#CFC1AE] bg-transparent px-4 py-3.5 text-sm text-[#34271E] outline-none transition placeholder:text-[#A79A8A] focus:border-[#62452F] focus:ring-2 focus:ring-[#B99A70]/25"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[#49382B]"
          >
            Password
          </label>

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="text-xs text-[#92734D] hover:text-[#493321]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          className="w-full rounded-lg border border-[#CFC1AE] bg-transparent px-4 py-3.5 text-sm text-[#34271E] outline-none transition placeholder:text-[#A79A8A] focus:border-[#62452F] focus:ring-2 focus:ring-[#B99A70]/25"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#62452F] px-4 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-[#493321] focus:outline-none focus:ring-2 focus:ring-[#B99A70] focus:ring-offset-2 focus:ring-offset-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="pt-3 text-center text-xs text-[#827568]">
        Authorized administrators only
      </p>
    </form>
  );
}
