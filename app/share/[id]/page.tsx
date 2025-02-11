"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Msg = { role: string; content: string }
type SharedChat = { messages: Msg[]; model: string; title: string; updated_at: string }

export default function SharePage() {
  const params    = useParams()
  const id        = params?.id as string
  const [chat,     setChat]     = useState<SharedChat | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/sessions/${id}`, { headers: { Authorization: "Bearer public" } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data.is_public) { setNotFound(true); return }
        setChat({ messages: data.messages ?? [], model: data.model, title: data.title, updated_at: data.updated_at })
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (!chat && !notFound) return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "18px", margin: "0 auto 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🔗</div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#ededff", marginBottom: "10px" }}>Session not found</h1>
        <p style={{ fontSize: "14.5px", color: "#7878a8", lineHeight: 1.7, marginBottom: "28px" }}>This link is invalid or the session is no longer public.</p>
        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "12px", textDecoration: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
          Open dashboard
        </a>
      </div>
    </div>
  )

  const date = chat ? new Date(chat.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#ededff" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#ededff" }}>Veil<span style={{ color: "#8b5cf6" }}>.</span></span>
            </a>
            <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.12)", display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#7878a8" }}>{chat?.title ?? "Shared Session"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 700, color: "#8b5cf6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>{chat?.model}</span>
            <span style={{ fontSize: "12px", color: "#4a4a6a" }}>{date}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 64px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {chat?.messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "rgba(139,92,246,0.12)", border: msg.role === "assistant" ? "1px solid rgba(139,92,246,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
              {msg.role === "user" ? "U" : "AI"}
            </div>
            <div style={{ maxWidth: "72%", padding: "14px 18px", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "rgba(15,15,28,0.9)", border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none", fontSize: "14.5px", lineHeight: 1.7, color: "#ededff", wordBreak: "break-word" }}>
              {msg.role === "assistant"
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                : <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
              }
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.9)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "12px" }}>Shared from Veil Research</p>
        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "10px", textDecoration: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "13.5px", fontWeight: 700 }}>
          Open your workspace →
        </a>
      </div>
    </div>
  )
}
