import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function makeUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ status: "unauthenticated" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user }, error } = await anon.auth.getUser(token)
  if (error || !user) return NextResponse.json({ status: "unauthenticated" }, { status: 401 })

  const db = makeUserClient(token)
  let { data: profile } = await db.from("profiles").select("*").eq("user_id", user.id).single()
  if (!profile) {
    const { data: created } = await db.from("profiles").insert({ user_id: user.id }).select().single()
    profile = created
  }

  return NextResponse.json({
    status:          profile?.subscription_status ?? "inactive",
    freeTrialUsed:   profile?.free_trial_used     ?? false,
    trialModelsUsed: profile?.trial_models_used   ?? [],
    email:           user.email,
    userId:          user.id,
  })
}
