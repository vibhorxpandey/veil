"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import {
  BookOpen, Dna, RefreshCw, PenLine, Sparkles, Zap,
  Terminal, BarChart3, GitBranch, Database, Activity,
  Server, Settings, Bell, User, Plus, Play,
  Send, Bot, Check, Crown, Lock, LogOut,
  ChevronRight, AlertCircle, X, Save, Eye, EyeOff,
  Cpu, Globe, Layers, TrendingUp, Clock,
} from "lucide-react"

// ─── Supabase client (browser) ───────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "sessions" | "workflows" | "integrations" | "compute" | "evaluations" | "settings" | "notifications" | "profile"
type Msg  = { role: "user" | "assistant"; content: string }

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = [
  { id: "research", label: "Research", icon: BookOpen, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)" },
  { id: "biology",  label: "Biology",  icon: Dna,      color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)" },
  { id: "flywheel", label: "Flywheel", icon: RefreshCw, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)" },
  { id: "write",    label: "Write",    icon: PenLine,   color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" },
]

const MODELS = [
  { id: "gpt-4o",      name: "GPT-4o",      provider: "OpenAI",   color: "#10a37f", icon: Sparkles, desc: "Best overall" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI",   color: "#10a37f", icon: Zap,      desc: "Fast & efficient" },
  { id: "llama-3-70b", name: "Llama 3 70B", provider: "NVIDIA",   color: "#3b82f6", icon: BookOpen, desc: "Open-source" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", color: "#8b5cf6", icon: Dna,      desc: "Deep reasoning" },
]

const WORKFLOWS = [
  { cat: "Research", name: "Literature Review Pipeline",  color: "#3b82f6", desc: "Synthesize papers into a survey" },
  { cat: "Biology",  name: "Protein Structure Analysis",  color: "#10b981", desc: "Run AlphaFold on custom sequences" },
  { cat: "Flywheel", name: "Fine-tune on Custom Data",    color: "#f59e0b", desc: "SFT fine-tune on domain datasets" },
  { cat: "Write",    name: "Manuscript Drafting",         color: "#8b5cf6", desc: "Outline to LaTeX first draft" },
  { cat: "Research", name: "Hypothesis Generation",       color: "#3b82f6", desc: "AI-assisted research questions" },
  { cat: "Biology",  name: "Genomics Pipeline",           color: "#10b981", desc: "Variant calling and pathway mapping" },
  { cat: "Flywheel", name: "Evaluation Harness Setup",    color: "#f59e0b", desc: "Automated benchmark suite" },
  { cat: "Write",    name: "Citation Verification",       color: "#8b5cf6", desc: "Real-time fact-checking" },
]

const INTEGRATIONS_LIST = [
  { name: "GitHub",         icon: GitBranch, color: "#ededff", desc: "Code repos & version control",   key: "github" },
  { name: "Hugging Face",   icon: Sparkles,  color: "#f59e0b", desc: "Models, datasets & spaces",     key: "huggingface" },
  { name: "Weights & Biases", icon: Activity, color: "#f43f5e", desc: "Experiment tracking",          key: "wandb" },
  { name: "Modal",          icon: Server,    color: "#3b82f6", desc: "Serverless GPU compute",         key: "modal" },
  { name: "Pinecone",       icon: Database,  color: "#10b981", desc: "Vector database",               key: "pinecone" },
  { name: "OpenAlex",       icon: Globe,     color: "#8b5cf6", desc: "Academic literature graph",     key: "openalex" },
]

const MOCK_NOTIFS = [
  { id: 1, title: "Welcome to Veil Research!", body: "Your account is ready. Try all 4 models — each gives you 1 free message.", time: "Just now", read: false, icon: Crown, color: "#8b5cf6" },
  { id: 2, title: "New models available", body: "DeepSeek R1 and Llama 3 70B are now live in your Sessions workspace.", time: "2h ago", read: false, icon: Sparkles, color: "#10a37f" },
  { id: 3, title: "Early access pricing locked", body: "You joined the early access list. ₹199/month pricing is reserved for you.", time: "1d ago", read: true, icon: Check, color: "#10b981" },
]

// ─── Sub-views ────────────────────────────────────────────────────────────────

function SessionsView({
  trialModelsUsed, isPro, userEmail, accessToken,
}: { trialModelsUsed: string[]; isPro: boolean; userEmail: string; accessToken: string }) {
  const bottomRef    = useRef<HTMLDivElement>(null)
  const [model,      setModel]    = useState("gpt-4o-mini")
  const [allMsgs,    setAllMsgs]  = useState<Record<string, Msg[]>>({})
  const [input,      setInput]    = useState("")
  const [loading,    setLoading]  = useState(false)
  const [trialUsed,  setTrialUsed] = useState<string[]>(trialModelsUsed)
  const [showGate,   setShowGate]  = useState(false)

  const messages = allMsgs[model] ?? []
  const modelObj = MODELS.find(m => m.id === model)!
  const modelTrialDone = !isPro && trialUsed.includes(model)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMsgs, loading, model])

  const send = async () => {
    if (!input.trim() || loading) return
    if (modelTrialDone) { setShowGate(true); return }

    const userMsg: Msg = { role: "user", content: input.trim() }
    const prev = allMsgs[model] ?? []
    const updated = [...prev, userMsg]
    setAllMsgs(m => ({ ...m, [model]: updated }))
    setInput("")
    setLoading(true)

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: updated, model }),
      })
      const data = await res.json()

      if (data.error === "UPGRADE_REQUIRED") {
        setTrialUsed(t => [...new Set([...t, model])])
        setShowGate(true)
        return
      }

      if (data.error === "QUOTA_EXCEEDED" || data.error === "AI_ERROR") {
        setAllMsgs(m => ({ ...m, [model]: [...updated, { role: "assistant", content: "Service temporarily unavailable. Please try again shortly." }] }))
        return
      }

      setAllMsgs(m => ({ ...m, [model]: [...updated, { role: "assistant", content: data.reply ?? "No response — please try again." }] }))
      if (data.trialModelsUsed) setTrialUsed(data.trialModelsUsed)
    } catch {
      setAllMsgs(m => ({ ...m, [model]: [...updated, { role: "assistant", content: "Something went wrong. Please try again." }] }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>

      {/* Gate modal */}
      {showGate && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{
            background: "#0f0f1c", borderRadius: "20px",
            border: "1px solid rgba(139,92,246,0.3)",
            padding: "36px", maxWidth: "400px", width: "100%", position: "relative",
          }}>
            <button onClick={() => setShowGate(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}>
              <X size={16} />
            </button>
            <Crown size={28} color="#8b5cf6" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "8px" }}>
              Free trial used for {modelObj.name}
            </h3>
            <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7, marginBottom: "20px" }}>
              You&apos;ve used your 1 free message for this model. Try another model, or join early access to get unlimited messages.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              {MODELS.filter(m => m.id !== model && !trialUsed.includes(m.id)).map(m => (
                <button key={m.id} onClick={() => { setModel(m.id); setShowGate(false) }} style={{
                  padding: "7px 14px", borderRadius: "8px", border: `1px solid ${m.color}30`,
                  background: `${m.color}12`, fontSize: "12.5px", fontWeight: 600,
                  color: m.color, cursor: "pointer",
                }}>
                  Try {m.name}
                </button>
              ))}
            </div>
            <a href="/pricing" style={{
              display: "block", width: "100%", padding: "12px", borderRadius: "12px",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff",
              fontSize: "14px", fontWeight: 700, textAlign: "center", textDecoration: "none",
              boxSizing: "border-box",
            }}>
              Join Early Access — ₹199/month →
            </a>
          </div>
        </div>
      )}

      {/* Model selector */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", gap: "8px", flexWrap: "wrap",
      }}>
        {MODELS.map(m => {
          const Icon = m.icon
          const used = !isPro && trialUsed.includes(m.id)
          const active = m.id === model
          return (
            <button key={m.id} onClick={() => setModel(m.id)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 14px", borderRadius: "10px", border: "none",
              cursor: "pointer", transition: "all 0.15s",
              background: active ? `${m.color}14` : "rgba(255,255,255,0.04)",
              outline: active ? `1px solid ${m.color}40` : "none",
              opacity: used && !active ? 0.6 : 1,
            }}>
              <Icon size={13} color={m.color} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: active ? m.color : "#7878a8" }}>{m.name}</span>
              {used ? (
                <span style={{ fontSize: "10px", color: "#4a4a6a", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>Used</span>
              ) : (
                <span style={{ fontSize: "10px", color: m.color, background: `${m.color}14`, padding: "2px 6px", borderRadius: "4px" }}>1 free</span>
              )}
            </button>
          )
        })}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#4a4a6a" }}>
          <AlertCircle size={12} />
          {isPro ? "Pro — unlimited" : `${4 - trialUsed.filter(id => MODELS.some(m => m.id === id)).length} of 4 models remaining`}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px", margin: "0 auto 16px",
              background: `${modelObj.color}14`, border: `1px solid ${modelObj.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <modelObj.icon size={24} color={modelObj.color} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#ededff", marginBottom: "6px" }}>{modelObj.name}</p>
            <p style={{ fontSize: "13px", color: "#7878a8" }}>{modelObj.desc} · {modelObj.provider}</p>
            {!isPro && !trialUsed.includes(model) && (
              <div style={{
                marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "100px",
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                fontSize: "12px", fontWeight: 600, color: "#f59e0b",
              }}>
                <AlertCircle size={12} /> 1 free message with this model
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0,
                background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : `${modelObj.color}14`,
                border: msg.role === "assistant" ? `1px solid ${modelObj.color}30` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {msg.role === "user" ? <User size={13} color="#fff" /> : <Bot size={13} color={modelObj.color} />}
              </div>
              <div style={{
                maxWidth: "72%", padding: "12px 16px",
                borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "rgba(15,15,28,0.9)",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none",
                fontSize: "14px", lineHeight: 1.7, color: "#ededff",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0,
                background: `${modelObj.color}14`, border: `1px solid ${modelObj.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={13} color={modelObj.color} />
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: "4px 14px 14px 14px",
                background: "rgba(15,15,28,0.9)", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: "6px", alignItems: "center",
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: modelObj.color, opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {modelTrialDone ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderRadius: "12px",
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={14} color="#8b5cf6" />
              <span style={{ fontSize: "13.5px", color: "#ededff", fontWeight: 600 }}>
                Trial used for {modelObj.name}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {MODELS.filter(m => !trialUsed.includes(m.id)).slice(0,2).map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} style={{
                  padding: "6px 12px", borderRadius: "8px", border: "none",
                  fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  color: m.color, background: `${m.color}14`,
                }}>Try {m.name}</button>
              ))}
              <a href="/pricing" style={{
                padding: "6px 14px", borderRadius: "8px",
                fontSize: "12px", fontWeight: 700, color: "#fff", textDecoration: "none",
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              }}>Early Access</a>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", padding: "10px 14px",
          }}>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px" }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything… (Enter to send)"
              rows={1}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#ededff", fontSize: "14px", lineHeight: 1.6, resize: "none", fontFamily: "inherit", padding: "4px 0", maxHeight: "160px" }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              width: "34px", height: "34px", borderRadius: "9px", border: "none",
              background: input.trim() && !loading ? `linear-gradient(135deg,${modelObj.color},${modelObj.color}99)` : "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0,
            }}>
              <Send size={14} color={input.trim() && !loading ? "#fff" : "#4a4a6a"} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}

function WorkflowsView() {
  const [filter, setFilter] = useState("All")
  const cats = ["All", "Research", "Biology", "Flywheel", "Write"]
  const filtered = filter === "All" ? WORKFLOWS : WORKFLOWS.filter(w => w.cat === filter)

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff" }}>Workflows</h2>
        <span style={{ fontSize: "12px", color: "#4a4a6a" }}>1000+ available at launch</span>
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "12.5px", fontWeight: 600,
            color: filter === c ? "#ededff" : "#7878a8",
            background: filter === c ? "rgba(255,255,255,0.1)" : "transparent",
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
        {filtered.map((w, i) => (
          <div key={i} style={{
            padding: "20px", borderRadius: "12px",
            background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: `3px solid ${w.color}`, cursor: "pointer",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: w.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{w.cat}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "6px" }}>{w.name}</div>
            <div style={{ fontSize: "12.5px", color: "#7878a8", marginBottom: "14px" }}>{w.desc}</div>
            <button style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "12px", fontWeight: 600, color: w.color,
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              <Play size={11} fill={w.color} /> Run workflow
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntegrationsView({ connected, setConnected }: { connected: Record<string, boolean>; setConnected: (v: Record<string, boolean>) => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState("")

  const saveKey = (k: string) => {
    if (typeof window !== "undefined") localStorage.setItem(`veil_key_${k}`, keys[k] ?? "")
    setConnected({ ...connected, [k]: !!(keys[k]) })
    setSaved(k)
    setTimeout(() => setSaved(""), 2000)
  }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Integrations</h2>
      <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "28px" }}>Connect your tools once — credentials sync to every agent and session.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {INTEGRATIONS_LIST.map(intg => {
          const Icon  = intg.icon
          const isConn = connected[intg.key]
          return (
            <div key={intg.key} style={{
              padding: "20px 24px", borderRadius: "14px",
              background: "rgba(15,15,28,0.8)",
              border: `1px solid ${isConn ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: keys[intg.key] !== undefined ? "14px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color={isConn ? intg.color : "#4a4a6a"} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff" }}>{intg.name}</div>
                    <div style={{ fontSize: "12px", color: "#7878a8" }}>{intg.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isConn && <span style={{ fontSize: "11px", color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "3px 10px", borderRadius: "100px", fontWeight: 700 }}>Connected</span>}
                  <button
                    onClick={() => setKeys(k => ({ ...k, [intg.key]: k[intg.key] !== undefined ? undefined as unknown as string : "" }))}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)", fontSize: "12.5px", fontWeight: 600,
                      color: "#7878a8", cursor: "pointer",
                    }}
                  >{keys[intg.key] !== undefined ? "Cancel" : isConn ? "Update key" : "Connect"}</button>
                </div>
              </div>
              {keys[intg.key] !== undefined && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type={show[intg.key] ? "text" : "password"}
                      placeholder={`Paste your ${intg.name} API key`}
                      value={keys[intg.key]}
                      onChange={e => setKeys(k => ({ ...k, [intg.key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 36px 10px 12px", borderRadius: "10px", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ededff", fontSize: "13px", outline: "none",
                      }}
                    />
                    <button onClick={() => setShow(s => ({ ...s, [intg.key]: !s[intg.key] }))} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}>
                      {show[intg.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={() => saveKey(intg.key)} style={{
                    padding: "10px 16px", borderRadius: "10px", border: "none",
                    background: saved === intg.key ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    color: saved === intg.key ? "#10b981" : "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    {saved === intg.key ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComputeView() {
  const profiles = [
    { name: "CPU Session",    cores: "2 vCPU",   ram: "8 GB",    gpu: "None",         price: "Free", color: "#10b981", active: true },
    { name: "GPU Starter",    cores: "8 vCPU",   ram: "32 GB",   gpu: "1× A10G",      price: "₹12/hr", color: "#3b82f6", active: false },
    { name: "GPU Pro",        cores: "16 vCPU",  ram: "64 GB",   gpu: "1× A100 40GB", price: "₹40/hr", color: "#8b5cf6", active: false },
    { name: "Multi-GPU",      cores: "32 vCPU",  ram: "128 GB",  gpu: "4× A100 80GB", price: "₹150/hr", color: "#f59e0b", active: false },
  ]
  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Compute</h2>
      <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "28px" }}>Scale from CPU sessions to multi-GPU clusters without changing your workflow.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "14px", marginBottom: "32px" }}>
        {profiles.map(p => (
          <div key={p.name} style={{
            padding: "24px", borderRadius: "16px",
            background: p.active ? `${p.color}10` : "rgba(15,15,28,0.8)",
            border: `1px solid ${p.active ? p.color + "40" : "rgba(255,255,255,0.07)"}`,
            borderTop: `2px solid ${p.color}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#ededff" }}>{p.name}</span>
              {p.active && <span style={{ fontSize: "10px", color: p.color, background: `${p.color}14`, padding: "3px 8px", borderRadius: "100px", fontWeight: 700 }}>Active</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              {[["CPU", p.cores], ["RAM", p.ram], ["GPU", p.gpu]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#7878a8" }}>{k}</span>
                  <span style={{ color: "#ededff", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: p.color }}>{p.price}</span>
              {!p.active && (
                <button style={{
                  padding: "5px 12px", borderRadius: "7px", border: `1px solid ${p.color}30`,
                  background: `${p.color}10`, fontSize: "12px", fontWeight: 600,
                  color: p.color, cursor: "pointer",
                }}>Select</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>
          <AlertCircle size={14} /> GPU provisioning available at Pro plan launch — ₹199/month
        </div>
      </div>
    </div>
  )
}

function EvaluationsView() {
  const evals = [
    { name: "MMLU Benchmark",    model: "GPT-4o",      status: "completed", score: "87.4%",  color: "#10b981" },
    { name: "HumanEval",         model: "GPT-4o mini", status: "completed", score: "74.2%",  color: "#10b981" },
    { name: "MATH Benchmark",    model: "DeepSeek R1", status: "running",   score: "--",     color: "#f59e0b" },
    { name: "Custom SFT Eval",   model: "Llama 3 70B", status: "queued",    score: "--",     color: "#7878a8" },
  ]
  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "4px" }}>Evaluations</h2>
          <p style={{ fontSize: "13px", color: "#7878a8" }}>Run automated benchmarks across models.</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "9px 18px", borderRadius: "10px", border: "none",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer",
        }}><Plus size={14} /> New Evaluation</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {evals.map((e, i) => (
          <div key={i} style={{
            padding: "18px 22px", borderRadius: "12px",
            background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff" }}>{e.name}</div>
              <div style={{ fontSize: "12px", color: "#7878a8" }}>{e.model}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: e.color }}>{e.score}</div>
              <div style={{ fontSize: "11px", color: "#4a4a6a", textTransform: "capitalize" }}>{e.status}</div>
            </div>
            <ChevronRight size={14} color="#4a4a6a" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsView({ email }: { email: string }) {
  const [name,      setName]      = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_name") ?? "" : "")
  const [openaiKey, setOpenaiKey] = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_key_openai") ?? "" : "")
  const [nvidiaKey, setNvidiaKey] = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_key_nvidia") ?? "" : "")
  const [showKeys,  setShowKeys]  = useState(false)
  const [saved,     setSaved]     = useState(false)
  const router = useRouter()

  const save = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("veil_name", name)
      localStorage.setItem("veil_key_openai", openaiKey)
      localStorage.setItem("veil_key_nvidia", nvidiaKey)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%", maxWidth: "600px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "28px" }}>Settings</h2>

      {/* Profile */}
      <Section title="Profile">
        <Field label="Display Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
            style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={email} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
        </Field>
      </Section>

      {/* API Keys */}
      <Section title="API Keys" subtitle="Stored locally on this device — not sent to our servers.">
        <Field label="OpenAI API Key">
          <div style={{ position: "relative" }}>
            <input type={showKeys ? "text" : "password"} value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..."
              style={{ ...inputStyle, paddingRight: "40px" }} />
            <button onClick={() => setShowKeys(s => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}>
              {showKeys ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
        <Field label="NVIDIA API Key">
          <input type={showKeys ? "text" : "password"} value={nvidiaKey} onChange={e => setNvidiaKey(e.target.value)} placeholder="nvapi-..."
            style={inputStyle} />
        </Field>
      </Section>

      <button onClick={save} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "11px 24px", borderRadius: "11px", border: "none",
        background: saved ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
        color: saved ? "#10b981" : "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
        marginBottom: "32px",
      }}>
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save changes</>}
      </button>

      {/* Danger */}
      <Section title="Account" subtitle="">
        <button onClick={signOut} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "10px",
          border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
          fontSize: "13.5px", fontWeight: 600, color: "#ef4444", cursor: "pointer",
        }}>
          <LogOut size={14} /> Sign out
        </button>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ededff", marginBottom: "2px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: "#4a4a6a" }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginTop: "24px" }} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#7878a8", display: "block", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px", boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#ededff", fontSize: "14px", outline: "none",
}

function NotificationsView() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff" }}>Notifications</h2>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{
          padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)", fontSize: "12.5px", fontWeight: 600,
          color: "#7878a8", cursor: "pointer",
        }}>Mark all read</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {notifs.map(n => {
          const Icon = n.icon
          return (
            <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{
              padding: "16px 20px", borderRadius: "12px", cursor: "pointer",
              background: n.read ? "rgba(10,10,18,0.6)" : "rgba(15,15,28,0.9)",
              border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
              display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                background: `${n.color}14`, border: `1px solid ${n.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color={n.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ededff" }}>{n.title}</span>
                  {!n.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: "13px", color: "#7878a8", lineHeight: 1.6 }}>{n.body}</div>
                <div style={{ fontSize: "11.5px", color: "#4a4a6a", marginTop: "6px" }}>{n.time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileView({ email, trialModelsUsed, isPro }: { email: string; trialModelsUsed: string[]; isPro: boolean }) {
  const initials = email.slice(0, 2).toUpperCase()
  const modelsUsed = MODELS.filter(m => trialModelsUsed.includes(m.id))

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "28px" }}>Profile</h2>

      {/* Avatar + info */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", fontWeight: 800, color: "#fff",
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "4px" }}>
            {typeof window !== "undefined" ? localStorage.getItem("veil_name") || email.split("@")[0] : email.split("@")[0]}
          </div>
          <div style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "8px" }}>{email}</div>
          <span style={{
            padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
            color: isPro ? "#10b981" : "#f59e0b",
            background: isPro ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${isPro ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
          }}>
            {isPro ? "Pro" : "Early Access"}
          </span>
        </div>
      </div>

      {/* Plan */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "12px" }}>PLAN</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#ededff" }}>{isPro ? "Veil Pro" : "Free Trial"}</div>
            <div style={{ fontSize: "13px", color: "#7878a8", marginTop: "2px" }}>
              {isPro ? "Unlimited access to all models & modes" : "1 free message per model · ₹199/month at launch"}
            </div>
          </div>
          {!isPro && (
            <a href="/pricing" style={{
              padding: "8px 18px", borderRadius: "9px",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none",
            }}>Upgrade →</a>
          )}
        </div>
      </div>

      {/* Usage */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "16px" }}>MODELS TRIED</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {MODELS.map(m => {
            const Icon  = m.icon
            const tried = trialModelsUsed.includes(m.id)
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={15} color={tried ? m.color : "#4a4a6a"} />
                  <span style={{ fontSize: "13.5px", color: tried ? "#ededff" : "#4a4a6a", fontWeight: tried ? 600 : 400 }}>{m.name}</span>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  color: tried ? "#10b981" : "#4a4a6a",
                  background: tried ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                  padding: "3px 10px", borderRadius: "100px",
                }}>{tried ? "✓ Tried" : "Not used"}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const [authLoading,      setAuthLoading]      = useState(true)
  const [userEmail,        setUserEmail]        = useState("")
  const [isPro,            setIsPro]            = useState(false)
  const [trialModelsUsed,  setTrialModelsUsed]  = useState<string[]>([])
  const [activeMode,       setActiveMode]       = useState("research")
  const [view,             setView]             = useState<View>("sessions")
  const [connected,        setConnected]        = useState<Record<string, boolean>>({})
  const [unreadCount,      setUnreadCount]      = useState(MOCK_NOTIFS.filter(n => !n.read).length)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [accessToken,      setAccessToken]      = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/login?next=/dashboard"); return }
      const token = session.access_token
      setAccessToken(token)
      setUserEmail(session.user.email ?? "")
      const res = await fetch("/api/subscription/status", {
        headers: { "Authorization": `Bearer ${token}` },
      })
      const d = await res.json()
      setIsPro(d.status === "active")
      setTrialModelsUsed(d.trialModelsUsed ?? [])
      setAuthLoading(false)
    })
  }, [router])

  if (authLoading) return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const mode = MODES.find(m => m.id === activeMode)!
  const ModeIcon = mode.icon

  const NAV = [
    { id: "sessions",      label: "Sessions",     icon: Terminal  },
    { id: "workflows",     label: "Workflows",    icon: Zap       },
    { id: "integrations",  label: "Integrations", icon: GitBranch },
    { id: "compute",       label: "Compute",      icon: Server    },
    { id: "evaluations",   label: "Evaluations",  icon: BarChart3 },
  ] as const

  const BOTTOM_NAV = [
    { id: "settings",      label: "Settings",      icon: Settings, badge: 0 },
    { id: "notifications", label: "Notifications", icon: Bell,     badge: unreadCount },
    { id: "profile",       label: "Profile",       icon: User,     badge: 0 },
  ] as const

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#050508", overflow: "hidden" }}>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="resp-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`resp-sidebar${sidebarOpen ? " sidebar-open" : ""}`} style={{
        width: "220px", flexShrink: 0,
        background: "rgba(10,10,18,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", padding: "16px 12px",
      }}>
        {/* Mode selector */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "6px" }}>MODE</div>
          {MODES.map(m => {
            const Icon   = m.icon
            const active = m.id === activeMode
            return (
              <button key={m.id} onClick={() => { setActiveMode(m.id); setSidebarOpen(false) }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", borderRadius: "9px", border: "none",
                marginBottom: "2px", cursor: "pointer", textAlign: "left",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                color: active ? m.color : "#7878a8",
                background: active ? m.bg : "transparent",
              }}>
                <Icon size={14} color={active ? m.color : "#4a4a6a"} />
                {m.label}
                {active && <span style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: m.color }} />}
              </button>
            )
          })}
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />

        {/* Main nav */}
        <div style={{ marginBottom: "auto" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "6px" }}>WORKSPACE</div>
          {NAV.map(item => {
            const Icon   = item.icon
            const active = view === item.id
            return (
              <button key={item.id} onClick={() => { setView(item.id as View); setSidebarOpen(false) }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", borderRadius: "9px", border: "none",
                marginBottom: "2px", cursor: "pointer", textAlign: "left",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                color: active ? "#ededff" : "#7878a8",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
              }}>
                <Icon size={14} color={active ? "#ededff" : "#4a4a6a"} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
          {BOTTOM_NAV.map(item => {
            const Icon   = item.icon
            const active = view === item.id
            return (
              <button key={item.id} onClick={() => {
                setView(item.id as View)
                if (item.id === "notifications") setUnreadCount(0)
                setSidebarOpen(false)
              }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", borderRadius: "9px", border: "none",
                marginBottom: "2px", cursor: "pointer", textAlign: "left",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                color: active ? "#ededff" : "#7878a8",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                position: "relative",
              }}>
                <Icon size={14} color={active ? "#ededff" : "#4a4a6a"} />
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: "auto", minWidth: "18px", height: "18px", borderRadius: "9px",
                    background: "#8b5cf6", fontSize: "10px", fontWeight: 700, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                  }}>{item.badge}</span>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,8,16,0.8)", backdropFilter: "blur(12px)", flexShrink: 0,
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
              width: "28px", height: "28px", borderRadius: "8px",
              background: mode.bg, border: `1px solid ${mode.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ModeIcon size={14} color={mode.color} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", textTransform: "capitalize" }}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </span>
            <span style={{ fontSize: "12px", color: "#4a4a6a" }}>· {mode.label} Mode</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              padding: "4px 12px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 700,
              color: isPro ? "#10b981" : "#f59e0b",
              background: isPro ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${isPro ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
            }}>{isPro ? "Pro" : "Free Trial"}</span>
            <div style={{
              width: "30px", height: "30px", borderRadius: "9px",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 800, color: "#fff",
            }}>{userEmail.slice(0, 2).toUpperCase()}</div>
          </div>
        </div>

        {/* View content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {view === "sessions"     && <SessionsView trialModelsUsed={trialModelsUsed} isPro={isPro} userEmail={userEmail} accessToken={accessToken} />}
          {view === "workflows"    && <WorkflowsView />}
          {view === "integrations" && <IntegrationsView connected={connected} setConnected={setConnected} />}
          {view === "compute"      && <ComputeView />}
          {view === "evaluations"  && <EvaluationsView />}
          {view === "settings"     && <SettingsView email={userEmail} />}
          {view === "notifications"&& <NotificationsView />}
          {view === "profile"      && <ProfileView email={userEmail} trialModelsUsed={trialModelsUsed} isPro={isPro} />}
        </div>
      </div>
    </div>
  )
}
