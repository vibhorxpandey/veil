"use client"

import { ArrowRight, BookOpen, Dna, RefreshCw, PenLine, Cpu, Layers, GitBranch, Zap, Check, ExternalLink } from "lucide-react"

const MISSION_BULLETS = [
  {
    icon: Layers,
    color: "#8b5cf6",
    title: "One unified workspace",
    desc: "Stop juggling Colab, Papers With Code, and Hugging Face. Veil pulls training, literature, and writing into a single flow.",
  },
  {
    icon: Cpu,
    color: "#3b82f6",
    title: "Four specialized AI modes",
    desc: "Research, Biology, Flywheel, and Write — each tuned for the exact task at hand, not a generic chat box.",
  },
  {
    icon: Zap,
    color: "#10b981",
    title: "Your compute, your credentials",
    desc: "Bring your own API keys and GPU budget. Veil orchestrates the infra without locking you into proprietary hardware.",
  },
]

const ROADMAP = [
  {
    label: "Real-time agent runtime",
    desc: "Persistent background agents that run experiments, poll results, and surface findings while you sleep.",
    color: "#8b5cf6",
    status: "In progress",
    statusColor: "#8b5cf6",
  },
  {
    label: "GPU fine-tuning at ₹12/hr",
    desc: "Kick off LoRA and full fine-tuning runs directly from the dashboard — no DevOps, no SSH.",
    color: "#3b82f6",
    status: "In progress",
    statusColor: "#3b82f6",
  },
  {
    label: "Multi-agent research pipelines",
    desc: "Chain specialized agents: one reads papers, one writes code, one runs evals — all coordinated.",
    color: "#f59e0b",
    status: "Planned",
    statusColor: "#f59e0b",
  },
  {
    label: "Biology mode + AlphaFold integration",
    desc: "Protein structure queries, pathway analysis, and genomics reasoning with AlphaFold3 and ESM3 in the loop.",
    color: "#10b981",
    status: "Planned",
    statusColor: "#10b981",
  },
  {
    label: "Evaluations harness",
    desc: "Automated benchmark runs with custom metrics, model comparisons, and versioned result tracking.",
    color: "#ec4899",
    status: "Planned",
    statusColor: "#ec4899",
  },
]

export default function About() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "110px 24px 80px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 65%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "100px", marginBottom: "28px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
            fontSize: "11.5px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.07em",
          }}>
            ABOUT VEIL
          </div>

          <h1 style={{
            fontSize: "clamp(38px, 5.5vw, 64px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px",
          }}>
            Built by a researcher,
            <br />
            <span style={{
              background: "linear-gradient(135deg, #ededff 0%, #a78bfa 45%, #38bdf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>for researchers.</span>
          </h1>

          <p style={{
            fontSize: "18px", color: "#7878a8", maxWidth: "560px",
            margin: "0 auto 36px", lineHeight: 1.75,
          }}>
            Veil is AI infrastructure for researchers who want to train models,
            synthesize papers, and ship science faster — without stitching together
            five different tools every single time.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <a href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "12px", fontSize: "15px",
              fontWeight: 700, color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              boxShadow: "0 0 30px rgba(139,92,246,0.3)",
            }}>
              Open Dashboard <ArrowRight size={16} />
            </a>
            <a href="mailto:vibhorpandey09@gmail.com" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "12px", fontSize: "15px",
              fontWeight: 600, color: "#7878a8", textDecoration: "none",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              Get in touch <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Founder ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "20px 24px 80px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "20px",
          background: "rgba(15,15,28,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          padding: "40px 40px",
          display: "flex",
          gap: "32px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "18px", flexShrink: 0,
            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", fontWeight: 800, color: "#fff", letterSpacing: "-1px",
            boxShadow: "0 0 32px rgba(139,92,246,0.35)",
          }}>
            VP
          </div>

          {/* Bio */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#ededff" }}>Vibhor Pandey</span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 10px", borderRadius: "100px", marginBottom: "16px",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              fontSize: "11.5px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.05em",
            }}>
              Founder &amp; Builder
            </div>

            <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.75, marginBottom: "16px" }}>
              I got frustrated. Every research project meant the same drill — spin up a Colab notebook,
              pull papers from Papers With Code, upload checkpoints to Hugging Face, set up W&amp;B logging,
              then start the actual work. Half the day gone before writing a single line of science.
            </p>
            <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.75, marginBottom: "20px" }}>
              Veil is the platform I wished existed: a single place where the literature, the training loop,
              the evaluation harness, and the write-up all talk to each other — driven by AI that actually
              understands what a researcher needs.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <a href="mailto:vibhorpandey09@gmail.com" style={{
                fontSize: "13px", color: "#8b5cf6", textDecoration: "none",
                display: "flex", alignItems: "center", gap: "5px",
              }}>
                vibhorpandey09@gmail.com <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 24px 80px", maxWidth: "900px", margin: "0 auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <p style={{
            fontSize: "11.5px", fontWeight: 700, color: "#4a4a6a",
            letterSpacing: "0.1em", marginBottom: "12px",
          }}>
            WHAT VEIL IS ABOUT
          </p>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#ededff", lineHeight: 1.15,
          }}>
            The research platform that
            <br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>stays out of your way.</span>
          </h2>
        </div>

        <div className="mobile-col" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px",
        }}>
          {MISSION_BULLETS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} style={{
                padding: "28px 24px",
                borderRadius: "16px",
                background: "rgba(15,15,28,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: `2px solid ${item.color}`,
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ededff", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Research Modes ───────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 24px 80px", maxWidth: "900px", margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ textAlign: "center", margin: "60px 0 40px" }}>
          <p style={{
            fontSize: "11.5px", fontWeight: 700, color: "#4a4a6a",
            letterSpacing: "0.1em", marginBottom: "12px",
          }}>
            THE FOUR MODES
          </p>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#ededff",
          }}>
            Purpose-built for every research task.
          </h2>
        </div>

        <div className="mobile-col" style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px",
        }}>
          {[
            {
              icon: BookOpen, label: "Research", color: "#3b82f6",
              desc: "Literature synthesis, hypothesis framing, GPU training orchestration, and manuscript drafting — all connected.",
              pills: ["Paper search", "Citation graph", "Training runs", "LaTeX export"],
            },
            {
              icon: Dna, label: "Biology", color: "#10b981",
              desc: "Protein design, genomics pipelines, pathway analysis, and biomedical reasoning with domain-aware context.",
              pills: ["AlphaFold", "ESM3", "Pathway DB", "Genomics"],
            },
            {
              icon: RefreshCw, label: "Flywheel", color: "#f59e0b",
              desc: "Auto fine-tuning loops, evaluation harnesses, and compounding model improvements — close the feedback loop automatically.",
              pills: ["LoRA / QLoRA", "Eval harness", "W&B logging", "Auto-iterate"],
            },
            {
              icon: PenLine, label: "Write", color: "#8b5cf6",
              desc: "Verified citations, clean LaTeX generation, and camera-ready formatting for NeurIPS, ICML, and beyond.",
              pills: ["Verified cites", "LaTeX output", "Camera-ready", "Co-authoring"],
            },
          ].map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} style={{
                padding: "28px 24px", borderRadius: "16px",
                background: "rgba(15,15,28,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: `2px solid ${m.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `${m.color}18`,
                    border: `1px solid ${m.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color={m.color} />
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#ededff" }}>{m.label}</span>
                </div>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.7, marginBottom: "16px" }}>
                  {m.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {m.pills.map(p => (
                    <span key={p} style={{
                      padding: "3px 10px", borderRadius: "100px",
                      fontSize: "11px", fontWeight: 600, color: m.color,
                      background: `${m.color}12`,
                      border: `1px solid ${m.color}25`,
                      letterSpacing: "0.02em",
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Roadmap ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 24px 80px", maxWidth: "800px", margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ textAlign: "center", margin: "60px 0 44px" }}>
          <p style={{
            fontSize: "11.5px", fontWeight: 700, color: "#4a4a6a",
            letterSpacing: "0.1em", marginBottom: "12px",
          }}>
            WHAT WE&apos;RE BUILDING
          </p>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#ededff",
          }}>
            The roadmap ahead.
          </h2>
          <p style={{ fontSize: "15px", color: "#7878a8", marginTop: "12px" }}>
            We ship fast. These are the next things coming out of the lab.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ROADMAP.map((item, i) => (
            <div key={i} style={{
              padding: "24px 28px", borderRadius: "16px",
              background: "rgba(15,15,28,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "flex-start", gap: "20px",
              flexWrap: "wrap",
            }}>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: item.color, marginTop: "5px", flexShrink: 0,
                boxShadow: `0 0 10px ${item.color}80`,
              }} />
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#ededff" }}>{item.label}</span>
                  <span style={{
                    padding: "2px 10px", borderRadius: "100px",
                    fontSize: "11px", fontWeight: 700,
                    color: item.statusColor,
                    background: `${item.statusColor}15`,
                    border: `1px solid ${item.statusColor}30`,
                    letterSpacing: "0.05em",
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 24px 100px", maxWidth: "640px", margin: "0 auto", textAlign: "center",
      }}>
        <div style={{
          padding: "56px 40px",
          borderRadius: "24px",
          background: "rgba(15,15,28,0.8)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 80px rgba(139,92,246,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow blob */}
          <div style={{
            position: "absolute", top: "-40px", left: "50%",
            transform: "translateX(-50%)",
            width: "300px", height: "120px", borderRadius: "50%",
            background: "rgba(139,92,246,0.12)",
            filter: "blur(40px)", pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
              letterSpacing: "-0.03em", color: "#ededff", marginBottom: "14px",
            }}>
              Ready to try it?
            </h2>
            <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.7, marginBottom: "28px" }}>
              The dashboard is live. Four modes, four models, GPU compute — all in one place.
              One free message per model to start.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <a href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 32px", borderRadius: "12px", fontSize: "15px",
                fontWeight: 700, color: "#fff", textDecoration: "none",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                boxShadow: "0 0 30px rgba(139,92,246,0.35)",
              }}>
                Go to Dashboard <ArrowRight size={16} />
              </a>
              <a href="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 24px", borderRadius: "12px", fontSize: "15px",
                fontWeight: 600, color: "#7878a8", textDecoration: "none",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
