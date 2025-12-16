"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [place, setPlace] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("donut_entries")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setPlace(data.place);
        setRating(data.rating);
      }
    }
    load();
  }, [id]);

  async function save() {
    await supabase
      .from("donut_entries")
      .update({ place, rating })
      .eq("id", id);

    router.push("/");
  }

  return (
    <main style={{ padding: 20, direction: "rtl" }}>
      <h1>✏️ עריכה</h1>

      <input value={place} onChange={(e) => setPlace(e.target.value)} />
      <br />
      <input value={rating} onChange={(e) => setRating(e.target.value)} />
      <br />
      <button onClick={save}>שמירה</button>
    </main>
  );
}


