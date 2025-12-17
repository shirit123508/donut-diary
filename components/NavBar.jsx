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
    <div className="card" style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(6px)" }}>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ fontWeight: 800 }}>🍩 יומן סופגניות</div>
          {session && (
            <>
              <Link href="/feed" style={linkStyle("/feed")}>פיד</Link>
              <Link href="/add" style={linkStyle("/add")}>הוספה</Link>
              <Link href="/family" style={linkStyle("/family")}>משפחה</Link>
            </>
          )}
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <ThemeSwitcher />
          {session ? (
            <button className="btnSecondary" onClick={logout} type="button">התנתקות</button>
          ) : (
            <Link className="btnSecondary" href="/login">כניסה</Link>
          )}
        </div>
      </div>
    </div>
  );
}
