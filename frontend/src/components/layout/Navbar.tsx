import { useState, memo, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

const SearchModal = lazy(() => import("@/components/search/SearchModal").then(m => ({ default: m.SearchModal })));

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/journey", label: "Journey" },
  { to: "/videos", label: "Videos" },
  { to: "/blogs", label: "Blogs" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gym-border/50 bg-gym-bg/80 backdrop-blur-lg">
      <div className="content-max-width flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-heading text-xl font-bold tracking-tight text-gym-gold">
          LH Fitness
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-gym-gold ${
                location.pathname === link.to
                  ? "text-gym-gold"
                  : "text-gym-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-gold"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 ml-2">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-lg border border-gym-gold/30 px-4 py-2 text-sm font-medium text-gym-gold transition-colors hover:bg-gym-gold-muted"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gym-text-secondary transition-colors hover:text-gym-gold"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-lg bg-gym-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gym-gold-hover"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gym-text-secondary transition-colors hover:text-gym-gold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gym-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gym-gold-hover"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gym-text-primary md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gym-border bg-gym-bg md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 text-sm font-medium transition-colors hover:text-gym-gold ${
                    location.pathname === link.to
                      ? "text-gym-gold"
                      : "text-gym-text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gym-border" />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="py-2 text-sm font-medium text-gym-text-secondary">
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="py-2 text-sm font-medium text-gym-text-secondary">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="py-2 text-sm font-medium text-gym-text-secondary">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="py-2 text-left text-sm font-medium text-gym-error">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-sm font-medium text-gym-text-secondary">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="rounded-lg bg-gym-gold px-4 py-2 text-center text-sm font-semibold text-black">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </nav>
  );
});
