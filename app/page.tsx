"use client";

import { useState } from "react";

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function formatTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed) return;

    const timestamp = formatTimestamp();
    setChat((prev) => [
      ...prev,
      { role: "user", content: trimmed, timestamp },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No response received.",
          timestamp: formatTimestamp(),
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to the local LLM.",
          timestamp: formatTimestamp(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__badge">E</div>
          <div>
            <p className="eyebrow">Earl AI</p>
            <h1>Local LLM Workspace</h1>
          </div>
        </div>

        <div className="sidebar__panel">
          <p className="panel-title">Quick actions</p>
          <button className="panel-button">New thread</button>
          <div className="panel-chip">Streaming responses</div>
          <div className="panel-chip">Context-aware mode</div>
        </div>

        <div className="sidebar__panel sidebar__panel--muted">
          <p className="panel-title">Status</p>
          <span className="status-pill">Ready</span>
          <p className="panel-copy">Your local model is available for fast private prompts.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace__header">
          <div>
            <p className="eyebrow">Session</p>
            <h2>Trusted answer flow</h2>
            <p className="subtitle">A minimal, edge-to-edge message stream with precise hierarchy and tactile input controls.</p>
          </div>
          <div className="workspace__meta">
            <span className="workspace__pill">LOCAL</span>
            <span className="workspace__status">Connected</span>
          </div>
        </header>

        <div className="message-panel">
          {chat.length === 0 ? (
            <section className="welcome-card">
              <p className="welcome-title">Ready when you are.</p>
              <p className="welcome-copy">
                Type your prompt below and press Enter or Send. Earl will reply with concise, contextual output.
              </p>
              <div className="welcome-annotations">
                <span>Hint: Ask for a secure API handler</span>
                <span>Or ask for architecture review notes</span>
              </div>
            </section>
          ) : null}

          <div className="message-feed">
            {chat.map((entry, index) => (
              <article
                key={`${entry.timestamp}-${index}`}
                className={`message-row ${entry.role === "user" ? "message-row--user" : "message-row--assistant"}`}
              >
                <div className={`message ${entry.role === "user" ? "message--user" : "message--assistant"}`}>
                  <div className="message__header">
                    <span>{entry.role === "user" ? "YOU" : "EARL"}</span>
                    <time>{entry.timestamp}</time>
                  </div>
                  <p className="message__body">{entry.content}</p>
                </div>
              </article>
            ))}

            {loading ? (
              <article className="message-row message-row--assistant message-row--loading">
                <div className="message message--assistant message--typing">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                  <p className="message__body">Earl is composing a response…</p>
                </div>
              </article>
            ) : null}
          </div>
        </div>

        <div className="prompt-panel">
          <label htmlFor="prompt" className="prompt-label">
            Prompt
          </label>
          <div className="prompt-input-group">
            <input
              id="prompt"
              className="prompt-input"
              placeholder="Ask your local AI to generate code, answer a question, or summarize notes."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
            />
            <button className="prompt-button" onClick={sendMessage} disabled={loading}>
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
