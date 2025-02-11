"use client"

import { useState } from "react"

// ── Mock feed data ─────────────────────────────────────────────────────────────

type Mode = "Research" | "Biology" | "Flywheel" | "Write"

interface FeedPost {
  id: number
  initials: string
  gradientFrom: string
  gradientTo: string
  name: string
  snippet: string
  mode: Mode
  timestamp: string
  likes: number
}

const POSTS: FeedPost[] = [
  {
    id: 1,
    initials: "AP",
    gradientFrom: "#8b5cf6",
    gradientTo: "#3b82f6",
    name: "Aryan Patel",
    snippet:
      "Running a literature synthesis on AF2 multimer predictions vs AF3 across 340 PDB entries. Veil's Research mode surfaced 12 papers I'd never have found through PubMed alone — the citation graph is wild.",
    mode: "Research",
    timestamp: "2h ago",
    likes: 47,
  },
  {
    id: 2,
    initials: "SK",
    gradientFrom: "#10b981",
    gradientTo: "#0ea5e9",
    name: "Sunita Krishnan",
    snippet:
      "Biology mode just mapped an entire CRISPR off-target pathway for my cas9 variant in under 3 minutes. Manual analysis would've taken a week. The pathway diagram output is publication-ready.",
    mode: "Biology",
    timestamp: "4h ago",
    likes: 83,
  },
  {
    id: 3,
    initials: "MR",
    gradientFrom: "#f59e0b",
    gradientTo: "#ef4444",
    name: "Marcus Reil",
    snippet:
      "Third Flywheel iteration on my NLP model. Fine-tuning on domain-specific clinical notes, auto-eval after each loop. Loss curve is finally looking smooth — 14% improvement on F1 vs baseline.",
    mode: "Flywheel",
    timestamp: "6h ago",
    likes: 61,
  },
  {
    id: 4,
    initials: "LH",
    gradientFrom: "#3b82f6",
    gradientTo: "#8b5cf6",
    name: "Lena Hoffmann",
    snippet:
      "Used Write mode to convert my messy research notes into a structured Methods section. LaTeX output was clean on the first pass — even auto-formatted my equation numbering correctly.",
    mode: "Write",
    timestamp: "yesterday",
    likes: 39,
  },
  {
    id: 5,
    initials: "DK",
    gradientFrom: "#10b981",
    gradientTo: "#8b5cf6",
    name: "Dev Kapoor",
    snippet:
      "Genomics pipeline on whole-exome sequencing data from 200 samples. Biology mode identified a novel variant cluster in the BRCA2 locus that my standard VCF filter would've discarded.",
    mode: "Biology",
    timestamp: "yesterday",
    likes: 102,
  },
  {
    id: 6,
    initials: "YT",
    gradientFrom: "#a78bfa",
    gradientTo: "#38bdf8",
    name: "Yuki Tanaka",
    snippet:
      "Synthesizing 80+ papers on transformer attention mechanisms for my survey chapter. Research mode clusters them by methodology automatically — saved me ~15 hours of manual sorting.",
    mode: "Research",
    timestamp: "2d ago",
    likes: 74,
  },
  {
    id: 7,
    initials: "CR",
    gradientFrom: "#f59e0b",
    gradientTo: "#10b981",
    name: "Clara Reyes",
    snippet:
      "Running a Flywheel loop on a protein structure predictor. Each iteration feeds back into the training set — already seeing better RMSD scores on the held-out test structures after just 4 rounds.",
    mode: "Flywheel",
    timestamp: "2d ago",
    likes: 55,
  },
  {
    id: 8,
    initials: "BN",
    gradientFrom: "#3b82f6",
    gradientTo: "#10b981",
    name: "Björn Nilsson",
    snippet:
      "Write mode turned my 40-page dissertation rough draft into a properly structured IEEE-format paper in one shot. Even caught three inconsistent variable definitions across sections.",
    mode: "Write",
    timestamp: "3d ago",
    likes: 91,
  },
  {
    id: 9,
    initials: "IA",
    gradientFrom: "#ef4444",
    gradientTo: "#a78bfa",
    name: "Ifeoma Adeyemi",
    snippet:
      "Cross-referencing 200+ RNA-seq studies on neurodegeneration. Biology mode built a combined gene expression heatmap and flagged three high-confidence candidate pathways I can now validate in the lab.",
    mode: "Biology",
    timestamp: "3d ago",
    likes: 128,
  },
  {
    id: 10,
    initials: "TM",
    gradientFrom: "#8b5cf6",
    gradientTo: "#f59e0b",
    name: "Tomás Molina",
    snippet:
      "Research mode gave me a full systematic review scaffold for my meta-analysis on LLM evaluation benchmarks — PRISMA chart included. Now I just need to fill in the actual numbers.",
    mode: "Research",
    timestamp: "4d ago",
    likes: 66,
  },
]

const MODE_COLORS: Record<Mode, { bg: string; border: string; text: string }> = {
  Research: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.35)", text: "#60a5fa" },
  Biology:  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", text: "#34d399" },
  Flywheel: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
  Write:    { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)", text: "#a78bfa" },
}

// ── Toast component ────────────────────────────────────────────────────────────

function Toast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null
  return (
    <div style={{
      position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
      zIndex: 300,
      padding: "13px 24px",
      borderRadius: "12px",
      background: "rgba(245,158,11,0.12)",
      border: "1px solid rgba(245,158,11,0.35)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 0 40px rgba(245,158,11,0.15)",
      fontSize: "13.5px", fontWeight: 600, color: "#ededff",
      whiteSpace: "nowrap",
    }}>
      <span style={{ color: "#f59e0b" }}>⏳</span>
      Coming soon — <a href="/pricing" style={{ color: "#f59e0b", textDecoration: "none" }}>join the waitlist</a>
      <button
        onClick={onClose}
        style={{ marginLeft: "8px", background: "none", border: "none", cursor: "pointer", color: "#7878a8", fontSize: "16px", lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  )
}

// ── Feed card ──────────────────────────────────────────────────────────────────

function FeedCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false)
  const modeStyle = MODE_COLORS[post.mode]

  return (
    <div style={{
      borderRadius: "16px",
      background: "#0d0d1a",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "22px 24px",
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
        {/* Avatar */}
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
          background: `linear-gradient(135deg, ${post.gradientFrom}, ${post.gradientTo})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", fontWeight: 800, color: "#fff",
          letterSpacing: "0.02em",
        }}>
          {post.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#ededff" }}>
              {post.name}
            </span>
            <span style={{
              padding: "2px 8px", borderRadius: "6px",
              fontSize: "10.5px", fontWeight: 700, color: "#f59e0b",
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
              letterSpacing: "0.04em",
            }}>
              EARLY ACCESS
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#4a4a6a", marginTop: "2px" }}>
            {post.timestamp}
          </div>
        </div>

        {/* Mode badge */}
        <span style={{
          padding: "4px 10px", borderRadius: "8px", flexShrink: 0,
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
          background: modeStyle.bg,
          border: `1px solid ${modeStyle.border}`,
          color: modeStyle.text,
        }}>
          {post.mode}
        </span>
      </div>

      {/* Snippet */}
      <p style={{
        fontSize: "14px", color: "#b0b0d0", lineHeight: 1.7,
        marginBottom: "16px",
      }}>
        {post.snippet}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setLiked(l => !l)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "8px",
            background: liked ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
            color: liked ? "#a78bfa" : "#7878a8",
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s",
            border: liked ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.07)",
          } as React.CSSProperties}
        >
          👍 {post.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PublicFeedPage() {
  const [shareText, setShareText] = useState("")
  const [toastVisible, setToastVisible] = useState(false)

  const handleShare = () => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>
      <Toast visible={toastVisible} onClose={() => setToastVisible(false)} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "100px 24px 64px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 55%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "100px", marginBottom: "24px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          fontSize: "11.5px", fontWeight: 700, color: "#34d399", letterSpacing: "0.08em",
        }}>
          🌐 EARLY ACCESS COMMUNITY
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 58px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          marginBottom: "16px",
        }}>
          What researchers are{" "}
          <span style={{
            background: "linear-gradient(135deg, #ededff 0%, #a78bfa 40%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            building
          </span>
        </h1>

        <p style={{
          fontSize: "17px",
          color: "#7878a8",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          Early adopters using Veil&apos;s four research modes share what they&apos;re working on.
          From protein folding to NLP fine-tuning — see the community in action.
        </p>
      </section>

      {/* ── Share input ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 48px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "16px",
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 20px",
          display: "flex", gap: "12px", alignItems: "flex-end",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 800, color: "#fff",
          }}>
            ?
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={shareText}
              onChange={e => setShareText(e.target.value)}
              placeholder="Share what you're researching…"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ededff",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            />
          </div>
          <button
            onClick={handleShare}
            style={{
              padding: "10px 20px", borderRadius: "10px", border: "none",
              fontSize: "13.5px", fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Share
          </button>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 48px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{
          display: "flex", gap: "0px",
          borderRadius: "14px",
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {[
            { label: "Researchers", value: "240+", color: "#8b5cf6" },
            { label: "Posts this week", value: "1,400+", color: "#3b82f6" },
            { label: "Papers cited", value: "18k+", color: "#10b981" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, padding: "18px 20px", textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color, marginBottom: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "11.5px", color: "#4a4a6a", fontWeight: 600, letterSpacing: "0.04em" }}>
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mode filter ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 28px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["All", "Research", "Biology", "Flywheel", "Write"] as const).map(m => {
            const isAll = m === "All"
            const style = isAll ? null : MODE_COLORS[m as Mode]
            return (
              <button key={m} style={{
                padding: "6px 16px", borderRadius: "8px",
                fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
                background: isAll ? "rgba(255,255,255,0.08)" : (style?.bg ?? ""),
                border: isAll ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${style?.border}`,
                color: isAll ? "#ededff" : (style?.text ?? ""),
              } as React.CSSProperties}>
                {m}
              </button>
            )
          })}
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "#4a4a6a", alignSelf: "center" }}>
            Showing all modes
          </span>
        </div>
      </section>

      {/* ── Feed ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 100px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {POSTS.map(post => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load more placeholder */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={handleShare}
            style={{
              padding: "11px 28px", borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#7878a8", fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
            }}
          >
            Load more posts
          </button>
          <p style={{ fontSize: "12px", color: "#4a4a6a", marginTop: "12px" }}>
            Full feed available to early access members.{" "}
            <a href="/pricing" style={{ color: "#8b5cf6", textDecoration: "none" }}>Join waitlist →</a>
          </p>
        </div>
      </section>
    </div>
  )
}
