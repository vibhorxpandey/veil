import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
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
