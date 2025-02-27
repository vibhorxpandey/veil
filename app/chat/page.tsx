"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Send, BookOpen, Dna, RefreshCw, PenLine,
  Sparkles, Zap, Crown, Lock, Mail,
  RotateCcw, User, Bot, AlertCircle, Check, X, ArrowRight
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type Message  = { role: "user" | "assistant"; content: string }
type SubState = { status: string; freeTrialUsed: boolean; email: string }

// ─── Models ──────────────────────────────────────────────────────────────────

const MODELS = [
  { id: "gpt-4o",      name: "GPT-4o",       provider: "OpenAI",        color: "#10a37f", desc: "Best overall performance",  icon: Sparkles },
  { id: "gpt-4o-mini", name: "GPT-4o mini",  provider: "OpenAI",        color: "#10a37f", desc: "Fast & cost-efficient",     icon: Zap },
  { id: "llama-3-70b", name: "Llama 3 70B",  provider: "Meta / NVIDIA", color: "#3b82f6", desc: "Open-source powerhouse",    icon: BookOpen },
  { id: "deepseek-r1", name: "DeepSeek R1",  provider: "DeepSeek",      color: "#8b5cf6", desc: "Advanced reasoning",        icon: Dna },
]

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose, userEmail }: {
  onClose: () => void
  userEmail: string
}) {
  const [email,     setEmail]     = useState(userEmail)
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await fetch("/api/waitlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#0f0f1c", borderRadius: "20px",
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: "0 0 60px rgba(139,92,246,0.2)",
        padding: "40px", maxWidth: "440px", width: "100%",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none", cursor: "pointer", color: "#7878a8",
        }}><X size={18} /></button>

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 20px",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={26} color="#10b981" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "10px" }}>You&apos;re on the list!</h2>
            <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7 }}>
              Check your inbox — we&apos;ve sent you a note from Vibhor explaining what&apos;s coming.
              You&apos;ll get priority access at <strong style={{ color: "#ededff" }}>₹199/month</strong> when payments launch.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px",
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px",
            }}>
              <Crown size={24} color="#8b5cf6" />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ededff", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Free trial complete
            </h2>
            <p style={{ fontSize: "14.5px", color: "#7878a8", lineHeight: 1.65, marginBottom: "20px" }}>
              You&apos;ve used your free message. Payments are launching soon at ₹199/month —
              join the early access list and we&apos;ll notify you the moment it&apos;s live.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {[
                "Unlimited messages across all models",
                "GPT-4o, Llama 3, DeepSeek R1 access",
                "All 4 research modes unlocked",
                "GPU compute & workflow execution",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#ededff" }}>
                  <Check size={14} color="#10b981" /> {f}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <Mail size={15} color="#4a4a6a" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  style={{
                    width: "100%", padding: "13px 14px 13px 40px", borderRadius: "12px",
                    fontSize: "14.5px", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "#ededff",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <button type="submit" disabled={loading || !email} style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                fontSize: "15px", fontWeight: 700, color: "#fff",
                cursor: loading || !email ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                boxShadow: "0 0 28px rgba(139,92,246,0.35)",
                opacity: loading || !email ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                {loading ? "Saving…" : <><ArrowRight size={15} /> Notify me at launch</>}
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#4a4a6a" }}>
              No spam · You&apos;ll get a personal note from Vibhor, founder of Veil
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ChatContent() {
  const router       = useRouter()
  const params       = useSearchParams()
  const bottomRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLTextAreaElement>(null)

  const [messages,      setMessages]      = useState<Message[]>([])
  const [input,         setInput]         = useState("")
  const [loading,       setLoading]       = useState(false)
  const [subState,      setSubState]      = useState<SubState | null>(null)
  const [subLoading,    setSubLoading]    = useState(true)
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [showUpgrade,   setShowUpgrade]   = useState(false)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  // Fetch subscription status on mount
  useEffect(() => {
    fetch("/api/subscription/status")
      .then(r => r.json())
      .then(d => {
        if (d.status === "unauthenticated") {
          router.push("/login?next=/chat")
          return
        }
        setSubState(d)
        setSubLoading(false)
        // If ?subscribed=true, refresh status
        if (params.get("subscribed") === "true") {
          setSubState(prev => prev ? { ...prev, status: "active" } : prev)
        }
      })
      .catch(() => setSubLoading(false))
  }, [router, params])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const model = MODELS.find(m => m.id === selectedModel) ?? MODELS[1]

  const canSend = subState?.status === "active" || !subState?.freeTrialUsed

  const handleSend = async () => {
    if (!input.trim() || loading) return
    if (!canSend) { setShowUpgrade(true); return }

    const userMsg: Message = { role: "user", content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setLoading(true)

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model: selectedModel }),
      })
      const data = await res.json()

      if (data.error === "UPGRADE_REQUIRED") {
        setShowUpgrade(true)
        setLoading(false)
        return
      }

      setMessages([...history, { role: "assistant", content: data.reply }])

      if (data.trialNowUsed) {
        setSubState(prev => prev ? { ...prev, freeTrialUsed: true } : prev)
      }
    } catch {
      setMessages([...history, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (subLoading) {
    return (
      <div style={{
        height: "calc(100vh - 60px)", display: "flex",
        alignItems: "center", justifyContent: "center", background: "#050508",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            border: "3px solid rgba(139,92,246,0.3)",
            borderTop: "3px solid #8b5cf6",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: "#7878a8", fontSize: "14px" }}>Loading workspace…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const isBlocked  = subState?.status !== "active" && subState?.freeTrialUsed
  const isPro      = subState?.status === "active"
  const trialLeft  = !isPro && !subState?.freeTrialUsed

  return (
    <div style={{
      height: "calc(100vh - 60px)", display: "flex",
      background: "#050508", position: "relative",
    }}>
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          userEmail={subState?.email ?? ""}
        />
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="resp-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`resp-sidebar${sidebarOpen ? " sidebar-open" : ""}`} style={{
        width: "260px", flexShrink: 0,
        background: "rgba(10,10,18,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        padding: "20px 14px",
        overflowY: "auto",
      }}>
        {/* User status badge */}
        <div style={{
          padding: "12px 14px", borderRadius: "12px", marginBottom: "20px",
          background: isPro ? "rgba(16,185,129,0.08)" : trialLeft ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isPro ? "rgba(16,185,129,0.25)" : trialLeft ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            {isPro
              ? <Crown size={13} color="#10b981" />
              : trialLeft
                ? <AlertCircle size={13} color="#f59e0b" />
                : <Lock size={13} color="#ef4444" />
            }
            <span style={{
              fontSize: "12px", fontWeight: 700,
              color: isPro ? "#10b981" : trialLeft ? "#f59e0b" : "#ef4444",
            }}>
              {isPro ? "Pro Plan Active" : trialLeft ? "1 Free Message" : "Trial Used"}
            </span>
          </div>
          <p style={{ fontSize: "11.5px", color: "#7878a8", lineHeight: 1.5 }}>
            {isPro
              ? "Unlimited access to all models"
              : trialLeft
                ? "Send 1 message free — then upgrade"
                : "Upgrade to continue chatting"
            }
          </p>
          {!isPro && (
            <button onClick={() => setShowUpgrade(true)} style={{
              marginTop: "10px", width: "100%", padding: "7px",
              borderRadius: "8px", border: "none", fontSize: "12px",
              fontWeight: 700, cursor: "pointer", color: "#fff",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            }}>
              Join Early Access
            </button>
          )}
        </div>

        {/* Model selector */}
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em", marginBottom: "10px", paddingLeft: "4px" }}>
          SELECT MODEL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "24px" }}>
          {MODELS.map(m => {
            const Icon = m.icon
            const active = m.id === selectedModel
            return (
              <button key={m.id} onClick={() => { setSelectedModel(m.id); setSidebarOpen(false) }} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", border: "none",
                cursor: "pointer", textAlign: "left", width: "100%",
                background: active ? `${m.color}12` : "transparent",
                outline: active ? `1px solid ${m.color}30` : "none",
                transition: "all 0.15s",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                  background: `${m.color}18`, border: `1px solid ${m.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={13} color={m.color} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#ededff" : "#7878a8" }}>{m.name}</div>
                  <div style={{ fontSize: "11px", color: "#4a4a6a" }}>{m.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* New chat */}
        <button onClick={() => setMessages([])} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)", fontSize: "13px", fontWeight: 600,
          color: "#7878a8", cursor: "pointer", width: "100%", marginTop: "auto",
        }}>
          <RotateCcw size={13} /> New Chat
        </button>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat header */}
        <div style={{
          padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,8,16,0.8)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Hamburger — visible on mobile only */}
            <button
              className="mobile-only"
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}
            >
              <span style={{ display: "block", width: "18px", height: "2px", background: "#ededff", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#ededff", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#ededff", borderRadius: "1px" }} />
            </button>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: `${model.color}14`, border: `1px solid ${model.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <model.icon size={15} color={model.color} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff" }}>{model.name}</div>
              <div style={{ fontSize: "11.5px", color: "#7878a8" }}>{model.provider}</div>
            </div>
          </div>
          {isPro && (
            <span style={{
              padding: "4px 12px", borderRadius: "100px", fontSize: "11px",
              fontWeight: 700, color: "#10b981",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Crown size={11} /> Pro
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "28px 32px",
          display: "flex", flexDirection: "column", gap: "20px",
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", margin: "auto", paddingBottom: "40px" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "18px", margin: "0 auto 20px",
                background: `${model.color}14`, border: `1px solid ${model.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <model.icon size={28} color={model.color} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "8px" }}>
                {model.name}
              </h2>
              <p style={{ fontSize: "14px", color: "#7878a8", maxWidth: "340px", margin: "0 auto", lineHeight: 1.6 }}>
                {model.desc}. Ask anything — research questions, code, analysis, writing.
              </p>
              {trialLeft && (
                <div style={{
                  marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", borderRadius: "100px",
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                  fontSize: "12.5px", fontWeight: 600, color: "#f59e0b",
                }}>
                  <AlertCircle size={13} /> 1 free message available
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex", gap: "12px",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
            }}>
              {/* Avatar */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                  : `${model.color}14`,
                border: msg.role === "assistant" ? `1px solid ${model.color}30` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {msg.role === "user"
                  ? <User size={14} color="#fff" />
                  : <Bot size={14} color={model.color} />
                }
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "70%",
                padding: "14px 18px",
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                  : "rgba(15,15,28,0.9)",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none",
                fontSize: "14.5px",
                lineHeight: 1.7,
                color: "#ededff",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                background: `${model.color}14`, border: `1px solid ${model.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={14} color={model.color} />
              </div>
              <div style={{
                padding: "14px 18px", borderRadius: "4px 16px 16px 16px",
                background: "rgba(15,15,28,0.9)", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: model.color, opacity: 0.6,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,8,16,0.9)",
        }}>
          {isBlocked ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderRadius: "14px",
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Lock size={16} color="#8b5cf6" />
                <span style={{ fontSize: "14px", color: "#ededff", fontWeight: 600 }}>
                  Free trial complete — upgrade to continue
                </span>
              </div>
              <button onClick={() => setShowUpgrade(true)} style={{
                padding: "8px 20px", borderRadius: "9px", border: "none",
                fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              }}>
                Join Early Access — ₹199/mo
              </button>
            </div>
          ) : (
            <div style={{
              display: "flex", gap: "10px", alignItems: "flex-end",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "10px 14px",
              transition: "border-color 0.2s",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px"
                }}
                onKeyDown={handleKeyDown}
                placeholder={trialLeft ? "Ask anything… (1 free message)" : "Ask anything…"}
                rows={1}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#ededff", fontSize: "14.5px", lineHeight: 1.6,
                  resize: "none", fontFamily: "inherit", padding: "4px 0",
                  maxHeight: "180px", overflowY: "auto",
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  width: "36px", height: "36px", borderRadius: "10px", border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                    : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  flexShrink: 0, transition: "all 0.15s",
                }}>
                <Send size={15} color={input.trim() && !loading ? "#fff" : "#4a4a6a"} />
              </button>
            </div>
          )}
          <p style={{ textAlign: "center", fontSize: "11.5px", color: "#2d2d4e", marginTop: "10px" }}>
            Veil may produce errors. Verify critical information.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function Chat() {
  return (
    <Suspense fallback={
      <div style={{
        height: "calc(100vh - 60px)", display: "flex",
        alignItems: "center", justifyContent: "center", background: "#050508",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(139,92,246,0.3)",
          borderTop: "3px solid #8b5cf6",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
