"use client";

import { useEffect, useState } from "react";

function highlightDifferences(original: string, rewritten: string) {
  const originalWords = original.split(/\s+/);
  const rewrittenWords = rewritten.split(/\s+/);

  const originalSet = new Set(originalWords);

  return rewrittenWords.map((word, idx) => {
    const isChanged = !originalSet.has(word);

    return (
      <span
        key={idx}
        style={{
          backgroundColor: isChanged
            ? "rgba(37, 99, 235, 0.15)"
            : "transparent",
          padding: isChanged ? "2px 4px" : "0",
          borderRadius: 4,
        }}
      >
        {word}{" "}
      </span>
    );
  });
}

export default function Home() {
  const [dark, setDark] = useState(false);

  const [emailText, setEmailText] = useState("");
  const [purpose, setPurpose] = useState("follow-up");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("short");
  const [audience, setAudience] = useState("manager");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [subjectResult, setSubjectResult] = useState<string[] | null>(null);

  const [subjectTone, setSubjectTone] = useState("formal");
  const [subjectAudience, setSubjectAudience] = useState("manager");
  const [mode, setMode] = useState<"rewrite" | "grammar">("rewrite");

  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  }

  async function handleSubjectRewrite() {
    setSubjectLoading(true);
    setSubjectResult(null);
    setError(null);

    const res = await fetch("/api/rewrite-subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        tone,
        audience,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to rewrite subject");
      setSubjectLoading(false);
      return;
    }

    setSubjectResult(data.subjects);
    setSubjectLoading(false);
  }

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
        mode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Invalid input");
      setResult(null);
      setLoading(false);
      return;
    }

    setError(null);
    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <button
        onClick={() => setDark(!dark)}
        className="
        mb-4 px-4 py-2 rounded-md
        border border-[color:var(--border)]
        bg-[color:var(--primary)]
        text-white
        hover:bg-[color:var(--primary-hover)]
        transition-colors
      "
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      <h2>Subject Line</h2>

      <input
        type="text"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          setSubjectResult(null);
        }}
        placeholder="Enter subject line..."
        className="
          w-full mt-4 p-3 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
        "
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <select
          value={subjectTone}
          onChange={(e) => setSubjectTone(e.target.value)}
          className="
      px-3 py-2 rounded-md
      border border-[color:var(--border)]
      bg-[color:var(--background)]
      text-[color:var(--foreground)]
      focus:outline-none
      focus:ring-2
      focus:ring-[color:var(--primary)]
    "
        >
          <option value="formal">Formal</option>
          <option value="neutral">Neutral</option>
          <option value="casual">Casual</option>
        </select>

        <select
          value={subjectAudience}
          onChange={(e) => setSubjectAudience(e.target.value)}
          className="
      px-3 py-2 rounded-md
      border border-[color:var(--border)]
      bg-[color:var(--background)]
      text-[color:var(--foreground)]
      focus:outline-none
      focus:ring-2
      focus:ring-[color:var(--primary)]
    "
        >
          <option value="manager">Manager</option>
          <option value="client">Client</option>
          <option value="peer">Peer</option>
          <option value="customer">Customer</option>
        </select>
      </div>


      <button
        style={{ marginTop: 10 }}
        onClick={handleSubjectRewrite}
        disabled={!subject || subjectLoading}
        className="
          mt-6 px-6 py-3 rounded-md font-medium
          bg-[color:var(--primary)]
          text-white
          hover:bg-[color:var(--primary-hover)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-all
        "
      >
        {subjectLoading ? "Rewriting..." : "Rewrite Subject"}
      </button>

      {subjectResult && subjectResult.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Subject Alternatives</h3>
          {subjectResult.map((s: string, idx: number) => (
            <p key={idx}>• {s}</p>
          ))}
        </div>
      )}

      <h1>AI Email Rewriter</h1>

      <textarea
        rows={8}
        className="
          w-full mt-4 p-3 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
        "
        placeholder="Paste your email here..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <select
          className="
          px-3 py-2 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
        "
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="persuasive">Persuasive</option>
          <option value="apologetic">Apologetic</option>
          <option value="follow-up">Follow-up</option>
        </select>

        <select
          className="
          px-3 py-2 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
        "
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="formal">Formal</option>
          <option value="neutral">Neutral</option>
          <option value="casual">Casual</option>
        </select>

        <select
          className="
          px-3 py-2 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
          "
          value={length}
          onChange={(e) => setLength(e.target.value)}
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="detailed">Detailed</option>
        </select>

        <select
          className="
            px-3 py-2 rounded-md
            border border-[color:var(--border)]
            bg-[color:var(--background)]
            text-[color:var(--foreground)]
            focus:outline-none
            focus:ring-2
            focus:ring-[color:var(--primary)]
          "
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        >
          <option value="manager">Manager</option>
          <option value="client">Client</option>
          <option value="peer">Peer</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as "rewrite" | "grammar")}
        className="
          px-3 py-2 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2
          focus:ring-[color:var(--primary)]
        "
      >
        <option value="rewrite">Rewrite (tone + purpose)</option>
        <option value="grammar">Grammar only</option>
      </select>

      <button
        onClick={handleRewrite}
        disabled={!emailText || loading}
        className="
          mt-6 px-6 py-3 rounded-md font-medium
          bg-[color:var(--primary)]
          text-white
          hover:bg-[color:var(--primary-hover)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-all
        "
      >
        {loading ? "Rewriting..." : "Rewrite Email"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {result?.rewrites && (
        <div style={{ marginTop: 40 }}>
          <h2>Rewritten Versions</h2>

          {result.rewrites.map((r: any, idx: number) => (
            <div
              key={idx}
              className="
      mt-6 p-4 rounded-md
      border border-[color:var(--border)]
      bg-[color:var(--background)]
    "
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Version {idx + 1}</h3>

                <button
                  onClick={() => copyToClipboard(r.email)}
                  className="
          text-sm px-3 py-1 rounded-md
          border border-[color:var(--border)]
          hover:bg-[color:var(--primary)]
          hover:text-white
          transition-colors
        "
                >
                  Copy
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap">
                {highlightDifferences(emailText, r.email)}
              </p>

              <small className="text-[color:var(--secondary)]">
                {r.explanation}
              </small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
