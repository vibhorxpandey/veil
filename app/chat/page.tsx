"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Send, BookOpen, Dna, RefreshCw, PenLine,
  Sparkles, Zap, Crown, Lock, Mail,
  RotateCcw, User, Bot, AlertCircle, Check, X, ArrowRight, Download, Share2, Mic
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ───────────────────────────────────────────────────────────────────

type Source   = { title: string; url: string; content: string }
type Message  = { role: "user" | "assistant"; content: string; sources?: Source[]; searchQuery?: string }
type SubState = { status: string; freeTrialUsed: boolean; email: string }

// ─── Sources Panel ────────────────────────────────────────────────────────────

function SourcesPanel({ sources, searchQuery }: { sources: Source[]; searchQuery?: string }) {
  if (!sources.length) return null
  return (
    <div style={{ marginTop: "10px" }}>
      {/* Searched label */}
      {searchQuery && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", color: "#4a4a6a" }}>🔍</span>
          <span style={{ fontSize: "11px", color: "#4a4a6a", fontStyle: "italic" }}>
            Searched: <span style={{ color: "#7878a8" }}>{searchQuery}</span>
          </span>
        </div>
      )}
      {/* Sources header */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
        <span style={{ fontSize: "13px" }}>🌐</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#7878a8", letterSpacing: ".06em", textTransform: "uppercase" }}>Sources</span>
      </div>
      {/* Cards — horizontal scroll on mobile */}
      <div style={{
        display: "flex", gap: "10px",
        overflowX: "auto", paddingBottom: "6px",
        scrollbarWidth: "none",
      }}>
        <style>{`.src-card:hover { border-color: rgba(139,92,246,0.45) !important; transform: translateY(-1px); }`}</style>
        {sources.map((s, i) => {
          let domain = ""
          try { domain = new URL(s.url).hostname.replace("www.", "") } catch { domain = s.url }
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="src-card"
              style={{
                flexShrink: 0, width: "200px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(10,10,20,0.8)",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                display: "flex", flexDirection: "column", gap: "6px",
                transition: "border-color 0.2s, transform 0.15s",
                animation: `fadeUp 0.3s ease ${i * 0.07}s both`,
              }}
            >
              {/* favicon + domain */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={favicon} alt="" width={14} height={14} style={{ borderRadius: "3px", flexShrink: 0 }} />
                <span style={{ fontSize: "10.5px", color: "#4a4a6a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{domain}</span>
                <span style={{ marginLeft: "auto", fontSize: "10px", color: "#3a3a5a", fontWeight: 700 }}>[{i + 1}]</span>
              </div>
              {/* title */}
              <span style={{
                fontSize: "12px", fontWeight: 700, color: "#c4c4e8", lineHeight: 1.4,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {s.title}
              </span>
              {/* snippet */}
              <span style={{
                fontSize: "11px", color: "#4a4a6a", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {s.content}
              </span>
            </a>
          )
        })}
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

// ─── Models ──────────────────────────────────────────────────────────────────

const MODELS = [
  { id: "gpt-4o",      name: "GPT-4o",       provider: "OpenAI",        color: "#10a37f", desc: "Best overall performance",  icon: Sparkles },
  { id: "gpt-4o-mini", name: "GPT-4o mini",  provider: "OpenAI",        color: "#10a37f", desc: "Fast & cost-efficient",     icon: Zap },
  { id: "llama-3-70b", name: "Llama 3 70B",  provider: "Meta / NVIDIA", color: "#3b82f6", desc: "Open-source powerhouse",    icon: BookOpen },
  { id: "deepseek-r1", name: "DeepSeek R1",  provider: "DeepSeek",      color: "#8b5cf6", desc: "Advanced reasoning",        icon: Dna },
]

// ─── Markdown renderer ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          return match ? (
            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
              customStyle={{ borderRadius: "8px", fontSize: "13px", margin: "8px 0", background: "rgba(0,0,0,0.4)" }}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code style={{ background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.88em", fontFamily: "monospace" }} {...props}>
              {children}
            </code>
          )
        },
        p: ({ children }: any) => <p style={{ margin: "0 0 10px", lineHeight: 1.7, lastChild: "none" } as any}>{children}</p>,
        h1: ({ children }: any) => <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#ededff", margin: "14px 0 8px" }}>{children}</h1>,
        h2: ({ children }: any) => <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ededff", margin: "12px 0 6px" }}>{children}</h2>,
        h3: ({ children }: any) => <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", margin: "10px 0 6px" }}>{children}</h3>,
        ul: ({ children }: any) => <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ul>,
        ol: ({ children }: any) => <ol style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ol>,
        li: ({ children }: any) => <li style={{ marginBottom: "4px" }}>{children}</li>,
        blockquote: ({ children }: any) => (
          <blockquote style={{ borderLeft: "3px solid #8b5cf6", paddingLeft: "12px", margin: "8px 0", color: "#7878a8", fontStyle: "italic" }}>
            {children}
          </blockquote>
        ),
        a: ({ href, children }: any) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>{children}</a>
        ),
        table: ({ children }: any) => (
          <div style={{ overflowX: "auto", margin: "8px 0" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "13px", width: "100%" }}>{children}</table>
          </div>
        ),
        th: ({ children }: any) => <th style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", background: "rgba(255,255,255,0.06)", fontWeight: 700 }}>{children}</th>,
        td: ({ children }: any) => <td style={{ border: "1px solid rgba(255,255,255,0.07)", padding: "6px 12px" }}>{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

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
              Check your inbox — Vibhor has sent you a note about what&apos;s coming.
              You&apos;ll get priority access at <strong style={{ color: "#ededff" }}>₹199/month</strong> when payments go live.
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
              Your free message has been used. Payments are launching soon at ₹199/month —
              join the early access list and we&apos;ll notify you the instant it&apos;s ready.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {[
                "Unlimited messages across all models",
                "GPT-4o, Llama 3, DeepSeek R1 access",
                "All 4 research modes unlocked",
                "GPU compute and workflow execution",
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
              No spam · You&apos;ll receive a personal note from Vibhor, founder of Veil
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
  const [accessToken,   setAccessToken]   = useState("")
  const [shareFeedback, setShareFeedback] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isListening,   setIsListening]   = useState(false)
  const recognitionRef  = useRef<any>(null)
  const [temperature,   setTemperature]   = useState(0.7)
  const [searchQuery,   setSearchQuery]   = useState("")

  // Load history when model changes
  useEffect(() => {
    const saved = localStorage.getItem(`veil_history_${selectedModel}`)
    if (saved) { try { setMessages(JSON.parse(saved)) } catch { setMessages([]) } }
    else setMessages([])
  }, [selectedModel])

  // Fetch subscription status on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login?next=/chat"); return }
      const token = session.access_token
      setAccessToken(token)
      fetch("/api/subscription/status", {
        headers: { "Authorization": `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => {
          if (d.status === "unauthenticated") { router.push("/login?next=/chat"); return }
          setSubState(d)
          setSubLoading(false)
          if (params.get("subscribed") === "true") {
            setSubState(prev => prev ? { ...prev, status: "active" } : prev)
          }
        })
        .catch(() => setSubLoading(false))
    })
  }, [router, params])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Reset search when model changes
  useEffect(() => setSearchQuery(""), [selectedModel])

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (isListening) { recognitionRef.current?.stop(); return }
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + " " + transcript : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
    recognitionRef.current = recognition
  }

  const model = MODELS.find(m => m.id === selectedModel) ?? MODELS[1]

  const canSend = subState?.status === "active" || !subState?.freeTrialUsed

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || loading) return
    if (!canSend) { setShowUpgrade(true); return }

    const text = input.trim()
    const img  = attachedImage
    const userMsg: Message = { role: "user", content: img ? (text ? `${text}\n[Image attached]` : "[Image attached]") : text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setAttachedImage(null)
    setLoading(true)

    // Build the messages payload — vision format for images
    const apiMessages = history.map((m, i) => {
      if (i === history.length - 1 && img) {
        return {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: img } },
            ...(text ? [{ type: "text", text }] : []),
          ],
        }
      }
      return { role: m.role, content: m.content.replace(/\n\[Image attached\]$/, "") }
    })

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: apiMessages, model: selectedModel, temperature, webSearch: true }),
      })

      // JSON error (non-streaming)
      if (!res.ok || !res.headers.get("content-type")?.includes("text/plain")) {
        const data = await res.json()
        if (data.error === "UPGRADE_REQUIRED") { setShowUpgrade(true); return }
        const msg = data.error === "QUOTA_EXCEEDED"
          ? "Service temporarily at capacity. Please try again in a moment."
          : "Something went wrong. Please try again."
        setMessages([...history, { role: "assistant", content: msg }])
        return
      }

      // Parse sources + search query from headers
      let sources: Source[] = []
      let searchedQuery     = ""
      try {
        const raw = res.headers.get("X-Sources")
        if (raw) sources = JSON.parse(raw)
        const q = res.headers.get("X-Search-Query")
        if (q) searchedQuery = decodeURIComponent(q)
      } catch { /* non-fatal */ }

      // Stream the response
      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let content   = ""
      setLoading(false)
      setMessages(prev => [...prev, { role: "assistant", content: "", sources, searchQuery: searchedQuery }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content, sources, searchQuery: searchedQuery }
          return updated
        })
      }

      if (res.headers.get("X-Trial-Updated") === "true") {
        setSubState(prev => prev ? { ...prev, freeTrialUsed: true } : prev)
      }

      // Persist history
      const finalMsg = { role: "assistant" as const, content, sources, searchQuery: searchedQuery }
      localStorage.setItem(`veil_history_${selectedModel}`, JSON.stringify([...history, finalMsg]))
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

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === "k") {
        e.preventDefault()
        // Cycle to next model
        setSelectedModel(cur => {
          const idx = MODELS.findIndex(m => m.id === cur)
          return MODELS[(idx + 1) % MODELS.length].id
        })
      }
      if (meta && e.key === "/") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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
          <p style={{ color: "#7878a8", fontSize: "14px" }}>Setting up your workspace…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const isBlocked  = subState?.status !== "active" && subState?.freeTrialUsed
  const isPro      = subState?.status === "active"
  const trialLeft  = !isPro && !subState?.freeTrialUsed
  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

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
                : "Upgrade to keep chatting"
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

        {/* Temperature slider */}
        <div style={{ marginBottom: "16px", padding: "0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em" }}>CREATIVITY</span>
            <span style={{ fontSize: "11px", color: "#7878a8", fontWeight: 600 }}>{temperature.toFixed(1)}</span>
          </div>
          <input type="range" min="0" max="1" step="0.1" value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", color: "#4a4a6a" }}>Precise</span>
            <span style={{ fontSize: "10px", color: "#4a4a6a" }}>Creative</span>
          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const text = messages.map(m =>
                    `**${m.role === "user" ? "You" : model.name}:**\n${m.content}`
                  ).join("\n\n---\n\n")
                  const blob = new Blob([`# Veil Chat — ${model.name}\n_${new Date().toLocaleString()}_\n\n${text}`], { type: "text/markdown" })
                  const url  = URL.createObjectURL(blob)
                  const a    = document.createElement("a")
                  a.href = url; a.download = `veil-chat-${Date.now()}.md`; a.click()
                  URL.revokeObjectURL(url)
                }}
                title="Export chat as Markdown"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", color: "#7878a8", fontSize: "12px", fontWeight: 600,
                }}
              >
                <Download size={12} /> Export
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const id = crypto.randomUUID().slice(0, 8)
                  localStorage.setItem("veil_share_" + id, JSON.stringify({ messages, model: model.name, date: new Date().toISOString() }))
                  navigator.clipboard.writeText(`https://veilresearch.com/share/${id}`).then(() => {
                    setShareFeedback(true)
                    setTimeout(() => setShareFeedback(false), 2000)
                  }).catch(() => {})
                }}
                title="Share this chat"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: shareFeedback ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                  color: shareFeedback ? "#10b981" : "#7878a8", fontSize: "12px", fontWeight: 600,
                }}
              >
                {shareFeedback ? <><Check size={12} /> Link copied!</> : <><Share2 size={12} /> Share</>}
              </button>
            )}
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
        </div>

        {/* Search bar */}
        {messages.length > 0 && (
          <div style={{
            padding: "8px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <input
              placeholder="Search conversation…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "7px 12px", borderRadius: "8px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#ededff", fontSize: "13px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        )}

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

          {filteredMessages.map((msg, i) => (
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

              {/* Bubble + sources */}
              <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column" }}>
                <div style={{
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                    : "rgba(15,15,28,0.9)",
                  border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none",
                  fontSize: "14.5px",
                  lineHeight: 1.7,
                  color: "#ededff",
                  wordBreak: "break-word",
                }}>
                  {msg.role === "assistant"
                    ? <MarkdownMessage content={msg.content} />
                    : <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  }
                </div>
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <SourcesPanel sources={msg.sources} searchQuery={msg.searchQuery} />
                )}
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
                  Free trial complete — upgrade to keep going
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Image preview */}
              {attachedImage && (
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachedImage} alt="attached" style={{ maxHeight: "120px", maxWidth: "200px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={() => setAttachedImage(null)} style={{
                    position: "absolute", top: "4px", right: "4px",
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer",
                    color: "#ededff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                </div>
              )}
              <div style={{
                display: "flex", gap: "10px", alignItems: "flex-end",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px", padding: "10px 14px",
              }}>
                {/* Image upload */}
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => setAttachedImage(ev.target?.result as string)
                    reader.readAsDataURL(file)
                    e.target.value = ""
                  }}
                />
                <button onClick={() => imageInputRef.current?.click()} title="Attach image (GPT-4o)" style={{
                  width: "32px", height: "32px", borderRadius: "8px", border: "none", flexShrink: 0,
                  background: attachedImage ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)",
                  color: attachedImage ? "#8b5cf6" : "#4a4a6a", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                }}>🖼</button>
                <button onClick={toggleVoice} title="Voice input" style={{
                  width: "32px", height: "32px", borderRadius: "8px", border: "none", flexShrink: 0,
                  background: isListening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                  color: isListening ? "#ef4444" : "#4a4a6a", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Mic size={15} />
                </button>
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
                  disabled={loading || (!input.trim() && !attachedImage)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "10px", border: "none",
                    background: (input.trim() || attachedImage) && !loading
                      ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                      : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: (input.trim() || attachedImage) && !loading ? "pointer" : "not-allowed",
                    flexShrink: 0, transition: "all 0.15s",
                  }}>
                  <Send size={15} color={(input.trim() || attachedImage) && !loading ? "#fff" : "#4a4a6a"} />
                </button>
              </div>
            </div>
          )}
          <p style={{ textAlign: "center", fontSize: "11.5px", color: "#2d2d4e", marginTop: "10px" }}>
            Veil may produce errors. Always verify critical information.
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
