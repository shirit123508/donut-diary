"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "../hooks";

export default function NavBar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();

  const linkStyle = (href) => ({
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: pathname === href ? "var(--card)" : "transparent",
    fontWeight: 600,
  });

  return (
    <nav
      className="card"
      style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(6px)" }}
      role="navigation"
      aria-label="ניווט ראשי"
    >
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{ fontWeight: 800, textDecoration: "none", color: "inherit" }}
            aria-label="חזור לדף הבית - יומן סופגניות"
          >
            🍩 יומן סופגניות
          </Link>
          {session && (
            <>
              <Link
                href="/feed"
                style={linkStyle("/feed")}
                aria-current={pathname === "/feed" ? "page" : undefined}
                aria-label="עבור לדף הפיד"
              >
                פיד
              </Link>
              <Link
                href="/add"
                style={linkStyle("/add")}
                aria-current={pathname === "/add" ? "page" : undefined}
                aria-label="עבור לדף הוספת סופגנייה"
              >
                הוספה
              </Link>
              <Link
                href="/family"
                style={linkStyle("/family")}
                aria-current={pathname === "/family" ? "page" : undefined}
                aria-label="עבור לדף ניהול משפחה"
              >
                משפחה
              </Link>
            </>
          )}
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <ThemeSwitcher />
          {session ? (
            <button
              className="btnSecondary"
              onClick={logout}
              type="button"
              aria-label="התנתק מהמערכת"
            >
              התנתקות
            </button>
          ) : (
            <Link
              className="btnSecondary"
              href="/login"
              aria-label="עבור לדף התחברות"
            >
              כניסה
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
