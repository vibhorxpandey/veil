"use client"

import { useState } from "react"

const CODE_SNIPPET = `POST https://api.veilresearch.com/v1/chat
Authorization: Bearer veil_sk_...

{
  "model": "gpt-4o",
  "mode": "research",
  "messages": [
    {
      "role": "user",
      "content": "Summarize recent AlphaFold papers"
    }
  ]
}`

const FEATURES = [
  {
    title: "Unified Model Router",
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.4)",
    icon: "⇄",
    description:
      "One endpoint routes to GPT-4o, GPT-4o mini, DeepSeek R1, and Llama 3 70B. Automatic fallback if a model is unavailable — your requests never drop.",
    tags: ["gpt-4o", "deepseek-r1", "llama-3-70b", "auto-fallback"],
  },
  {
    title: "Research Mode API",
    color: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.15)",
    borderColor: "rgba(139,92,246,0.4)",
    icon: "◈",
    description:
      "All four Veil modes — Research, Biology, Flywheel, and Write — are exposed as a single `mode` parameter. Switch reasoning profiles per request.",
    tags: ["mode=research", "mode=biology", "mode=flywheel", "mode=write"],
  },
  {
    title: "Workflow Execution",
    color: "#10b981",
    glowColor: "rgba(16,185,129,0.15)",
    borderColor: "rgba(16,185,129,0.4)",
    icon: "⚙",
    description:
      "Trigger any of 1000+ pre-built workflows programmatically — literature scans, fine-tuning pipelines, genomics analyses, and LaTeX rendering.",
    tags: ["1000+ workflows", "pipeline triggers", "async jobs", "webhooks"],
  },
]

const TIERS = [
  {
    name: "Free",
    quota: "100 req / day",
    price: "₹0",
    period: "",
    color: "#7878a8",
    borderColor: "rgba(120,120,168,0.25)",
    features: ["All 4 research modes", "100 requests/day", "Standard latency", "Community support"],
  },
  {
    name: "Pro",
    quota: "10k req / day",
    price: "₹999",
    period: "/mo",
    color: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.45)",
    highlight: true,
    features: ["All 4 research modes", "10,000 requests/day", "Priority latency", "Workflow execution", "Email support"],
  },
  {
    name: "Enterprise",
    quota: "Unlimited",
    price: "Custom",
    period: "",
    color: "#10b981",
    borderColor: "rgba(16,185,129,0.3)",
    features: ["Unlimited requests", "SLA guarantee", "Dedicated infrastructure", "Custom integrations", "Slack + phone support"],
  },
]

export default function ApiAccessPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "api" }),
      })
    } catch {
      // swallow — waitlist endpoint may not exist yet
    }
    setSubmitted(true)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "100px 24px 72px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
      }}>
        {/* Coming Soon badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "100px", marginBottom: "28px",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          fontSize: "11.5px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em",
        }}>
          ⏳ COMING SOON
        </div>

        <h1 style={{
          fontSize: "clamp(34px, 5.5vw, 62px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          marginBottom: "18px",
        }}>
          Build on{" "}
          <span style={{
            background: "linear-gradient(135deg, #ededff 0%, #a78bfa 40%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Veil Research API
          </span>
        </h1>

        <p style={{
          fontSize: "17px",
          color: "#7878a8",
          maxWidth: "520px",
          margin: "0 auto 40px",
          lineHeight: 1.7,
        }}>
          Programmatic access to all four research modes, model routing, and workflow execution.
          Built for teams and developers.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#waitlist" style={{
            padding: "12px 28px", borderRadius: "10px", border: "none",
            fontSize: "14.5px", fontWeight: 700, color: "#fff", textDecoration: "none",
            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
            boxShadow: "0 0 28px rgba(139,92,246,0.35)",
            display: "inline-flex", alignItems: "center", gap: "8px",
          }}>
            Request API access →
          </a>
          <a href="#pricing" style={{
            padding: "12px 28px", borderRadius: "10px",
            fontSize: "14.5px", fontWeight: 600, color: "#ededff", textDecoration: "none",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "inline-flex", alignItems: "center", gap: "8px",
          }}>
            View pricing
          </a>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              borderRadius: "18px",
              background: "#0d0d1a",
              border: `1px solid ${f.borderColor}`,
              borderTop: `3px solid ${f.color}`,
              padding: "28px 28px 24px",
              boxShadow: `0 0 40px ${f.glowColor}`,
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: f.glowColor,
                border: `1px solid ${f.borderColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", marginBottom: "16px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ededff", marginBottom: "10px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.7, marginBottom: "18px" }}>
                {f.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {f.tags.map(tag => (
                  <span key={tag} style={{
                    padding: "3px 10px", borderRadius: "6px",
                    fontSize: "11px", fontWeight: 600,
                    background: `${f.glowColor}`,
                    border: `1px solid ${f.borderColor}`,
                    color: f.color, letterSpacing: "0.02em",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Snippet ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 24px 88px",
        maxWidth: "780px",
        margin: "0 auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#ededff", marginBottom: "10px",
          }}>
            Simple. Standard. RESTful.
          </h2>
          <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.6 }}>
            Drop-in compatible with OpenAI-style clients. One additional parameter unlocks all four modes.
          </p>
        </div>

        <div style={{
          borderRadius: "16px",
          background: "#080810",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 0 60px rgba(139,92,246,0.1)",
          overflow: "hidden",
        }}>
          {/* Code window header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontSize: "11.5px", color: "#4a4a6a", fontWeight: 600, letterSpacing: "0.04em" }}>
              REST API · JSON
            </span>
            <button
              onClick={handleCopy}
              style={{
                padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: copied ? "#10b981" : "#7878a8",
                fontSize: "11.5px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Code body */}
          <pre style={{
            margin: 0,
            padding: "28px 28px",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
            fontSize: "13.5px",
            lineHeight: 1.75,
            color: "#c4c4e8",
            overflowX: "auto",
            whiteSpace: "pre",
          }}>
            <span style={{ color: "#f59e0b" }}>POST </span>
            <span style={{ color: "#38bdf8" }}>https://api.veilresearch.com/v1/chat</span>{"\n"}
            <span style={{ color: "#a78bfa" }}>Authorization</span>
            <span style={{ color: "#c4c4e8" }}>: </span>
            <span style={{ color: "#10b981" }}>Bearer veil_sk_...</span>{"\n"}
            {"\n"}
            <span style={{ color: "#c4c4e8" }}>{`{`}</span>{"\n"}
            {"  "}<span style={{ color: "#a78bfa" }}>&quot;model&quot;</span>
            <span style={{ color: "#c4c4e8" }}>: </span>
            <span style={{ color: "#10b981" }}>&quot;gpt-4o&quot;</span>
            <span style={{ color: "#c4c4e8" }}>,</span>{"\n"}
            {"  "}<span style={{ color: "#a78bfa" }}>&quot;mode&quot;</span>
            <span style={{ color: "#c4c4e8" }}>: </span>
            <span style={{ color: "#10b981" }}>&quot;research&quot;</span>
            <span style={{ color: "#c4c4e8" }}>,</span>{"\n"}
            {"  "}<span style={{ color: "#a78bfa" }}>&quot;messages&quot;</span>
            <span style={{ color: "#c4c4e8" }}>: [</span>{"\n"}
            {"    "}<span style={{ color: "#c4c4e8" }}>{`{`}</span>{"\n"}
            {"      "}<span style={{ color: "#a78bfa" }}>&quot;role&quot;</span>
            <span style={{ color: "#c4c4e8" }}>: </span>
            <span style={{ color: "#10b981" }}>&quot;user&quot;</span>
            <span style={{ color: "#c4c4e8" }}>,</span>{"\n"}
            {"      "}<span style={{ color: "#a78bfa" }}>&quot;content&quot;</span>
            <span style={{ color: "#c4c4e8" }}>: </span>
            <span style={{ color: "#10b981" }}>&quot;Summarize recent AlphaFold papers&quot;</span>{"\n"}
            {"    "}<span style={{ color: "#c4c4e8" }}>{`}`}</span>{"\n"}
            {"  "}<span style={{ color: "#c4c4e8" }}>]</span>{"\n"}
            <span style={{ color: "#c4c4e8" }}>{`}`}</span>
          </pre>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{
        padding: "0 24px 88px",
        maxWidth: "900px",
        margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#ededff", marginBottom: "10px",
          }}>
            API Pricing
          </h2>
          <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.6 }}>
            Start free. Scale to Enterprise. No surprise bills.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
        }}>
          {TIERS.map(tier => (
            <div key={tier.name} style={{
              borderRadius: "18px",
              background: tier.highlight ? "#111120" : "#0d0d1a",
              border: `1px solid ${tier.borderColor}`,
              boxShadow: tier.highlight ? `0 0 60px rgba(139,92,246,0.15)` : "none",
              padding: "28px",
              position: "relative",
              transform: tier.highlight ? "scale(1.02)" : "scale(1)",
            }}>
              {tier.highlight && (
                <div style={{
                  position: "absolute", top: "-1px", left: 0, right: 0,
                  height: "3px", borderRadius: "18px 18px 0 0",
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                }} />
              )}

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "4px 10px", borderRadius: "100px", marginBottom: "18px",
                background: `${tier.color}18`,
                border: `1px solid ${tier.color}35`,
                fontSize: "11px", fontWeight: 700, color: tier.color, letterSpacing: "0.06em",
              }}>
                {tier.quota.toUpperCase()}
              </div>

              <div style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>
                {tier.name}
              </div>

              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", color: "#ededff", lineHeight: 1 }}>
                  {tier.price}
                </span>
                <span style={{ fontSize: "14px", color: "#7878a8" }}>{tier.period}</span>
              </div>

              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "18px", marginTop: "18px",
                display: "flex", flexDirection: "column", gap: "8px",
              }}>
                {tier.features.map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: tier.color, fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#ededff", lineHeight: 1.4 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Waitlist Form ────────────────────────────────────────────────────── */}
      <section id="waitlist" style={{
        padding: "0 24px 100px",
        maxWidth: "520px",
        margin: "0 auto",
      }}>
        <div style={{
          borderRadius: "20px",
          background: "#0d0d1a",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 80px rgba(139,92,246,0.1)",
          padding: "44px 40px",
          textAlign: "center",
        }}>
          {submitted ? (
            <>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 20px",
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px",
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "10px" }}>
                You&apos;re on the API waitlist
              </h3>
              <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7 }}>
                We&apos;ll reach out at <strong style={{ color: "#ededff" }}>{email}</strong> when access opens.
                You&apos;ll be among the first to get API keys.
              </p>
            </>
          ) : (
            <>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 14px", borderRadius: "100px", marginBottom: "20px",
                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
                fontSize: "11.5px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em",
              }}>
                API WAITLIST
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#ededff", marginBottom: "10px" }}>
                Get early API access
              </h3>
              <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7, marginBottom: "28px" }}>
                We&apos;re rolling out API keys in batches. Drop your email and we&apos;ll reach
                out when your access is ready — no spam, just your key.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    fontSize: "14.5px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ededff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    fontSize: "15px", fontWeight: 700, color: "#fff",
                    cursor: loading || !email ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    boxShadow: "0 0 28px rgba(139,92,246,0.3)",
                    opacity: loading || !email ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading ? "Saving…" : "Request API access →"}
                </button>
              </form>

              <p style={{ fontSize: "11.5px", color: "#4a4a6a", marginTop: "14px" }}>
                No card required. We&apos;ll send your API key directly to your inbox.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
