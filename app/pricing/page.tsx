"use client"

import { useState } from "react"
import {
  Check, Crown, BookOpen, Dna, RefreshCw, PenLine,
  Mail, X, ArrowRight, Zap, Star,
} from "lucide-react"

const FEATURES = [
  "Unlimited chat messages",
  "GPT-4o & GPT-4o mini access",
  "Llama 3 70B (open-source)",
  "DeepSeek R1 advanced reasoning",
  "Research mode — literature synthesis",
  "Biology mode — protein & genomics",
  "Flywheel mode — auto fine-tuning",
  "Write mode — LaTeX & manuscripts",
  "1000s of pre-built workflows",
  "GPU compute orchestration",
  "Persistent agent runtime",
  "GitHub, HuggingFace, W&B integrations",
  "Priority support",
]

const FAQS = [
  {
    q: "What is Early Access pricing?",
    a: "Early Access is a limited-time offer for the first users who join Veil. You lock in ₹199/month forever — even after we raise prices. Once the early access spots fill up, pricing moves to ₹699/month.",
  },
  {
    q: "When will payments be available?",
    a: "We're setting up our payment infrastructure. Join the early access list and you'll be the first to know — plus you'll lock in ₹199/month permanently.",
  },
  {
    q: "How much do I save on the annual plan?",
    a: "The annual plan is ₹8099/year vs ₹8388/year (₹699 × 12) — saving you ₹289. You also get priority access and early feature releases.",
  },
  {
    q: "Which payment methods will be accepted?",
    a: "UPI, credit/debit cards, and net banking via a secure Indian payment gateway.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard at any time. You keep access until the end of your billing period.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your conversations and credentials are encrypted and never used to train models.",
  },
]

const PLANS = [
  {
    id: "early",
    name: "Early Access",
    badge: "Limited spots",
    badgeColor: "#f59e0b",
    price: "₹199",
    period: "/month",
    sub: "Lock in forever — price never increases for you",
    highlight: false,
    icon: Star,
    iconColor: "#f59e0b",
    borderColor: "rgba(245,158,11,0.35)",
    glowColor: "rgba(245,158,11,0.12)",
    ctaLabel: "Lock in ₹199/month →",
    ctaGradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    features: FEATURES,
  },
  {
    id: "monthly",
    name: "Pro Monthly",
    badge: "Most popular",
    badgeColor: "#8b5cf6",
    price: "₹699",
    period: "/month",
    sub: "Full access, billed monthly",
    highlight: true,
    icon: Crown,
    iconColor: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.5)",
    glowColor: "rgba(139,92,246,0.15)",
    ctaLabel: "Get started →",
    ctaGradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    features: FEATURES,
  },
  {
    id: "annual",
    name: "Pro Annual",
    badge: "Best value",
    badgeColor: "#10b981",
    price: "₹8099",
    period: "/year",
    sub: "Save ₹289 vs monthly · Priority features",
    highlight: false,
    icon: Zap,
    iconColor: "#10b981",
    borderColor: "rgba(16,185,129,0.35)",
    glowColor: "rgba(16,185,129,0.1)",
    ctaLabel: "Get annual access →",
    ctaGradient: "linear-gradient(135deg, #10b981, #3b82f6)",
    features: FEATURES,
  },
]

function EarlyAccessModal({ plan, onClose }: { plan: typeof PLANS[0]; onClose: () => void }) {
  const [email,     setEmail]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan: plan.name }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "#0f0f1c", borderRadius: "20px",
        border: `1px solid ${plan.borderColor}`,
        boxShadow: `0 0 80px ${plan.glowColor}`,
        padding: "40px", maxWidth: "440px", width: "100%", position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}>
          <X size={18} />
        </button>

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
              We&apos;ll email you at <strong style={{ color: "#ededff" }}>{email}</strong> the moment payments go live.
              Your <strong style={{ color: plan.iconColor }}>{plan.name}</strong> spot is reserved.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px",
              background: `${plan.glowColor}`, border: `1px solid ${plan.borderColor}`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px",
            }}>
              <plan.icon size={24} color={plan.iconColor} />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>
              {plan.name} — {plan.price}{plan.period}
            </h2>
            <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.65, marginBottom: "24px" }}>
              Payments are launching soon. Drop your email to reserve your spot at this price —
              you&apos;ll be notified the moment it goes live.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {[
                `Lock in ${plan.price}${plan.period} pricing`,
                "Be first when payments launch",
                "No card needed until we're live",
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
                background: plan.ctaGradient,
                boxShadow: `0 0 28px ${plan.glowColor}`,
                opacity: loading || !email ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                {loading ? "Saving…" : <><ArrowRight size={15} /> Reserve my spot</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Pricing() {
  const [activePlan, setActivePlan] = useState<typeof PLANS[0] | null>(null)
  const [openFaq,    setOpenFaq]    = useState<number | null>(null)

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>
      {activePlan && <EarlyAccessModal plan={activePlan} onClose={() => setActivePlan(null)} />}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "100px 24px 60px", textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 60%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "100px", marginBottom: "24px",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em",
        }}>
          <Star size={12} /> EARLY ACCESS PRICING — LIMITED SPOTS
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800,
          letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.05,
        }}>
          Simple, transparent pricing.
          <br />
          <span style={{
            background: "linear-gradient(135deg, #ededff 0%, #a78bfa 45%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Lock in early. Pay less forever.</span>
        </h1>
        <p style={{ fontSize: "17px", color: "#7878a8", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
          Join now at ₹199/month and that price is yours permanently —
          even after we move to standard pricing.
        </p>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "20px 24px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div className="mobile-col" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} className="pricing-card" style={{
              borderRadius: "20px", overflow: "hidden",
              border: `1px solid ${plan.borderColor}`,
              boxShadow: plan.highlight ? `0 0 60px ${plan.glowColor}` : "none",
              position: "relative",
              transform: plan.highlight ? "scale(1.03)" : "scale(1)",
            }}>
              {/* Top gradient bar */}
              <div style={{ height: "3px", background: plan.ctaGradient }} />

              <div style={{ background: plan.highlight ? "#111120" : "#0f0f1c", padding: "32px 28px" }}>
                {/* Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 10px", borderRadius: "100px", marginBottom: "20px",
                  background: `${plan.badgeColor}15`,
                  border: `1px solid ${plan.badgeColor}30`,
                  fontSize: "11px", fontWeight: 700, color: plan.badgeColor, letterSpacing: "0.06em",
                }}>
                  <plan.icon size={11} /> {plan.badge.toUpperCase()}
                </div>

                {/* Name */}
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#ededff", marginBottom: "20px" }}>
                  {plan.name}
                </div>

                {/* Price */}
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-0.04em", color: "#ededff", lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: "15px", color: "#7878a8" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#7878a8", marginBottom: "28px", lineHeight: 1.5 }}>{plan.sub}</p>

                {/* CTA */}
                <button onClick={() => setActivePlan(plan)} style={{
                  width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                  fontSize: "14px", fontWeight: 700, color: "#fff", cursor: "pointer",
                  background: plan.ctaGradient,
                  boxShadow: plan.highlight ? `0 0 30px ${plan.glowColor}` : "none",
                  marginBottom: "28px",
                }}>
                  {plan.ctaLabel}
                </button>

                {/* Coming soon note */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 12px", borderRadius: "9px", marginBottom: "24px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: "12px", color: "#4a4a6a",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  Payments launching soon — reserve your spot
                </div>

                {/* Features */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "14px" }}>
                    EVERYTHING INCLUDED
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Check size={13} color={plan.iconColor} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ fontSize: "13px", color: "#ededff", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price comparison note */}
        <div style={{
          textAlign: "center", marginTop: "40px", padding: "20px",
          background: "rgba(245,158,11,0.06)", borderRadius: "14px",
          border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7 }}>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>Early Access spots are limited.</span>{" "}
            Join now to lock in ₹199/month permanently — once spots fill, pricing moves to ₹699/month.
          </p>
        </div>
      </section>

      {/* ── Modes ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px", maxWidth: "900px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", margin: "60px 0 36px", textAlign: "center", color: "#ededff" }}>
          All 4 modes. Every plan.
        </h2>
        <div className="mobile-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
          {[
            { icon: BookOpen, label: "Research", color: "#3b82f6", desc: "Literature synthesis, hypothesis framing, GPU training, manuscript drafting." },
            { icon: Dna,       label: "Biology",  color: "#10b981", desc: "Protein design, genomics, pathway analysis, biomedical reasoning." },
            { icon: RefreshCw, label: "Flywheel", color: "#f59e0b", desc: "Auto fine-tuning, evaluations, compounding model improvements." },
            { icon: PenLine,   label: "Write",    color: "#8b5cf6", desc: "Verified citations, clean LaTeX, camera-ready formatting." },
          ].map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} style={{
                padding: "24px", borderRadius: "14px",
                background: "rgba(15,15,28,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: `2px solid ${m.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Icon size={17} color={m.color} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#ededff" }}>{m.label}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#7878a8", lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 24px 100px", maxWidth: "640px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "28px", textAlign: "center", color: "#ededff" }}>
          Common questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              borderRadius: "12px", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              background: openFaq === i ? "rgba(15,15,28,0.9)" : "rgba(10,10,18,0.8)",
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", padding: "16px 20px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#ededff" }}>{faq.q}</span>
                <span style={{ color: "#7878a8", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", fontSize: "20px", lineHeight: 1 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 16px" }}>
                  <p style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <p style={{ fontSize: "14px", color: "#7878a8", marginBottom: "20px" }}>
            Questions?{" "}
            <a href="mailto:vibhorpandey09@gmail.com" style={{ color: "#8b5cf6", textDecoration: "none" }}>
              vibhorpandey09@gmail.com →
            </a>
          </p>
          <button onClick={() => setActivePlan(PLANS[0])} style={{
            padding: "13px 32px", borderRadius: "12px", border: "none",
            fontSize: "15px", fontWeight: 700, color: "#fff", cursor: "pointer",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          }}>
            Lock in Early Access — ₹199/month →
          </button>
        </div>
      </section>
    </div>
  )
}
