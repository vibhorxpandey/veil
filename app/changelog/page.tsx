"use client"

import { Check, Terminal, Cpu, GitBranch, Zap, BookOpen, Users, Smartphone, Lock, ArrowRight } from "lucide-react"

const RELEASES = [
  {
    version: "v0.4",
    date: "May 2026",
    label: "Latest",
    labelColor: "#10b981",
    labelBg: "rgba(16,185,129,0.12)",
    labelBorder: "rgba(16,185,129,0.3)",
    gradientColor: "#10b981",
    items: [
      {
        icon: Terminal,
        color: "#10b981",
        title: "Dashboard Terminal with copy/paste support",
        desc: "Full xterm.js terminal embedded in the dashboard. Select text, Ctrl+C / Ctrl+V, right-click paste — all working.",
      },
      {
        icon: Cpu,
        color: "#3b82f6",
        title: "Switched to real OpenAI API",
        desc: "GPT-4o and GPT-4o mini now route to the live OpenAI API. Streaming responses, proper token counting, accurate quota errors surfaced to the UI.",
      },
      {
        icon: BookOpen,
        color: "#8b5cf6",
        title: "Markdown rendering in chat",
        desc: "AI responses now render headings, bold, code blocks, lists, and inline code correctly instead of raw markdown strings.",
      },
    ],
  },
  {
    version: "v0.3",
    date: "April 2026",
    label: "Major release",
    labelColor: "#8b5cf6",
    labelBg: "rgba(139,92,246,0.12)",
    labelBorder: "rgba(139,92,246,0.3)",
    gradientColor: "#8b5cf6",
    items: [
      {
        icon: BookOpen,
        color: "#3b82f6",
        title: "Dashboard with 4 research modes",
        desc: "Shipped the core dashboard with Research, Biology, Flywheel, and Write modes — each with a tailored system prompt and UI.",
      },
      {
        icon: Cpu,
        color: "#8b5cf6",
        title: "4 AI models: GPT-4o, GPT-4o mini, Llama 3 70B, DeepSeek R1",
        desc: "Model switcher in the dashboard header. Each model streams responses; DeepSeek R1 shows chain-of-thought reasoning traces.",
      },
      {
        icon: GitBranch,
        color: "#f59e0b",
        title: "Integrations panel",
        desc: "Connect GitHub, HuggingFace, W&B, Modal, Pinecone, and OpenAlex directly from the dashboard. Credentials stay in-browser.",
      },
      {
        icon: Zap,
        color: "#10b981",
        title: "Compute profiles",
        desc: "CPU free tier plus GPU profiles at ₹12/hr (T4), ₹45/hr (A10), and ₹150/hr (A100). Select before any training run.",
      },
      {
        icon: Check,
        color: "#ec4899",
        title: "Evaluations harness",
        desc: "Run automated benchmarks against custom metrics. Results logged per run, comparable across model versions.",
      },
      {
        icon: Users,
        color: "#38bdf8",
        title: "Free trial: 1 message per model",
        desc: "All new accounts get one free message per model — no credit card, no friction. Enough to see the difference between modes.",
      },
    ],
  },
  {
    version: "v0.2",
    date: "March 2026",
    label: "Auth + Pricing",
    labelColor: "#3b82f6",
    labelBg: "rgba(59,130,246,0.12)",
    labelBorder: "rgba(59,130,246,0.3)",
    gradientColor: "#3b82f6",
    items: [
      {
        icon: Lock,
        color: "#3b82f6",
        title: "Auth with email/password and magic link",
        desc: "Full authentication flow: create account, sign in with password, or get a one-click magic link via email. JWT sessions, Bearer token to API routes.",
      },
      {
        icon: Zap,
        color: "#f59e0b",
        title: "Pricing page with early access",
        desc: "Launched the pricing page with three tiers. Early Access locked at ₹199/month — permanently. Waitlist modal collects emails.",
      },
      {
        icon: Smartphone,
        color: "#8b5cf6",
        title: "Mobile-responsive layout",
        desc: "Nav collapses on small screens, grid sections reflow to single column, touch targets sized correctly throughout.",
      },
    ],
  },
  {
    version: "v0.1",
    date: "February 2026",
    label: "Initial launch",
    labelColor: "#7878a8",
    labelBg: "rgba(120,120,168,0.1)",
    labelBorder: "rgba(120,120,168,0.25)",
    gradientColor: "#4a4a6a",
    items: [
      {
        icon: Zap,
        color: "#7878a8",
        title: "Initial launch — waitlist page",
        desc: "First public version. Landing page with the Veil concept, neural canvas background animation, and an email waitlist.",
      },
      {
        icon: BookOpen,
        color: "#7878a8",
        title: "Four research modes concept",
        desc: "Research, Biology, Flywheel, and Write modes defined. UI mockups and mode descriptions published on the landing page.",
      },
    ],
  },
]

export default function Changelog() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "110px 24px 60px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 60%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "100px", marginBottom: "28px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          fontSize: "11.5px", fontWeight: 700, color: "#10b981", letterSpacing: "0.07em",
        }}>
          CHANGELOG
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "16px",
        }}>
          What&apos;s been shipped.
        </h1>
        <p style={{
          fontSize: "17px", color: "#7878a8", maxWidth: "480px",
          margin: "0 auto 12px", lineHeight: 1.7,
        }}>
          A running log of everything released — features, fixes, and infra changes.
          Most recent first.
        </p>
        <p style={{ fontSize: "13px", color: "#4a4a6a" }}>
          Questions?{" "}
          <a href="mailto:vibhorpandey09@gmail.com" style={{ color: "#7878a8", textDecoration: "none" }}>
            vibhorpandey09@gmail.com
          </a>
        </p>
      </section>

      {/* ── Release List ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "20px 24px 100px", maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {RELEASES.map((release, ri) => (
            <div key={release.version} style={{ display: "flex", gap: "0", position: "relative" }}>

              {/* Timeline spine */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                width: "48px", flexShrink: 0, paddingTop: "28px",
              }}>
                {/* Version dot */}
                <div style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: release.gradientColor,
                  border: `2px solid ${release.gradientColor}`,
                  boxShadow: `0 0 12px ${release.gradientColor}60`,
                  flexShrink: 0, zIndex: 1,
                }} />
                {/* Spine line */}
                {ri < RELEASES.length - 1 && (
                  <div style={{
                    width: "1px", flex: 1, marginTop: "8px",
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                  }} />
                )}
              </div>

              {/* Release block */}
              <div style={{ flex: 1, paddingBottom: "52px" }}>
                {/* Version header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  flexWrap: "wrap", marginBottom: "4px", paddingTop: "20px",
                }}>
                  <span style={{
                    fontSize: "22px", fontWeight: 800, letterSpacing: "-0.04em", color: "#ededff",
                  }}>
                    {release.version}
                  </span>
                  <span style={{
                    padding: "3px 10px", borderRadius: "100px",
                    fontSize: "11px", fontWeight: 700,
                    color: release.labelColor,
                    background: release.labelBg,
                    border: `1px solid ${release.labelBorder}`,
                    letterSpacing: "0.05em",
                  }}>
                    {release.label.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: "13px", color: "#4a4a6a", marginLeft: "auto",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {release.date}
                  </span>
                </div>

                {/* Divider */}
                <div style={{
                  height: "1px", background: "rgba(255,255,255,0.05)",
                  marginBottom: "20px",
                }} />

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {release.items.map((item, ii) => {
                    const Icon = item.icon
                    return (
                      <div key={ii} style={{
                        padding: "20px 22px",
                        borderRadius: "14px",
                        background: "rgba(15,15,28,0.8)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        display: "flex", gap: "16px", alignItems: "flex-start",
                        transition: "border-color 0.2s",
                      }}>
                        {/* Icon badge */}
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: `${item.color}14`,
                          border: `1px solid ${item.color}28`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Icon size={16} color={item.color} />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "5px" }}>
                            <Check size={13} color={item.color} style={{ marginTop: "3px", flexShrink: 0 }} />
                            <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#ededff", lineHeight: 1.3 }}>
                              {item.title}
                            </span>
                          </div>
                          <p style={{ fontSize: "13px", color: "#7878a8", lineHeight: 1.7, marginLeft: "21px" }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          padding: "28px 32px", borderRadius: "16px",
          background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "4px" }}>
              Shipping fast, in public.
            </p>
            <p style={{ fontSize: "13px", color: "#7878a8" }}>
              Follow along or reach out to shape what gets built next.
            </p>
          </div>
          <a href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "11px 22px", borderRadius: "10px", fontSize: "13.5px",
            fontWeight: 700, color: "#fff", textDecoration: "none",
            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
            boxShadow: "0 0 20px rgba(139,92,246,0.25)", flexShrink: 0,
          }}>
            Open Dashboard <ArrowRight size={14} />
          </a>
        </div>
      </section>

    </div>
  )
}
