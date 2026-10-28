
import { useEffect, useState } from "react";
import api from "../services/api";
import BrandLogo from "../components/BrandLogo";
import LoginHeader from "../components/LoginHeader";
import LoginForm from "../components/LoginForm";
import LoginFooter from "../components/LoginFooter";
import LoadingScreen from "../components/LoadingScreen";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@electrostore.com");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data } = await api.get("/api/admin/auth/me");

        if (active) {
          setAdmin(data.admin || data.user || data);
          window.location.replace("/admin/dashboard");
        }
      } catch {
        if (active) {
          setAdmin(null);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(credentials) {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/api/admin/auth/login",
        credentials
      );

      setAdmin(data.admin || data.user || data);

      // Navigate to the dashboard after successful login.
      window.location.assign("/admin/dashboard");

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sign-in failed. Please check your credentials."
      );

      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      await api.post("/api/admin/auth/logout");
      setAdmin(null);
      window.location.replace("/admin/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sign-out failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return <LoadingScreen />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F4EE] px-5 py-12">
      {/* Background logo watermark */}
      <BrandLogo
        decorative
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(85vw,560px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
      />

      {/* Login content */}
      <section className="relative z-10 w-full max-w-sm">
        <LoginHeader isAuthenticated={Boolean(admin)} />

        {admin ? (
          <div className="text-center">
            <div className="border-y border-[#D9CDBB] py-5">
              <p className="text-xs uppercase tracking-widest text-[#92734D]">
                Signed in as
              </p>

              <p className="mt-2 break-all text-sm text-[#34271E]">
                {admin.email || email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="mt-7 w-full rounded-lg bg-[#62452F] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-[#493321] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            email={email}
            setEmail={setEmail}
          />
        )}

        <LoginFooter />
      </section>
    </main>
  );
}
