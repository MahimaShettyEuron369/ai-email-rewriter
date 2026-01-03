"use client";

import { useState } from "react";

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [purpose, setPurpose] = useState("follow-up");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("short");
  const [audience, setAudience] = useState("manager");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleRewrite() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/rewrite-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailText,
        purpose,
        tone,
        length,
        audience,
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>AI Email Rewriter</h1>

      <textarea
        rows={8}
        style={{ width: "100%", marginTop: 20 }}
        placeholder="Paste your email here..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="persuasive">Persuasive</option>
          <option value="apologetic">Apologetic</option>
          <option value="follow-up">Follow-up</option>
        </select>

        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="formal">Formal</option>
          <option value="neutral">Neutral</option>
          <option value="casual">Casual</option>
        </select>

        <select value={length} onChange={(e) => setLength(e.target.value)}>
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="detailed">Detailed</option>
        </select>

        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="manager">Manager</option>
          <option value="client">Client</option>
          <option value="peer">Peer</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <button
        style={{ marginTop: 20 }}
        onClick={handleRewrite}
        disabled={!emailText || loading}
      >
        {loading ? "Rewriting..." : "Rewrite Email"}
      </button>

      {result && (
        <div style={{ marginTop: 40 }}>
          <h2>Rewritten Versions</h2>

          {result.rewrites.map((r: any, idx: number) => (
            <div key={idx} style={{ marginTop: 20 }}>
              <h3>Version {idx + 1}</h3>
              <p>{r.email}</p>
              <small>{r.explanation}</small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
