import { NextResponse } from "next/server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const FOUNDER_EMAIL = "vibhorpandey09@gmail.com"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const gratitudeEmail = (email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Veil</title>
</head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;">V</div>
        <span style="font-size:20px;font-weight:700;color:#ededff;">Veil Research</span>
      </div>
    </div>

    <!-- Hero card -->
    <div style="background:#0f0f1c;border-radius:20px;border:1px solid rgba(139,92,246,0.25);padding:40px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#8b5cf6;letter-spacing:0.08em;margin:0 0 16px;">THANK YOU FOR JOINING</p>
      <h1 style="font-size:28px;font-weight:800;color:#ededff;margin:0 0 16px;line-height:1.2;letter-spacing:-0.02em;">
        You&apos;re on the Veil early&nbsp;access list.
      </h1>
      <p style="font-size:15px;color:#7878a8;line-height:1.75;margin:0;">
        Hi — I&apos;m genuinely grateful you signed up. It means a lot that you&apos;re interested in what we&apos;re building. Let me take a moment to tell you why Veil exists, and what&apos;s coming for you.
      </p>
    </div>

    <!-- Why Veil -->
    <div style="background:#0f0f1c;border-radius:16px;border:1px solid rgba(255,255,255,0.07);padding:32px;margin-bottom:16px;">
      <h2 style="font-size:18px;font-weight:800;color:#ededff;margin:0 0 16px;">Why I built Veil</h2>
      <p style="font-size:14.5px;color:#7878a8;line-height:1.8;margin:0 0 14px;">
        I&apos;m Vibhor Pandey, a student at UPES University Dehradun. I built Veil because I was tired of switching between five different tools just to do one research task — reading papers in one tab, running models in another, writing in a third, and losing context every single time.
      </p>
      <p style="font-size:14.5px;color:#7878a8;line-height:1.8;margin:0 0 14px;">
        Researchers, students, and ML engineers deserve a workspace where the AI actually understands the <em>entire</em> context of their work — not just the last message. A place where you can start a literature review, pivot to writing a hypothesis, kick off a fine-tune, and come back to a manuscript draft — all without losing a single thread.
      </p>
      <p style="font-size:14.5px;color:#7878a8;line-height:1.8;margin:0;">
        That&apos;s Veil. One workspace. Four deep modes. Thousands of workflows. Your models, your compute, your credentials — all in one place, always in sync.
      </p>
    </div>

    <!-- What's coming -->
    <div style="background:#0f0f1c;border-radius:16px;border:1px solid rgba(255,255,255,0.07);padding:32px;margin-bottom:16px;">
      <h2 style="font-size:18px;font-weight:800;color:#ededff;margin:0 0 16px;">What you&apos;re getting access to</h2>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          ["Research Mode", "End-to-end research execution — hypothesis framing, literature synthesis, experiment planning, GPU training, evaluations, and manuscript drafting."],
          ["Biology Mode", "Wet-lab and computational biology specialist for protein design, genomics, pathway analysis, and biomedical reasoning workflows."],
          ["Flywheel Mode", "Build compounding model improvements from production usage, auto-design fine-tunes, run evaluations, and ship stronger versions continuously."],
          ["Write Mode", "Turn rough notes into publication-ready output with structured arguments, verified citations, clean LaTeX, and camera-ready formatting."],
        ].map(([title, desc]) => `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;margin-top:6px;flex-shrink:0;"></div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#ededff;margin-bottom:4px;">${title}</div>
            <div style="font-size:13px;color:#7878a8;line-height:1.65;">${desc}</div>
          </div>
        </div>`).join("")}
      </div>
    </div>

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.1));border-radius:16px;border:1px solid rgba(139,92,246,0.25);padding:32px;margin-bottom:24px;text-align:center;">
      <p style="font-size:15px;color:#ededff;font-weight:700;margin:0 0 8px;">You have 1 free message waiting.</p>
      <p style="font-size:13.5px;color:#7878a8;margin:0 0 20px;line-height:1.65;">
        Head to Veil right now and try it — no payment needed for your first message. Experience the Research, Biology, Flywheel, or Write mode firsthand.
      </p>
      <a href="https://veilresearch.com/chat" style="display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 0 28px rgba(139,92,246,0.35);">
        Open Veil →
      </a>
    </div>

    <!-- Sign off -->
    <div style="padding:24px 0;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="font-size:14px;color:#7878a8;line-height:1.75;margin:0 0 16px;">
        Thank you again for being early. Building this has been the most ambitious thing I&apos;ve done so far, and knowing people are interested makes every late night worth it.
      </p>
      <p style="font-size:14px;color:#7878a8;margin:0 0 4px;">With gratitude,</p>
      <p style="font-size:15px;font-weight:700;color:#ededff;margin:0 0 2px;">Vibhor Pandey</p>
      <p style="font-size:13px;color:#4a4a6a;margin:0;">Founder, Veil Research · UPES University Dehradun</p>
      <p style="margin-top:12px;font-size:13px;">
        <a href="mailto:vibhorpandey09@gmail.com" style="color:#8b5cf6;text-decoration:none;">vibhorpandey09@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <p style="font-size:11.5px;color:#2d2d4e;text-align:center;margin-top:24px;">
      © 2025 Veil Research · UPES University Dehradun ·
      <a href="https://veilresearch.com" style="color:#4a4a6a;text-decoration:none;">veilresearch.com</a>
    </p>

  </div>
</body>
</html>
`

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  // Save to Supabase waitlist table (best effort)
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await admin.from("waitlist").upsert({ email }, { onConflict: "email" })
  } catch {
    // Table may not exist yet — non-fatal
  }

  // Send gratitude email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = getResend()
      await resend.emails.send({
        from:    "Vibhor from Veil <onboarding@resend.dev>",
        to:      [email],
        replyTo: FOUNDER_EMAIL,
        subject: "You're on the Veil early access list 🎉",
        html:    gratitudeEmail(email),
      })
    } catch (err) {
      console.error("Email send failed:", err)
    }
  }

  return NextResponse.json({ success: true })
}
