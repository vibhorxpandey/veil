"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState("Signing you in…")

  useEffect(() => {
    const run = async () => {
      // 1. Already have a session (e.g. password login redirected here)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { router.replace("/dashboard"); return }

      // 2. PKCE flow — code in query string
      const code = new URLSearchParams(window.location.search).get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { router.replace("/dashboard"); return }
      }

      // 3. Implicit flow — tokens in hash (older Supabase config)
      const hash   = new URLSearchParams(window.location.hash.slice(1))
      const access = hash.get("access_token")
      if (access) {
        // Let the Supabase listener pick it up
        await new Promise(r => setTimeout(r, 800))
        const { data: { session: s2 } } = await supabase.auth.getSession()
        if (s2) { router.replace("/dashboard"); return }
      }

      // 4. Fallback — link expired
      setStatus("Link expired — redirecting to login…")
      setTimeout(() => router.replace("/login?error=link_expired"), 1800)
    }
    run()
  }, [router])

  return (
    <div style={{
      height: "calc(100vh - 60px)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "#050508", gap: "16px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ color: "#7878a8", fontSize: "14px" }}>{status}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
