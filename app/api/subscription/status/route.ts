import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createSupabaseServer()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 })
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ user_id: user.id })
      .select()
      .single()
    profile = created
  }

  return NextResponse.json({
    status:           profile?.subscription_status ?? "inactive",
    freeTrialUsed:    profile?.free_trial_used ?? false,
    trialModelsUsed:  profile?.trial_models_used ?? [],
    email:            user.email,
    userId:           user.id,
  })
}
