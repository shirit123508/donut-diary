"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { key: "light", label: "בהיר" },
  { key: "dark", label: "כהה" },
  { key: "hanukkah", label: "חנוכה" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function applyTheme(next) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  return (
    <div className="row" style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <span className="small">ערכת נושא:</span>
      {THEMES.map((t) => (
        <button
          key={t.key}
          onClick={() => applyTheme(t.key)}
          className={t.key === theme ? "btn" : "btnSecondary"}
          style={{ padding: "8px 12px" }}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
