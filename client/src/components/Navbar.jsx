
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Collections", to: "/#collection" },
  { label: "About Us", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-[#e9dfd3] bg-[#fffdf9]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="group flex shrink-0 items-center gap-3"
          aria-label="Sri Jayam Furnitures home"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#e8d9c6] bg-white shadow-sm transition group-hover:shadow-md sm:h-14 sm:w-14">
            <img
              src="/logo.png"
              alt="Sri Jayam Furnitures logo"
              className="h-full w-full object-contain p-1"
            />
          </div>

          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide text-[#493326] sm:text-xl">
              Sri Jayam
            </h1>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.3em] text-[#9b784f] sm:text-[10px]">
              Furnitures
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className="relative py-2 text-sm font-medium text-[#594638] transition-colors hover:text-[#a57945]"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/admin/login"
            className="rounded-full border border-[#b89570] px-4 py-2.5 text-sm font-semibold text-[#6f4b2d] transition hover:border-[#6f4b2d] hover:bg-[#f5ede3]"
          >
            Admin Login
          </Link>

          <Link
            to="/#collection"
            className="group inline-flex items-center gap-2 rounded-full bg-[#493326] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#694a35] hover:shadow-md"
          >
            Explore Furniture
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5d8c8] text-[#493326] transition hover:bg-[#f5ede3] md:hidden"
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-[#e9dfd3] bg-[#fffdf9] px-5 pb-5 pt-3 shadow-lg md:hidden">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#eee5db] py-3.5 text-sm font-medium text-[#594638] transition hover:pl-2 hover:text-[#a57945]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              to="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center rounded-full border border-[#b89570] px-3 py-3 text-center text-xs font-semibold text-[#6f4b2d] transition hover:bg-[#f5ede3]"
            >
              Admin Login
            </Link>

            <Link
              to="/#collection"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center rounded-full bg-[#493326] px-3 py-3 text-center text-xs font-semibold text-white transition hover:bg-[#694a35]"
            >
              Explore Furniture →
            </Link>
          </div>

          <p className="mt-5 text-center text-[9px] uppercase tracking-[0.25em] text-[#9b784f]">
            Crafted with tradition · Made for your home
          </p>
        </div>
      )}
    </nav>
  );
}
