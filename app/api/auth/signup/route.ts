import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password too long" }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try creating new user with email auto-confirmed
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (!createErr) {
      try {
        await resend.emails.send({
          from: "Veil Research <hello@veilresearch.com>",
          to: email,
          subject: "Welcome to Veil — you're in early access",
          html: `
            <div style="background:#050508;color:#ededff;font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;border-radius:16px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
                <span style="font-size:20px;font-weight:800;color:#ededff">Veil</span>
                <span style="font-size:12px;color:#8b5cf6;background:rgba(139,92,246,0.12);padding:3px 10px;border-radius:100px;font-weight:700">Early Access</span>
              </div>
              <h1 style="font-size:26px;font-weight:800;margin-bottom:12px;color:#ededff">Welcome to Veil Research</h1>
              <p style="color:#7878a8;font-size:15px;line-height:1.7;margin-bottom:24px">
                You now have access to four specialized AI modes, 4 frontier models, and a research workspace built for people who actually ship science.
              </p>
              <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:20px;margin-bottom:28px">
                <p style="color:#ededff;font-weight:700;margin-bottom:12px;font-size:14px">Your free trial includes:</p>
                <ul style="color:#7878a8;font-size:14px;line-height:2;padding-left:16px;margin:0">
                  <li>1 free message with each of 4 AI models</li>
                  <li>Full dashboard access — modes, workflows, integrations</li>
                  <li>Research terminal with Python 3.11 runtime</li>
                  <li>Early access pricing locked at ₹199/month</li>
                </ul>
              </div>
              <a href="https://veilresearch.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;text-decoration:none;padding:13px 28px;border-radius:12px;font-weight:700;font-size:15px">Open your dashboard →</a>
              <p style="color:#4a4a6a;font-size:12px;margin-top:32px">Veil Research · veilresearch.com</p>
            </div>
          `
        })
      } catch {
        // don't fail signup if email fails
      }
      return NextResponse.json({ success: true })
    }

    // User already exists — find them, confirm email, update password
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        password,
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: createErr.message }, { status: 400 })
  } catch (err) {
    console.error("Signup error:", err)
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 })
  }
}
