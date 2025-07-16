"use client";

import { useState, FormEvent, useRef } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function HomePage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Përshëndetje! Jam Ndërtimtari Bot. Më pyet çdo gjë rreth materialeve dhe termave të ndërtimit në shqip (p.sh. llak, epoksi, rrjetë, fugë...).",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: q }],
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Server error ${resp.status}: ${t}`);
      }

      const data = (await resp.json()) as {
        message?: { role: string; content: string };
      };

      const a =
        data?.message?.content ??
        "(nuk mora përgjigje nga serveri — kontrollo konsolën)";

      setMessages((m) => [...m, { role: "assistant", content: a }]);
    } catch (err) {
      console.error("chat error", err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Ndodhi një gabim gjatë pyetjes. Kontrollo lidhjen ose çelësin e OpenAI.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "2rem 1rem 6rem",
        fontFamily: "sans-serif",
        lineHeight: 1.4,
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Ndërtimtari Bot
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#0070f3" : "#333",
              color: "white",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              maxWidth: "90%",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#333",
              color: "white",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
            }}
          >
            Duke menduar…
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#111",
          padding: "0.75rem 1rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Shkruaj pyetjen këtu…"
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid #555",
            background: "#000",
            color: "white",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            background: loading ? "#444" : "#0070f3",
            color: "white",
            border: "none",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Dërgo
        </button>
      </form>

      <p
        style={{
          marginTop: "3rem",
          fontSize: "0.8rem",
          color: "#888",
          textAlign: "center",
        }}
      >
        Ky mjet jep informacion të përgjithshëm. Për punime strukturore,
        elektrike ose gaz, konsultohu me profesionist të licencuar.
      </p>
    </main>
  );
}
