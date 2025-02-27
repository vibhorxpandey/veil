"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function LoginContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const next    = params.get("next") ?? "/dashboard"

  const [tab,      setTab]      = useState<"password" | "magic">("password")
  const [mode,     setMode]     = useState<"signin" | "signup">("signin")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState(
    params.get("error") === "link_expired" ? "That link expired — request a new one." : ""
  )
  const [success,  setSuccess]  = useState("")

  // ── Password auth ──────────────────────────────────────────────────────────
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)

    try {
      if (mode === "signup") {
        if (password !== confirm) { setError("Passwords don't match."); setLoading(false); return }
        if (password.length < 6)  { setError("Password must be at least 6 characters."); setLoading(false); return }

        const res  = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const json = await res.json()
        if (json.error) { setError(json.error); setLoading(false); return }

        // Account ready — sign in immediately
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) { setError(signInErr.message); setLoading(false); return }
        router.replace(next)
        return
      }

      // Sign in existing account
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        if (err.message.toLowerCase().includes("not confirmed")) {
          // Auto-fix unconfirmed account then sign in again
          await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          const { error: retryErr } = await supabase.auth.signInWithPassword({ email, password })
          if (retryErr) { setError("Wrong email or password."); setLoading(false); return }
          router.replace(next)
          return
        }
        setError(
          err.message.toLowerCase().includes("invalid")
            ? "Wrong email or password."
            : err.message
        )
        setLoading(false)
        return
      }
      router.replace(next)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // ── Magic link ─────────────────────────────────────────────────────────────
  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `https://veilresearch.com/auth/callback?next=${next}` },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSent(true); setLoading(false)
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#050508", padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "#0f0f1c", borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        padding: "36px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", justifyContent: "center" }}>
          <img src="/logo.png" alt="Veil" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#ededff" }}>Veil</span>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: "4px", padding: "4px",
          background: "rgba(255,255,255,0.04)", borderRadius: "12px",
          marginBottom: "28px",
        }}>
          {(["password", "magic"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSent(false) }} style={{
              flex: 1, padding: "8px", borderRadius: "9px", border: "none",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              color: tab === t ? "#ededff" : "#7878a8",
              background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
            }}>
              {t === "password" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        {/* Error / success banners */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 14px", borderRadius: "10px", marginBottom: "16px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            fontSize: "13px", color: "#ef4444",
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 14px", borderRadius: "10px", marginBottom: "16px",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            fontSize: "13px", color: "#10b981",
          }}>
            <Check size={14} /> {success}
          </div>
        )}

        {/* ── Password tab ──────────────────────────────────────────────── */}
        {tab === "password" && (
          <>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "4px", textAlign: "center" }}>
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p style={{ fontSize: "13px", color: "#7878a8", textAlign: "center", marginBottom: "24px" }}>
              {mode === "signin" ? "Sign in with your email and password" : "Choose a password for your account"}
            </p>

            <form onSubmit={handlePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Email */}
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#4a4a6a" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  style={inputSt}
                />
              </div>

              {/* Password */}
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#4a4a6a" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  style={{ ...inputSt, paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Confirm password (sign up only) */}
              {mode === "signup" && (
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#4a4a6a" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type={showPw ? "text" : "password"} value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm password" required
                    style={inputSt}
                  />
                </div>
              )}

              <button type="submit" disabled={loading || !email || !password} style={{
                padding: "13px", borderRadius: "12px", border: "none",
                fontSize: "15px", fontWeight: 700, color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                opacity: loading || !email || !password ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                {loading ? "Please wait…" : mode === "signin" ? <>Sign in <ArrowRight size={15} /></> : "Create account"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "18px" }}>
              <button onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(""); setSuccess("") }} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", color: "#7878a8",
              }}>
                {mode === "signin"
                  ? <>No account? <span style={{ color: "#8b5cf6" }}>Create one →</span></>
                  : <>Already have one? <span style={{ color: "#8b5cf6" }}>Sign in →</span></>
                }
              </button>
            </div>
          </>
        )}

        {/* ── Magic link tab ────────────────────────────────────────────── */}
        {tab === "magic" && (
          <>
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px", margin: "0 auto 16px",
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={24} color="#10b981" />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "8px" }}>Check your inbox</h2>
                <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.65 }}>
                  Magic link sent to <strong style={{ color: "#ededff" }}>{email}</strong>.
                  Click it to sign in — valid for 60 minutes.
                </p>
                <button onClick={() => setSent(false)} style={{
                  marginTop: "16px", background: "none", border: "none",
                  cursor: "pointer", fontSize: "12.5px", color: "#8b5cf6",
                }}>
                  Send to a different email →
                </button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "4px", textAlign: "center" }}>Sign in with link</h1>
                <p style={{ fontSize: "13px", color: "#7878a8", textAlign: "center", marginBottom: "24px" }}>We&apos;ll email you a one-time link — no password needed.</p>
                <form onSubmit={handleMagic} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} color="#4a4a6a" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required
                      style={inputSt}
                    />
                  </div>
                  <button type="submit" disabled={loading || !email} style={{
                    padding: "13px", borderRadius: "12px", border: "none",
                    fontSize: "15px", fontWeight: 700, color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    opacity: loading || !email ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    {loading ? "Sending…" : <>Send magic link <ArrowRight size={15} /></>}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "#2d2d4e", marginTop: "24px" }}>
          By signing in you agree to our terms · veilresearch.com
        </p>
      </div>
    </div>
  )
}

const inputSt: React.CSSProperties = {
  width: "100%", padding: "12px 14px 12px 40px", borderRadius: "11px",
  fontSize: "14px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", color: "#ededff",
  outline: "none", boxSizing: "border-box",
}

export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
