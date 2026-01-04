"use client";

import { useEffect, useState } from "react";

const SectionDivider = () => (
  <div
    style={{
      margin: "40px 0 20px",
      borderBottom: "1px solid var(--border)",
    }}
  />
);

const BigSectionDivider = () => (
  <div
    style={{
      margin: "60px 0",
      height: "1px",
      background:
        "linear-gradient(to right, transparent, var(--border), transparent)",
      opacity: 0.8,
    }}
  />
);

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
            ? "rgba(225, 255, 0, 0.49)"
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
  const [copiedSubjectIndex, setCopiedSubjectIndex] = useState<number | null>(
    null
  );
  const [copiedRewriteIndex, setCopiedRewriteIndex] = useState<number | null>(
    null
  );

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);

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
        tone: subjectTone,
        audience: subjectAudience,
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

  useEffect(() => {
    fetch("/api/version-history")
      .then((res) => res.json())
      .then(setVersionHistory);
  }, []);

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

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "22px", fontWeight: 600 }}>
          Subject Line Rewriter
        </h2>

        <p
          style={{
            marginTop: 6,
            color: "var(--secondary)",
            fontSize: "14px",
            maxWidth: 520,
            marginInline: "auto",
          }}
        >
          Generates alternative subject lines tailored to tone and audience,
          without changing the original intent.
        </p>
      </div>

      <SectionDivider />

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
        <div style={{ marginTop: 30 }}>
          <h3>Subject Alternatives</h3>

          {subjectResult.map((s: string, idx: number) => (
            <div
              key={idx}
              className="
          mt-4 p-4 rounded-md
          border border-[color:var(--border)]
          bg-[color:var(--background)]
        "
            >
              <div className="flex justify-between items-center">
                <p style={{ margin: 0, fontWeight: 500 }}>{s}</p>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(s);
                      setCopiedSubjectIndex(idx);
                      setTimeout(() => setCopiedSubjectIndex(null), 1500);
                    }}
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

                  {copiedSubjectIndex === idx && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-22px",
                        right: 0,
                        fontSize: "12px",
                        background: "#000",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Copied
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BigSectionDivider />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "22px", fontWeight: 600 }}>
          Email Body Rewriter
        </h2>

        <p
          style={{
            marginTop: 6,
            color: "var(--secondary)",
            fontSize: "14px",
            maxWidth: 560,
            marginInline: "auto",
          }}
        >
          Rewrites the email body to improve clarity, tone, and structure.
          Grammar-only mode fixes mistakes without changing wording.
        </p>
      </div>

      <SectionDivider />

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
      </div>

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

      {result?.rewrites && <SectionDivider />}

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

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(r.email);
                      setCopiedRewriteIndex(idx);
                      setTimeout(() => setCopiedRewriteIndex(null), 1500);
                    }}
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

                  {copiedRewriteIndex === idx && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-22px",
                        right: 0,
                        fontSize: "12px",
                        background: "#000",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Copied
                    </span>
                  )}
                </div>
              </div>

              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {highlightDifferences(emailText, r.email)}
              </div>

              <small className="text-[color:var(--secondary)]">
                {r.explanation}
              </small>
            </div>
          ))}
        </div>
      )}

      {versionHistory.length > 0 && (
        <div style={{ marginTop: 40 }}>
          {/* Header with toggle button */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <h3 style={{ display: "inline-block", marginRight: 10 }}>
              Version History
            </h3>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              style={{
                padding: "2px 6px",
                fontSize: 12,
                cursor: "pointer",
                border: "1px solid #737373ff",
                borderRadius: 4,
                backgroundColor: "#f0f0f0",
              }}
              className="
      text-sm px-3 py-1 rounded-md
      border border-[color:var(--border)]
      hover:bg-[color:var(--primary)]
      hover:text-black
      transition-colors
    "
            >
              {isHistoryOpen ? "Hide" : "Show"}
            </button>
          </div>

          {/* Collapsible content */}
          {isHistoryOpen && (
            <div className="mt-4 border rounded-md">
              {versionHistory.map((v) => (
                <div
                  key={v.id}
                  className="p-3 border-b cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setResult({
                      rewrites: [
                        {
                          email: v.rewritten_email,
                          explanation: "Restored",
                        },
                      ],
                    })
                  }
                >
                  <div className="text-sm font-medium">
                    {new Date(v.created_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {v.tone} • {v.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
