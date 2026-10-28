
import BrandLogo from "./BrandLogo";

export default function LoginHeader({ isAuthenticated = false }) {
  return (
    <header className="mb-9 text-center">
      <BrandLogo className="mx-auto mb-5 h-20 w-20" />

      <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#92734D]">
        Sri Jayam Furnitures
      </p>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#34271E]">
        {isAuthenticated ? "Welcome back" : "Admin Sign In"}
      </h1>

      <p className="mt-2 text-sm text-[#827568]">
        {isAuthenticated
          ? "You are signed in to your store."
          : "Manage your store, all in one place."}
      </p>
    </header>
  );
}
