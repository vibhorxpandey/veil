"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dna, RefreshCw, PenLine,
  GitBranch, Database, BarChart3, Cpu, Server,
  Zap, Globe, ArrowRight, Check,
  BookOpen, Layers, Play, Terminal, ChevronRight,
  Microscope, Sparkles, TrendingUp,
  Cloud, Lock, Activity, Box
} from "lucide-react"

// ─── Canvas Background ───────────────────────────────────────────────────────

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let animId: number
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const COUNT = 60

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 160)})`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(139,92,246,0.5)"
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: "research",
    label: "Research",
    icon: BookOpen,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.25)",
    border: "rgba(59,130,246,0.35)",
    desc: "End-to-end research execution: hypothesis framing, literature synthesis, experiment planning, GPU training, evaluations, and manuscript drafting.",
    tags: ["Literature Synthesis", "Hypothesis Framing", "Manuscript Drafting"],
  },
  {
    id: "biology",
    label: "Biology",
    icon: Dna,
    color: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    border: "rgba(16,185,129,0.35)",
    desc: "Wet-lab and computational biology specialist for protein design, genomics, pathway analysis, and biomedical reasoning workflows.",
    tags: ["Protein Design", "Genomics", "Pathway Analysis"],
  },
  {
    id: "flywheel",
    label: "Flywheel",
    icon: RefreshCw,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    border: "rgba(245,158,11,0.35)",
    desc: "Build compounding model improvements from production usage, auto-design fine-tunes, run evaluations, and ship stronger versions continuously.",
    tags: ["Auto Fine-tuning", "Evaluations", "Model Shipping"],
  },
  {
    id: "write",
    label: "Write",
    icon: PenLine,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
    border: "rgba(139,92,246,0.35)",
    desc: "Turn rough notes into publication-ready output with structured arguments, verified citations, clean LaTeX, and camera-ready formatting.",
    tags: ["LaTeX Output", "Citation Verification", "Camera-Ready"],
  },
]

const WORKFLOWS = [
  { cat: "Research", name: "Literature Review Pipeline", desc: "Synthesize 100+ papers into a structured survey", color: "#3b82f6" },
  { cat: "Biology", name: "Protein Structure Prediction", desc: "Run AlphaFold variants on custom sequences", color: "#10b981" },
  { cat: "Flywheel", name: "SFT Fine-Tune on Custom Data", desc: "Supervised fine-tune DeepSeek on domain datasets", color: "#f59e0b" },
  { cat: "Write", name: "Manuscript Drafting", desc: "From outline to LaTeX-formatted first draft", color: "#8b5cf6" },
  { cat: "Research", name: "Hypothesis Generation", desc: "AI-assisted research question formulation", color: "#3b82f6" },
  { cat: "Biology", name: "Genomics Pipeline", desc: "Variant calling, annotation, and pathway mapping", color: "#10b981" },
  { cat: "Flywheel", name: "Evaluation Harness Setup", desc: "Automated benchmark suite for model versions", color: "#f59e0b" },
  { cat: "Write", name: "Argument Structuring", desc: "Turn notes into coherent paper structure", color: "#8b5cf6" },
  { cat: "Research", name: "Experiment Planning", desc: "Design ablations and statistical test plans", color: "#3b82f6" },
  { cat: "Biology", name: "Drug-Target Interaction", desc: "Screen compound libraries against protein targets", color: "#10b981" },
  { cat: "Flywheel", name: "RLHF Data Collection", desc: "Auto-generate preference pairs from prod logs", color: "#f59e0b" },
  { cat: "Write", name: "Citation Verification", desc: "Real-time fact-checking against OpenAlex/PubMed", color: "#8b5cf6" },
]

const INTEGRATIONS = [
  { name: "GitHub", icon: GitBranch, desc: "Code repos & version control" },
  { name: "Hugging Face", icon: Sparkles, desc: "Models, datasets & spaces" },
  { name: "Weights & Biases", icon: Activity, desc: "Experiment tracking" },
  { name: "Modal", icon: Cloud, desc: "Serverless GPU compute" },
  { name: "Prime Intellect", icon: Cpu, desc: "Distributed training" },
  { name: "Pinecone", icon: Database, desc: "Vector database" },
  { name: "OpenAlex", icon: Globe, desc: "Academic literature graph" },
  { name: "PubMed", icon: Microscope, desc: "Biomedical literature" },
]

const RUNTIME_FEATURES = [
  {
    icon: Box,
    title: "Persistent Sandboxes",
    desc: "Each agent continues inside an isolated, stateful environment with full checkpointing and deterministic resume.",
    points: ["State recovery without manual setup", "Every run remains reproducible", "Context survives disconnects automatically"],
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Elastic Compute Profiles",
    desc: "Scale from lightweight analysis nodes to full GPU clusters without changing prompts, workflows, or context state.",
    points: ["From CPU sessions to multi-GPU clusters", "Model runs, evaluations, and writing in one flow", "Dynamic allocation based on task intensity"],
    color: "#3b82f6",
  },
  {
    icon: Server,
    title: "Asynchronous Work Orchestration",
    desc: "Queue long evaluations, training loops, and literature synthesis pipelines while your browser session is offline.",
    points: ["Background queues continue while you are away", "Automatic artifact collection and organization", "Morning-ready summaries delivered to dashboard"],
    color: "#10b981",
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ children, color = "#8b5cf6" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 12px", borderRadius: "100px",
      fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.05em",
      color, border: `1px solid ${color}44`,
      background: `${color}11`,
    }}>{children}</span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
      <Badge color="#8b5cf6">
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
        {children}
      </Badge>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeMode, setActiveMode] = useState("research")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
    setSubmitted(true)
  }

  return (
    <div style={{ background: "#050508", minHeight: "100vh", position: "relative" }}>
      <NeuralCanvas />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="grid-bg" style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 60px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 100px",
        textAlign: "center",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: "800px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="animate-fade-in-up" style={{ maxWidth: "860px" }}>
          <div style={{ marginBottom: "24px" }}>
            <Badge color="#8b5cf6">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} className="animate-pulse-glow" />
              Now in Early Access — Join 2,400+ researchers
            </Badge>
          </div>

          <h1 style={{
            fontSize: "clamp(42px, 6vw, 76px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: "28px",
          }}>
            <span className="gradient-text">Train models and</span>
            <br />
            <span style={{ color: "#ededff" }}>read papers in one flow.</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#7878a8",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto 48px",
          }}>
            Four specialized AI modes. 1000s of workflows. Fine-tune DeepSeek on Tinker GPUs,
            run evaluations, and review literature in one continuous workspace orchestrated by your agents.
          </p>

          {/* Email capture */}
          {submitted ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "14px 28px", borderRadius: "14px",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#6ee7b7", fontSize: "15px", fontWeight: 600,
            }}>
              <Check size={18} /> You&apos;re on the list — we&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="hero-form" style={{
              display: "flex", gap: "10px", justifyContent: "center",
              flexWrap: "wrap", marginBottom: "20px",
            }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="hero-input"
                style={{
                  padding: "13px 20px", borderRadius: "12px", fontSize: "15px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ededff", outline: "none", width: "280px",
                }}
              />
              <button type="submit" style={{
                padding: "13px 28px", borderRadius: "12px", fontSize: "15px",
                fontWeight: 600, color: "#fff", border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                boxShadow: "0 0 30px rgba(139,92,246,0.4)",
              }}>
                Join Waitlist
              </button>
            </form>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
            <a href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "14px", color: "#7878a8", textDecoration: "none",
            }}>
              Open Dashboard <ArrowRight size={14} />
            </a>
            <span style={{ color: "#2d2d4e" }}>|</span>
            <a href="#modes" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "14px", color: "#7878a8", textDecoration: "none",
            }}>
              Explore Modes <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Mode preview chips */}
        <div className="animate-fade-in delay-400" style={{
          display: "flex", gap: "10px", justifyContent: "center",
          flexWrap: "wrap", marginTop: "72px",
        }}>
          {MODES.map(m => {
            const Icon = m.icon
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "12px",
                background: "rgba(15,15,28,0.8)", border: `1px solid ${m.border}`,
                fontSize: "13.5px", fontWeight: 600, color: m.color,
                backdropFilter: "blur(12px)",
              }}>
                <Icon size={15} color={m.color} />
                {m.label}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MODES ────────────────────────────────────────────────────────────── */}
      <section id="modes" className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <SectionLabel>4 Modes</SectionLabel>

        <h2 style={{
          fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
          textAlign: "center", letterSpacing: "-0.03em",
          marginBottom: "16px", color: "#ededff",
        }}>
          Switch modes. <span className="gradient-text">Never drop context.</span>
        </h2>
        <p style={{
          textAlign: "center", color: "#7878a8", fontSize: "17px",
          maxWidth: "520px", margin: "0 auto 64px", lineHeight: 1.65,
        }}>
          Switch modes mid-session to change objectives, tool access, and execution style without losing any context or history.
        </p>

        {/* Mode tab switcher */}
        <div className="mode-tabs-wrap" style={{
          display: "flex", justifyContent: "center", gap: "4px",
          marginBottom: "48px", padding: "6px",
          background: "rgba(255,255,255,0.04)", borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          width: "fit-content", margin: "0 auto 48px",
        }}>
          {MODES.map(m => {
            const Icon = m.icon
            const active = activeMode === m.id
            return (
              <button key={m.id} onClick={() => setActiveMode(m.id)} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "9px 20px", borderRadius: "11px", border: "none",
                fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
                color: active ? m.color : "#7878a8",
                background: active ? `${m.color}18` : "transparent",
                boxShadow: active ? `0 0 20px ${m.glow}` : "none",
              }}>
                <Icon size={14} />
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Active mode detail */}
        {MODES.map(m => {
          if (m.id !== activeMode) return null
          const Icon = m.icon
          return (
            <div key={m.id} className="mobile-col" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
              alignItems: "center",
            }}>
              {/* Left: info */}
              <div style={{
                padding: "48px", borderRadius: "20px",
                background: "rgba(15,15,28,0.9)",
                border: `1px solid ${m.border}`,
                boxShadow: `0 0 60px ${m.glow}`,
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: `${m.color}18`, border: `1px solid ${m.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "24px",
                }}>
                  <Icon size={26} color={m.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", color: "#ededff" }}>{m.label}</h3>
                  <Badge color={m.color}>Mode</Badge>
                </div>
                <p style={{ fontSize: "16px", color: "#7878a8", lineHeight: 1.7, marginBottom: "28px" }}>{m.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {m.tags.map(tag => (
                    <span key={tag} style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600,
                      color: m.color, background: `${m.color}14`, border: `1px solid ${m.border}`,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Right: terminal/preview */}
              <div style={{
                padding: "32px", borderRadius: "20px",
                background: "rgba(10,10,16,0.95)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "monospace",
              }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                    <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.8, color: "#7878a8" }}>
                  <div><span style={{ color: "#8b5cf6" }}>veil</span> <span style={{ color: "#10b981" }}>switch</span> <span style={{ color: "#f59e0b" }}>--mode</span> <span style={{ color: "#ededff" }}>{m.id}</span></div>
                  <div style={{ color: "#4a4a6a", marginTop: "6px" }}>✓ Context preserved ({Math.floor(Math.random() * 40 + 10)}k tokens)</div>
                  <div style={{ color: "#4a4a6a" }}>✓ Tool access updated</div>
                  <div style={{ color: "#4a4a6a" }}>✓ Switching execution style...</div>
                  <div style={{ marginTop: "12px", color: m.color }}>→ Ready in {m.label} mode.</div>
                  <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                    <span style={{ color: "#8b5cf6" }}>veil</span> <span style={{ color: "#ededff" }}>{">"}</span>
                    <span style={{ display: "inline-block", width: "8px", height: "14px", background: m.color, marginLeft: "4px", animation: "pulse-glow 1s infinite" }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* 2x2 mode grid */}
        <div className="mobile-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "48px" }}>
          {MODES.map(m => {
            const Icon = m.icon
            return (
              <div key={m.id}
                onClick={() => setActiveMode(m.id)}
                style={{
                  padding: "32px", borderRadius: "16px", cursor: "pointer",
                  background: "rgba(15,15,28,0.7)",
                  border: `1px solid ${activeMode === m.id ? m.border : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.2s",
                  borderTop: `3px solid ${m.color}`,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <Icon size={20} color={m.color} />
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#ededff" }}>{m.label}</span>
                </div>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── WORKFLOWS ────────────────────────────────────────────────────────── */}
      <section id="workflows" className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px",
        background: "rgba(10,10,18,0.6)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionLabel>Workflows</SectionLabel>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
            textAlign: "center", letterSpacing: "-0.03em",
            marginBottom: "16px", color: "#ededff",
          }}>
            1000s of <span className="gradient-text">workflows.</span>
          </h2>
          <p style={{
            textAlign: "center", color: "#7878a8", fontSize: "17px",
            maxWidth: "480px", margin: "0 auto 56px", lineHeight: 1.65,
          }}>
            Pre-built pipelines across research, biology, model training, and writing — ready to run or adapt.
          </p>

          {/* Search bar (decorative) */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "14px 20px", borderRadius: "14px", marginBottom: "40px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: "500px", margin: "0 auto 40px",
          }}>
            <span style={{ color: "#4a4a6a", fontSize: "14px" }}>⌕</span>
            <span style={{ color: "#4a4a6a", fontSize: "14px" }}>Search 1000+ workflows...</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}>
            {WORKFLOWS.map((w, i) => (
              <div key={i} style={{
                padding: "24px", borderRadius: "14px",
                background: "rgba(15,15,28,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${w.color}`,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{
                  fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em",
                  color: w.color, textTransform: "uppercase", marginBottom: "10px",
                }}>{w.cat}</div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#ededff", marginBottom: "6px" }}>{w.name}</div>
                <div style={{ fontSize: "12.5px", color: "#7878a8", lineHeight: 1.6 }}>{w.desc}</div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  marginTop: "16px", fontSize: "12px", color: w.color, fontWeight: 600,
                }}>
                  <Play size={11} fill={w.color} /> Run workflow
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "12px", fontSize: "14px",
              fontWeight: 600, color: "#ededff", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
            }}>
              Browse all workflows <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS ──────────────────────────────────────────────────────── */}
      <section id="integrations" className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px",
        maxWidth: "1100px", margin: "0 auto",
      }}>
        <div className="mobile-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          {/* Left */}
          <div>
            <SectionLabel>Universal Sync</SectionLabel>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 800,
              letterSpacing: "-0.03em", marginBottom: "20px", color: "#ededff",
              lineHeight: 1.15,
            }}>
              Your Credentials.<br /><span className="gradient-text">Your Compute.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#7878a8", lineHeight: 1.7, marginBottom: "36px" }}>
              Connect once on the dashboard. GitHub, Hugging Face, Weights & Biases,
              and other API keys automatically sync to every agent and every session.
            </p>

            {[
              { icon: Lock, label: "Universal Credential Sync", desc: "Connect once. Credentials sync to every agent automatically." },
              { icon: Cpu, label: "GPU Orchestration", desc: "Provision compute clusters across multiple providers seamlessly." },
              { icon: Layers, label: "Deep Integrations", desc: "Connect your stack once and coordinate research execution across repos, experiments, and cloud runtimes." },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                  background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <f.icon size={18} color="#8b5cf6" />
                </div>
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#ededff", marginBottom: "4px" }}>{f.label}</div>
                  <div style={{ fontSize: "13px", color: "#7878a8", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: integration grid */}
          <div className="mobile-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {INTEGRATIONS.map(intg => {
              const Icon = intg.icon
              return (
                <div key={intg.name} style={{
                  padding: "20px 24px", borderRadius: "14px",
                  background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <Icon size={18} color="#8b5cf6" />
                    <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ededff" }}>{intg.name}</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#7878a8" }}>{intg.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ZERO SETUP ───────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "80px 24px",
        background: "rgba(10,10,18,0.5)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 18px", borderRadius: "100px", marginBottom: "24px",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
          }}>
            <Zap size={14} color="#10b981" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", letterSpacing: "0.06em" }}>ZERO SETUP OVERHEAD</span>
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em",
            color: "#ededff", marginBottom: "16px",
          }}>
            Start researching immediately.
          </h2>
          <p style={{ fontSize: "17px", color: "#7878a8", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
            Everything from package dependencies to Python environments is fully managed
            by our sandboxed runtime. No setup. No config. Just research.
          </p>
        </div>
      </section>

      {/* ── RUNTIME ──────────────────────────────────────────────────────────── */}
      <section id="runtime" className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <SectionLabel>Persistent Runtime</SectionLabel>
        <h2 style={{
          fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
          textAlign: "center", letterSpacing: "-0.03em",
          marginBottom: "16px", color: "#ededff",
        }}>
          Agents that <span className="gradient-text">never stop.</span>
        </h2>
        <p style={{
          textAlign: "center", color: "#7878a8", fontSize: "17px",
          maxWidth: "520px", margin: "0 auto 72px", lineHeight: 1.65,
        }}>
          Keep long-running workflows alive in persistent browser runtimes. Start a training run or
          literature review, walk away, and your agents continue execution autonomously.
        </p>

        <div className="mobile-col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {RUNTIME_FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} style={{
                padding: "36px", borderRadius: "20px",
                background: "rgba(15,15,28,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: `2px solid ${f.color}`,
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: `${f.color}14`, border: `1px solid ${f.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px",
                }}>
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ededff", marginBottom: "12px" }}>{f.title}</h3>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.7, marginBottom: "20px" }}>{f.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {f.points.map(pt => (
                    <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#7878a8" }}>
                      <Check size={13} color={f.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── RL RESEARCH ──────────────────────────────────────────────────────── */}
      <section className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px",
        background: "rgba(8,8,16,0.7)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", right: "-200px", transform: "translateY(-50%)",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="mobile-col" style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <Badge color="#3b82f6">Research Infrastructure</Badge>
            <h2 style={{
              fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em",
              color: "#ededff", marginTop: "20px", marginBottom: "16px", lineHeight: 1.2,
            }}>
              Long-Horizon RL Environments for Scientific Research.
            </h2>
            <p style={{ fontSize: "15.5px", color: "#7878a8", lineHeight: 1.75, marginBottom: "28px" }}>
              Develop RL environments and process-based training data for LLMs, starting with
              agentic coding environments for ML research workflows.
            </p>
            <a href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 24px", borderRadius: "11px", fontSize: "14px",
              fontWeight: 600, color: "#93c5fd", textDecoration: "none",
              border: "1px solid rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.08)",
            }}>
              Start building <ArrowRight size={14} />
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: Terminal, label: "Agentic coding environments", color: "#3b82f6" },
              { icon: TrendingUp, label: "Process-based reward signals", color: "#8b5cf6" },
              { icon: BarChart3, label: "Automated evaluation pipelines", color: "#10b981" },
              { icon: Globe, label: "Multi-agent coordination", color: "#f59e0b" },
            ].map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 20px", borderRadius: "12px",
                  background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: `${f.color}14`, border: `1px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={f.color} />
                  </div>
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#ededff" }}>{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FOUNDER ──────────────────────────────────────────────────────────── */}
      <section className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "100px", marginBottom: "40px",
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
            fontSize: "12px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.06em",
          }}>
            FROM THE FOUNDER
          </div>

          <div style={{
            background: "rgba(15,15,28,0.85)", borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "48px 40px", textAlign: "left", position: "relative",
          }}>
            {/* Quote mark */}
            <div style={{
              fontSize: "80px", lineHeight: 1, color: "rgba(139,92,246,0.15)",
              fontFamily: "Georgia, serif", position: "absolute", top: "24px", left: "36px",
              userSelect: "none",
            }}>&ldquo;</div>

            <p style={{
              fontSize: "17px", color: "#ededff", lineHeight: 1.85,
              marginBottom: "24px", position: "relative", zIndex: 1,
              paddingTop: "24px",
            }}>
              I built Veil because I kept switching between five different tools just to do one research task —
              reading papers in one tab, running models in another, writing in a third.
              Every switch broke my flow and killed my context.
            </p>
            <p style={{
              fontSize: "17px", color: "#7878a8", lineHeight: 1.85,
              marginBottom: "36px",
            }}>
              Researchers and ML engineers deserve a workspace where the AI understands the <em style={{ color: "#ededff" }}>entire</em> context of their work —
              not just the last message. That&apos;s what Veil is. One workspace, four deep modes, thousands of workflows,
              your compute — all in one place, always in sync.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img src="/logo.png" alt="Veil" style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#ededff" }}>Vibhor Pandey</div>
                <div style={{ fontSize: "13px", color: "#7878a8", marginTop: "2px" }}>
                  Founder, Veil Research · UPES University, Dehradun
                </div>
                <a
                  href="mailto:vibhorpandey09@gmail.com"
                  style={{ fontSize: "12.5px", color: "#8b5cf6", textDecoration: "none", marginTop: "4px", display: "inline-block" }}
                >
                  vibhorpandey09@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="resp-section-padding" style={{
        position: "relative", zIndex: 1,
        padding: "140px 24px",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px", height: "400px",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <h2 style={{
            fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800,
            letterSpacing: "-0.04em", marginBottom: "20px",
          }}>
            <span className="gradient-text">Research faster.</span>
            <br />
            <span style={{ color: "#ededff" }}>Ship better models.</span>
          </h2>
          <p style={{ fontSize: "17px", color: "#7878a8", marginBottom: "48px", lineHeight: 1.7 }}>
            Join researchers who are running experiments, reviewing papers,<br />
            and training models — all in one continuous workspace.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/dashboard" style={{
              padding: "15px 36px", borderRadius: "14px", fontSize: "16px",
              fontWeight: 700, color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              boxShadow: "0 0 40px rgba(139,92,246,0.4)",
            }}>
              Open Dashboard →
            </a>
            <a href="#modes" style={{
              padding: "15px 36px", borderRadius: "14px", fontSize: "16px",
              fontWeight: 700, color: "#ededff", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
            }}>
              Explore Modes
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="resp-footer" style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="Veil" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#7878a8" }}>Veil Research</span>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Contact", href: "mailto:vibhorpandey09@gmail.com" },
          ].map(link => (
            <a key={link.label} href={link.href} style={{ fontSize: "13px", color: "#4a4a6a", textDecoration: "none" }}>{link.label}</a>
          ))}
        </div>
        <span style={{ fontSize: "12.5px", color: "#4a4a6a" }}>© 2025 Veil Research. All rights reserved.</span>
      </footer>
    </div>
  )
}
