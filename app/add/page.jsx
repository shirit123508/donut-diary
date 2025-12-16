"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [donuts, setDonuts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("donut_entries")
        .select("*")
        .order("created_at", { ascending: false });

      setDonuts(data || []);
    }
    load();
  }, []);

  return (
    <main style={{ padding: 20, direction: "rtl" }}>
      <h1>🍩 יומן הסופגניות</h1>

      <Link href="/add">➕ הוספת סופגניה</Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {donuts.map((donut) => (
          <div
            key={donut.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 16,
              padding: 12,
            }}
          >
            {donut.photo_url && (
              <img
                src={donut.photo_url}
                alt="סופגניה"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              />
            )}

            <strong>{donut.place}</strong>
            <div>⭐ {donut.rating}</div>

            <Link
              href={`/edit/${donut.id}`}
              style={{ fontSize: 14, color: "blue" }}
            >
              ✏️ עריכה
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

